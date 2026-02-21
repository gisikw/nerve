Perfect! Now I have a complete understanding of the issue. Let me analyze:

## Analysis

Based on my investigation of the codebase, I can identify the issue and what needs to be done:

**Current State:**
1. `MessageList.svelte` renders messages in an `{#each}` block (lines 237-244)
2. Each message is rendered by `MessageItem.svelte`, which includes `MessageBody.svelte`
3. `MessageBody.svelte` calls `renderMarkdown()` via `{@html renderMarkdown(message.body)}` (lines 87, 119)
4. The `renderMarkdown()` function in `lib/markdown.ts` has no error handling - if it throws or takes too long, Svelte's rendering can fail
5. When rendering fails, Svelte falls back to the empty state: "No messages yet." (line 232)

**The Problem:**
- Extremely long message bodies (e.g., verbose Knockout toolchain output) can cause:
  - The markdown parser to hang or throw due to memory/processing limits
  - The DOM to become too large to render efficiently
  - The browser to silently fail rendering
- There's no error boundary, no size limit, and no truncation mechanism

**What Needs to Be Done:**
1. Add a size check in `MessageBody.svelte` to detect extremely long messages
2. For oversized messages, show a truncated version with a "Show more" button
3. Add error handling around `renderMarkdown()` to catch failures gracefully
4. Add a test case for long messages to the markdown test suite
5. Update the spec to document the behavior for long messages

**Files to Modify:**
- `ui/src/MessageBody.svelte` - Add truncation logic and error handling
- `ui/src/lib/markdown.ts` - Add defensive bounds checking (optional but recommended)
- `ui/src/lib/markdown.test.ts` - Add test for long messages
- `specs/message_display.feature` - Document long message behavior

**Assumptions:**
- A reasonable truncation threshold is around 10,000-50,000 characters (will need to test)
- The "show more" affordance should expand inline, not in a modal
- Truncation should preserve markdown structure where possible
- Code blocks and other special markdown elements should be considered when truncating

This is actionable and self-contained. The scope is clear, and I know exactly which files need to change.

```json
{"disposition": "continue"}
```
