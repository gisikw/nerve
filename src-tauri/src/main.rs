#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![recursion_limit = "512"]

mod client;
mod commands;
mod messages;
mod rooms;

use client::MatrixState;

fn main() {
    tracing_subscriber::fmt::init();

    let state = MatrixState::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::check_session,
            commands::login,
            commands::logout,
            commands::list_rooms,
            commands::get_messages,
            commands::send_message,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
