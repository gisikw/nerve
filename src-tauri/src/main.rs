#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![recursion_limit = "512"]

mod client;
mod commands;
mod error;
mod messages;
mod rooms;
mod streams;
mod typing;

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
            commands::mark_read,
            commands::send_message,
            commands::send_reaction,
            commands::get_typing,
            commands::send_typing_notice,
            commands::get_media,
            commands::send_image,
            commands::get_pinned_events,
            commands::pin_message,
            commands::unpin_message,
            commands::create_room,
            commands::get_streams,
            commands::send_stream_action,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
