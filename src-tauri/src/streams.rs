use std::collections::HashMap;
use std::sync::Arc;

use matrix_sdk::ruma::OwnedRoomId;
use matrix_sdk::Client;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

use crate::error::{self, NerveError, Result};

/// Wire format for `network.gisi.nerve.stream` event content.
#[derive(Clone, Debug, Deserialize)]
pub struct StreamEventContent {
    pub action: String,
    pub stream_id: String,
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub text: Option<String>,
    #[serde(default)]
    pub channel: Option<String>,
    #[serde(default)]
    pub buttons: Vec<StreamButton>,
}

/// Raw event wrapper — we deserialize just enough to check the type and
/// extract content.
#[derive(Deserialize)]
struct RawEventEnvelope {
    #[serde(rename = "type")]
    event_type: String,
    content: serde_json::Value,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct StreamButton {
    pub id: String,
    pub label: String,
}

/// In-memory state for a single stream.
#[derive(Clone, Debug, Serialize)]
pub struct StreamState {
    pub stream_id: String,
    pub name: String,
    pub buttons: Vec<StreamButton>,
    pub lines: Vec<StreamLine>,
    pub closed: bool,
}

#[derive(Clone, Debug, Serialize)]
pub struct StreamLine {
    pub text: String,
    pub channel: String,
}

/// Per-room map of active streams, keyed by stream_id.
pub type StreamCache = Arc<RwLock<HashMap<OwnedRoomId, HashMap<String, StreamState>>>>;

pub fn new_cache() -> StreamCache {
    Arc::new(RwLock::new(HashMap::new()))
}

/// Register a raw sync event handler that catches our custom event type.
///
/// We use `Raw<AnySyncTimelineEvent>` to get the raw JSON bytes, then
/// check the type field ourselves and deserialize the content if it matches.
pub fn register_handler(client: &Client, cache: StreamCache) {
    use matrix_sdk::ruma::events::AnySyncTimelineEvent;
    use matrix_sdk::ruma::serde::Raw;

    client.add_event_handler(
        move |raw: Raw<AnySyncTimelineEvent>, room: matrix_sdk::Room| {
            let cache = cache.clone();
            async move {
                // Deserialize just enough to check the type
                let envelope: RawEventEnvelope = match serde_json::from_str(raw.json().get()) {
                    Ok(e) => e,
                    Err(_) => return,
                };

                if envelope.event_type != "network.gisi.nerve.stream" {
                    return;
                }

                let content: StreamEventContent =
                    match serde_json::from_value(envelope.content) {
                        Ok(c) => c,
                        Err(_) => return,
                    };

                let room_id = room.room_id().to_owned();
                let mut guard = cache.write().await;
                let room_streams = guard.entry(room_id).or_default();

                match content.action.as_str() {
                    "open" => {
                        room_streams.insert(
                            content.stream_id.clone(),
                            StreamState {
                                stream_id: content.stream_id,
                                name: content.name.unwrap_or_else(|| "Stream".to_string()),
                                buttons: content.buttons,
                                lines: Vec::new(),
                                closed: false,
                            },
                        );
                    }
                    "append" => {
                        if let Some(stream) = room_streams.get_mut(&content.stream_id) {
                            if !stream.closed {
                                stream.lines.push(StreamLine {
                                    text: content.text.unwrap_or_default(),
                                    channel: content
                                        .channel
                                        .unwrap_or_else(|| "stdout".to_string()),
                                });
                            }
                        }
                    }
                    "close" => {
                        if let Some(stream) = room_streams.get_mut(&content.stream_id) {
                            stream.closed = true;
                        }
                    }
                    _ => {}
                }
            }
        },
    );
}

/// Get all stream states for a room.
pub async fn get_streams(cache: &StreamCache, room_id: &str) -> Result<Vec<StreamState>> {
    let room_id = error::parse_room_id(room_id)?;
    let guard = cache.read().await;
    let streams = guard
        .get(&*room_id)
        .map(|m| m.values().cloned().collect())
        .unwrap_or_default();
    Ok(streams)
}

/// Send a button press (stream action) back to the room as a custom event.
pub async fn send_stream_action(
    client: &Client,
    room_id: &str,
    stream_id: &str,
    button_id: &str,
) -> Result<()> {
    use matrix_sdk::ruma::api::client::message::send_message_event;
    use matrix_sdk::ruma::TransactionId;

    let room_id = error::parse_room_id(room_id)?;
    let _room = client
        .get_room(&room_id)
        .ok_or_else(|| NerveError::RoomNotFound(room_id.to_string()))?;

    let content = serde_json::json!({
        "stream_id": stream_id,
        "button_id": button_id,
    });

    let raw_content = matrix_sdk::ruma::serde::Raw::from_json(
        serde_json::value::to_raw_value(&content)
            .map_err(|e| NerveError::Io(std::io::Error::new(std::io::ErrorKind::InvalidData, e)))?,
    );

    let request = send_message_event::v3::Request::new_raw(
        room_id,
        TransactionId::new(),
        "network.gisi.nerve.stream_action".into(),
        raw_content,
    );

    client.send(request).await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use matrix_sdk::ruma::RoomId;

    fn room_id(s: &str) -> OwnedRoomId {
        RoomId::parse(s).unwrap()
    }

    #[tokio::test]
    async fn new_cache_is_empty() {
        let cache = new_cache();
        let guard = cache.read().await;
        assert!(guard.is_empty());
    }

    #[tokio::test]
    async fn get_streams_empty_cache() {
        let cache = new_cache();
        let result = get_streams(&cache, "!room:matrix.org").await;
        assert!(result.is_ok());
        assert!(result.unwrap().is_empty());
    }

    #[tokio::test]
    async fn get_streams_with_data() {
        let cache = new_cache();
        {
            let mut guard = cache.write().await;
            let mut room_map = HashMap::new();
            room_map.insert(
                "stream-1".to_string(),
                StreamState {
                    stream_id: "stream-1".to_string(),
                    name: "Build Output".to_string(),
                    buttons: vec![StreamButton {
                        id: "cancel".to_string(),
                        label: "Cancel".to_string(),
                    }],
                    lines: vec![StreamLine {
                        text: "compiling...".to_string(),
                        channel: "stdout".to_string(),
                    }],
                    closed: false,
                },
            );
            guard.insert(room_id("!room:matrix.org"), room_map);
        }

        let streams = get_streams(&cache, "!room:matrix.org").await.unwrap();
        assert_eq!(streams.len(), 1);
        assert_eq!(streams[0].name, "Build Output");
        assert_eq!(streams[0].lines.len(), 1);
    }

    #[tokio::test]
    async fn get_streams_invalid_room_id() {
        let cache = new_cache();
        let result = get_streams(&cache, "not-a-room").await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn stream_lifecycle() {
        let cache = new_cache();
        let rid = room_id("!room:matrix.org");

        // Open
        {
            let mut guard = cache.write().await;
            let room_streams = guard.entry(rid.clone()).or_default();
            room_streams.insert(
                "s1".to_string(),
                StreamState {
                    stream_id: "s1".to_string(),
                    name: "Build".to_string(),
                    buttons: vec![],
                    lines: vec![],
                    closed: false,
                },
            );
        }

        // Append
        {
            let mut guard = cache.write().await;
            if let Some(room_streams) = guard.get_mut(&rid) {
                if let Some(stream) = room_streams.get_mut("s1") {
                    stream.lines.push(StreamLine {
                        text: "line 1".to_string(),
                        channel: "stdout".to_string(),
                    });
                }
            }
        }

        // Close
        {
            let mut guard = cache.write().await;
            if let Some(room_streams) = guard.get_mut(&rid) {
                if let Some(stream) = room_streams.get_mut("s1") {
                    stream.closed = true;
                }
            }
        }

        let streams = get_streams(&cache, "!room:matrix.org").await.unwrap();
        assert_eq!(streams.len(), 1);
        assert!(streams[0].closed);
        assert_eq!(streams[0].lines.len(), 1);
    }

    #[tokio::test]
    async fn append_to_closed_stream_ignored() {
        let cache = new_cache();
        let rid = room_id("!room:matrix.org");

        {
            let mut guard = cache.write().await;
            let room_streams = guard.entry(rid.clone()).or_default();
            room_streams.insert(
                "s1".to_string(),
                StreamState {
                    stream_id: "s1".to_string(),
                    name: "Done".to_string(),
                    buttons: vec![],
                    lines: vec![],
                    closed: true,
                },
            );
        }

        // Simulate handler logic — skip appending to closed streams
        {
            let mut guard = cache.write().await;
            if let Some(room_streams) = guard.get_mut(&rid) {
                if let Some(stream) = room_streams.get_mut("s1") {
                    if !stream.closed {
                        stream.lines.push(StreamLine {
                            text: "should not appear".to_string(),
                            channel: "stdout".to_string(),
                        });
                    }
                }
            }
        }

        let streams = get_streams(&cache, "!room:matrix.org").await.unwrap();
        assert!(streams[0].lines.is_empty());
    }
}
