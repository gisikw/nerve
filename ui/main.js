import { Elm } from "./src/Main.elm";

const invoke = window.__TAURI__?.core?.invoke;

const app = Elm.Main.init({
  node: document.getElementById("app"),
});

// Command map: Elm command names -> Tauri invoke names
const commands = {
  checkSession: "check_session",
  login: "login",
  logout: "logout",
  listRooms: "list_rooms",
  getMessages: "get_messages",
  sendMessage: "send_message",
};

// Listen for outgoing commands from Elm
app.ports.sendToTauri.subscribe(async (msg) => {
  const { command, args } = msg;
  const tauriCmd = commands[command];

  if (!tauriCmd) {
    console.error("Unknown command:", command);
    app.ports.receiveFromTauri.send({ tag: "error", payload: `Unknown command: ${command}` });
    return;
  }

  try {
    const result = await invoke(tauriCmd, args || {});
    app.ports.receiveFromTauri.send({ tag: command, payload: result });
  } catch (err) {
    app.ports.receiveFromTauri.send({ tag: "error", payload: String(err) });
  }
});

// Auto-grow compose textarea to fit content
document.addEventListener("input", (e) => {
  if (e.target.id === "compose-input") {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }
});

// Reset textarea height when Elm clears the compose text (after sending)
app.ports.sendToTauri.subscribe((msg) => {
  if (msg.command === "sendMessage") {
    requestAnimationFrame(() => {
      const el = document.getElementById("compose-input");
      if (el) el.style.height = "auto";
    });
  }
});

// Focus compose input on any unbound keypress (printable characters only)
document.addEventListener("keydown", (e) => {
  const compose = document.getElementById("compose-input");
  if (!compose || document.activeElement === compose) return;
  // Skip if user is in another input/textarea (e.g. login form)
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  // Skip modifier-only or navigation keys
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length !== 1) return;
  compose.focus();
});

// Check session on startup
if (invoke) {
  invoke("check_session")
    .then((result) => {
      app.ports.receiveFromTauri.send({ tag: "checkSession", payload: result });
    })
    .catch((err) => {
      app.ports.receiveFromTauri.send({ tag: "error", payload: String(err) });
    });
}
