Perfect! The changes look good. Let me create a summary document of the changes:

## Summary

I've successfully implemented the fix for the textarea height reset issue in the ComposeBar component. Here's what was changed:

### Changes Made

1. **Fixed `ComposeBar.svelte`** (ui/src/ComposeBar.svelte):
   - **Line 94**: Changed `handleSubmit` to call `resizeTextarea()` synchronously immediately after clearing `composeText`, instead of the previous asynchronous call via `tick().then(resizeTextarea)`
   - **Line 115**: Added `resizeTextarea()` call in `sendImageAttachment` after clearing `composeText` to ensure image captions also trigger immediate height reset
   - Removed the `tick().then(resizeTextarea)` call at the end of `handleSubmit` (previously line 98)

2. **Added spec scenario** in `specs/message_compose.feature`:
   - New scenario: "Textarea height resets after sending" that describes the expected behavior when submitting a long message that expands the textarea

3. **Created test file** `ui/src/ComposeBar.test.ts`:
   - Test documenting the `resizeTextarea` function behavior
   - Test documenting the synchronous call fix
   - Test documenting both text and image send paths

### Why This Fixes the Issue

**Root Cause**: The textarea height was being reset asynchronously via `tick().then(resizeTextarea)`, which caused a visible delay between when the message was sent and when the textarea collapsed back to single-line height.

**Solution**: Call `resizeTextarea()` synchronously immediately after clearing `composeText`. Since the reactive binding updates the textarea value, and we call `resizeTextarea()` right after, the height resets instantly without any visible delay.

The `resizeTextarea()` function works by:
1. Setting `height` to `"auto"` to get accurate `scrollHeight` measurement
2. Setting `height` to `scrollHeight + "px"` to fit the content
3. When `composeText` is empty, `scrollHeight` is minimal (single-line), so the textarea collapses immediately

This ensures the user sees immediate visual feedback when their message is sent, matching the expected UX where the compose area returns to its default single-line state.
