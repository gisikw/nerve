// Session state: login status, current user ID.

import { checkSession, login as tauriLogin, logout as tauriLogout } from "../tauri";

export type SessionState =
  | { status: "checking" }
  | { status: "logged_out" }
  | { status: "logging_in" }
  | { status: "logged_in"; userId: string }
  | { status: "error"; message: string };

let session = $state<SessionState>({ status: "checking" });

export function getSession(): SessionState {
  return session;
}

export async function initSession(): Promise<void> {
  try {
    const result = await checkSession();
    if (result.logged_in && result.user_id) {
      session = { status: "logged_in", userId: result.user_id };
    } else {
      session = { status: "logged_out" };
    }
  } catch (err) {
    session = { status: "error", message: String(err) };
  }
}

export async function login(
  homeserver: string,
  username: string,
  password: string,
): Promise<void> {
  session = { status: "logging_in" };
  try {
    const result = await tauriLogin(homeserver, username, password);
    session = { status: "logged_in", userId: result.user_id };
  } catch (err) {
    session = { status: "error", message: String(err) };
  }
}

export async function logout(): Promise<void> {
  try {
    await tauriLogout();
  } catch {
    // Best effort
  }
  session = { status: "logged_out" };
}
