use std::collections::HashMap;
use std::sync::Arc;

use matrix_sdk::ruma::events::typing::SyncTypingEvent;
use matrix_sdk::ruma::{OwnedRoomId, OwnedUserId};
use matrix_sdk::Client;
use serde::Serialize;
use tokio::sync::RwLock;

/// Shared cache of who is currently typing in each room.
pub type TypingCache = Arc<RwLock<HashMap<OwnedRoomId, Vec<OwnedUserId>>>>;

pub fn new_cache() -> TypingCache {
    Arc::new(RwLock::new(HashMap::new()))
}

/// Register a global event handler that updates the typing cache on each
/// `m.typing` sync event.
pub fn register_handler(client: &Client, cache: TypingCache) {
    let own_user_id = client.user_id().map(|id| id.to_owned());

    client.add_event_handler(move |event: SyncTypingEvent, room: matrix_sdk::Room| {
        let cache = cache.clone();
        let own_user_id = own_user_id.clone();
        async move {
            let users: Vec<OwnedUserId> = event
                .content
                .user_ids
                .into_iter()
                .filter(|uid| own_user_id.as_ref().map_or(true, |own| uid != own))
                .collect();
            cache.write().await.insert(room.room_id().to_owned(), users);
        }
    });
}

#[derive(Serialize)]
pub struct TypingStatus {
    pub users: Vec<String>,
}

/// Read the current typing users for a room from the cache.
pub async fn get_typing_users(
    cache: &TypingCache,
    room_id: &str,
) -> anyhow::Result<TypingStatus> {
    let room_id = matrix_sdk::ruma::RoomId::parse(room_id)?;
    let guard = cache.read().await;
    let users = guard
        .get(&*room_id)
        .map(|ids| ids.iter().map(|id| id.to_string()).collect())
        .unwrap_or_default();
    Ok(TypingStatus { users })
}

/// Send a typing notification to a room.
pub async fn send_typing(
    client: &Client,
    room_id: &str,
    typing: bool,
) -> anyhow::Result<()> {
    let room_id = matrix_sdk::ruma::RoomId::parse(room_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| anyhow::anyhow!("Room not found"))?;
    room.typing_notice(typing).await?;
    Ok(())
}
