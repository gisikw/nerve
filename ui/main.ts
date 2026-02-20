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

