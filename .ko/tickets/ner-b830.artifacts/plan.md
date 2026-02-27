## Goal
Replace the localStorage-based archived room tracking with Matrix's `m.lowpriority` tag from the server.

## Context
The codebase currently determines archived status by maintaining a local `Set<string>` of room IDs persisted to localStorage (key: `nerve-archived-rooms`). This is defined in `ui/src/lib/stores/rooms.svelte.ts` with functions like `toggleArchive()`, `getArchivedRoomIds()`, and storage helpers `loadArchivedIds()`/`saveArchivedIds()`.

The archive state is used in two places:
1. **Frontend filtering** — `ui/src/lib/channel-switcher.ts`'s `getRoomGroup()` checks if a room ID is in the archived set to categorize it as `RoomGroup.Archived`
2. **Sidebar display** — `ui/src/Sidebar.svelte` uses the archive state to separate rooms into Channels vs Archived sections

Matrix provides a standard `m.lowpriority` tag in room account data to indicate low-priority/archived rooms. The matrix-rust-sdk (v0.16, per `src-tauri/Cargo.toml`) exposes these APIs:
- `room.is_low_priority() -> bool` — synchronous method that checks if the room has the `m.lowpriority` tag
- `room.set_is_low_priority(is_low_priority: bool, tag_order: Option<f64>) -> Result<()>` — async method to set or clear the tag

The Rust backend's `RoomInfo` struct (`src-tauri/src/rooms.rs`) currently does not expose this field. The `collect_rooms()` function fetches room metadata but does not query the low-priority status.

Tests exist in `ui/src/lib/stores/rooms.test.ts` that validate localStorage persistence behavior. These will need to be removed or adapted. Tests in `ui/src/lib/channel-switcher.test.ts` verify that archived rooms are categorized correctly — these should continue to pass once the data source changes.

The fake backend (`ui/fake-state.ts`) does not model room tags. It will need an `is_low_priority` field added to `FakeRoom` to support development and testing.

## Approach
Add a boolean `is_low_priority` field to the `RoomInfo` type. In the Rust backend, call the synchronous `room.is_low_priority()` during `collect_rooms()` and include it in the serialized response. In the frontend, replace the localStorage-based `archivedRoomIds` set with a check against the `room.is_low_priority` field from the server. When toggling archive status, call a new Tauri command `set_room_low_priority` that invokes the SDK's `set_is_low_priority(is_low_priority, None)` method (passing `None` for tag_order) and emits a `rooms-updated` event to refresh the UI. Remove localStorage persistence code entirely.

## Tasks
1. [src-tauri/src/rooms.rs:RoomInfo] — Add `is_low_priority: bool` field to the `RoomInfo` struct.
   Verify: Rust compiles (`cd src-tauri && cargo check`).

2. [src-tauri/src/rooms.rs:collect_rooms] — Call `room.is_low_priority()` for each room and populate the new field. Note: this is a synchronous method, not async.
   Verify: Rust compiles and existing backend tests pass (`cd src-tauri && cargo test`).

3. [src-tauri/src/commands.rs] — Add a new Tauri command `set_room_low_priority(room_id: String, is_low_priority: bool)` that looks up the room by ID, calls `room.set_is_low_priority(is_low_priority, None).await`, and emits a `rooms-updated` event.
   Verify: Command compiles and is registered in the Tauri command list.

4. [src-tauri/src/main.rs] — Register the new `set_room_low_priority` command in the Tauri builder's `invoke_handler!` macro.
   Verify: Application builds (`cargo tauri build --debug` completes).

5. [ui/src/lib/tauri.ts:RoomInfo] — Add `is_low_priority: boolean` to the TypeScript `RoomInfo` interface.
   Verify: TypeScript compiles (`cd ui && npm run check`).

6. [ui/src/lib/tauri.ts] — Add a typed wrapper `setRoomLowPriority(roomId: string, isLowPriority: boolean): Promise<void>` that invokes the new command.
   Verify: TypeScript compiles.

7. [ui/src/lib/stores/rooms.svelte.ts] — Remove `archivedRoomIds`, `loadArchivedIds()`, `saveArchivedIds()`, and the `ARCHIVE_KEY` constant. Remove `getArchivedRoomIds()` and `toggleShowArchived()`/`getShowArchived()` state variables.
   Verify: TypeScript compiles (expect errors in files that reference these).

8. [ui/src/lib/stores/rooms.svelte.ts:toggleArchive] — Replace the implementation to call `setRoomLowPriority(roomId, !room.is_low_priority)` followed by `refreshRooms()`. The function should look up the room's current `is_low_priority` status from the `rooms` array to determine the toggle direction.
   Verify: TypeScript compiles.

9. [ui/src/lib/channel-switcher.ts:getRoomGroup] — Remove the `archivedIds: Set<string>` parameter. Check `room.is_low_priority` directly instead of `archivedIds.has(room.id)`.
   Verify: TypeScript compiles (expect errors in call sites).

10. [ui/src/lib/channel-switcher.ts:sortRooms] — Remove the `archivedIds: Set<string>` parameter. Pass no second argument to `getRoomGroup()`.
    Verify: TypeScript compiles (expect errors in call sites).

11. [ui/src/ChannelSwitcher.svelte] — Update call to `sortRooms()` to remove the `archivedIds` argument.
    Verify: TypeScript compiles and component renders in dev mode.

12. [ui/src/Sidebar.svelte] — Update references to archived state. Instead of `getArchivedRoomIds()`, filter rooms by `room.is_low_priority`. Update `toggleArchive()` calls to work without the set. Keep the visibility toggle state for the archived section (the `showArchived` state variable and `toggleShowArchived()` function should remain in the component, not the store).
    Verify: TypeScript compiles and sidebar renders correctly in dev mode.

13. [ui/src/lib/stores/rooms.test.ts] — Delete or comment out all tests related to `archivedRoomIds`, localStorage persistence, `toggleArchive` idempotency, and `getShowArchived`/`toggleShowArchived`. These tests are no longer valid since the state is server-managed.
    Verify: `npm test` passes (remaining tests may need small updates).

14. [ui/src/lib/channel-switcher.test.ts] — Update test helper `getRoomGroup()` and `sortRooms()` calls to remove `archivedIds` parameter. Update test data by setting `is_low_priority: true` on archived rooms instead of passing a set.
    Verify: `npm test -- channel-switcher.test.ts` passes.

15. [ui/fake-state.ts:FakeRoom] — Add `is_low_priority: boolean` field to the interface and initialize it to `false` in all `initialRooms` entries.
    Verify: Fake backend starts without errors (`cd ui && npx vite`).

16. [ui/fake-state.ts] — Add a `set_room_low_priority` command handler that finds the room by ID and updates `room.is_low_priority` to the provided boolean value. The command should match the Tauri command signature (accepts `roomId` and `isLowPriority` parameters).
    Verify: Fake backend responds to the new command correctly.

17. [specs/room_navigation.feature] — Update scenarios referencing archived rooms (lines 76-137) to clarify that archive state is now determined by Matrix's `m.lowpriority` tag, not a local UI setting. Update scenario text where it references "localStorage" (line 126-129) to instead describe the behavior as "Archive state persists on the server."
    Verify: Spec reads coherently and accurately describes the new behavior.

## Open Questions
**Resolved:** The matrix-rust-sdk v0.16 API has been confirmed:
- `is_low_priority()` is a synchronous method (not async) that returns `bool`
- `set_is_low_priority(is_low_priority: bool, tag_order: Option<f64>)` is async and takes an optional tag_order parameter
- We will pass `None` for `tag_order` since we don't need custom ordering

**Updated consideration:** Task 7 incorrectly states to remove `toggleShowArchived()`/`getShowArchived()` from the stores. Per INVARIANTS.md and the current Sidebar.svelte implementation, the visibility toggle for the archived section should remain but be moved to local component state in Sidebar.svelte rather than global store state. Task 12 has been updated to clarify this.
