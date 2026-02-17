use matrix_sdk::room::MessagesOptions;
use matrix_sdk::ruma::events::room::message::{MessageType, RoomMessageEventContent};
use matrix_sdk::ruma::events::room::MediaSource;
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
    #[serde(skip_serializing_if = "Option::is_none")]
    pub media_url: Option<String>,
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
            let (body, msg_type, media_url) = match msg.as_original() {
                Some(original) => {
                    let (body, msg_type, media_url) = match &original.content.msgtype {
                        MessageType::Text(t) => (t.body.clone(), "text", None),
                        MessageType::Notice(n) => (n.body.clone(), "notice", None),
                        MessageType::Emote(e) => (format!("* {}", e.body), "emote", None),
                        MessageType::Image(img) => {
                            let url = mxc_to_http(client, &img.source);
                            let caption = img.caption().unwrap_or(&img.body);
                            (caption.to_string(), "image", url)
                        }
                        MessageType::File(_) => ("[file]".to_string(), "other", None),
                        MessageType::Audio(_) => ("[audio]".to_string(), "other", None),
                        MessageType::Video(_) => ("[video]".to_string(), "other", None),
                        _ => ("[unsupported]".to_string(), "other", None),
                    };
                    (body, msg_type.to_string(), media_url)
                }
                None => ("[redacted]".to_string(), "redacted".to_string(), None),
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
                media_url,
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
