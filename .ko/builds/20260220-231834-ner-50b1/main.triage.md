Perfect! Now I have a complete understanding of the issue and the solution.

## Summary

**What needs to be done:**
The textarea in `ComposeBar.svelte` needs to reset its height immediately after sending a message, not wait until the user starts typing again.

**The root cause:**
In `handleSubmit()` (line 81-99), after clearing `composeText`, the code calls `tick().then(resizeTextarea)`. However, `resizeTextarea()` measures the current `scrollHeight` of the textarea, which still reflects the expanded state even though the content is now empty. The textarea's height doesn't automatically collapse when the content is cleared - it stays at whatever explicit height was set.

**The fix:**
Modify the `handleSubmit()` function to explicitly reset the textarea height to its initial single-row state immediately after clearing the text. The simplest approach is to set `textareaEl.style.height = "auto"` right after clearing the text, before calling `resizeTextarea()`. This forces the browser to recalculate based on the empty content and the `rows="1"` attribute.

**Files to modify:**
- `/home/dev/Projects/nerve/ui/src/ComposeBar.svelte` (line ~93-98 in the `handleSubmit` function)

**Assumptions:**
- The textarea should collapse to single-row height (matching `rows="1"`) when empty
- This should happen immediately on submit, not after the next keystroke
- The fix should work for both text-only messages and image sends with captions

**Implementation approach:**
After line 93 where `composeText = ""`, and before line 98's `tick().then(resizeTextarea)`, we should reset the textarea height. The most reliable approach is to set `textareaEl.style.height = "auto"` immediately, which will cause the browser to use the intrinsic height based on `rows="1"` and the empty content.

This is a straightforward, self-contained fix with clear acceptance criteria:
- ✅ After sending a message, the textarea should immediately collapse to single-row height
- ✅ The behavior should match what happens when you start typing a new message
- ✅ Should work for both regular messages and image attachments with captions

```json
{"disposition": "continue"}
```
