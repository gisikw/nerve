Perfect! Let me verify the implementation one more time by checking how the code flows through the system. Let me trace through it:

1. **State Management** (`rooms.svelte.ts`): Added `showChannels` state (defaults to `true`) with `getShowChannels()` and `toggleShowChannels()` functions ✅
2. **Filtering Logic** (`sidebar.ts`): Created `filterVisibleRooms()` that returns all rooms when expanded, or only rooms with `notification_count > 0` when collapsed ✅
3. **UI Component** (`Sidebar.svelte`): 
   - Imported the new functions ✅
   - Changed static "Channels" label to a clickable button with twirldown ✅
   - Applied filtering via `visibleActiveRooms` derived state ✅
   - Twirldown shows ▼ when expanded, ▶ when collapsed ✅
4. **Specs** (`room_navigation.feature`): Added 5 scenarios covering the collapse behavior ✅
5. **Tests** (`sidebar.test.ts`): Created comprehensive tests for both filtering functions ✅

Everything looks good! Let me do a final check to make sure the implementation matches the ticket requirements. Let me re-read the ticket to confirm:

The ticket states:
- ✅ CHANNELS header should be a twirldown (disclosure triangle) - Implemented as a button with ▼/▶
- ✅ When collapsed, show channels with activity (unreads, mentions) - Implemented via `filterVisibleRooms()` checking `notification_count > 0`
- ✅ Hide everything else when collapsed - Implemented in the filter function
- ✅ Location: Sidebar.svelte - Modified correctly
- ✅ Needs collapsed/expanded state - Added `showChannels` to `rooms.svelte.ts`
- ✅ Filtering logic that exempts active channels - Created in `sidebar.ts`

The implementation is complete! Let me create a summary:

## Summary

I've successfully implemented a collapsible channels section for the Sidebar with activity-aware filtering. Here's what was changed:

### Changes Made

1. **`ui/src/lib/stores/rooms.svelte.ts`** (lines 27, 73-79)
   - Added `showChannels` state (defaults to `true`) to track collapsed/expanded state
   - Added `getShowChannels()` and `toggleShowChannels()` functions for state management

2. **`ui/src/lib/sidebar.ts`** (new file)
   - Created `filterVisibleRooms()` function that returns all rooms when expanded, or only rooms with `notification_count > 0` when collapsed
   - Created `hasActivity()` helper function to determine if a room has activity

3. **`ui/src/Sidebar.svelte`** (lines 1-14, 25-27, 40-49, 51)
   - Imported `getShowChannels`, `toggleShowChannels`, and `filterVisibleRooms`
   - Added `visibleActiveRooms` derived state that applies filtering
   - Replaced static "Channels" label with a clickable button featuring a twirldown (▼ when expanded, ▶ when collapsed)
   - Updated room list to iterate over `visibleActiveRooms` instead of `activeRooms`

4. **`specs/room_navigation.feature`** (lines 37-63)
   - Added 5 new scenarios covering:
     - Collapsing/expanding behavior
     - Visibility of channels with unreads when collapsed
     - Hiding channels without activity when collapsed
     - Showing all channels when expanded
     - Twirldown visual indicator

5. **`ui/src/lib/sidebar.test.ts`** (new file)
   - Created comprehensive test suite with 8 tests covering:
     - Showing all rooms when expanded
     - Filtering to only active rooms when collapsed
     - Edge cases (empty arrays, no activity)
     - The `hasActivity()` helper function

### How It Works

When the user clicks the "Channels" header, it toggles between expanded and collapsed states. In the expanded state (default), all active channels are visible. In the collapsed state, only channels with `notification_count > 0` are shown, ensuring users never miss important activity while keeping the sidebar compact.

The implementation follows all INVARIANTS.md requirements:
- Uses Svelte 5 runes (`$state`, `$derived`)
- Pure decision logic in `sidebar.ts` separated from UI
- Follows existing patterns (matches Archived section behavior)
- Uses existing CSS classes (`.sidebar-section-header`, `.section-toggle`)
- Includes both specs and tests
