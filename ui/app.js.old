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
let messagePollInterval = null;

function showLogin() {
  loginView.hidden = false;
  mainView.hidden = true;
  stopRoomPolling();
  stopMessagePolling();
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
    li.dataset.roomId = room.id;

    const nameSpan = document.createTextNode(room.name);
    li.appendChild(nameSpan);

    if (room.notification_count > 0) {
      li.classList.add("unread");
      const badge = document.createElement("span");
      badge.classList.add("unread-badge");
      badge.textContent = room.notification_count > 99 ? "99+" : room.notification_count;
      li.appendChild(badge);
    }

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

  for (const li of roomListEl.children) {
    li.classList.toggle("selected", li.dataset.roomId === room.id);
  }

  await loadMessages(room.id);
  startMessagePolling();
}

// Messages

async function loadMessages(roomId) {
  messagesEl.innerHTML = "<p class='placeholder'>Loading...</p>";
  try {
    const msgs = await invoke("get_messages", { roomId });
    renderMessages(msgs);
  } catch (err) {
    messagesEl.innerHTML = "<p class='placeholder'>Failed to load messages</p>";
    console.error("Failed to load messages:", err);
  }
}

function renderMessages(msgs) {
  const wasAtBottom =
    messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 40;

  messagesEl.innerHTML = "";
  if (msgs.length === 0) {
    messagesEl.innerHTML = "<p class='placeholder'>No messages yet.</p>";
    return;
  }

  let prevSender = null;
  let prevTimestamp = 0;

  for (const msg of msgs) {
    const el = document.createElement("div");
    el.classList.add("message");
    if (msg.msg_type === "notice") el.classList.add("notice");
    if (msg.msg_type === "emote") el.classList.add("emote");

    // Group consecutive messages from the same sender within 5 minutes
    const sameGroup =
      prevSender === msg.sender && msg.timestamp - prevTimestamp < 300000;

    if (!sameGroup) {
      el.classList.add("group-start");

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
      el.appendChild(header);
    }

    if (msg.msg_type === "image" && msg.media_url) {
      const container = document.createElement("div");
      container.classList.add("image-container");

      const loading = document.createElement("span");
      loading.classList.add("image-loading");
      loading.textContent = "Loading image...";
      container.appendChild(loading);

      const img = document.createElement("img");
      img.src = msg.media_url;
      img.alt = msg.body || "Image";
      img.onload = () => {
        loading.remove();
        if (wasAtBottom) messagesEl.scrollTop = messagesEl.scrollHeight;
      };
      img.onerror = () => {
        loading.textContent = "[Failed to load image]";
        img.remove();
      };
      container.appendChild(img);
      el.appendChild(container);
    } else {
      const body = document.createElement("div");
      body.classList.add("message-body");
      body.textContent = msg.body;
      el.appendChild(body);
    }

    messagesEl.appendChild(el);
    prevSender = msg.sender;
    prevTimestamp = msg.timestamp;
  }

  if (wasAtBottom) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

function formatSender(userId) {
  const match = userId.match(/^@([^:]+)/);
  return match ? match[1] : userId;
}

function formatTime(tsMillis) {
  const d = new Date(tsMillis);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Message polling

function startMessagePolling() {
  stopMessagePolling();
  messagePollInterval = setInterval(() => {
    if (selectedRoomId) loadMessages(selectedRoomId);
  }, 3000);
}

function stopMessagePolling() {
  if (messagePollInterval) {
    clearInterval(messagePollInterval);
    messagePollInterval = null;
  }
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
    console.log("Login result:", JSON.stringify(result));
    if (result && result.user_id) {
      showMain(result.user_id);
    } else {
      showError("Login succeeded but no user_id returned");
    }
  } catch (err) {
    console.error("Login error:", err);
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
  console.log("init: checking session...");
  try {
    const session = await invoke("check_session");
    console.log("init: session result:", JSON.stringify(session));
    if (session.logged_in && session.user_id) {
      showMain(session.user_id);
    } else {
      showLogin();
    }
  } catch (err) {
    console.error("init: check_session failed:", err);
    showLogin();
  }
}

init();
