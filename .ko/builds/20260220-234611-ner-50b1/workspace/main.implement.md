That's fine - the syntax is correct and the changes are minimal. Let me create a summary of what was changed.

## Summary

I've successfully fixed the textarea height reset issue in `ComposeBar.svelte`. The problem was that after sending a message, the textarea remained at its expanded height instead of collapsing immediately.

### Changes made:

1. **Line 98** (in `handleSubmit`): Changed from `tick().then(resizeTextarea)` to `resizeTextarea()` to reset the textarea height synchronously immediately after clearing the text for regular text messages.

2. **Line 116** (in `sendImageAttachment`): Added `resizeTextarea()` call after clearing the text and attachment when sending an image with a caption, ensuring the textarea resets in that case as well.

### Why this fixes the issue:

- **Previously**: The `resizeTextarea()` call was deferred using `tick().then()`, which meant it happened asynchronously after the next DOM update cycle. This caused a visible delay where the textarea stayed expanded.

- **Now**: The `resizeTextarea()` function is called synchronously immediately after clearing `composeText`, so the height resets instantly when the message is sent.

The fix handles both cases:
- **Text messages**: Text is cleared and textarea is resized immediately in `handleSubmit`
- **Image messages**: Text is cleared and textarea is resized immediately in `sendImageAttachment` after the image is processed

This is a minimal change that directly addresses the reported issue without refactoring or adding unnecessary complexity.
