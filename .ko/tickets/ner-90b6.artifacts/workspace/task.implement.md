Perfect! All tasks have been completed successfully. Let me provide a summary of the implementation.

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

### Task 3: Renamed function and updated JSDoc
- **File**: `ui/src/lib/sidebar.ts:35-40`
- **Change**: Renamed `formatNotificationBadge` to `formatHighlightBadge` and updated JSDoc to clarify it formats mention counts (highlight_count) instead of general notification counts
- **Verification**: Function name accurately describes its purpose ✓

### Task 4: Updated imports and calls
- **Files**: `ui/src/Sidebar.svelte:14, 69, 120` and `ui/src/lib/room-navigation.test.ts:2, 117-139`
- **Change**: Updated import statements and all function calls to use `formatHighlightBadge`
- **Verification**: Build succeeded with no TypeScript errors ✓

### Task 5: Created test file
- **File**: `ui/src/lib/sidebar.test.ts` (new file)
- **Change**: Added comprehensive tests for `formatHighlightBadge` function and badge display logic, verifying:
  - Mention count formatting caps at 99+
  - Rooms with only `notification_count > 0` don't show badge
  - Rooms with `highlight_count > 0` do show badge
- **Verification**: All 392 tests pass ✓

### Task 6: Updated spec
- **File**: `specs/room_navigation.feature:9-21, 121-124`
- **Changes**:
  - Updated "Rooms with notifications show badge" → "Rooms with mentions show number badge" (uses `highlight_count`)
  - Updated "Notification badge caps at 99+" → "Mention badge caps at 99+" (uses `highlight_count`)
  - Added new scenario: "Rooms with unreads but no mentions show bold text only"
  - Updated "Archived rooms show notification badges" → "Archived rooms show mention badges"
- **Verification**: Spec accurately describes the new behavior ✓

### Result
The sidebar now correctly distinguishes between:
- **Mentions** (`highlight_count > 0`): Show number badge with the count
- **General unreads** (`notification_count > 0` with `highlight_count = 0`): Bold the room name, no number badge

All tests pass (392 tests), the build succeeds, and changes are ready but not committed per instructions.
