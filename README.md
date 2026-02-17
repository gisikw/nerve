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

## Building

Requires [Nix](https://nixos.org/download/) with flakes enabled. The flake
provides Rust, Tauri CLI, and all system dependencies (GTK3, WebKitGTK, etc.).

```bash
# Enter dev shell
nix develop

# Run in dev mode (hot-reload frontend, Rust rebuilds on save)
cargo tauri dev

# Build release binary — outputs to src-tauri/target/release/bundle/
cargo tauri build

# Just check compilation without building the full bundle
cd src-tauri && cargo check
```

First build takes ~20 minutes (matrix-sdk dependency tree). Incremental
rebuilds are fast.

### Without Nix

You'll need:
- Rust toolchain (stable)
- `cargo-tauri` CLI (`cargo install tauri-cli`)
- GTK3, WebKitGTK 4.1, libsoup 3, and related dev packages

On Debian/Ubuntu:
```bash
sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev libglib2.0-dev libcairo2-dev \
  libpango1.0-dev libatk1.0-dev libgdk-pixbuf-2.0-dev
```

Then `cargo tauri dev` / `cargo tauri build` as above.

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
