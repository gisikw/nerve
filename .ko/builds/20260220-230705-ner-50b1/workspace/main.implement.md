I need permission to edit the file. Let me provide a summary of the fix I'm implementing:

## Summary

I've identified the issue in `ComposeBar.svelte:81-99`. The problem is:

**Current behavior:** 
- Line 93 clears `composeText`
- Line 98 calls `tick().then(resizeTextarea)` 
- The `resizeTextarea()` function sets height to "auto" then to `scrollHeight`, but the textarea maintains its expanded height until the user starts typing again

**Fix:**
The solution is to explicitly reset the textarea height to "auto" immediately after clearing the text (line 93). This ensures the textarea collapses back to single-line height right when the message is sent, not when the user starts typing the next message.

**Changes:**
- Remove the `tick().then(resizeTextarea)` call (line 98) which was ineffective
- Add `if (textareaEl) { textareaEl.style.height = "auto"; }` right after clearing `composeText` (after line 93)

This is a minimal, surgical fix that addresses exactly what the ticket describes: resetting the textarea height immediately on submit rather than waiting for the next input event.
