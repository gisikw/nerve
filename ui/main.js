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
