use std::collections::HashMap;

use matrix_sdk::room::MessagesOptions;
use matrix_sdk::ruma::events::reaction::ReactionEventContent;
use matrix_sdk::ruma::events::room::message::{MessageType, Relation, RoomMessageEventContent};
use matrix_sdk::ruma::events::room::MediaSource;
use matrix_sdk::ruma::events::{AnySyncMessageLikeEvent, AnySyncTimelineEvent};
use matrix_sdk::ruma::OwnedEventId;
use matrix_sdk::Client;
use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct ReactionInfo {
    pub emoji: String,
    pub count: u32,
    pub include_self: bool,
}

#[derive(Serialize, Clone)]
pub struct MessageInfo {
    pub event_id: String,
    pub sender: String,
    pub body: String,
    pub timestamp: i64,
    pub msg_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub media_url: Option<String>,
    pub reactions: Vec<ReactionInfo>,
}

/// Convert an mxc:// URI to an HTTP download URL via the homeserver.
fn mxc_to_http(client: &Client, source: &MediaSource) -> Option<String> {
    let mxc_uri = match source {
        MediaSource::Plain(uri) => uri,
        MediaSource::Encrypted(_) => return None,
    };

    let (server_name, media_id) = mxc_uri.parts().ok()?;
    let homeserver = client.homeserver();
    let url = format!(
        "{}/_matrix/media/v3/download/{}/{}",
        homeserver.as_str().trim_end_matches('/'),
        server_name,
        media_id,
    );
    Some(url)
}

/// Extract body, msg_type, and media_url from a message type.
fn extract_content(client: &Client, msgtype: &MessageType) -> (String, String, Option<String>) {
    match msgtype {
        MessageType::Text(t) => (t.body.clone(), "text".to_string(), None),
        MessageType::Notice(n) => (n.body.clone(), "notice".to_string(), None),
        MessageType::Emote(e) => (format!("* {}", e.body), "emote".to_string(), None),
        MessageType::Image(img) => {
            let url = mxc_to_http(client, &img.source);
            let caption = img.caption().unwrap_or(&img.body);
            (caption.to_string(), "image".to_string(), url)
        }
        MessageType::File(_) => ("[file]".to_string(), "other".to_string(), None),
        MessageType::Audio(_) => ("[audio]".to_string(), "other".to_string(), None),
        MessageType::Video(_) => ("[video]".to_string(), "other".to_string(), None),
        _ => ("[unsupported]".to_string(), "other".to_string(), None),
    }
}

/// Track senders per (event_id, emoji) for reaction aggregation.
struct ReactionAccumulator {
    /// Map from target event ID -> emoji -> set of sender user IDs
    reactions: HashMap<OwnedEventId, HashMap<String, Vec<String>>>,
}

impl ReactionAccumulator {
    fn new() -> Self {
        Self {
            reactions: HashMap::new(),
        }
    }

    fn add(&mut self, target_event_id: OwnedEventId, emoji: String, sender: String) {
        self.reactions
            .entry(target_event_id)
            .or_default()
            .entry(emoji)
            .or_default()
            .push(sender);
    }

    fn for_event(&self, event_id: &str, self_user_id: &str) -> Vec<ReactionInfo> {
        let event_id = match OwnedEventId::try_from(event_id) {
            Ok(id) => id,
            Err(_) => return Vec::new(),
        };
        let Some(emoji_map) = self.reactions.get(&event_id) else {
            return Vec::new();
        };
        let mut reactions: Vec<ReactionInfo> = emoji_map
            .iter()
            .map(|(emoji, senders)| ReactionInfo {
                emoji: emoji.clone(),
                count: senders.len() as u32,
                include_self: senders.iter().any(|s| s == self_user_id),
            })
            .collect();
        reactions.sort_by(|a, b| b.count.cmp(&a.count));
        reactions
    }
}

/// Fetch recent messages for a room. Returns newest-last.
pub async fn fetch_messages(
    client: &Client,
    room_id: &str,
    limit: u32,
) -> anyhow::Result<Vec<MessageInfo>> {
    let room_id = matrix_sdk::ruma::RoomId::parse(room_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| anyhow::anyhow!("Room not found"))?;

    let self_user_id = client
        .user_id()
        .map(|id| id.to_string())
        .unwrap_or_default();

    let options = MessagesOptions::backward().from(None::<&str>);
    let response = room.messages(options).await?;

    let mut messages: Vec<MessageInfo> = Vec::new();
    let mut reaction_acc = ReactionAccumulator::new();

    for timeline_event in response.chunk {
        let raw = timeline_event.raw();
        let Ok(event) = raw.deserialize() else {
            continue;
        };

        match event {
            AnySyncTimelineEvent::MessageLike(AnySyncMessageLikeEvent::RoomMessage(msg)) => {
                let Some(original) = msg.as_original() else {
                    messages.push(MessageInfo {
                        event_id: msg.event_id().to_string(),
                        sender: msg.sender().to_string(),
                        body: "[redacted]".to_string(),
                        timestamp: msg.origin_server_ts().0.into(),
                        msg_type: "redacted".to_string(),
                        media_url: None,
                        reactions: Vec::new(),
                    });
                    continue;
                };

                // If this is an edit (m.replace), update the original message's
                // body instead of adding a duplicate entry.
                if let Some(Relation::Replacement(replacement)) = &original.content.relates_to {
                    let target_id = replacement.event_id.to_string();
                    let (body, msg_type, media_url) =
                        extract_content(client, &replacement.new_content.msgtype);
                    if let Some(target) = messages.iter_mut().find(|m| m.event_id == target_id) {
                        target.body = body;
                        target.msg_type = msg_type;
                        target.media_url = media_url;
                    }
                    continue;
                }

                let (body, msg_type, media_url) =
                    extract_content(client, &original.content.msgtype);

                messages.push(MessageInfo {
                    event_id: msg.event_id().to_string(),
                    sender: msg.sender().to_string(),
                    body,
                    timestamp: msg.origin_server_ts().0.into(),
                    msg_type,
                    media_url,
                    reactions: Vec::new(),
                });
            }
            AnySyncTimelineEvent::MessageLike(AnySyncMessageLikeEvent::Reaction(reaction)) => {
                if let Some(original) = reaction.as_original() {
                    let annotation = &original.content.relates_to;
                    reaction_acc.add(
                        annotation.event_id.clone(),
                        annotation.key.clone(),
                        reaction.sender().to_string(),
                    );
                }
            }
            _ => {}
        }
    }

    // Attach aggregated reactions to their messages
    for msg in &mut messages {
        msg.reactions = reaction_acc.for_event(&msg.event_id, &self_user_id);
    }

    // Response comes newest-first (backward); reverse for display order
    messages.reverse();

    // Limit to the last N
    if messages.len() > limit as usize {
        messages = messages.split_off(messages.len() - limit as usize);
    }

    Ok(messages)
}

/// Send a text message to a room.
pub async fn send_message(
    client: &Client,
    room_id: &str,
    body: &str,
) -> anyhow::Result<()> {
    let room_id = matrix_sdk::ruma::RoomId::parse(room_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| anyhow::anyhow!("Room not found"))?;

    let content = RoomMessageEventContent::text_plain(body);
    room.send(content).await?;
    Ok(())
}

/// Send a reaction (emoji annotation) to an event in a room.
pub async fn send_reaction(
    client: &Client,
    room_id: &str,
    event_id: &str,
    emoji: &str,
) -> anyhow::Result<()> {
    let room_id = matrix_sdk::ruma::RoomId::parse(room_id)?;
    let event_id = OwnedEventId::try_from(event_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| anyhow::anyhow!("Room not found"))?;

    let content = ReactionEventContent::new(
        matrix_sdk::ruma::events::relation::Annotation::new(event_id, emoji.to_string()),
    );
    room.send(content).await?;
    Ok(())
}
