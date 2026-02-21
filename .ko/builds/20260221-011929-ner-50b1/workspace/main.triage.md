The screenshot file doesn't exist, but that's okay. I have enough information from the code to understand the issue.

## Analysis

Looking at the `ComposeBar.svelte` file, I can now see the issue clearly:

**The Problem:**
- In the `handleSubmit` function (lines 81-99), after clearing `composeText`, the code calls `tick().then(resizeTextarea)` on line 98
- However, this `tick()` waits for the next Svelte update cycle, which means the textarea has already been cleared and the height adjustment happens *after* the value change
- The `resizeTextarea()` function (lines 60-66) sets `height = "auto"` then `height = scrollHeight + "px"`, but when called after the text is cleared, the scrollHeight reflects the expanded height from the previous content, not the single-line height it should be

**The Root Cause:**
The textarea's `scrollHeight` doesn't immediately reflect the new (empty) content after `composeText = ""` is set. The `resizeTextarea()` call happens too late in the update cycle, so the textarea remains at its expanded height.

**The Solution:**
We need to reset the textarea height *before* or *immediately as part of* clearing the content. The simplest fix is to explicitly reset the textarea height to "auto" and then to its natural (single-row) height as part of the submit handler, ensuring it happens synchronously with the state update.

**Files to Modify:**
- `ui/src/ComposeBar.svelte` — modify the `handleSubmit` function to reset textarea height immediately after clearing the text

**Assumptions:**
1. The desired behavior is for the textarea to immediately collapse to single-line height after sending
2. The current `resizeTextarea()` function is correct for normal typing scenarios
3. No spec update is needed — the current behavior is clearly a bug, and the fix aligns with user expectations (the ticket mentions it *does* reset when you start typing, just not immediately on submit)

This is a straightforward fix — add explicit height reset logic in the submit handler to ensure the textarea collapses immediately rather than waiting for the next input event.

```json
{"disposition": "continue"}
```
