//! Message handling functionality split into behavioral modules:
//! - types: Shared data structures and utilities
//! - fetch: Message fetching and reaction aggregation
//! - send: Sending text, image, and voice messages
//! - reactions: Reaction handling
//! - pinning: Pin/unpin functionality

mod types;
mod fetch;
mod send;
mod reactions;
mod pinning;

// Re-export public types
pub use types::{MessagesResponse, download_media};

// Re-export fetch functions
pub use fetch::{fetch_messages, mark_read, register_handler};

// Re-export send functions
pub use send::{send_message, send_image, send_voice_message};

// Re-export reaction functions
pub use reactions::send_reaction;

// Re-export pinning functions
pub use pinning::{get_pinned_events, pin_message, unpin_message};
