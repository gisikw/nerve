# Nerve

A purpose-built Matrix client. Tauri (Rust) + Elm frontend.

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
- **Frontend:** Elm. Virtual DOM for flicker-free updates. Communicates
  with the Rust backend via two ports (sendToTauri/receiveFromTauri) using
  tagged JSON envelopes. Vite + vite-plugin-elm for the build pipeline.
- **Build:** Single binary per platform. System webview (WebKitGTK on
  Linux, WebKit on macOS).

## Building

Requires [Nix](https://nixos.org/download/) with flakes enabled. The flake
provides Rust, Tauri CLI, Node.js, Elm, and all system dependencies.

```bash
# Enter dev shell
nix develop

# Install frontend deps (first time only)
cd ui && npm install && cd ..

# Run in dev mode (Vite hot-reload + Rust rebuilds on save)
cargo tauri dev

# Build release binary — outputs to src-tauri/target/release/bundle/
cargo tauri build

# Run Elm tests
cd ui && npx elm-test
```

First build takes ~20 minutes (matrix-sdk dependency tree). Incremental
rebuilds are fast.

### Without Nix

You'll need:
- Rust toolchain (stable)
- `cargo-tauri` CLI (`cargo install tauri-cli`)
- Node.js 20+ and npm
- Elm 0.19.1
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
ui/                     # Elm frontend
  src/Main.elm          # App entry point
  src/Model.elm         # Model, Msg, Page types
  src/Update.elm        # Update function (all state transitions)
  src/View/Login.elm    # Login form view
  src/View/Sidebar.elm  # Room list sidebar
  src/View/Messages.elm # Message display and compose bar
  src/Types.elm         # Domain types (Room, Message, etc.)
  src/Decode.elm        # JSON decoders for Rust types
  src/Ports.elm         # Port declarations
  src/Commands.elm      # Typed command helpers
  main.js               # JS glue (ports <-> Tauri invoke)
  index.html            # HTML shell
  styles.css            # Styles
  elm.json              # Elm dependencies
  package.json          # Vite + vite-plugin-elm
  tests/                # Elm tests
flake.nix               # Nix dev shell
```
