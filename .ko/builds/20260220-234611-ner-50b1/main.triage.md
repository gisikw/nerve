Perfect. I now have a clear understanding of the issue. Let me analyze what I found:

## Analysis

**Current behavior:**
Looking at `ComposeBar.svelte` lines 81-98, the `handleSubmit` function:
1. Clears the `composeText` state (line 93 or 114)
2. Calls `tick().then(resizeTextarea)` on line 98

The issue is that `tick()` waits for the DOM to update, but the textarea height was already set to match its expanded `scrollHeight`. When the text is cleared, the textarea still has the explicit `height` style set from the previous expansion, so it stays tall until the user starts typing again (which triggers `handleInput` → `resizeTextarea`).

**Root cause:**
In `resizeTextarea()` (lines 60-66), the function:
1. Sets `height = "auto"` (line 62)
2. Reads `scrollHeight` (line 63)
3. Sets `height = scrollHeight + "px"` (line 63)

After submit, when `composeText` becomes empty, the `scrollHeight` is still based on the previous content because the textarea's content hasn't visually updated yet when `resizeTextarea` runs.

**The fix:**
The submit handler should reset the textarea height immediately after clearing the text, ensuring the height resets before the next tick. The simplest approach is to explicitly set `textareaEl.style.height = "auto"` right after clearing `composeText`, or to call `resizeTextarea()` synchronously before the `tick()`.

**Files to modify:**
- `ui/src/ComposeBar.svelte` — modify the `handleSubmit` function (around lines 81-98)

**Acceptance criteria:**
- After sending a message, the textarea immediately collapses to single-line height
- The textarea doesn't stay expanded until the user starts typing again
- The resize still works correctly when typing the next message

This is a straightforward UI bug fix with clear scope. No architectural decisions needed, no dependencies on other tickets, and the implementation is obvious once you understand the DOM timing issue.

```json
{"disposition": "continue"}
```
