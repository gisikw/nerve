use std::path::PathBuf;

use matrix_sdk::{config::SyncSettings, Client, ServerName};
use tokio::sync::Mutex;
use tracing::info;

use crate::typing::{self, TypingCache};

/// Shared Matrix client state, managed across Tauri commands.
pub struct MatrixState {
    pub client: Mutex<Option<Client>>,
    pub typing_cache: TypingCache,
}

impl MatrixState {
    pub fn new() -> Self {
        Self {
            client: Mutex::new(None),
            typing_cache: typing::new_cache(),
        }
    }
}

pub fn data_dir() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("nerve")
}

/// Persist the homeserver name so we can restore the session on next launch.
pub fn save_homeserver(homeserver: &str) -> anyhow::Result<()> {
    let dir = data_dir();
    std::fs::create_dir_all(&dir)?;
    std::fs::write(dir.join("homeserver"), homeserver)?;
    Ok(())
}

/// Load the previously-used homeserver name, if any.
pub fn load_homeserver() -> Option<String> {
    std::fs::read_to_string(data_dir().join("homeserver"))
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

/// Clear the saved homeserver (on logout).
pub fn clear_homeserver() {
    let _ = std::fs::remove_file(data_dir().join("homeserver"));
}

/// Build a Matrix client for the given homeserver, with a persistent sqlite
/// store for crypto state and session data.
pub async fn build_client(homeserver: &str) -> anyhow::Result<Client> {
    let server_name = ServerName::parse(homeserver)?;
    let store_path = data_dir().join("matrix-store");

    let client = Client::builder()
        .server_name(&server_name)
        .sqlite_store(&store_path, None)
        .build()
        .await?;

    Ok(client)
}

/// Log in with username and password. Returns the user ID on success.
pub async fn login(client: &Client, username: &str, password: &str) -> anyhow::Result<String> {
    let response = client
        .matrix_auth()
        .login_username(username, password)
        .initial_device_display_name("Nerve")
        .send()
        .await?;

    info!("Logged in as {}", response.user_id);
    Ok(response.user_id.to_string())
}

/// Check if we have a persisted session that can be restored.
pub async fn try_restore_session(client: &Client) -> bool {
    // The sqlite store persists the session automatically.
    // If the client has a logged-in user, the session was restored.
    client.user_id().is_some()
}

/// Start the sync loop in the background. Call after login or session restore.
/// Registers the typing event handler before starting sync.
pub fn spawn_sync(client: Client, typing_cache: TypingCache) {
    typing::register_handler(&client, typing_cache);
    tokio::spawn(Box::pin(async move {
        info!("Starting sync loop");
        if let Err(e) = client.sync(SyncSettings::default()).await {
            tracing::error!("Sync error: {}", e);
        }
    }));
}
