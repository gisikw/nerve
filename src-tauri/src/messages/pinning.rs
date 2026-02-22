use matrix_sdk::ruma::events::room::pinned_events::RoomPinnedEventsEventContent;
use matrix_sdk::Client;

use crate::error::{self, NerveError, Result};

/// Get the list of pinned event IDs for a room.
pub async fn get_pinned_events(
    client: &Client,
    room_id: &str,
) -> Result<Vec<String>> {
    let room_id = error::parse_room_id(room_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| NerveError::RoomNotFound(room_id.to_string()))?;

    match room.load_pinned_events().await {
        Ok(Some(ids)) => Ok(ids.into_iter().map(|id| id.to_string()).collect()),
        Ok(None) => Ok(Vec::new()),
        Err(_) => Ok(Vec::new()),
    }
}

/// Pin a message by adding its event ID to the room's pinned events.
pub async fn pin_message(
    client: &Client,
    room_id: &str,
    event_id: &str,
) -> Result<()> {
    let room_id = error::parse_room_id(room_id)?;
    let event_id = error::parse_event_id(event_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| NerveError::RoomNotFound(room_id.to_string()))?;

    let mut pinned = room
        .load_pinned_events()
        .await
        .unwrap_or(None)
        .unwrap_or_default();

    if !pinned.contains(&event_id) {
        pinned.push(event_id);
        let content = RoomPinnedEventsEventContent::new(pinned);
        room.send_state_event(content).await?;
    }

    Ok(())
}

/// Unpin a message by removing its event ID from the room's pinned events.
pub async fn unpin_message(
    client: &Client,
    room_id: &str,
    event_id: &str,
) -> Result<()> {
    let room_id = error::parse_room_id(room_id)?;
    let event_id = error::parse_event_id(event_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| NerveError::RoomNotFound(room_id.to_string()))?;

    let mut pinned = room
        .load_pinned_events()
        .await
        .unwrap_or(None)
        .unwrap_or_default();

    pinned.retain(|id| id != &event_id);
    let content = RoomPinnedEventsEventContent::new(pinned);
    room.send_state_event(content).await?;

    Ok(())
}
