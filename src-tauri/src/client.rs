use std::path::PathBuf;

use matrix_sdk::{config::SyncSettings, Client, ServerName};
use tokio::sync::Mutex;
use tracing::info;

/// Shared Matrix client state, managed across Tauri commands.
pub struct MatrixState {
    pub client: Mutex<Option<Client>>,
}

impl MatrixState {
    pub fn new() -> Self {
        Self {
            client: Mutex::new(None),
        }
    }
}

fn data_dir() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("nerve")
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
pub fn spawn_sync(client: Client) {
    tokio::spawn(Box::pin(async move {
        info!("Starting sync loop");
        if let Err(e) = client.sync(SyncSettings::default()).await {
            tracing::error!("Sync error: {}", e);
        }
    }));
}
