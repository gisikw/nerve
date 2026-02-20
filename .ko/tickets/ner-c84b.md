---
id: ner-c84b
status: closed
deps: [ner-be48, ner-35da, ner-3f09, ner-0f04, ner-f968, ner-30ff, ner-deac, ner-777d, ner-f68b]
links: []
created: 2026-02-19T04:01:04Z
type: task
priority: 2
---
# Migrate frontend from Elm to Svelte (keep Rust backend + Tauri shell)

## Context

The Elm frontend has a fundamental mismatch with the chat client workload.
Every state change runs a full virtual DOM diff — polling every 2-3 seconds
means constant re-renders even when nothing changed. Combined with the
polling-over-IPC architecture, this produces visible jank: flickering,
scroll position loss, slow room switches, and rendering artifacts.

Three independent evaluations (code review, clean-context Claude consultation
x2) converged on the same conclusion:
- The Rust backend is solid and stays
- Tauri as the shell is fine
- The frontend framework needs fine-grained reactivity (Svelte or SolidJS)
- Polling must be replaced with push events from the sync loop

## Approach

Svelte + Vite (NOT SvelteKit — no routing, no SSR, no server needed).
The Rust backend, Tauri IPC, and all command definitions stay. The frontend
gets rewritten component-by-component with Svelte, using Tauri's event
system for push updates instead of polling.

The Elm and Svelte frontends can coexist briefly during migration (Vite
entry point swap), but the goal is a clean cutover, not long-term parallel
maintenance.

## What survives

- All Rust code (src-tauri/src/*)
- Tauri command definitions and IPC protocol
- CSS design language and variables (styles/base.css)
- The fake backend architecture (adapted for Svelte)
- INVARIANTS.md (updated for Svelte conventions)

## What gets replaced

- All Elm source (ui/src/*.elm)
- The Elm build pipeline
- main.ts port/glue layer (replaced by direct Tauri API calls from Svelte)
- The polling subscriptions
