use matrix_sdk::ruma::events::reaction::ReactionEventContent;
use matrix_sdk::Client;
use serde::Serialize;

use crate::error::{self, NerveError, Result};

#[derive(Serialize, Clone)]
pub struct ReactionInfo {
    pub emoji: String,
    pub count: u32,
    pub include_self: bool,
}

/// Send a reaction (emoji annotation) to an event in a room.
pub async fn send_reaction(
    client: &Client,
    room_id: &str,
    event_id: &str,
    emoji: &str,
) -> Result<()> {
    let room_id = error::parse_room_id(room_id)?;
    let event_id = error::parse_event_id(event_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| NerveError::RoomNotFound(room_id.to_string()))?;

    let content = ReactionEventContent::new(
        matrix_sdk::ruma::events::relation::Annotation::new(event_id, emoji.to_string()),
    );
    room.send(content).await?;
    Ok(())
}
