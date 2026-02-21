Perfect! The new files are there but untracked. Let me verify the solution by reviewing what was implemented:

## Summary

I've successfully implemented a fix for extremely long messages failing to render. Here's what was changed:

### Changes Made:

1. **Added specs** (`specs/message_display.feature`):
   - Scenario: Extremely long messages are truncated by default
   - Scenario: Truncated messages can be expanded
   - Scenario: Expanded messages can be collapsed

2. **Created truncation utility** (`ui/src/lib/truncate.ts`):
   - `truncateMessage()` function that limits message bodies to 5000 characters
   - Smart truncation at word boundaries (when possible) to avoid mid-word cuts
   - Returns metadata indicating if truncation occurred and preserves full text

3. **Added comprehensive tests** (`ui/src/lib/truncate.test.ts`):
   - 7 test cases covering short messages, exact limit, long messages, word boundary handling, etc.
   - Also added tests to `ui/src/lib/markdown.test.ts` to verify the markdown renderer handles extremely long input without failing

4. **Updated MessageBody component** (`ui/src/MessageBody.svelte`):
   - Added state tracking for expand/collapse functionality
   - Created helper functions: `renderMessageBody()`, `shouldShowExpandButton()`, `toggleExpand()`
   - Added "Show more" / "Show less" button UI that appears for truncated messages
   - Applied truncation to all message types (text, image captions)
   - Styled the expand button using existing design tokens

### How It Works:

- Messages longer than 5000 characters are automatically truncated at render time
- The markdown renderer processes only the truncated portion (or full text if expanded)
- Users see a "Show more" button below truncated messages
- Clicking expands to show the full message with a "Show less" button
- The truncation is smart enough to cut at word boundaries when feasible (within 10% of the limit)

### Testing:

- All 37 frontend tests pass (including 7 new truncation tests + 3 new markdown stress tests)
- Frontend builds successfully without errors
- The solution follows all INVARIANTS.md requirements:
  - Uses Svelte 5 runes (`$state`, `$derived`)
  - Uses existing CSS design tokens (`--accent`, `--border`, `--bg-hover`)
  - Pure decision logic is testable (truncation is a pure function)
  - Each spec has corresponding tests
  - New files are well under the 500-line limit

This fix prevents the "No messages yet" empty state bug that was occurring when the rendering pipeline choked on extremely large message payloads. The solution is defensive (truncates by default) while still allowing users to view full content on demand.
