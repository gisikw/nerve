use tauri::{AppHandle, State};

use crate::client::{self, MatrixState};
use crate::messages::{self, MessagesResponse};
use crate::rooms::{self, CreateRoomResult, RoomInfo};
use crate::streams::{self, StreamState};
use crate::tts;
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

/// Try to restore a session from a saved homeserver and sqlite store.
/// Returns the restored client if successful.
async fn try_restore_from_disk() -> Option<matrix_sdk::Client> {
    let homeserver = client::load_homeserver()?;
    let restored = client::build_client(&homeserver).await.ok()?;
    if client::try_restore_session(&restored).await {
        Some(restored)
    } else {
        None
    }
}

/// Attempt to restore a persisted session. Called on app startup.
#[tauri::command]
pub async fn check_session(
    state: State<'_, MatrixState>,
    app_handle: AppHandle,
) -> Result<SessionStatus, String> {
    let mut guard = state.client.lock().await;

    // If we already have a client, check it directly.
    if let Some(ref client) = *guard {
        let logged_in = client::try_restore_session(client).await;
        let user_id = client.user_id().map(|id| id.to_string());
        if logged_in {
            client::spawn_sync(client.clone(), state.typing_cache.clone(), state.stream_cache.clone(), app_handle);
        }
        return Ok(SessionStatus { logged_in, user_id });
    }

    // No client yet — try to restore from disk.
    if let Some(restored) = try_restore_from_disk().await {
        let user_id = restored.user_id().map(|id| id.to_string());
        client::spawn_sync(restored.clone(), state.typing_cache.clone(), state.stream_cache.clone(), app_handle);
        *guard = Some(restored);
        return Ok(SessionStatus {
            logged_in: true,
            user_id,
        });
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
    app_handle: AppHandle,
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

    client::spawn_sync(new_client.clone(), state.typing_cache.clone(), state.stream_cache.clone(), app_handle);

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

/// Get recent messages for a room. Optionally pass a pagination token
/// (`from`) to load older history.
#[tauri::command]
pub async fn get_messages(
    state: State<'_, MatrixState>,
    room_id: String,
    from: Option<String>,
) -> Result<MessagesResponse, String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        messages::fetch_messages(client, &room_id, 50, from.as_deref())
            .await
            .map_err(|e| format!("Failed to fetch messages for room {room_id}: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}

/// Send a read receipt for a room, clearing server-side unread count.
#[tauri::command]
pub async fn mark_read(
    state: State<'_, MatrixState>,
    room_id: String,
    event_id: String,
) -> Result<(), String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        messages::mark_read(client, &room_id, &event_id)
            .await
            .map_err(|e| format!("Failed to mark room {room_id} as read: {e}"))
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
            .map_err(|e| format!("Failed to send message to room {room_id}: {e}"))
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
            .map_err(|e| format!("Failed to send reaction {emoji} to event {event_id} in room {room_id}: {e}"))
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
        .map_err(|e| format!("Failed to get typing status for room {room_id}: {e}"))
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
            .map_err(|e| format!("Failed to send typing notice for room {room_id}: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}

/// Create a new room with the given name.
#[tauri::command]
pub async fn create_room(
    state: State<'_, MatrixState>,
    name: String,
) -> Result<CreateRoomResult, String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        rooms::create_room(client, &name)
            .await
            .map_err(|e| format!("Failed to create room: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}

/// Send an image to a room. Accepts base64-encoded image data.
#[tauri::command]
pub async fn send_image(
    state: State<'_, MatrixState>,
    room_id: String,
    filename: String,
    data: String,
    mime_type: String,
    caption: Option<String>,
) -> Result<(), String> {
    use base64::Engine;
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        let bytes = base64::engine::general_purpose::STANDARD
            .decode(&data)
            .map_err(|e| format!("Invalid base64 data: {e}"))?;
        messages::send_image(
            client,
            &room_id,
            &filename,
            bytes,
            &mime_type,
            caption.as_deref(),
        )
        .await
        .map_err(|e| format!("Failed to send image to room {room_id}: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}

/// Send a voice message to a room. Accepts base64-encoded audio data.
#[tauri::command]
pub async fn send_voice_message(
    state: State<'_, MatrixState>,
    room_id: String,
    filename: String,
    data: String,
    mime_type: String,
    duration_ms: Option<u64>,
) -> Result<(), String> {
    use base64::Engine;
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        let bytes = base64::engine::general_purpose::STANDARD
            .decode(&data)
            .map_err(|e| format!("Invalid base64 data: {e}"))?;
        messages::send_voice_message(
            client,
            &room_id,
            &filename,
            bytes,
            &mime_type,
            duration_ms,
        )
        .await
        .map_err(|e| format!("Failed to send voice message to room {room_id}: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}

/// Download media from an mxc:// URI and return it as a data: URI.
/// Uses the SDK's authenticated media download (handles Matrix v1.11+).
#[tauri::command]
pub async fn get_media(
    state: State<'_, MatrixState>,
    mxc_uri: String,
) -> Result<String, String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        messages::download_media(client, &mxc_uri)
            .await
            .map_err(|e| format!("Failed to download media {mxc_uri}: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}

/// Get pinned event IDs for a room.
#[tauri::command]
pub async fn get_pinned_events(
    state: State<'_, MatrixState>,
    room_id: String,
) -> Result<Vec<String>, String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        messages::get_pinned_events(client, &room_id)
            .await
            .map_err(|e| format!("Failed to get pinned events for room {room_id}: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}

/// Pin a message in a room.
#[tauri::command]
pub async fn pin_message(
    state: State<'_, MatrixState>,
    room_id: String,
    event_id: String,
) -> Result<(), String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        messages::pin_message(client, &room_id, &event_id)
            .await
            .map_err(|e| format!("Failed to pin message {event_id} in room {room_id}: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}

/// Unpin a message in a room.
#[tauri::command]
pub async fn unpin_message(
    state: State<'_, MatrixState>,
    room_id: String,
    event_id: String,
) -> Result<(), String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        messages::unpin_message(client, &room_id, &event_id)
            .await
            .map_err(|e| format!("Failed to unpin message {event_id} in room {room_id}: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}

/// Get active streams for a room.
#[tauri::command]
pub async fn get_streams(
    state: State<'_, MatrixState>,
    room_id: String,
) -> Result<Vec<StreamState>, String> {
    streams::get_streams(&state.stream_cache, &room_id)
        .await
        .map_err(|e| format!("Failed to get streams for room {room_id}: {e}"))
}

/// Synthesize text to speech and return base64-encoded mp3 audio.
#[tauri::command]
pub async fn speak_text(text: String) -> Result<String, String> {
    tts::synthesize(&text).await
}

/// Send a stream button action back to a room.
#[tauri::command]
pub async fn send_stream_action(
    state: State<'_, MatrixState>,
    room_id: String,
    stream_id: String,
    button_id: String,
) -> Result<(), String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        streams::send_stream_action(client, &room_id, &stream_id, &button_id)
            .await
            .map_err(|e| format!("Failed to send stream action: {e}"))
    } else {
        Err("Not logged in".to_string())
    }
}
