use futures::future::join_all;
use matrix_sdk::Client;
use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct RoomInfo {
    pub id: String,
    pub name: String,
    pub is_direct: bool,
    pub notification_count: u64,
}

/// Collect room info from the client's current state.
/// Fetches is_direct status in parallel to avoid sequential per-room latency.
pub async fn collect_rooms(client: &Client) -> Vec<RoomInfo> {
    let joined = client.joined_rooms();

    let futures: Vec<_> = joined
        .into_iter()
        .map(|room| async move {
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
            }
        })
        .collect();

    let mut rooms = join_all(futures).await;
    rooms.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    rooms
}
