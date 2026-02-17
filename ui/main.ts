import { Elm } from "./src/Main.elm";

const invoke = window.__TAURI__?.core?.invoke as
  | ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>)
  | undefined;

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
    const result = await invoke!(tauriCmd, msg.args ?? {});
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
