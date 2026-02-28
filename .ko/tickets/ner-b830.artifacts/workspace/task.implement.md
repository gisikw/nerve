All 17 tasks complete. Here's a summary of what was changed:

---

## Summary

### Backend (Rust)

**Task 1–2: `src-tauri/src/rooms.rs`**
- Added `is_low_priority: bool` to `RoomInfo` struct
- Added `let is_low_priority = room.is_low_priority();` in `collect_rooms()` (synchronous call) and populated the field

**Task 3–4: `src-tauri/src/commands.rs` / `main.rs`**
- Added `use tauri::Emitter` import to `commands.rs`
- Added `set_room_low_priority(room_id, is_low_priority)` Tauri command that parses the room ID, calls `room.set_is_low_priority(is_low_priority, None).await`, and emits `rooms-updated`
- Registered it in `main.rs`'s `invoke_handler!` macro

### Frontend (TypeScript/Svelte)

**Task 5–6: `ui/src/lib/tauri.ts`**
- Added `is_low_priority: boolean` to `RoomInfo` interface
- Added `setRoomLowPriority(roomId, isLowPriority)` typed wrapper

**Task 7–8: `ui/src/lib/stores/rooms.svelte.ts`**
- Removed all localStorage code (`ARCHIVE_KEY`, `loadArchivedIds`, `saveArchivedIds`, `archivedRoomIds`, `getArchivedRoomIds`, `getShowArchived`, `toggleShowArchived`)
- Rewrote `toggleArchive` as async: calls `setRoomLowPriority(!room.is_low_priority)` then `refreshRooms()`

**Task 9–10: `ui/src/lib/channel-switcher.ts`**
- Removed `archivedIds: Set<string>` parameter from `getRoomGroup` and `sortRooms`; now checks `room.is_low_priority` directly

**Task 11: `ui/src/ChannelSwitcher.svelte`**
- Removed `getArchivedRoomIds` import; updated `sortRooms()` call (no set argument); uses `room.is_low_priority` for archived indicator

**Task 12: `ui/src/Sidebar.svelte`**
- Removed `getArchivedRoomIds`, `getShowArchived`, `toggleShowArchived` imports
- Added local `showArchived = $state(false)` and local `toggleShowArchived()` function
- Filters rooms by `r.is_low_priority` directly

**Tasks 13–14: Tests**
- `rooms.test.ts`: removed all localStorage/archive/visibility tests; kept only `channels section visibility` tests
- `channel-switcher.test.ts`: added `is_low_priority` parameter to `makeRoom()`, removed `archivedIds` from all `getRoomGroup`/`sortRooms` calls, set `is_low_priority: true` on archived test rooms

**Tasks 15–16: `ui/fake-state.ts`**
- Added `is_low_priority: boolean` to `FakeRoom` interface; initialized to `false` in all seed rooms and `add_room` handler
- Added `set_room_low_priority` command handler

**Task 17: `specs/room_navigation.feature`**
- Updated archiving scenarios to reference Matrix's `m.lowpriority` tag instead of localStorage
- Renamed "Archive state persists in localStorage" → "Archive state is server-managed"

**No deviations from the plan.**
