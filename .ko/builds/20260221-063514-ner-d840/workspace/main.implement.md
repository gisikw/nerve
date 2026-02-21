Perfect! Now let me verify the complete implementation one more time and provide a summary:

## Summary

I've successfully implemented the channel switcher sorting and grouping feature. Here's what was changed:

### Changes Made

#### 1. **Backend (Rust) - `src-tauri/src/rooms.rs`**
- Added `highlight_count` field to `RoomInfo` struct to track @-mentions
- Added `last_activity` field to `RoomInfo` struct to track the timestamp of the most recent event
- Implemented proper extraction of `last_activity` from the latest timeline event via matrix-rust-sdk
- Removed the old alphabetical sorting (now handled by frontend)

#### 2. **Frontend Types - `ui/src/lib/tauri.ts`**
- Added `highlight_count: number` to the `RoomInfo` interface
- Added `last_activity: number` to the `RoomInfo` interface

#### 3. **Sorting Logic - `ui/src/lib/channel-switcher.ts`**
- Added `RoomGroup` enum with priority levels: Mentioned (0), Unread (1), Read (2), Archived (3)
- Implemented `getRoomGroup()` function to categorize rooms based on their state
- Implemented `sortRooms()` function that:
  - Groups rooms by priority (mentioned → unread → read → archived)
  - Within each group, sorts by `last_activity` (most recent first)
  - Returns a new sorted array without mutating the original

#### 4. **Channel Switcher Component - `ui/src/ChannelSwitcher.svelte`**
- Imported and applied `sortRooms()` to the room list
- Updated the `filtered` derived state to apply sorting before filtering by query

#### 5. **Fake Backend - `ui/fake-state.ts`**
- Added a fifth test room ("announcements") with unreads but no mentions to better demonstrate the grouping
- All fake rooms already had `highlight_count` and `last_activity` fields with realistic test data

#### 6. **Specifications - `specs/channel_switcher.feature`**
- Added comprehensive scenarios covering:
  - Rooms sorted by group then by last activity
  - Within-group sorting by last activity descending
  - Mentioned rooms appearing first regardless of activity
  - Archived rooms appearing last regardless of unreads or activity

#### 7. **Tests - `ui/src/lib/channel-switcher.test.ts`**
- Added comprehensive test suite with 13 new tests covering:
  - Room grouping logic (4 tests)
  - Room sorting logic (9 tests)
- Tests verify:
  - Correct categorization into priority groups
  - Proper sorting by group priority
  - Proper sorting by last_activity within groups
  - Edge cases (empty lists, single rooms, archived rooms with unreads)
  - Non-mutation of original array

### How It Works

The channel switcher now displays rooms in this order:

1. **Mentioned** (rooms with `highlight_count > 0`) - These need immediate attention
2. **Unread** (rooms with `notification_count > 0` but no highlights) - Activity to catch up on
3. **Read** (rooms with no notifications) - Normal active rooms
4. **Archived** (manually archived rooms) - Low priority, shown last regardless of notification state

Within each group, rooms are sorted by `last_activity` with the most recent first, making it easy to find the most active conversations.

This implementation follows all INVARIANTS.md requirements:
- Uses Svelte 5 runes (`$derived`, `$state`)
- Pure decision logic separated from effects
- Comprehensive specs and tests for all new behavior
- No new dependencies
- Matches existing code patterns and conventions
