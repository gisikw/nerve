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
# Prerequisites: Rust toolchain, system webview deps
# On NixOS/Debian: webkit2gtk, libayatana-appindicator, etc.

# Dev mode (hot-reload frontend, Rust rebuilds on change)
cargo tauri dev

# Build release binary
cargo tauri build
```

## Status

Not started. This README is the spec.
