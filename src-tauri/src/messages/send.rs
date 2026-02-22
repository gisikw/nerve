use matrix_sdk::ruma::events::room::message::{
    MessageType, RoomMessageEventContent,
};
use matrix_sdk::ruma::events::room::MediaSource;
use matrix_sdk::Client;

use crate::error::{self, NerveError, Result};

/// Send a text message to a room.
pub async fn send_message(
    client: &Client,
    room_id: &str,
    body: &str,
) -> Result<()> {
    let room_id = error::parse_room_id(room_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| NerveError::RoomNotFound(room_id.to_string()))?;

    let content = RoomMessageEventContent::text_plain(body);
    room.send(content).await?;
    Ok(())
}

/// Send an image to a room. Takes raw bytes, uploads to the homeserver's
/// media repository, then sends an m.image message with the resulting mxc URI.
pub async fn send_image(
    client: &Client,
    room_id: &str,
    filename: &str,
    data: Vec<u8>,
    mime_type: &str,
    caption: Option<&str>,
) -> Result<()> {
    use matrix_sdk::ruma::events::room::ImageInfo;

    let room_id = error::parse_room_id(room_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| NerveError::RoomNotFound(room_id.to_string()))?;

    let content_type: mime::Mime = mime_type
        .parse()
        .unwrap_or(mime::APPLICATION_OCTET_STREAM);

    let mxc_uri = client
        .media()
        .upload(&content_type, data, None)
        .await?
        .content_uri;

    let body = caption.unwrap_or(filename).to_string();

    let mut image_info = ImageInfo::new();
    image_info.mimetype = Some(mime_type.to_string());

    let mut image_content =
        matrix_sdk::ruma::events::room::message::ImageMessageEventContent::new(
            body, MediaSource::Plain(mxc_uri),
        )
        .info(Box::new(image_info));

    // When a caption is provided, `body` holds the caption text.
    // Set `filename` explicitly so receivers can recover the original filename.
    if caption.is_some() {
        image_content.filename = Some(filename.to_string());
    }

    let content = RoomMessageEventContent::new(MessageType::Image(image_content));

    room.send(content).await?;
    Ok(())
}

/// Send a voice/audio message to a room. Takes raw bytes, uploads to the
/// homeserver's media repository, then sends an m.audio message with the
/// resulting mxc URI and optional voice flag.
pub async fn send_voice_message(
    client: &Client,
    room_id: &str,
    filename: &str,
    data: Vec<u8>,
    mime_type: &str,
    duration_ms: Option<u64>,
) -> Result<()> {
    use matrix_sdk::ruma::events::room::message::{AudioInfo, AudioMessageEventContent};

    let room_id = error::parse_room_id(room_id)?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| NerveError::RoomNotFound(room_id.to_string()))?;

    let content_type: mime::Mime = mime_type
        .parse()
        .unwrap_or(mime::APPLICATION_OCTET_STREAM);

    let mxc_uri = client
        .media()
        .upload(&content_type, data.clone(), None)
        .await?
        .content_uri;

    let mut audio_info = AudioInfo::new();
    audio_info.mimetype = Some(mime_type.to_string());
    audio_info.size = Some((data.len() as u32).into());
    if let Some(ms) = duration_ms {
        audio_info.duration = Some(std::time::Duration::from_millis(ms));
    }

    let audio_content =
        AudioMessageEventContent::new(filename.to_string(), MediaSource::Plain(mxc_uri))
            .info(Some(Box::new(audio_info)));

    let content = RoomMessageEventContent::new(MessageType::Audio(audio_content));
    room.send(content).await?;
    Ok(())
}
