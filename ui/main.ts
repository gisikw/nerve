import { Elm } from "./src/Main.elm";
import { fakeInvoke } from "./fake";

const tauriInvoke = window.__TAURI__?.core?.invoke as
  | ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>)
  | undefined;

const invoke = tauriInvoke ?? fakeInvoke;

const archivedRooms: string[] = JSON.parse(
  localStorage.getItem("nerve-archived-rooms") ?? "[]",
);

const app = Elm.Main.init({
  node: document.getElementById("app"),
  flags: { archivedRooms },
});

// Command map: Elm command names -> Tauri invoke names
const commands: Record<string, string> = {
  checkSession: "check_session",
  login: "login",
  logout: "logout",
  listRooms: "list_rooms",
  getMessages: "get_messages",
  getOlderMessages: "get_messages",
  sendMessage: "send_message",
  sendReaction: "send_reaction",
  getTyping: "get_typing",
  sendTypingNotice: "send_typing_notice",
  createRoom: "create_room",
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

// Check session on startup
invoke("check_session")
  .then((result) => {
    app.ports.receiveFromTauri.send({ tag: "checkSession", payload: result });
  })
  .catch((err) => {
    app.ports.receiveFromTauri.send({ tag: "error", payload: String(err) });
  });
