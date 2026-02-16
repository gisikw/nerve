use matrix_sdk::room::MessagesOptions;
use matrix_sdk::ruma::events::room::message::MessageType;
use matrix_sdk::ruma::events::{AnySyncMessageLikeEvent, AnySyncTimelineEvent};
use matrix_sdk::Client;
use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct MessageInfo {
    pub event_id: String,
    pub sender: String,
    pub body: String,
    pub timestamp: i64,
    pub msg_type: String,
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

    let options = MessagesOptions::backward().from(None::<&str>);
    let response = room.messages(options).await?;

    let mut messages: Vec<MessageInfo> = Vec::new();

    for timeline_event in response.chunk {
        let raw = timeline_event.raw();
        let Ok(event) = raw.deserialize() else {
            continue;
        };

        if let AnySyncTimelineEvent::MessageLike(
            AnySyncMessageLikeEvent::RoomMessage(msg),
        ) = event
        {
            let (body, msg_type) = match msg.as_original() {
                Some(original) => {
                    let body = match &original.content.msgtype {
                        MessageType::Text(t) => t.body.clone(),
                        MessageType::Notice(n) => n.body.clone(),
                        MessageType::Emote(e) => format!("* {}", e.body),
                        MessageType::Image(_) => "[image]".to_string(),
                        MessageType::File(_) => "[file]".to_string(),
                        MessageType::Audio(_) => "[audio]".to_string(),
                        MessageType::Video(_) => "[video]".to_string(),
                        _ => "[unsupported]".to_string(),
                    };
                    let msg_type = match &original.content.msgtype {
                        MessageType::Text(_) => "text",
                        MessageType::Notice(_) => "notice",
                        MessageType::Emote(_) => "emote",
                        MessageType::Image(_) => "image",
                        _ => "other",
                    };
                    (body, msg_type.to_string())
                }
                None => ("[redacted]".to_string(), "redacted".to_string()),
            };

            let sender = msg.sender().to_string();
            let timestamp = msg.origin_server_ts().0.into();
            let event_id = msg.event_id().to_string();

            messages.push(MessageInfo {
                event_id,
                sender,
                body,
                timestamp,
                msg_type,
            });
        }
    }

    // Response comes newest-first (backward); reverse for display order
    messages.reverse();

    // Limit to the last N
    if messages.len() > limit as usize {
        messages = messages.split_off(messages.len() - limit as usize);
    }

    Ok(messages)
}
