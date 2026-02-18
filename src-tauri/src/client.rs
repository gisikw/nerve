use std::path::PathBuf;

use matrix_sdk::{config::SyncSettings, Client};
use tokio::sync::Mutex;
use tracing::info;

use crate::error::{self, Result};
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

/// Clear the saved homeserver (on logout).
pub fn clear_homeserver() {
    let _ = std::fs::remove_file(data_dir().join("homeserver"));
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

/// Log in with username and password. Returns the user ID on success.
pub async fn login(client: &Client, username: &str, password: &str) -> Result<String> {
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
    fn clear_homeserver_removes_file() {
        with_temp_data_dir(|| {
            save_homeserver("matrix.example.com").unwrap();
            assert!(load_homeserver().is_some());
            clear_homeserver();
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
