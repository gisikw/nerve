---
id: ner-be48
status: open
deps: []
links: []
created: 2026-02-19T04:01:12Z
type: task
priority: 2
---
# Replace polling with push events from Rust sync loop

## Problem

The frontend polls: rooms every 5s, messages every 3s, typing every 2s,
streams every 2s. Each poll is a full IPC round-trip that triggers a
re-render even when nothing changed. This is the single biggest source
of jank.

## Approach

Use Tauri v2's `app.emit()` / `app.listen()` to push state changes from
the Rust sync loop to the frontend.

### Events to add

- `rooms-updated` — emitted on room state changes via sync
- `messages-updated` — emitted per-room when new timeline events arrive
- `typing-updated` — emitted when typing state changes
- `streams-updated` — emitted when stream events arrive

### Rust changes

- `spawn_sync` gets an `AppHandle` parameter for emitting events
- Sync event handlers emit Tauri events alongside updating caches
- Existing polling commands stay for initial load / explicit refresh

### Frontend changes

- Subscribe to Tauri events instead of polling timers
- Initial data load still uses commands (login, room select)
- Subsequent updates arrive via push events

This lands before the Svelte migration so the push infrastructure is
available from the start.
