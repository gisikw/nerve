Excellent! All tasks are complete and verified. Let me provide a summary of what was implemented.

## Implementation Summary

All tasks from the plan have been successfully completed:

### Task 1: Updated active rooms badge condition
- **File**: `ui/src/Sidebar.svelte:68-70`
- **Change**: Changed badge condition from `room.notification_count > 0` to `room.highlight_count > 0`
- **Verification**: Build succeeded ✓

### Task 2: Updated archived rooms badge condition
- **File**: `ui/src/Sidebar.svelte:119-121`
- **Change**: Changed badge condition from `room.notification_count > 0` to `room.highlight_count > 0`
- **Verification**: Build succeeded ✓

### Task 3: Renamed function
- **File**: `ui/src/lib/sidebar.ts:35-40`
- **Change**: Renamed `formatNotificationBadge` to `formatHighlightBadge` and updated JSDoc to clarify it formats mention counts
- **Verification**: Function name accurately describes its purpose ✓

### Task 4: Updated imports and calls
- **Files**: `ui/src/Sidebar.svelte:14, 69, 120`
- **Change**: Updated import and all calls to use `formatHighlightBadge`
- **Verification**: Build succeeded with no TypeScript errors ✓

### Task 5: Created test file
- **File**: `ui/src/lib/sidebar.test.ts` (new file)
- **Change**: Added comprehensive tests for `formatHighlightBadge` function
- **Additional work**: Also updated existing test file `ui/src/lib/room-navigation.test.ts` to use the renamed function
- **Verification**: All 388 tests pass ✓

### Task 6: Updated spec
- **File**: `specs/room_navigation.feature:9-21, 115-118`
- **Changes**:
  - Updated "Rooms with notifications show badge" → "Rooms with mentions show number badge" (uses `highlight_count`)
  - Updated "Notification badge caps at 99+" → "Mention badge caps at 99+" (uses `highlight_count`)
  - Added new scenario: "Rooms with unreads but no mentions show bold text only"
  - Updated archived rooms scenario to reference mentions instead of notifications
- **Verification**: Spec accurately describes the new behavior ✓

### Result
The sidebar now correctly distinguishes between:
- **Mentions** (`highlight_count > 0`): Show number badge with the count
- **General unreads** (`notification_count > 0` with `highlight_count = 0`): Bold the room name, no number badge

All tests pass and the build succeeds. Changes are ready but not committed as per instructions.
