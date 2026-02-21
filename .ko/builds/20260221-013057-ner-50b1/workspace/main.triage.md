Perfect. The file is well under the 500-line limit (381 lines), so we won't need to split it.

## Analysis

After investigating the codebase, the ticket is **actionable**. Here's what I found:

**The Problem:**
- In `ComposeBar.svelte`, the `handleSubmit` function (lines 81-99) clears `composeText` on line 93
- It then calls `tick().then(resizeTextarea)` on line 98 to resize the textarea
- However, the textarea's height doesn't properly collapse back to single-line after the text is cleared
- The issue is that when `resizeTextarea()` runs, it sets `height = "auto"` and then `height = scrollHeight`, but with empty content, this doesn't consistently reset to the initial single-line height
- The textarea does resize correctly when the user starts typing again (via `handleInput`), confirming the resizing mechanism works

**The Solution:**
The fix needs to explicitly reset the textarea height in `handleSubmit` after clearing the text. The simplest approach is to set the textarea height to `"auto"` immediately after clearing `composeText`, before calling `resizeTextarea()`.

**Files to Modify:**
- `ui/src/ComposeBar.svelte` — modify the `handleSubmit` function to reset textarea height after clearing text

**Spec Update Needed:**
- `specs/message_compose.feature` — add a scenario for textarea height reset behavior

**Test Requirements:**
According to INVARIANTS.md, this needs both a spec and a test. The behavioral test would verify that after sending a multi-line message, the compose textarea returns to single-line height.

**Assumptions:**
- The fix should happen synchronously in `handleSubmit`, not after a tick
- The same fix should apply to both text message submission and image attachment submission (both clear `composeText`)
- No architectural decisions needed — this is a straightforward UI bug fix

```json
{"disposition": "continue"}
```
