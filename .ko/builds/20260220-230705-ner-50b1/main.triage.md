I can see `resizeTextarea()` is called in:
1. Line 55: After room switch (inside $effect, after tick)
2. Line 71: On every input
3. Line 98: After submit (via tick().then())

The issue is likely that line 98's approach isn't working reliably. Looking at the image send path (lines 101-120), I notice:
- Line 114: `composeText = "";`
- Line 115: `clearAttachment();`
- But there's NO call to `resizeTextarea()` after sending an image!

So the bug affects both text and image sends, but the image path doesn't even attempt to resize.

## Analysis

**Scope:** Clear - the textarea should reset to single-line height immediately after submitting a message.

**Files:** `ComposeBar.svelte` - specifically the `handleSubmit` function (line 81) and `sendImageAttachment` function (line 101).

**Self-contained:** Yes - this is a straightforward UI behavior fix.

**Root cause:** 
1. In `handleSubmit` (text send): The `tick().then(resizeTextarea)` pattern (line 98) isn't reliably resetting the height
2. In `sendImageAttachment` (image send): There's no call to `resizeTextarea()` at all

**Solution:**
The issue is likely that after clearing `composeText`, we need to ensure the textarea element's internal state is fully updated before measuring scrollHeight. The current approach uses `tick()` but this might not be sufficient. 

A more reliable approach would be to:
1. Directly reset the textarea height to "auto" or a base height
2. Or call `resizeTextarea()` synchronously after the state update, possibly with an additional microtask delay

Looking at line 55, the pattern used after room switch is: `tick().then(() => { textareaEl?.focus(); resizeTextarea(); })` - this works because it's in a callback.

The fix should make line 98 consistent with this pattern, and add a similar call to `sendImageAttachment`.

**Acceptance criteria:**
1. After sending a text message, the textarea immediately collapses to single-line height
2. After sending an image (with or without caption), the textarea immediately collapses to single-line height
3. This happens on submit, not waiting until the next keystroke

**Assumptions:**
- The `resizeTextarea()` function itself is correct (it is - it properly sets height to auto then to scrollHeight)
- The issue is timing/invocation, not the resize logic itself
- We should follow the existing pattern used in the room-switch effect (line 53-56)

This ticket is fully actionable.

```json
{"disposition": "continue"}
```
