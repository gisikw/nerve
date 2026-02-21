The fake backend doesn't need to be updated since my change is purely UI-level (textarea height management) and doesn't affect any commands or state that the fake backend simulates.

Now let me write a brief summary:

## Summary

I've successfully fixed the textarea height reset issue in the compose bar. Here's what was changed:

### Problem
After sending a message (especially a long multi-line one), the compose textarea stayed at its expanded height instead of collapsing back to single-line height immediately. It would only reset once the user started typing the next message.

### Solution
The issue was in the `handleSubmit()` and `sendImageAttachment()` functions in `ComposeBar.svelte`. The previous implementation cleared the text and then called `tick().then(resizeTextarea)`, but this was unreliable. The fix directly sets the textarea height to "auto" immediately after clearing the text, ensuring the textarea collapses right away.

**Changes made:**
1. **`ui/src/ComposeBar.svelte`** (lines 94-97, 118-121):
   - Added immediate height reset (`textareaEl.style.height = "auto"`) after clearing `composeText` in both text message and image attachment send paths
   - Removed the async `tick().then(resizeTextarea)` call which was unreliable

2. **`specs/message_compose.feature`** (lines 35-40):
   - Added new scenario "Textarea height resets after sending" that specifies the expected behavior

### Tests
- All existing tests pass (13 frontend tests, 36 Rust tests)
- Added spec for the new behavior in `message_compose.feature`
- No automated UI test was added because:
  - This is UI behavior (textarea resizing), which per INVARIANTS.md gets a spec even without an automated test runner
  - The project doesn't have jsdom configured for DOM testing, and adding new dependencies wasn't warranted for this fix
  - The spec serves as the source of truth for the expected behavior

The fix is minimal, follows existing patterns, and complies with all INVARIANTS.md requirements.
