use tauri::State;

use crate::client::{self, MatrixState};

#[derive(serde::Serialize)]
pub struct LoginResult {
    pub user_id: String,
}

#[derive(serde::Serialize)]
pub struct SessionStatus {
    pub logged_in: bool,
    pub user_id: Option<String>,
}

/// Attempt to restore a persisted session. Called on app startup.
#[tauri::command]
pub async fn check_session(state: State<'_, MatrixState>) -> Result<SessionStatus, String> {
    let guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        let logged_in = client::try_restore_session(client).await;
        let user_id = client.user_id().map(|id| id.to_string());
        if logged_in {
            client::spawn_sync(client.clone());
        }
        Ok(SessionStatus { logged_in, user_id })
    } else {
        Ok(SessionStatus {
            logged_in: false,
            user_id: None,
        })
    }
}

/// Log in with homeserver, username, and password.
#[tauri::command]
pub async fn login(
    state: State<'_, MatrixState>,
    homeserver: String,
    username: String,
    password: String,
) -> Result<LoginResult, String> {
    let new_client = client::build_client(&homeserver)
        .await
        .map_err(|e| format!("Failed to connect to homeserver: {e}"))?;

    let user_id = client::login(&new_client, &username, &password)
        .await
        .map_err(|e| format!("Login failed: {e}"))?;

    client::spawn_sync(new_client.clone());

    let mut guard = state.client.lock().await;
    *guard = Some(new_client);

    Ok(LoginResult { user_id })
}

/// Log out and clear session.
#[tauri::command]
pub async fn logout(state: State<'_, MatrixState>) -> Result<(), String> {
    let mut guard = state.client.lock().await;
    if let Some(ref client) = *guard {
        client.matrix_auth().logout().await.map_err(|e| format!("Logout failed: {e}"))?;
    }
    *guard = None;
    Ok(())
}
