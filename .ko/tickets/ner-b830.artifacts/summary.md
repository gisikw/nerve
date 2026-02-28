# After-Action Summary: ner-b830

## What Was Done

Replaced localStorage-based room archiving with Matrix's `m.lowpriority` tag. All 17 planned tasks were completed:

**Rust backend:**
- Added `is_low_priority: bool` to `RoomInfo` struct, populated via the synchronous `room.is_low_priority()` SDK call in `collect_rooms()`
- Added a new Tauri command `set_room_low_priority(room_id, is_low_priority)` that calls `room.set_is_low_priority(is_low_priority, None).await` and emits a `rooms-updated` event
- Registered the new command in the Tauri builder's `invoke_handler!` macro

**TypeScript/Svelte frontend:**
- Added `is_low_priority: boolean` to the `RoomInfo` interface in `tauri.ts`, plus a typed `setRoomLowPriority()` IPC wrapper
- Removed all localStorage-based archive state (`ARCHIVE_KEY`, `loadArchivedIds`, `saveArchivedIds`, `archivedRoomIds`, `getArchivedRoomIds`, `getShowArchived`, `toggleShowArchived`) from `rooms.svelte.ts`
- `toggleArchive()` now awaits `setRoomLowPriority()` + `refreshRooms()` instead of mutating a local Set
- `getRoomGroup()` and `sortRooms()` lost the `archivedIds: Set<string>` parameter — archived status is now read directly from `room.is_low_priority`
- `ChannelSwitcher.svelte` and `Sidebar.svelte` updated accordingly
- `showArchived` visibility toggle was moved to local component state in `Sidebar.svelte` (not removed), as specified in the plan's open questions

**Fake backend:**
- `FakeRoom` interface gains `is_low_priority: boolean`, initialized to `false` in all seed rooms and `add_room` driver action
- `set_room_low_priority` command handler mutates the in-memory room object

**Tests and specs:**
- Removed all localStorage/archive tests from `rooms.test.ts` (they tested server state that no longer exists client-side)
- Updated `channel-switcher.test.ts` to use `is_low_priority: true` on archived rooms instead of passing a `Set`
- Updated `specs/room_navigation.feature` to reference Matrix's `m.lowpriority` tag rather than localStorage

## Notable Decisions

- `toggleArchive()` is now `async` — callers that previously called it synchronously must now handle a Promise. Both `Sidebar.svelte` call sites use `onclick` without `await`, which is fine (fire-and-forget; UI refreshes via `rooms-updated` event).
- Error handling in `toggleArchive()` uses `console.error` (not user-visible feedback). This is appropriate per INVARIANTS.md: archive toggling is closer to a background/infrastructure operation rather than a primary message action.

## Test Results

All tests pass: 370 frontend (vitest) + 44 Rust unit tests.
