use std::path::PathBuf;

use matrix_sdk::{
    authentication::{matrix::MatrixSession, AuthSession},
    config::SyncSettings,
    Client,
};
use tauri::AppHandle;
use tokio::sync::Mutex;
use tracing::info;

use crate::error::{self, Result};
use crate::streams::{self, StreamCache};
use crate::typing::{self, TypingCache};

/// Shared Matrix client state, managed across Tauri commands.
pub struct MatrixState {
    pub client: Mutex<Option<Client>>,
    pub typing_cache: TypingCache,
    pub stream_cache: StreamCache,
}

impl MatrixState {
    pub fn new() -> Self {
        Self {
            client: Mutex::new(None),
            typing_cache: typing::new_cache(),
            stream_cache: streams::new_cache(),
        }
    }
}

pub fn data_dir() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("nerve")
}

/// Persist the homeserver name so we can restore the session on next launch.
pub fn save_homeserver(homeserver: &str) -> Result<()> {
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

/// Save the device ID so re-login reuses the same device, avoiding crypto
/// store conflicts when the sqlite store already has keys for a prior device.
pub fn save_device_id(device_id: &str) -> Result<()> {
    let dir = data_dir();
    std::fs::create_dir_all(&dir)?;
    std::fs::write(dir.join("device-id"), device_id)?;
    Ok(())
}

/// Load the previously-used device ID, if any.
pub fn load_device_id() -> Option<String> {
    std::fs::read_to_string(data_dir().join("device-id"))
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

/// Save the Matrix session (access token, user/device IDs) for restore.
pub fn save_session(session: &MatrixSession) -> Result<()> {
    let dir = data_dir();
    std::fs::create_dir_all(&dir)?;
    let json = serde_json::to_string(session)?;
    std::fs::write(dir.join("session.json"), json)?;
    Ok(())
}

/// Load a previously-saved Matrix session.
pub fn load_session() -> Option<MatrixSession> {
    let data = std::fs::read_to_string(data_dir().join("session.json")).ok()?;
    serde_json::from_str(&data).ok()
}

/// Clear all saved credentials (on logout).
pub fn clear_credentials() {
    let dir = data_dir();
    let _ = std::fs::remove_file(dir.join("homeserver"));
    let _ = std::fs::remove_file(dir.join("device-id"));
    let _ = std::fs::remove_file(dir.join("session.json"));
}

/// Build a Matrix client for the given homeserver, with a persistent sqlite
/// store for crypto state and session data.
pub async fn build_client(homeserver: &str) -> Result<Client> {
    let server_name = error::parse_server_name(homeserver)?;
    let store_path = data_dir().join("matrix-store");

    let client = Client::builder()
        .server_name(&server_name)
        .sqlite_store(&store_path, None)
        .build()
        .await?;

    Ok(client)
}

/// Log in with username and password. Reuses the stored device ID when
/// available so the crypto store stays valid across app restarts. Returns
/// the user ID on success.
pub async fn login(client: &Client, username: &str, password: &str) -> Result<String> {
    let mut builder = client
        .matrix_auth()
        .login_username(username, password)
        .initial_device_display_name("Nerve");

    // Reuse the device ID from a previous session so the sqlite crypto
    // store (which is keyed by device) doesn't reject the new login.
    let saved_device_id = load_device_id();
    if let Some(ref did) = saved_device_id {
        builder = builder.device_id(did);
    }

    let response = builder.send().await?;

    // Persist the device ID for next time.
    let _ = save_device_id(response.device_id.as_str());

    // Persist the session (access token etc.) so we can restore without
    // re-entering credentials on next launch.
    if let Some(session) = client.matrix_auth().session() {
        let _ = save_session(&session);
    }

    info!("Logged in as {} (device {})", response.user_id, response.device_id);
    Ok(response.user_id.to_string())
}

/// Try to restore the session from a previously-saved access token.
/// Returns true if the session was successfully restored.
pub async fn try_restore_session(client: &Client) -> bool {
    if let Some(session) = load_session() {
        client.restore_session(AuthSession::from(session)).await.is_ok()
    } else {
        false
    }
}

/// Start the sync loop in the background. Call after login or session restore.
/// Registers event handlers (typing, streams, rooms, messages) before starting
/// sync. Handlers emit Tauri events via the `AppHandle` so the frontend
/// receives push updates instead of polling.
pub fn spawn_sync(
    client: Client,
    typing_cache: TypingCache,
    stream_cache: StreamCache,
    app_handle: AppHandle,
) {
    typing::register_handler(&client, typing_cache, app_handle.clone());
    streams::register_handler(&client, stream_cache, app_handle.clone());
    crate::rooms::register_handler(&client, app_handle.clone());
    crate::messages::register_handler(&client, app_handle.clone());
    tokio::spawn(Box::pin(async move {
        info!("Starting sync loop");
        if let Err(e) = client.sync(SyncSettings::default()).await {
            tracing::error!("Sync error: {}", e);
        }
    }));
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU64, Ordering};

    static TEST_COUNTER: AtomicU64 = AtomicU64::new(0);

    /// Run a test with XDG_DATA_HOME pointed at a unique temp dir, so
    /// data_dir() returns a predictable, isolated path. Each call gets
    /// its own directory to avoid races from parallel test execution.
    fn with_temp_data_dir<F: FnOnce()>(f: F) {
        let id = TEST_COUNTER.fetch_add(1, Ordering::SeqCst);
        let tmp = std::env::temp_dir().join(format!(
            "nerve-test-{}-{}",
            std::process::id(),
            id
        ));
        let _ = std::fs::remove_dir_all(&tmp);
        std::fs::create_dir_all(&tmp).unwrap();

        // dirs::data_dir() reads XDG_DATA_HOME on Linux
        unsafe { std::env::set_var("XDG_DATA_HOME", &tmp) };
        f();
        let _ = std::fs::remove_dir_all(&tmp);
    }

    #[test]
    #[serial_test::serial]
    fn save_and_load_homeserver() {
        with_temp_data_dir(|| {
            save_homeserver("matrix.example.com").unwrap();
            let loaded = load_homeserver();
            assert_eq!(loaded, Some("matrix.example.com".to_string()));
        });
    }

    #[test]
    #[serial_test::serial]
    fn load_homeserver_returns_none_when_missing() {
        with_temp_data_dir(|| {
            let loaded = load_homeserver();
            assert_eq!(loaded, None);
        });
    }

    #[test]
    #[serial_test::serial]
    fn clear_credentials_removes_files() {
        with_temp_data_dir(|| {
            save_homeserver("matrix.example.com").unwrap();
            assert!(load_homeserver().is_some());
            clear_credentials();
            assert_eq!(load_homeserver(), None);
        });
    }

    #[test]
    #[serial_test::serial]
    fn load_homeserver_trims_whitespace() {
        with_temp_data_dir(|| {
            let dir = data_dir();
            std::fs::create_dir_all(&dir).unwrap();
            std::fs::write(dir.join("homeserver"), "  matrix.example.com  \n").unwrap();
            let loaded = load_homeserver();
            assert_eq!(loaded, Some("matrix.example.com".to_string()));
        });
    }

    #[test]
    #[serial_test::serial]
    fn load_homeserver_returns_none_for_empty() {
        with_temp_data_dir(|| {
            let dir = data_dir();
            std::fs::create_dir_all(&dir).unwrap();
            std::fs::write(dir.join("homeserver"), "   \n").unwrap();
            let loaded = load_homeserver();
            assert_eq!(loaded, None);
        });
    }
}
