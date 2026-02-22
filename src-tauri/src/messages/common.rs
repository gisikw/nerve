use matrix_sdk::ruma::events::room::MediaSource;
use matrix_sdk::Client;
use serde::Serialize;

use crate::error::{self, Result};

#[derive(Serialize, Clone)]
pub struct MessageInfo {
    pub event_id: String,
    pub sender: String,
    pub body: String,
    pub timestamp: i64,
    pub msg_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub media_url: Option<String>,
    pub reactions: Vec<super::reactions::ReactionInfo>,
}

/// Return the mxc:// URI string for a media source, if plain (not encrypted).
pub fn mxc_uri_string(source: &MediaSource) -> Option<String> {
    match source {
        MediaSource::Plain(uri) => Some(uri.to_string()),
        MediaSource::Encrypted(_) => None,
    }
}

/// Download media bytes from the homeserver via the SDK (handles authenticated
/// media automatically) and return them as a `data:` URI.
pub async fn download_media(client: &Client, mxc_uri: &str) -> Result<String> {
    use base64::Engine;
    use matrix_sdk::media::{MediaFormat, MediaRequestParameters};

    let uri = error::parse_mxc_uri(mxc_uri)?;

    let request = MediaRequestParameters {
        source: MediaSource::Plain(uri),
        format: MediaFormat::File,
    };

    let data = client.media().get_media_content(&request, true).await?;

    // Sniff content type from magic bytes
    let content_type = if data.starts_with(&[0x89, 0x50, 0x4E, 0x47]) {
        "image/png"
    } else if data.starts_with(&[0xFF, 0xD8, 0xFF]) {
        "image/jpeg"
    } else if data.starts_with(b"GIF8") {
        "image/gif"
    } else if data.starts_with(b"RIFF") && data.len() > 12 && &data[8..12] == b"WEBP" {
        "image/webp"
    } else {
        "application/octet-stream"
    };

    let b64 = base64::engine::general_purpose::STANDARD.encode(&data);
    Ok(format!("data:{content_type};base64,{b64}"))
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
        .ok_or_else(|| crate::error::NerveError::RoomNotFound(room_id.to_string()))?;

    room.send_single_receipt(ReceiptType::Read, ReceiptThread::Unthreaded, event_id)
        .await?;

    Ok(())
}
