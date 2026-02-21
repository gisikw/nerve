Perfect! I now have a clear understanding of the issue and the codebase. Let me analyze what needs to be done:

## Analysis

**Current behavior:**
- Line 94-95 in `MessageList.svelte`: The autoscroll threshold is **100px** (`el.scrollTop + el.clientHeight >= el.scrollHeight - 100`)
- Line 197-198: ResizeObserver also uses **100px** threshold
- The ticket requests a threshold of **~200px**

**Problem identified:**
The ticket mentions the typing indicator should trigger auto-scroll when near bottom, but the typing indicator (`#if typingUsers.length > 0` block at lines 282-287) is rendered OUTSIDE the `#messages` container. When it appears, it doesn't trigger the autoscroll effect because:
1. The typing indicator is a separate element below the messages container
2. The `$effect` on lines 64-106 only reacts to NEW MESSAGES (changes to `lastId`)
3. It does NOT react to the typing indicator appearing/disappearing

**Files to modify:**
1. `ui/src/MessageList.svelte` - Update the threshold from 100px to 200px in TWO places (lines 95 and 198)
2. `ui/src/MessageList.svelte` - Add an effect to auto-scroll when typing indicator appears AND user is near bottom

**Assumptions:**
- The 200px threshold is appropriate (mentioned in the ticket as "~200px")
- Auto-scroll should occur both when new messages arrive AND when typing indicator appears (if near bottom)
- The scroll button threshold in `lib/scroll.ts` is already 200px (line 14), so message scroll behavior should match that

**Acceptance criteria:**
- When user is scrolled within 200px of bottom and a new message arrives → auto-scroll
- When user is scrolled within 200px of bottom and typing indicator appears → auto-scroll  
- When user has scrolled more than 200px up from bottom → preserve scroll position (don't auto-scroll)
- Typing indicator visible but chat not fully scrolled should no longer occur (the issue shown in the screenshot)

This is a straightforward fix with clear scope and acceptance criteria.

```json
{"disposition": "continue"}
```
