Perfect! Let me also check that I haven't introduced any regressions. Let me trace through the code path:

1. When typing, `handleInput` is called → sets `composeText` → calls `resizeTextarea()` → since text is present, it expands the textarea ✓
2. When submitting, `handleSubmit` is called → clears `composeText = ""` → calls `tick().then(resizeTextarea)` → since text is empty, it keeps height as "auto" which collapses to single-line ✓
3. When switching rooms, the effect restores draft → calls `resizeTextarea()` → if draft has text, it expands; if empty, it stays collapsed ✓

Everything looks good! Let me create a brief summary of the changes:

## Summary

I've successfully fixed the textarea height reset issue in the compose bar. Here's what was changed:

### Changes Made

1. **ComposeBar.svelte:60-70** - Updated the `resizeTextarea()` function to check if `composeText` is empty before setting the height to `scrollHeight`. When the text is empty (after sending), the height stays at "auto", which causes the textarea to collapse back to its natural single-line height.

2. **specs/message_compose.feature:35-38** - Added a new spec scenario "Textarea height resets after sending" that describes the expected behavior when a multi-line message is submitted.

3. **ui/src/lib/compose.test.ts** - Created a new test file with 6 tests that verify the textarea resize logic:
   - Resets to auto height when text is empty
   - Resets to auto height when text is only whitespace
   - Expands to scrollHeight when text is present
   - Expands to scrollHeight for multi-line text
   - Sets overflow to hidden when content fits
   - Sets overflow to auto when content exceeds offsetHeight

### How it works

The fix leverages the fact that when a textarea's height is set to "auto", it collapses to its natural height based on the `rows` attribute (which is 1 in this case). The updated logic:

1. Always resets height to "auto" first
2. Only sets height to `scrollHeight` if there's actual content (not empty/whitespace)
3. This ensures that after sending a message (which clears `composeText`), the textarea collapses immediately

All tests pass (19 tests total across 2 test files).
