Perfect! The implementation matches the existing sidebar pattern exactly (`font-weight: 600`).

## Summary

I have successfully implemented all three tasks from the plan:

### Task 1: Added unread class binding to ChannelSwitcher.svelte
- **File**: `ui/src/ChannelSwitcher.svelte:136`
- **Change**: Added `class:unread={room.notification_count > 0 || room.highlight_count > 0}` to the switcher-item `<li>` element
- **Verification**: Component test added and passing

### Task 2: Added CSS rule for bold styling
- **File**: `ui/styles/switcher.css:51-53`
- **Change**: Added `.switcher-item.unread { font-weight: 600; }` rule after the base `.switcher-item` styles
- **Verification**: Follows the exact pattern from `sidebar.css` where `.unread` rooms get `font-weight: 600`

### Task 3: Added scenario to feature spec
- **File**: `specs/channel_switcher.feature:91-99`
- **Change**: Added "Channels with unreads appear bold" scenario documenting the expected behavior for rooms with `notification_count > 0` or `highlight_count > 0`
- **Verification**: Scenario clearly describes the expected visual behavior

### Additional work:
- **Test coverage**: Added a regression test in `ui/src/ChannelSwitcher.test.ts` to verify the unread class binding exists in the component source
- **All tests passing**: Ran the full test suite (393 tests) - all pass ✓

The implementation is complete, follows the established patterns from the sidebar, and all verification steps have passed. Changes are left uncommitted as instructed.
