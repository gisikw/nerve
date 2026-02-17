import { Elm } from "./src/Main.elm";
import { fakeInvoke } from "./fake";

const tauriInvoke = window.__TAURI__?.core?.invoke as
  | ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>)
  | undefined;

const invoke = tauriInvoke ?? fakeInvoke;

const app = Elm.Main.init({
  node: document.getElementById("app"),
});

// Command map: Elm command names -> Tauri invoke names
const commands: Record<string, string> = {
  checkSession: "check_session",
  login: "login",
  logout: "logout",
  listRooms: "list_rooms",
  getMessages: "get_messages",
  sendMessage: "send_message",
  sendReaction: "send_reaction",
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
  });
});

// Zoom: Cmd/Ctrl + / - / 0 to adjust base font size
const ZOOM_STEP = 1;
const ZOOM_MIN = 10;
const ZOOM_MAX = 22;
const ZOOM_DEFAULT = 14;

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
  }
});

// Check session on startup
invoke("check_session")
  .then((result) => {
    app.ports.receiveFromTauri.send({ tag: "checkSession", payload: result });
  })
  .catch((err) => {
    app.ports.receiveFromTauri.send({ tag: "error", payload: String(err) });
  });
