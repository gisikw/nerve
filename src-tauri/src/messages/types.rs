use matrix_sdk::ruma::events::room::MediaSource;
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

/// Response from fetching messages, includes a pagination token for loading
/// older history.
#[derive(Serialize)]
pub struct MessagesResponse {
    pub messages: Vec<MessageInfo>,
    /// Pagination token for fetching older messages. `None` when the beginning
    /// of the room timeline has been reached.
    pub end_token: Option<String>,
}

/// Payload emitted as a `messages-updated` Tauri event.
#[derive(Clone, Serialize)]
pub struct MessagesUpdatedEvent {
    pub room_id: String,
}

/// Return the mxc:// URI string for a media source, if plain (not encrypted).
pub(crate) fn mxc_uri_string(source: &MediaSource) -> Option<String> {
    match source {
        MediaSource::Plain(uri) => Some(uri.to_string()),
        MediaSource::Encrypted(_) => None,
    }
}

/// Download media bytes from the homeserver via the SDK (handles authenticated
/// media automatically) and return them as a `data:` URI.
pub async fn download_media(
    client: &matrix_sdk::Client,
    mxc_uri: &str,
) -> crate::error::Result<String> {
    use base64::Engine;
    use matrix_sdk::media::{MediaFormat, MediaRequestParameters};

    let uri = crate::error::parse_mxc_uri(mxc_uri)?;

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
