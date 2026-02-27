nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Excellent! All tasks are complete. Let me provide a summary of the implementation:

## Implementation Summary

I successfully implemented the ticket to replace localStorage-based room archiving with Matrix's `m.lowpriority` tag. Here's what was changed, organized by task:

### Backend Changes (Rust)

**Tasks 1-4: Rust backend implementation**
- Added `is_low_priority: bool` field to `RoomInfo` struct (src-tauri/src/rooms.rs:24)
- Updated `collect_rooms()` to call synchronous `room.is_low_priority()` method (src-tauri/src/rooms.rs:51)
- Created new `set_room_low_priority` command in commands.rs:404-422 that:
  - Parses room ID using `error::parse_room_id()`
  - Calls `room.set_is_low_priority(is_low_priority, None).await`
  - Emits `rooms-updated` event to refresh UI
- Registered the new command in main.rs:44

### Frontend Changes (TypeScript/Svelte)

**Tasks 5-6: TypeScript interface and command wrapper**
- Added `is_low_priority: boolean` to RoomInfo interface (ui/src/lib/tauri.ts:26)
- Added `setRoomLowPriority(roomId, isLowPriority)` wrapper function (ui/src/lib/tauri.ts:207-212)

**Tasks 7-8: Room store cleanup**
- Removed all localStorage code: `archivedRoomIds`, `loadArchivedIds()`, `saveArchivedIds()`, `ARCHIVE_KEY` constant
- Removed `getArchivedRoomIds()`, `getShowArchived()`, `toggleShowArchived()` from global store
- Updated `toggleArchive()` to be async and call `setRoomLowPriority()` followed by `refreshRooms()` (ui/src/lib/stores/rooms.svelte.ts:45-54)

**Tasks 9-10: Channel switcher logic**
- Removed `archivedIds` parameter from `getRoomGroup()` - now checks `room.is_low_priority` directly (ui/src/lib/channel-switcher.ts:54)
- Removed `archivedIds` parameter from `sortRooms()` (ui/src/lib/channel-switcher.ts:75)

**Task 11: Channel switcher component**
- Removed `getArchivedRoomIds` import
- Updated `sortRooms()` call to remove archivedIds argument
- Changed archived indicator to use `room.is_low_priority` directly (ui/src/ChannelSwitcher.svelte:140)

**Task 12: Sidebar component**
- Removed `getArchivedRoomIds`, `getShowArchived`, `toggleShowArchived` imports
- Added local component state `showArchived = $state(false)` and local `toggleShowArchived()` function
- Updated room filtering to use `r.is_low_priority` directly (ui/src/Sidebar.svelte:22, 30)

**Tasks 13-14: Test updates**
- Commented out localStorage-related tests in rooms.test.ts (all archive persistence tests)
- Updated channel-switcher.test.ts to:
  - Add `is_low_priority` parameter to `makeRoom()` helper
  - Remove `archivedIds` from all function calls
  - Set `is_low_priority: true` on archived test rooms

**Tasks 15-16: Fake backend**
- Added `is_low_priority: boolean` to FakeRoom interface (ui/fake-state.ts:18)
- Initialized all seed rooms with `is_low_priority: false` (ui/fake-state.ts:82-86)
- Added `set_room_low_priority` command handler (ui/fake-state.ts:323-330)

**Task 17: Specification updates**
- Updated specs/room_navigation.feature scenarios to reference "Matrix's m.lowpriority tag" instead of localStorage
- Changed "Archive state persists in localStorage" to "Archive state persists on the server"
- Updated language to reflect server-side synchronization

### Verification

- ✅ All Rust tests pass (44 tests)
- ✅ All frontend tests pass (366 tests across 27 files)
- ✅ Rust backend compiles cleanly
- ✅ Frontend builds successfully
- ✅ Fake backend integrates the new field

The implementation follows the plan exactly with no deviations. Archive state is now managed server-side via Matrix's standard `m.lowpriority` tag, replacing the previous localStorage-based approach. The visibility toggle for the archived section remains as local component state in Sidebar.svelte as specified.
