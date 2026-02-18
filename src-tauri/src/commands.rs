use tauri::State;

use crate::client::{self, MatrixState};
use crate::messages::{self, MessageInfo};
use crate::rooms::{self, RoomInfo};
use crate::typing::{self, TypingStatus};

#[derive(serde::Serialize)]
pub struct LoginResult {
    pub user_id: String,
}

#[derive(serde::Serialize)]
pub struct SessionStatus {
    pub logged_in: bool,
    pub user_id: Option<String>,
}

/// Attempt to restore a persisted session. Called on app startup.
#[tauri::command]
pub async fn check_session(state: State<'_, MatrixState>) -> Result<SessionStatus, String> {
    let mut guard = state.client.lock().await;

    // If we already have a client, check it directly.
    if let Some(ref client) = *guard {
        let logged_in = client::try_restore_session(client).await;
        let user_id = client.user_id().map(|id| id.to_string());
        if logged_in {
            client::spawn_sync(client.clone(), state.typing_cache.clone());
        }
        return Ok(SessionStatus { logged_in, user_id });
    }

    // No client yet — try to restore from a saved homeserver + sqlite store.
    if let Some(homeserver) = client::load_homeserver() {
        if let Ok(restored) = client::build_client(&homeserver).await {
            if client::try_restore_session(&restored).await {
                let user_id = restored.user_id().map(|id| id.to_string());
                client::spawn_sync(restored.clone(), state.typing_cache.clone());
                *guard = Some(restored);
                return Ok(SessionStatus {
                    logged_in: true,
                    user_id,
                });
            }
        }
    }

    Ok(SessionStatus {
        logged_in: false,
        user_id: None,
    })
}

/// Log in with homeserver, username, and password.
#[tauri::command]
pub async fn login(
    state: State<'_, MatrixState>,
    homeserver: String,
    username: String,
    password: String,
) -> Result<LoginResult, String> {
    let new_client = client::build_client(&homeserver)
        .await
        .map_err(|e| format!("Failed to connect to homeserver: {e}"))?;

    let user_id = client::login(&new_client, &username, &password)
        .await
        .map_err(|e| format!("Login failed: {e}"))?;

    // Persist homeserver for session restore on next launch.
    let _ = client::save_homeserver(&homeserver);

    client::spawn_sync(new_client.clone(), state.typing_cache.clone());

    let mut guard = state.client.lock().await;
    *guard = Some(new_client);

    Ok(LoginResult { user_id })
}

/// Log out and clear session.
#[tauri::command]
pub async fn logout(state: State<'_, MatrixState>) -> Result<(), String> {
    let mut guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        client
            .matrix_auth()
            .logout()
            .await
            .map_err(|e| format!("Logout failed: {e}"))?;
    }
    *guard = None;
    client::clear_homeserver();
    Ok(())
}

/// Get the current list of joined rooms.
#[tauri::command]
pub async fn list_rooms(state: State<'_, MatrixState>) -> Result<Vec<RoomInfo>, String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        Ok(rooms::collect_rooms(client, &state.typing_cache).await)
    } else {
        Err("Not logged in".to_string())
    }
}

/// Get recent messages for a room.
#[tauri::command]
pub async fn get_messages(
    state: State<'_, MatrixState>,
    room_id: String,
) -> Result<Vec<MessageInfo>, String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        messages::fetch_messages(client, &room_id, 50)
            .await
            .map_err(|e| format!("Failed to fetch messages: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}

/// Send a text message to a room.
#[tauri::command]
pub async fn send_message(
    state: State<'_, MatrixState>,
    room_id: String,
    body: String,
) -> Result<(), String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        messages::send_message(client, &room_id, &body)
            .await
            .map_err(|e| format!("Failed to send message: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}

/// Send an emoji reaction to a message.
#[tauri::command]
pub async fn send_reaction(
    state: State<'_, MatrixState>,
    room_id: String,
    event_id: String,
    emoji: String,
) -> Result<(), String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        messages::send_reaction(client, &room_id, &event_id, &emoji)
            .await
            .map_err(|e| format!("Failed to send reaction: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}

/// Get users currently typing in a room.
#[tauri::command]
pub async fn get_typing(
    state: State<'_, MatrixState>,
    room_id: String,
) -> Result<TypingStatus, String> {
    typing::get_typing_users(&state.typing_cache, &room_id)
        .await
        .map_err(|e| format!("Failed to get typing status: {e}"))
}

/// Send a typing indicator to a room.
#[tauri::command]
pub async fn send_typing_notice(
    state: State<'_, MatrixState>,
    room_id: String,
    is_typing: bool,
) -> Result<(), String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        typing::send_typing(client, &room_id, is_typing)
            .await
            .map_err(|e| format!("Failed to send typing notice: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}
