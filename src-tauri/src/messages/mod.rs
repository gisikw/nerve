//! Message handling functionality split into behavioral domains:
//! - fetch: Retrieving messages from rooms
//! - reactions: Sending and aggregating reactions
//! - send: Sending messages (text, images, voice)
//! - pinning: Managing pinned messages
//! - common: Shared types and utilities

mod common;
mod fetch;
mod pinning;
mod reactions;
mod send;

// Re-export public API
#[allow(unused_imports)]
pub use common::{download_media, mark_read, MessageInfo};
#[allow(unused_imports)]
pub use fetch::{fetch_messages, register_handler, MessagesResponse, MessagesUpdatedEvent};
pub use pinning::{get_pinned_events, pin_message, unpin_message};
#[allow(unused_imports)]
pub use reactions::{send_reaction, ReactionInfo};
pub use send::{send_image, send_message, send_voice_message};
