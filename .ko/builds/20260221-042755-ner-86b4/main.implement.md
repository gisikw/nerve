Excellent! Let me create a summary of the changes:

## Summary

I've successfully implemented the ticket to move the activity indicator to the rightmost position in sidebar channel entries. Here's what was changed:

### Code Changes

**`ui/src/Sidebar.svelte`** (lines 51-61 and 93-103):
- Swapped the order of the archive button and typing indicator in both active and archived room lists
- The new order is: room name → archive button → typing indicator (when present)
- This makes the typing indicator the rightmost element, catching the user's eye first when scanning the sidebar

### Specs and Tests

**`specs/room_navigation.feature`** (lines 31-35):
- Added a new scenario "Activity indicator appears rightmost in channel row"
- Specifies that when typing activity is present, the typing indicator must be the rightmost element
- Specifies that the archive button appears before the typing indicator

**`ui/src/Sidebar.test.ts`** (new file):
- Created comprehensive tests for sidebar channel row element ordering
- Tests verify the correct order of elements with and without typing activity
- Tests confirm the typing indicator is rightmost when present
- Tests confirm the archive button comes before the typing indicator
- All 5 tests pass successfully

### Test Results

All tests pass:
- ✓ 5 new sidebar ordering tests
- ✓ 6 existing compose tests  
- ✓ 13 existing markdown tests
- **24 total tests passing**

The implementation is minimal, following existing patterns, and properly tested. The typing indicator now appears as the rightmost element in channel rows, making activity more visible to users scanning their sidebar.
