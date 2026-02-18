use futures::future::join_all;
use matrix_sdk::Client;
use serde::Serialize;

use crate::typing::TypingCache;

#[derive(Serialize, Clone)]
pub struct RoomInfo {
    pub id: String,
    pub name: String,
    pub is_direct: bool,
    pub notification_count: u64,
    pub typing_users: Vec<String>,
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

                RoomInfo {
                    id: room.room_id().to_string(),
                    name,
                    is_direct,
                    notification_count,
                    typing_users,
                }
            }
        })
        .collect();

    let mut rooms = join_all(futures).await;
    rooms.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    rooms
}
