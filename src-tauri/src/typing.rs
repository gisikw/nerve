use std::collections::HashMap;
use std::sync::Arc;

use matrix_sdk::ruma::events::typing::SyncTypingEvent;
use matrix_sdk::ruma::{OwnedRoomId, OwnedUserId};
use matrix_sdk::Client;
use serde::Serialize;
use tokio::sync::RwLock;

use crate::error::{self, NerveError, Result};

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
) -> Result<TypingStatus> {
    let room_id = error::parse_room_id(room_id)?;
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
) -> Result<()> {
    let room_id = error::parse_room_id(room_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| NerveError::RoomNotFound(room_id.to_string()))?;
    room.typing_notice(typing).await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use matrix_sdk::ruma::RoomId;

    fn room_id(s: &str) -> OwnedRoomId {
        RoomId::parse(s).unwrap()
    }

    fn user_id(s: &str) -> OwnedUserId {
        OwnedUserId::try_from(s).unwrap()
    }

    #[test]
    fn new_cache_is_empty() {
        let cache = new_cache();
        let guard = cache.try_read().unwrap();
        assert!(guard.is_empty());
    }

    #[tokio::test]
    async fn get_typing_users_empty_cache() {
        let cache = new_cache();
        let result = get_typing_users(&cache, "!room:matrix.org").await;
        assert!(result.is_ok());
        assert!(result.unwrap().users.is_empty());
    }

    #[tokio::test]
    async fn get_typing_users_populated_cache() {
        let cache = new_cache();
        {
            let mut guard = cache.write().await;
            guard.insert(
                room_id("!room:matrix.org"),
                vec![user_id("@alice:matrix.org"), user_id("@bob:matrix.org")],
            );
        }

        let result = get_typing_users(&cache, "!room:matrix.org").await.unwrap();
        assert_eq!(result.users.len(), 2);
        assert!(result.users.contains(&"@alice:matrix.org".to_string()));
        assert!(result.users.contains(&"@bob:matrix.org".to_string()));
    }

    #[tokio::test]
    async fn get_typing_users_wrong_room() {
        let cache = new_cache();
        {
            let mut guard = cache.write().await;
            guard.insert(
                room_id("!room1:matrix.org"),
                vec![user_id("@alice:matrix.org")],
            );
        }

        let result = get_typing_users(&cache, "!room2:matrix.org").await.unwrap();
        assert!(result.users.is_empty());
    }

    #[tokio::test]
    async fn get_typing_users_invalid_room_id() {
        let cache = new_cache();
        let result = get_typing_users(&cache, "not-a-room").await;
        assert!(result.is_err());
    }
}
