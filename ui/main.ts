import { mount } from "svelte";
import App from "./src/App.svelte";
import { getMedia } from "./src/lib/tauri";

// --- Mount Svelte app ---

mount(App, { target: document.getElementById("app")! });

// --- Zoom: Cmd/Ctrl + / - / 0 to adjust base font size ---

const ZOOM_STEP = 2;
const ZOOM_MIN = 16;
const ZOOM_MAX = 40;
const ZOOM_DEFAULT = 27;

function getZoom(): number {
  const stored = localStorage.getItem("nerve-font-size");
  if (!stored) return ZOOM_DEFAULT;
  const val = parseInt(stored, 10);
  return val < ZOOM_MIN ? ZOOM_DEFAULT : val;
}

function setZoom(size: number) {
  const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, size));
  document.documentElement.style.fontSize = clamped + "px";
  localStorage.setItem("nerve-font-size", String(clamped));
}

setZoom(getZoom());

document.addEventListener("keydown", (e) => {
  const mod = e.metaKey || e.ctrlKey;
  if (!mod) return;
  if (e.key === "=" || e.key === "+") {
    e.preventDefault();
    setZoom(getZoom() + ZOOM_STEP);
  } else if (e.key === "-") {
    e.preventDefault();
    setZoom(getZoom() - ZOOM_STEP);
  } else if (e.key === "0") {
    e.preventDefault();
    setZoom(ZOOM_DEFAULT);
  }
});

// --- Resolve mxc:// image sources via authenticated media download ---

const resolvedMedia = new Map<string, string>();
const pendingMedia = new Set<string>();

async function resolveMxcImage(img: HTMLImageElement) {
  const mxcUri = img.dataset.mxcUri ?? img.getAttribute("src");
  if (!mxcUri || !mxcUri.startsWith("mxc://")) return;

  img.dataset.mxcUri = mxcUri;
  img.removeAttribute("src");

  const cached = resolvedMedia.get(mxcUri);
  if (cached) {
    img.src = cached;
    return;
  }

  if (pendingMedia.has(mxcUri)) return;
  pendingMedia.add(mxcUri);

  try {
    const dataUri = await getMedia(mxcUri);
    resolvedMedia.set(mxcUri, dataUri);
    document
      .querySelectorAll<HTMLImageElement>(
        `img[data-mxc-uri="${CSS.escape(mxcUri)}"]`,
      )
      .forEach((el) => {
        el.src = dataUri;
      });
  } catch (err) {
    console.error("Failed to resolve media:", mxcUri, err);
  } finally {
    pendingMedia.delete(mxcUri);
  }
}

const mediaObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof HTMLImageElement) {
        resolveMxcImage(node);
      } else if (node instanceof HTMLElement) {
        node.querySelectorAll<HTMLImageElement>("img").forEach(resolveMxcImage);
      }
    }
  }
});

mediaObserver.observe(document.body, { childList: true, subtree: true });

// --- TTS audio playback queue ---

let ttsCurrentAudio: HTMLAudioElement | null = null;
const ttsQueue: string[] = [];

function ttsPlayNext() {
  if (ttsQueue.length === 0) {
    ttsCurrentAudio = null;
    return;
  }
  const base64 = ttsQueue.shift()!;
  const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
  ttsCurrentAudio = audio;
  audio.addEventListener("ended", ttsPlayNext);
  audio.addEventListener("error", ttsPlayNext);
  audio.play().catch(() => ttsPlayNext());
}

export function ttsEnqueue(base64: string) {
  ttsQueue.push(base64);
  if (!ttsCurrentAudio) {
    ttsPlayNext();
  }
}

export function ttsStopAll() {
  ttsQueue.length = 0;
  if (ttsCurrentAudio) {
    ttsCurrentAudio.pause();
    ttsCurrentAudio = null;
  }
}

// --- Audio playback for message attachments ---

let currentPlayingAudio: HTMLAudioElement | null = null;
let currentPlayingBtn: HTMLElement | null = null;

document.addEventListener("click", async (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>(
    "[data-mxc-audio]",
  );
  if (!btn) return;

  const mxcUri = btn.dataset.mxcAudio;
  if (!mxcUri) return;

  if (currentPlayingBtn === btn && currentPlayingAudio) {
    currentPlayingAudio.pause();
    currentPlayingAudio = null;
    btn.classList.remove("playing");
    currentPlayingBtn = null;
    return;
  }

  if (currentPlayingAudio) {
    currentPlayingAudio.pause();
    currentPlayingBtn?.classList.remove("playing");
    currentPlayingAudio = null;
    currentPlayingBtn = null;
  }

  let dataUri = resolvedMedia.get(mxcUri);
  if (!dataUri) {
    btn.classList.add("loading");
    try {
      dataUri = await getMedia(mxcUri);
      resolvedMedia.set(mxcUri, dataUri);
    } catch (err) {
      console.error("Failed to download audio:", mxcUri, err);
      btn.classList.remove("loading");
      return;
    }
    btn.classList.remove("loading");
  }

  const audio = new Audio(dataUri);
  currentPlayingAudio = audio;
  currentPlayingBtn = btn;
  btn.classList.add("playing");

  audio.addEventListener("ended", () => {
    btn.classList.remove("playing");
    currentPlayingAudio = null;
    currentPlayingBtn = null;
  });
  audio.addEventListener("error", () => {
    btn.classList.remove("playing");
    currentPlayingAudio = null;
    currentPlayingBtn = null;
  });

  audio.play().catch(() => {
    btn.classList.remove("playing");
    currentPlayingAudio = null;
    currentPlayingBtn = null;
  });
});
