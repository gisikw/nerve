# Nerve

A purpose-built Matrix client. Tauri (Rust) + Svelte frontend.

## Why

Element is a general-purpose Matrix client. Nerve is purpose-built for
AI-augmented Matrix workflows: multiple rooms with AI agents, first-class
support for agent interaction patterns (tool approvals, streaming output,
context telemetry) that Element will never prioritize.

**MVP goal:** Replace Element for daily use. Not by reimplementing all of
Element, but by being good enough at the things that matter — fast room
switching, clean message rendering, good typography, E2EE that just works —
that there's no reason to keep Element open.

The multiplexing and custom event type rendering comes after the client is
livable.

## Architecture

- **Backend:** Tauri (Rust). Uses matrix-rust-sdk for Matrix protocol,
  E2EE, sync. Exposes commands to the frontend via Tauri's IPC.
- **Frontend:** Svelte 5 with runes. Communicates with the Rust backend
  via typed IPC wrapper (`src/lib/tauri.ts`). Vite for the build pipeline.
- **Build:** Single binary per platform. System webview (WebKitGTK on
  Linux, WebKit on macOS).

## Building

Requires [Nix](https://nixos.org/download/) with flakes enabled. The flake
provides Rust, Tauri CLI, Node.js, and all system dependencies.

```bash
# Enter dev shell
nix develop

# Install frontend deps (first time only)
cd ui && npm install && cd ..

# Run in dev mode (Vite hot-reload + Rust rebuilds on save)
cargo tauri dev

# Build release binary — outputs to src-tauri/target/release/bundle/
cargo tauri build

# Run Rust tests
cd src-tauri && cargo test
```

First build takes ~20 minutes (matrix-sdk dependency tree). Incremental
rebuilds are fast.

### Without Nix

You'll need:
- Rust toolchain (stable)
- `cargo-tauri` CLI (`cargo install tauri-cli`)
- Node.js 20+ and npm
- GTK3, WebKitGTK 4.1, libsoup 3, and related dev packages (Linux only)

## Project Structure

```
src-tauri/              # Rust backend (Tauri app)
  src/main.rs           # Entry point
  src/commands.rs       # Tauri IPC commands
  src/rooms.rs          # Room listing
  src/messages.rs       # Message fetching and sending
  Cargo.toml            # Rust dependencies
  tauri.conf.json       # Tauri configuration
ui/                     # Svelte frontend
  src/App.svelte        # Root component (routing, layout)
  src/Login.svelte      # Login form
  src/Sidebar.svelte    # Room list sidebar
  src/MessageList.svelte    # Message list with autoscroll and pagination
  src/MessageItem.svelte    # Individual message (sender, timestamp, actions)
  src/MessageBody.svelte    # Message content (markdown, images, audio)
  src/ComposeBar.svelte     # Message input (text, emoji, attachments, voice)
  src/ReactionRow.svelte    # Emoji reaction pills
  src/StreamsPanel.svelte   # Streaming output panel
  src/lib/tauri.ts          # Typed IPC wrapper
  src/lib/emoji.ts          # Emoji shortcode replacement
  src/lib/markdown.ts       # Markdown rendering
  src/lib/stores/           # Svelte 5 rune-based stores
  main.ts               # App mount, zoom, TTS queue
  index.html            # HTML shell
  styles/               # CSS
  package.json          # Vite + Svelte deps
  fake-state.ts         # Fake backend (dev mode)
  fake.ts               # Fake backend client
  screenshot.ts         # Screenshot pipeline
flake.nix               # Nix dev shell
```
