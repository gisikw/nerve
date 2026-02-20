import { mount } from "svelte";
import App from "./src/App.svelte";

// --- Mount Svelte app ---

mount(App, { target: document.getElementById("app")! });

// --- Zoom: Cmd/Ctrl + / - / 0 to adjust base font size ---

const ZOOM_STEP = 2;
const ZOOM_MIN = 16;
const ZOOM_MAX = 40;
const ZOOM_DEFAULT = 22;

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

// --- TTS audio playback queue ---
//
// Uses AudioContext (Web Audio API) instead of HTMLAudioElement to avoid
// autoplay restrictions. The AudioContext is created/resumed during a user
// gesture (the speak button click) via ttsUnlockContext(), so subsequent
// playback from async TTS synthesis doesn't need a fresh gesture.

let ttsCtx: AudioContext | null = null;
let ttsPlaying: AudioBufferSourceNode | null = null;
const ttsQueue: string[] = [];

function ttsGetContext(): AudioContext {
  if (!ttsCtx) ttsCtx = new AudioContext();
  return ttsCtx;
}

/** Call during a user gesture to unlock the AudioContext for future playback. */
export function ttsUnlockContext() {
  const ctx = ttsGetContext();
  if (ctx.state === "suspended") ctx.resume();
}

function ttsPlayNext() {
  if (ttsQueue.length === 0) {
    ttsPlaying = null;
    return;
  }
  const base64 = ttsQueue.shift()!;
  const ctx = ttsGetContext();

  // Decode base64 → ArrayBuffer → AudioBuffer
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  ctx.decodeAudioData(bytes.buffer).then((buffer) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.addEventListener("ended", ttsPlayNext);
    ttsPlaying = source;
    source.start();
  }).catch(() => ttsPlayNext());
}

export function ttsEnqueue(base64: string) {
  ttsQueue.push(base64);
  if (!ttsPlaying) {
    ttsPlayNext();
  }
}

export function ttsStopAll() {
  ttsQueue.length = 0;
  if (ttsPlaying) {
    ttsPlaying.stop();
    ttsPlaying = null;
  }
}

