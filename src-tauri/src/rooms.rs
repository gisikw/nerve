use anyhow::Result;
use futures::future::join_all;
use matrix_sdk::ruma::api::client::room::create_room::v3::Request as CreateRoomRequest;
use matrix_sdk::ruma::api::client::room::Visibility;
use matrix_sdk::ruma::events::room::member::SyncRoomMemberEvent;
use matrix_sdk::ruma::events::room::name::SyncRoomNameEvent;
use matrix_sdk::Client;
use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::typing::TypingCache;

#[derive(Serialize, Clone)]
pub struct RoomInfo {
    pub id: String,
    pub name: String,
    pub is_direct: bool,
    pub notification_count: u64,
    pub typing_users: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub topic: Option<String>,
}

/// Collect room info from the client's current state.
/// Fetches is_direct status in parallel to avoid sequential per-room latency.
/// Includes typing users from the shared cache.
pub async fn collect_rooms(client: &Client, typing_cache: &TypingCache) -> Vec<RoomInfo> {
    let joined = client.joined_rooms();
    let typing_snapshot = typing_cache.read().await;

    let futures: Vec<_> = joined
        .into_iter()
        .map(|room| {
            let typing_users = typing_snapshot
                .get(room.room_id())
                .map(|ids| ids.iter().map(|id| id.to_string()).collect())
                .unwrap_or_default();
            async move {
                let name = room
                    .cached_display_name()
                    .map(|n| n.to_string())
                    .unwrap_or_else(|| room.room_id().to_string());
                let is_direct = room.is_direct().await.unwrap_or(false);
                let notification_count = room.unread_notification_counts().notification_count;

                let topic = room.topic();

                RoomInfo {
                    id: room.room_id().to_string(),
                    name,
                    is_direct,
                    notification_count,
                    typing_users,
                    topic,
                }
            }
        })
        .collect();

    let mut rooms = join_all(futures).await;
    rooms.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    rooms
}

#[derive(Serialize)]
pub struct CreateRoomResult {
    pub room_id: String,
}

/// Register event handlers that emit `rooms-updated` when room state changes
/// (name changes, membership changes). The frontend uses this to refresh the
/// room list without polling.
pub fn register_handler(client: &Client, app_handle: AppHandle) {
    // Room name changes
    let ah = app_handle.clone();
    client.add_event_handler(move |_event: SyncRoomNameEvent, _room: matrix_sdk::Room| {
        let ah = ah.clone();
        async move {
            let _ = ah.emit("rooms-updated", ());
        }
    });

    // Room membership changes (joins, leaves, etc.)
    client.add_event_handler(move |_event: SyncRoomMemberEvent, _room: matrix_sdk::Room| {
        let app_handle = app_handle.clone();
        async move {
            let _ = app_handle.emit("rooms-updated", ());
        }
    });
}

/// Create a new room with the given name.
pub async fn create_room(client: &Client, name: &str) -> Result<CreateRoomResult> {
    let mut request = CreateRoomRequest::new();
    request.name = Some(name.to_owned());
    request.visibility = Visibility::Private;

    let response = client.create_room(request).await?;
    Ok(CreateRoomResult {
        room_id: response.room_id().to_string(),
    })
}
