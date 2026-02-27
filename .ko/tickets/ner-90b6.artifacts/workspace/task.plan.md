Perfect! I've created the implementation plan. Here's a summary:

## Plan Summary

**Goal**: Fix the sidebar badge behavior to show number badges only for mentions, and bold text for general unreads.

**Key Insight**: The codebase already has the correct data model (`highlight_count` for mentions vs `notification_count` for general unreads), but the UI currently shows number badges for all unreads instead of just mentions.

**Changes needed**:
1. Update badge conditions in Sidebar.svelte (both active and archived sections) to check `highlight_count > 0` instead of `notification_count > 0`
2. Rename `formatNotificationBadge` to `formatHighlightBadge` to clarify its purpose
3. Add tests to verify the distinction
4. Update the spec to document the new behavior

The existing `.unread` class (applied when `notification_count > 0`) already provides the bold styling, so general unreads will automatically show as bold text without badges once we fix the badge condition.

The plan is ready for review at `.ko/tickets/ner-90b6.artifacts/plan.md`.
