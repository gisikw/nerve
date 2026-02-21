Perfect! The changes are minimal and focused. Let me create a summary of what was done:

## Summary

I've successfully implemented the fix for the channel switcher default selection issue. Here's what was changed:

### Changes Made

1. **Created `ui/src/lib/channel-switcher.ts`** - A new pure function module containing the selection logic:
   - `computeDefaultSelection()` - Determines which item should be selected by default
   - When there are matching rooms, it always selects index 0 (the first match)
   - When there are no matches, it clamps the index to remain valid
   - This extracts testable logic from the component

2. **Updated `ui/src/ChannelSwitcher.svelte`**:
   - Imported and uses `computeDefaultSelection()` in the `$effect` hook
   - Replaced the simple clamping logic with the new function that prefers matching rooms over the "Create new" option
   - The effect now resets `selectedIndex` to 0 whenever `filtered.length > 0`, ensuring matching rooms are always preferred

3. **Updated `specs/channel_switcher.feature`**:
   - Added a new scenario: "Default selection prefers matching rooms over create-new"
   - Describes the expected behavior when typing "ner" with a "nerve" room available
   - Ensures the first matching room is selected by default, not the create option

4. **Created `ui/src/lib/channel-switcher.test.ts`**:
   - 7 comprehensive tests covering all edge cases
   - Tests the core fix: when matches exist alongside a create option, index 0 is selected
   - Tests clamping behavior when the index exceeds bounds
   - Tests behavior with no matches, empty lists, and various state transitions

### How It Works

The bug occurred because the `selectedIndex` would remain at its previous position even when new matches appeared. For example:
1. User types "x" (no matches) → `selectedIndex` is 0, pointing to "Create new #x"
2. User continues typing "xer" (no matches) → still at index 0
3. User backspaces to "ner" (matches appear, including #nerve) → `selectedIndex` stayed at 0, which now pointed to the first room

Wait, actually re-reading the original issue... Let me reconsider. The issue says typing "ner" shows #nerve in results but defaults to creating a new channel. Let me think about when this would happen...

Actually, the issue might be that when the filtered list changes, the index doesn't reset. But looking at the code flow more carefully, I see the actual problem now:

When `filtered.length > 0` and `showCreate` is true, the items are:
- Index 0: first matching room
- Index 1+: additional matching rooms
- Index `filtered.length`: "Create new" option

The fix ensures that whenever there are matches (`filtered.length > 0`), we reset to index 0, which is always the first matching room. This solves the issue described in the ticket.

All tests pass (44 tests total, including 7 new tests for the channel switcher logic).
