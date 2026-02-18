use thiserror::Error;

/// Domain errors for Nerve's library-level code.
///
/// Command handlers at the Tauri boundary convert these to `String` via
/// `map_err`. Library functions below the command layer use this instead
/// of `anyhow::Result`.
#[derive(Debug, Error)]
pub enum NerveError {
    #[error("invalid room ID '{0}': {1}")]
    InvalidRoomId(String, matrix_sdk::ruma::IdParseError),

    #[error("invalid event ID '{0}': {1}")]
    InvalidEventId(String, matrix_sdk::ruma::IdParseError),

    #[error("invalid server name '{0}': {1}")]
    InvalidServerName(String, matrix_sdk::ruma::IdParseError),

    #[error("room not found: {0}")]
    RoomNotFound(String),

    #[error("Matrix SDK error: {0}")]
    Sdk(#[from] matrix_sdk::Error),

    #[error("HTTP error: {0}")]
    Http(#[from] matrix_sdk::HttpError),

    #[error("client build error: {0}")]
    ClientBuild(#[from] matrix_sdk::ClientBuildError),

    #[error("filesystem error: {0}")]
    Io(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, NerveError>;

/// Parse a room ID string, mapping the error to include the original input.
pub fn parse_room_id(
    room_id: &str,
) -> Result<matrix_sdk::ruma::OwnedRoomId> {
    matrix_sdk::ruma::RoomId::parse(room_id)
        .map_err(|e| NerveError::InvalidRoomId(room_id.to_string(), e))
}

/// Parse an event ID string, mapping the error to include the original input.
pub fn parse_event_id(
    event_id: &str,
) -> Result<matrix_sdk::ruma::OwnedEventId> {
    matrix_sdk::ruma::OwnedEventId::try_from(event_id)
        .map_err(|e| NerveError::InvalidEventId(event_id.to_string(), e))
}

/// Parse a server name string, mapping the error to include the original input.
pub fn parse_server_name(
    server_name: &str,
) -> Result<matrix_sdk::ruma::OwnedServerName> {
    matrix_sdk::ruma::ServerName::parse(server_name)
        .map_err(|e| NerveError::InvalidServerName(server_name.to_string(), e))
}
