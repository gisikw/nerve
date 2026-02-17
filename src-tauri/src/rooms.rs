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
pub async fn collect_rooms(client: &Client) -> Vec<RoomInfo> {
    let joined = client.joined_rooms();
    let mut rooms = Vec::with_capacity(joined.len());

    for room in joined {
        let name = room
            .cached_display_name()
            .map(|n| n.to_string())
            .unwrap_or_else(|| room.room_id().to_string());
        let is_direct = room.is_direct().await.unwrap_or(false);
        let notification_count = room.unread_notification_counts().notification_count;

        rooms.push(RoomInfo {
            id: room.room_id().to_string(),
            name,
            is_direct,
            notification_count,
        });
    }

    rooms.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    rooms
}
