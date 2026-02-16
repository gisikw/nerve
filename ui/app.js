const { invoke } = window.__TAURI__.core;

const loginView = document.getElementById("login-view");
const mainView = document.getElementById("main-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const loginStatus = document.getElementById("login-status");
const userIdSpan = document.getElementById("user-id");
const logoutBtn = document.getElementById("logout-btn");
const roomListEl = document.getElementById("room-list");
const noRoomSelected = document.getElementById("no-room-selected");
const roomContent = document.getElementById("room-content");
const roomNameEl = document.getElementById("room-name");
const messagesEl = document.getElementById("messages");
const composeForm = document.getElementById("compose");
const composeInput = document.getElementById("compose-input");

let selectedRoomId = null;
let roomPollInterval = null;

function showLogin() {
  loginView.hidden = false;
  mainView.hidden = true;
  stopRoomPolling();
}

function showMain(userId) {
  loginView.hidden = true;
  mainView.hidden = false;
  userIdSpan.textContent = userId;
  loadRooms();
  startRoomPolling();
}

function showError(msg) {
  loginError.textContent = msg;
  loginError.hidden = false;
  loginStatus.hidden = true;
}

function showStatus(msg) {
  loginStatus.textContent = msg;
  loginStatus.hidden = false;
  loginError.hidden = true;
}

// Room list

async function loadRooms() {
  try {
    const rooms = await invoke("list_rooms");
    renderRoomList(rooms);
  } catch (err) {
    console.error("Failed to load rooms:", err);
  }
}

function renderRoomList(rooms) {
  roomListEl.innerHTML = "";
  for (const room of rooms) {
    const li = document.createElement("li");
    li.textContent = room.name;
    li.dataset.roomId = room.id;
    if (room.unread) li.classList.add("unread");
    if (room.id === selectedRoomId) li.classList.add("selected");
    li.addEventListener("click", () => selectRoom(room));
    roomListEl.appendChild(li);
  }
}

async function selectRoom(room) {
  selectedRoomId = room.id;
  roomNameEl.textContent = room.name;
  noRoomSelected.hidden = true;
  roomContent.hidden = false;

  // Update selection styling
  for (const li of roomListEl.children) {
    li.classList.toggle("selected", li.dataset.roomId === room.id);
  }

  await loadMessages(room.id);
}

// Messages

async function loadMessages(roomId) {
  messagesEl.innerHTML = "<p class='placeholder'>Loading...</p>";
  try {
    const msgs = await invoke("get_messages", { roomId });
    renderMessages(msgs);
  } catch (err) {
    messagesEl.innerHTML = `<p class='placeholder'>Failed to load messages</p>`;
    console.error("Failed to load messages:", err);
  }
}

function renderMessages(msgs) {
  messagesEl.innerHTML = "";
  if (msgs.length === 0) {
    messagesEl.innerHTML = "<p class='placeholder'>No messages yet.</p>";
    return;
  }

  for (const msg of msgs) {
    const el = document.createElement("div");
    el.classList.add("message");
    if (msg.msg_type === "notice") el.classList.add("notice");
    if (msg.msg_type === "emote") el.classList.add("emote");

    const sender = document.createElement("span");
    sender.classList.add("sender");
    sender.textContent = formatSender(msg.sender);

    const time = document.createElement("span");
    time.classList.add("timestamp");
    time.textContent = formatTime(msg.timestamp);

    const header = document.createElement("div");
    header.classList.add("message-header");
    header.appendChild(sender);
    header.appendChild(time);

    const body = document.createElement("div");
    body.classList.add("message-body");
    body.textContent = msg.body;

    el.appendChild(header);
    el.appendChild(body);
    messagesEl.appendChild(el);
  }

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function formatSender(userId) {
  // @user:server.org -> user
  const match = userId.match(/^@([^:]+)/);
  return match ? match[1] : userId;
}

function formatTime(tsMillis) {
  const d = new Date(tsMillis);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Compose

composeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = composeInput.value.trim();
  if (!body || !selectedRoomId) return;

  composeInput.value = "";
  composeInput.style.height = "auto";

  try {
    await invoke("send_message", { roomId: selectedRoomId, body });
    await loadMessages(selectedRoomId);
  } catch (err) {
    console.error("Failed to send message:", err);
  }
});

composeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    composeForm.requestSubmit();
  }
});

// Auto-resize textarea
composeInput.addEventListener("input", () => {
  composeInput.style.height = "auto";
  composeInput.style.height = Math.min(composeInput.scrollHeight, 120) + "px";
});

function startRoomPolling() {
  stopRoomPolling();
  roomPollInterval = setInterval(loadRooms, 5000);
}

function stopRoomPolling() {
  if (roomPollInterval) {
    clearInterval(roomPollInterval);
    roomPollInterval = null;
  }
}

// Login

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.hidden = true;

  const homeserver = document.getElementById("homeserver").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  showStatus("Connecting...");

  try {
    const result = await invoke("login", { homeserver, username, password });
    showMain(result.user_id);
  } catch (err) {
    showError(String(err));
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await invoke("logout");
  } catch (_) {
    // Best effort
  }
  showLogin();
});

// Init

async function init() {
  try {
    const session = await invoke("check_session");
    if (session.logged_in && session.user_id) {
      showMain(session.user_id);
    } else {
      showLogin();
    }
  } catch (_) {
    showLogin();
  }
}

init();
