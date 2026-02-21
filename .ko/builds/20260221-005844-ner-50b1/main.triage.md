Perfect! Now I understand the issue completely. Let me analyze the problem:

## Analysis

**The Issue:**
Looking at the `handleSubmit` function (lines 81-99), I can see:
1. Line 93: `composeText = "";` clears the text
2. Line 98: `tick().then(resizeTextarea);` schedules a resize after the DOM updates

The `resizeTextarea()` function (lines 60-66) should work correctly:
- It sets `height = "auto"` first
- Then sets `height = scrollHeight + "px"`
- For empty content, this should collapse to single-line height

However, the issue states the textarea stays expanded until you start typing. This suggests the `tick().then(resizeTextarea)` call at line 98 might not be executing properly, OR there's a race condition.

Looking more closely, I notice that `handleInput` (line 68-78) also calls `resizeTextarea()` at line 71. The ticket says "it does reset once you start typing" - this confirms that `handleInput` is what fixes it, not the submit handler.

**Root Cause:**
The problem is likely that `tick().then(resizeTextarea)` at line 98 is not sufficient. After clearing `composeText`, the textarea's `value` attribute updates, but the internal scrollHeight might not update synchronously even after `tick()`. We need to ensure the textarea is properly reset.

**Solution:**
Instead of relying on `tick().then(resizeTextarea)`, we should directly reset the textarea height in the submit handler after clearing the text. The most reliable approach is to set the height to "auto" or to the single-line height explicitly.

**Files to modify:**
- `/home/dev/Projects/nerve/ui/src/ComposeBar.svelte` - Update the `handleSubmit` function to properly reset textarea height

**Assumptions:**
1. The fix should work for both text messages and image attachments (both paths clear `composeText`)
2. The single-line height should be the default/auto height
3. This is a simple timing/sequencing fix, no architectural changes needed

**Acceptance criteria** (implied from the ticket):
- After sending a message, the compose textarea should immediately collapse to single-line height
- This should happen before the user starts typing the next message
- The behavior should be consistent for both regular messages and image attachments

This is a clear, self-contained fix with identifiable files and clear acceptance criteria.

```json
{"disposition": "continue"}
```
