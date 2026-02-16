const { invoke } = window.__TAURI__.core;

const loginView = document.getElementById("login-view");
const mainView = document.getElementById("main-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const loginStatus = document.getElementById("login-status");
const userIdSpan = document.getElementById("user-id");
const logoutBtn = document.getElementById("logout-btn");

function showLogin() {
  loginView.hidden = false;
  mainView.hidden = true;
}

function showMain(userId) {
  loginView.hidden = true;
  mainView.hidden = false;
  userIdSpan.textContent = userId;
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

// On load, check for existing session
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
