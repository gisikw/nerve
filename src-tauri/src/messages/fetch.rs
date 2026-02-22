use std::collections::HashMap;

use matrix_sdk::room::MessagesOptions;
use matrix_sdk::ruma::events::room::message::{
    MessageType, OriginalSyncRoomMessageEvent, Relation,
};
use matrix_sdk::ruma::events::{AnySyncMessageLikeEvent, AnySyncTimelineEvent};
use matrix_sdk::ruma::OwnedEventId;
use matrix_sdk::Client;
use tauri::{AppHandle, Emitter};
use tracing::warn;

use crate::error::{self, NerveError, Result};

use super::types::{MessageInfo, MessagesResponse, MessagesUpdatedEvent, ReactionInfo, mxc_uri_string};

/// Register an event handler that emits `messages-updated` when new messages
/// arrive in any room. The frontend uses this to fetch fresh messages instead
/// of polling.
pub fn register_handler(client: &Client, app_handle: AppHandle) {
    client.add_event_handler(
        move |_event: OriginalSyncRoomMessageEvent, room: matrix_sdk::Room| {
            let app_handle = app_handle.clone();
            async move {
                let _ = app_handle.emit(
                    "messages-updated",
                    MessagesUpdatedEvent {
                        room_id: room.room_id().to_string(),
                    },
                );
            }
        },
    );
}

/// Extract body, msg_type, and media_url from a message type.
fn extract_content(msgtype: &MessageType) -> (String, String, Option<String>) {
    match msgtype {
        MessageType::Text(t) => (t.body.clone(), "text".to_string(), None),
        MessageType::Notice(n) => (n.body.clone(), "notice".to_string(), None),
        MessageType::Emote(e) => (format!("* {}", e.body), "emote".to_string(), None),
        MessageType::Image(img) => {
            let url = mxc_uri_string(&img.source);
            let caption = img.caption().unwrap_or_default();
            (caption.to_string(), "image".to_string(), url)
        }
        MessageType::File(_) => ("[file]".to_string(), "other".to_string(), None),
        MessageType::Audio(audio) => {
            let url = mxc_uri_string(&audio.source);
            (audio.body.clone(), "audio".to_string(), url)
        }
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
///
/// If `from_token` is `None`, fetches the most recent messages.
/// If `from_token` is `Some`, fetches messages older than the token
/// (for backward pagination / scroll-back).
pub async fn fetch_messages(
    client: &Client,
    room_id: &str,
    limit: u32,
    from_token: Option<&str>,
) -> Result<MessagesResponse> {
    let room_id = error::parse_room_id(room_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| NerveError::RoomNotFound(room_id.to_string()))?;

    let self_user_id = client
        .user_id()
        .map(|id| id.to_string())
        .unwrap_or_default();

    let mut options = MessagesOptions::backward().from(from_token);
    options.limit = limit.into();
    let response = room.messages(options).await?;

    let mut messages: Vec<MessageInfo> = Vec::new();
    let mut reaction_acc = ReactionAccumulator::new();
    // Edits collected separately since backward iteration means the edit event
    // arrives before the target message. Key: target event ID.
    let mut edits: HashMap<String, (String, String, Option<String>)> = HashMap::new();

    for timeline_event in response.chunk {
        let raw = timeline_event.raw();
        let Ok(event) = raw.deserialize() else {
            warn!(
                room_id = %room_id,
                "Skipping timeline event that failed to deserialize"
            );
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

                // If this is an edit (m.replace), stash it for later application.
                if let Some(Relation::Replacement(replacement)) = &original.content.relates_to {
                    let target_id = replacement.event_id.to_string();
                    let (body, msg_type, media_url) =
                        extract_content(&replacement.new_content.msgtype);
                    // Only keep the newest edit per target (first one seen in
                    // backward order is newest).
                    edits.entry(target_id).or_insert((body, msg_type, media_url));
                    continue;
                }

                let (body, msg_type, media_url) =
                    extract_content(&original.content.msgtype);

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

    // Apply edits to their target messages
    for msg in &mut messages {
        if let Some((body, msg_type, media_url)) = edits.remove(&msg.event_id) {
            msg.body = body;
            msg.msg_type = msg_type;
            msg.media_url = media_url;
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

    Ok(MessagesResponse {
        messages,
        end_token: response.end,
    })
}

/// Send a read receipt for the given event, clearing the server-side unread
/// notification count for the room.
pub async fn mark_read(client: &Client, room_id: &str, event_id: &str) -> Result<()> {
    use matrix_sdk::ruma::api::client::receipt::create_receipt::v3::ReceiptType;
    use matrix_sdk::ruma::events::receipt::ReceiptThread;

    let room_id = error::parse_room_id(room_id)?;
    let event_id = error::parse_event_id(event_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| NerveError::RoomNotFound(room_id.to_string()))?;

    room.send_single_receipt(ReceiptType::Read, ReceiptThread::Unthreaded, event_id)
        .await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn event_id(s: &str) -> OwnedEventId {
        OwnedEventId::try_from(s).unwrap()
    }

    #[test]
    fn reaction_accumulator_empty() {
        let acc = ReactionAccumulator::new();
        let reactions = acc.for_event("$evt:matrix.org", "@me:matrix.org");
        assert!(reactions.is_empty());
    }

    #[test]
    fn reaction_accumulator_single_reaction() {
        let mut acc = ReactionAccumulator::new();
        acc.add(event_id("$evt:matrix.org"), "👍".to_string(), "@alice:matrix.org".to_string());

        let reactions = acc.for_event("$evt:matrix.org", "@bob:matrix.org");
        assert_eq!(reactions.len(), 1);
        assert_eq!(reactions[0].emoji, "👍");
        assert_eq!(reactions[0].count, 1);
        assert!(!reactions[0].include_self);
    }

    #[test]
    fn reaction_accumulator_include_self() {
        let mut acc = ReactionAccumulator::new();
        acc.add(event_id("$evt:matrix.org"), "👍".to_string(), "@me:matrix.org".to_string());
        acc.add(event_id("$evt:matrix.org"), "👍".to_string(), "@alice:matrix.org".to_string());

        let reactions = acc.for_event("$evt:matrix.org", "@me:matrix.org");
        assert_eq!(reactions.len(), 1);
        assert_eq!(reactions[0].count, 2);
        assert!(reactions[0].include_self);
    }

    #[test]
    fn reaction_accumulator_not_include_self() {
        let mut acc = ReactionAccumulator::new();
        acc.add(event_id("$evt:matrix.org"), "👍".to_string(), "@alice:matrix.org".to_string());
        acc.add(event_id("$evt:matrix.org"), "👍".to_string(), "@bob:matrix.org".to_string());

        let reactions = acc.for_event("$evt:matrix.org", "@me:matrix.org");
        assert_eq!(reactions[0].count, 2);
        assert!(!reactions[0].include_self);
    }

    #[test]
    fn reaction_accumulator_multiple_emoji() {
        let mut acc = ReactionAccumulator::new();
        acc.add(event_id("$evt:matrix.org"), "👍".to_string(), "@alice:matrix.org".to_string());
        acc.add(event_id("$evt:matrix.org"), "❤️".to_string(), "@bob:matrix.org".to_string());
        acc.add(event_id("$evt:matrix.org"), "❤️".to_string(), "@carol:matrix.org".to_string());

        let reactions = acc.for_event("$evt:matrix.org", "@me:matrix.org");
        assert_eq!(reactions.len(), 2);
        // Sorted by count descending — ❤️ (2) before 👍 (1)
        assert_eq!(reactions[0].emoji, "❤️");
        assert_eq!(reactions[0].count, 2);
        assert_eq!(reactions[1].emoji, "👍");
        assert_eq!(reactions[1].count, 1);
    }

    #[test]
    fn reaction_accumulator_different_events() {
        let mut acc = ReactionAccumulator::new();
        acc.add(event_id("$evt1:matrix.org"), "👍".to_string(), "@alice:matrix.org".to_string());
        acc.add(event_id("$evt2:matrix.org"), "❤️".to_string(), "@bob:matrix.org".to_string());

        let r1 = acc.for_event("$evt1:matrix.org", "@me:matrix.org");
        assert_eq!(r1.len(), 1);
        assert_eq!(r1[0].emoji, "👍");

        let r2 = acc.for_event("$evt2:matrix.org", "@me:matrix.org");
        assert_eq!(r2.len(), 1);
        assert_eq!(r2[0].emoji, "❤️");
    }

    #[test]
    fn reaction_accumulator_invalid_event_id_returns_empty() {
        let mut acc = ReactionAccumulator::new();
        acc.add(event_id("$evt:matrix.org"), "👍".to_string(), "@alice:matrix.org".to_string());

        let reactions = acc.for_event("not-a-valid-id", "@me:matrix.org");
        assert!(reactions.is_empty());
    }

    #[test]
    fn reaction_accumulator_unknown_event_returns_empty() {
        let mut acc = ReactionAccumulator::new();
        acc.add(event_id("$evt:matrix.org"), "👍".to_string(), "@alice:matrix.org".to_string());

        let reactions = acc.for_event("$other:matrix.org", "@me:matrix.org");
        assert!(reactions.is_empty());
    }

    #[test]
    fn reaction_accumulator_multiple_senders_same_emoji() {
        let mut acc = ReactionAccumulator::new();
        let eid = event_id("$evt:matrix.org");
        for i in 0..5 {
            acc.add(eid.clone(), "🎉".to_string(), format!("@user{i}:matrix.org"));
        }

        let reactions = acc.for_event("$evt:matrix.org", "@user2:matrix.org");
        assert_eq!(reactions.len(), 1);
        assert_eq!(reactions[0].count, 5);
        assert!(reactions[0].include_self);
    }
}
