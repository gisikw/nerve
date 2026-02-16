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

function selectRoom(room) {
  selectedRoomId = room.id;
  roomNameEl.textContent = room.name;
  noRoomSelected.hidden = true;
  roomContent.hidden = false;
  messagesEl.innerHTML = "<p class='placeholder'>Messages coming soon.</p>";

  // Update selection styling
  for (const li of roomListEl.children) {
    li.classList.toggle("selected", li.dataset.roomId === room.id);
  }
}

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
