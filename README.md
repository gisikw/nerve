# Nerve

A Matrix client built for Exocortex. Tauri (Rust) + web frontend.

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
- **Frontend:** Web (framework TBD — likely Svelte or vanilla). Renders
  messages, handles input, room navigation.
- **Build:** Single binary per platform. System webview (WebKitGTK on
  Linux, WebKit on macOS).

## Development

```bash
# Enter dev shell (provides Rust, Tauri CLI, GTK/WebKit deps)
nix develop

# Dev mode (hot-reload frontend, Rust rebuilds on change)
cargo tauri dev

# Build release binary
cargo tauri build

# Check backend compiles
cd src-tauri && cargo check
```

## Project Structure

```
src-tauri/          # Rust backend (Tauri app)
  src/main.rs       # Entry point
  Cargo.toml        # Rust dependencies
  tauri.conf.json   # Tauri configuration
  icons/            # App icons
ui/                 # Frontend (HTML/CSS/JS)
  index.html        # Entry point
  styles.css        # Styles
flake.nix           # Nix dev shell
```
