import { Elm } from "./src/Main.elm";
import { fakeInvoke } from "./fake";

const tauriInvoke = window.__TAURI__?.core?.invoke as
  | ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>)
  | undefined;

const invoke = tauriInvoke ?? fakeInvoke;

const archivedRooms: string[] = JSON.parse(
  localStorage.getItem("nerve-archived-rooms") ?? "[]",
);
const ttsEnabled: boolean =
  localStorage.getItem("nerve-tts-enabled") === "true";

const app = Elm.Main.init({
  node: document.getElementById("app"),
  flags: { archivedRooms, ttsEnabled },
});

// Command map: Elm command names -> Tauri invoke names
const commands: Record<string, string> = {
  checkSession: "check_session",
  login: "login",
  logout: "logout",
  listRooms: "list_rooms",
  getMessages: "get_messages",
  getOlderMessages: "get_messages",
  markRead: "mark_read",
  sendMessage: "send_message",
  sendImage: "send_image",
  sendReaction: "send_reaction",
  getPinnedEvents: "get_pinned_events",
  pinMessage: "pin_message",
  unpinMessage: "unpin_message",
  getTyping: "get_typing",
  sendTypingNotice: "send_typing_notice",
  createRoom: "create_room",
  getStreams: "get_streams",
  sendStreamAction: "send_stream_action",
  speakText: "speak_text",
  sendVoiceMessage: "send_voice_message",
};

// Listen for outgoing commands from Elm
app.ports.sendToTauri.subscribe(async (msg) => {
  const tauriCmd = commands[msg.command];

  if (!tauriCmd) {
    console.error("Unknown command:", msg.command);
    app.ports.receiveFromTauri.send({
      tag: "error",
      payload: `Unknown command: ${msg.command}`,
    });
    return;
  }

  try {
    const result = await invoke(tauriCmd, msg.args ?? {});
    // For TTS responses, play the audio before forwarding to Elm
    if (msg.command === "speakText" && typeof result === "string") {
      ttsEnqueue(result);
    }
    app.ports.receiveFromTauri.send({ tag: msg.command, payload: result });
  } catch (err) {
    app.ports.receiveFromTauri.send({ tag: "error", payload: String(err) });
  }
});

// Resize compose textarea to fit content. Called by Elm via port after
// text changes and message send (to reset height).
app.ports.resizeComposeInput.subscribe(() => {
  requestAnimationFrame(() => {
    const el = document.getElementById(
      "compose-input",
    ) as HTMLTextAreaElement | null;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
    // Show scrollbar only when at max height
    el.style.overflowY = el.scrollHeight > el.offsetHeight ? "auto" : "hidden";
  });
});

// Persist archived room IDs to localStorage
app.ports.saveArchivedRooms.subscribe((ids: string[]) => {
  localStorage.setItem("nerve-archived-rooms", JSON.stringify(ids));
});

// Persist TTS enabled state to localStorage
app.ports.saveTtsEnabled.subscribe((enabled: boolean) => {
  localStorage.setItem("nerve-tts-enabled", String(enabled));
  if (!enabled) {
    // Stop any in-progress playback
    ttsStopAll();
  }
});

// ---------- TTS audio playback queue ----------

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

function ttsEnqueue(base64: string) {
  if (ttsCurrentAudio) {
    ttsQueue.push(base64);
  } else {
    ttsQueue.push(base64);
    ttsPlayNext();
  }
}

function ttsStopAll() {
  ttsQueue.length = 0;
  if (ttsCurrentAudio) {
    ttsCurrentAudio.pause();
    ttsCurrentAudio = null;
  }
}

// Zoom: Cmd/Ctrl + / - / 0 to adjust base font size
const ZOOM_STEP = 1;
const ZOOM_MIN = 10;
const ZOOM_MAX = 22;
const ZOOM_DEFAULT = 16;

function getZoom(): number {
  const stored = localStorage.getItem("nerve-font-size");
  return stored ? parseInt(stored, 10) : ZOOM_DEFAULT;
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
  } else if (e.key === "k") {
    e.preventDefault(); // Let Elm handle Cmd+K
  } else if (e.key === "/") {
    e.preventDefault(); // Let Elm handle Cmd+/
  } else if (e.key === ".") {
    e.preventDefault(); // Let Elm handle Cmd+.
  } else if (e.key === "V" && e.shiftKey) {
    e.preventDefault(); // Let Elm handle Cmd+Shift+V (voice recording)
  }
});

// Resolve mxc:// image sources via the backend's authenticated media download.
// Uses a MutationObserver to catch <img> elements Elm renders with mxc:// src
// and replaces them with data: URIs fetched through the Tauri get_media command.
const resolvedMedia = new Map<string, string>();
const pendingMedia = new Set<string>();

async function resolveMxcImage(img: HTMLImageElement) {
  const mxcUri = img.dataset.mxcUri ?? img.getAttribute("src");
  if (!mxcUri || !mxcUri.startsWith("mxc://")) return;

  // Stash the mxc URI and clear src to prevent browser 404
  img.dataset.mxcUri = mxcUri;
  img.removeAttribute("src");

  // Already resolved?
  const cached = resolvedMedia.get(mxcUri);
  if (cached) {
    img.src = cached;
    return;
  }

  // Already in flight?
  if (pendingMedia.has(mxcUri)) return;
  pendingMedia.add(mxcUri);

  try {
    const dataUri = (await invoke("get_media", { mxcUri })) as string;
    resolvedMedia.set(mxcUri, dataUri);
    // Update all images waiting for this URI
    document
      .querySelectorAll<HTMLImageElement>(`img[data-mxc-uri="${CSS.escape(mxcUri)}"]`)
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

// Scroll-near-top detection for paginated message loading.
// When the user scrolls within 200px of the top of #messages, fire the
// onScrollNearTop port so Elm can request older messages.
function setupScrollSentinel() {
  const el = document.getElementById("messages");
  if (!el) {
    requestAnimationFrame(setupScrollSentinel);
    return;
  }
  let ticking = false;
  el.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (el.scrollTop < 200) {
        app.ports.onScrollNearTop.send(null);
      }
      const nearBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
      if (nearBottom) {
        app.ports.onScrollNearBottom.send(null);
      }
      ticking = false;
    });
  });
}
setupScrollSentinel();

// Preserve scroll position when older messages are prepended.
// We observe DOM mutations on #messages and adjust scrollTop by the
// height delta so the user's viewport doesn't jump.
function setupScrollPreservation() {
  const el = document.getElementById("messages");
  if (!el) {
    requestAnimationFrame(setupScrollPreservation);
    return;
  }
  let prevScrollHeight = el.scrollHeight;
  const observer = new MutationObserver(() => {
    const newScrollHeight = el.scrollHeight;
    const delta = newScrollHeight - prevScrollHeight;
    if (delta > 0 && el.scrollTop < 400) {
      // Content was prepended while near the top — adjust scroll
      el.scrollTop += delta;
    }
    prevScrollHeight = newScrollHeight;
  });
  observer.observe(el, { childList: true, subtree: true });
}
setupScrollPreservation();

// ---------- Image drop zone + caption modal ----------

// Mime type mapping for common image types
function imageMime(file: File): string | null {
  const type = file.type;
  if (type.startsWith("image/")) return type;
  // Fallback by extension
  const ext = file.name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  return ext ? map[ext] ?? null : null;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data:...;base64, prefix
      resolve(result.split(",", 2)[1]);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Get the currently selected room ID from Elm's model via a hidden element
// that Elm renders, or parse it from the DOM.
function getSelectedRoomId(): string | null {
  // Elm renders #room-content only when a room is selected. The room ID
  // is stored as a data attribute on the compose form by our Elm patch.
  const compose = document.getElementById("compose");
  return compose?.dataset.roomId ?? null;
}

function createDropOverlay(): HTMLDivElement {
  const overlay = document.createElement("div");
  overlay.id = "drop-overlay";
  overlay.innerHTML = `
    <div class="drop-overlay-content">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span>Drop image to upload</span>
    </div>
  `;
  return overlay;
}

function showCaptionModal(
  file: File,
  previewUrl: string,
  roomId: string,
): void {
  // Remove any existing modal
  document.getElementById("caption-modal-backdrop")?.remove();

  const backdrop = document.createElement("div");
  backdrop.id = "caption-modal-backdrop";
  backdrop.innerHTML = `
    <div class="caption-modal">
      <div class="caption-modal-preview">
        <img src="${previewUrl}" alt="${file.name}" />
      </div>
      <div class="caption-modal-filename">${file.name}</div>
      <input type="text" class="caption-modal-input" placeholder="Add a caption (optional)" autocomplete="off" />
      <div class="caption-modal-actions">
        <button class="caption-modal-cancel">Cancel</button>
        <button class="caption-modal-send">Send</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const input = backdrop.querySelector(
    ".caption-modal-input",
  ) as HTMLInputElement;
  const sendBtn = backdrop.querySelector(
    ".caption-modal-send",
  ) as HTMLButtonElement;
  const cancelBtn = backdrop.querySelector(
    ".caption-modal-cancel",
  ) as HTMLButtonElement;

  input.focus();

  async function doSend() {
    const caption = input.value.trim() || undefined;
    const mimeType = imageMime(file);
    if (!mimeType) {
      console.error("Unsupported image type:", file.type, file.name);
      backdrop.remove();
      return;
    }

    // Show uploading state
    sendBtn.textContent = "Uploading...";
    sendBtn.disabled = true;
    cancelBtn.disabled = true;

    try {
      const base64 = await readFileAsBase64(file);
      await invoke("send_image", {
        roomId,
        filename: file.name,
        data: base64,
        mimeType,
        caption: caption ?? null,
      });
      // Tell Elm to refresh messages
      app.ports.receiveFromTauri.send({
        tag: "sendImage",
        payload: null,
      });
    } catch (err) {
      console.error("Failed to upload image:", err);
      app.ports.receiveFromTauri.send({
        tag: "error",
        payload: `Image upload failed: ${err}`,
      });
    } finally {
      backdrop.remove();
    }
  }

  sendBtn.addEventListener("click", doSend);
  cancelBtn.addEventListener("click", () => backdrop.remove());

  // Enter to send, Escape to cancel
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doSend();
    } else if (e.key === "Escape") {
      backdrop.remove();
    }
  });

  // Click outside modal to cancel
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.remove();
  });
}

function handleImageFiles(files: FileList, roomId: string) {
  for (const file of Array.from(files)) {
    if (!imageMime(file)) continue;
    const previewUrl = URL.createObjectURL(file);
    showCaptionModal(file, previewUrl, roomId);
    // Only handle the first image per drop
    break;
  }
}

// Set up drag-and-drop on the room content area
let dropOverlay: HTMLDivElement | null = null;
let dragCounter = 0;

document.addEventListener("dragenter", (e) => {
  const roomContent = document.getElementById("room-content");
  if (!roomContent) return;
  if (!e.dataTransfer?.types.includes("Files")) return;

  e.preventDefault();
  dragCounter++;

  if (!dropOverlay) {
    dropOverlay = createDropOverlay();
    roomContent.appendChild(dropOverlay);
  }
});

document.addEventListener("dragover", (e) => {
  if (!dropOverlay) return;
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
});

document.addEventListener("dragleave", (e) => {
  if (!dropOverlay) return;
  e.preventDefault();
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    dropOverlay.remove();
    dropOverlay = null;
  }
});

document.addEventListener("drop", (e) => {
  e.preventDefault();
  dragCounter = 0;
  if (dropOverlay) {
    dropOverlay.remove();
    dropOverlay = null;
  }

  const roomId = getSelectedRoomId();
  if (!roomId || !e.dataTransfer?.files.length) return;

  handleImageFiles(e.dataTransfer.files, roomId);
});

// Also support paste from clipboard
document.addEventListener("paste", (e) => {
  const roomId = getSelectedRoomId();
  if (!roomId) return;

  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of Array.from(items)) {
    if (item.type.startsWith("image/")) {
      e.preventDefault();
      const file = item.getAsFile();
      if (!file) continue;
      const previewUrl = URL.createObjectURL(file);
      showCaptionModal(file, previewUrl, roomId);
      break;
    }
  }
});

// ---------- Audio message playback ----------

let currentPlayingAudio: HTMLAudioElement | null = null;
let currentPlayingBtn: HTMLElement | null = null;

document.addEventListener("click", async (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>(
    "[data-mxc-audio]",
  );
  if (!btn) return;

  const mxcUri = btn.dataset.mxcAudio;
  if (!mxcUri) return;

  // If this button is already playing, stop it
  if (currentPlayingBtn === btn && currentPlayingAudio) {
    currentPlayingAudio.pause();
    currentPlayingAudio = null;
    btn.classList.remove("playing");
    currentPlayingBtn = null;
    return;
  }

  // Stop any currently playing audio
  if (currentPlayingAudio) {
    currentPlayingAudio.pause();
    currentPlayingBtn?.classList.remove("playing");
    currentPlayingAudio = null;
    currentPlayingBtn = null;
  }

  // Check cache first
  let dataUri = resolvedMedia.get(mxcUri);
  if (!dataUri) {
    btn.classList.add("loading");
    try {
      dataUri = (await invoke("get_media", { mxcUri })) as string;
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

// ---------- Voice recording (press-to-talk) ----------

let mediaRecorder: MediaRecorder | null = null;
let recordingChunks: Blob[] = [];
let recordingStartTime = 0;

async function startRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Prefer webm/opus (widely supported), fall back to whatever the browser offers
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    mediaRecorder = new MediaRecorder(stream, { mimeType });
    recordingChunks = [];
    recordingStartTime = Date.now();

    mediaRecorder.addEventListener("dataavailable", (e) => {
      if (e.data.size > 0) recordingChunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", async () => {
      const durationMs = Date.now() - recordingStartTime;
      // Stop all tracks to release the microphone
      stream.getTracks().forEach((t) => t.stop());

      if (recordingChunks.length === 0) return;

      const blob = new Blob(recordingChunks, { type: mimeType });
      const roomId = getSelectedRoomId();
      if (!roomId) return;

      // Convert to base64
      const base64 = await blobToBase64(blob);
      const ext = mimeType.includes("webm") ? "webm" : "ogg";

      try {
        await invoke("send_voice_message", {
          roomId,
          filename: `voice-message.${ext}`,
          data: base64,
          mimeType: mimeType.split(";")[0], // "audio/webm"
          durationMs: Math.round(durationMs),
        });
        app.ports.receiveFromTauri.send({
          tag: "sendVoiceMessage",
          payload: null,
        });
      } catch (err) {
        console.error("Failed to send voice message:", err);
        app.ports.receiveFromTauri.send({
          tag: "error",
          payload: `Voice message failed: ${err}`,
        });
      }
    });

    mediaRecorder.start();
    app.ports.onRecordingState.send(true);
  } catch (err) {
    console.error("Failed to start recording:", err);
    app.ports.onRecordingState.send(false);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    mediaRecorder = null;
  }
  app.ports.onRecordingState.send(false);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",", 2)[1]);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Listen for recording commands from Elm
app.ports.startRecording.subscribe(() => startRecording());
app.ports.stopRecording.subscribe(() => stopRecording());

// Check session on startup
invoke("check_session")
  .then((result) => {
    app.ports.receiveFromTauri.send({ tag: "checkSession", payload: result });
  })
  .catch((err) => {
    app.ports.receiveFromTauri.send({ tag: "error", payload: String(err) });
  });
