I keep hitting the permission issue. Let me wait for approval and then proceed with the implementation. The changes I need to make are:

1. Change `tick().then(resizeTextarea)` to `tick().then(() => resizeTextarea())` on line 98 for consistency with the pattern used elsewhere in the file
2. Add `tick().then(() => resizeTextarea())` after clearing `composeText` in the `sendImageAttachment` function (after line 115)

These minimal changes will ensure the textarea height resets immediately after sending a message in both code paths (text messages and image messages with captions).
