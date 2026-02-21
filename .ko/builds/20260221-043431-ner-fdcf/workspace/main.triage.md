Perfect! Now I have a complete understanding of the codebase. Let me analyze what needs to be done:

## Analysis

After investigating the codebase, I can clearly see:

1. **Current State**: The "Channels" section in `Sidebar.svelte` (line 35) is currently a static `<div class="sidebar-section-label">Channels</div>`. It's not collapsible.

2. **Existing Pattern**: There's already a collapsible section pattern in the same file for "Archived" rooms (lines 66-108), which uses:
   - A `sidebar-section-header` button with a toggle triangle (▶/▼)
   - State management via `showArchived` from `rooms.svelte.ts`
   - Conditional rendering with `{#if}`

3. **Activity Definition**: Based on the code, "activity" means:
   - `room.notification_count > 0` (unread messages) - shown via the `.unread` class
   - `typing.length > 0` (typing indicators) - shown via the `.typing` class and typing badge

4. **Required Changes**:
   - Convert the static "Channels" label to a collapsible button (like Archived)
   - Add state for `showChannels` in `rooms.svelte.ts`
   - When collapsed, filter the channel list to only show rooms with activity
   - Maintain CSS consistency with the existing archived section pattern

5. **Files to Modify**:
   - `ui/src/Sidebar.svelte` - Add collapsible UI and filtering logic
   - `ui/src/lib/stores/rooms.svelte.ts` - Add `showChannels` state and getter/toggle functions
   - `specs/room_navigation.feature` - Add acceptance criteria for the collapsible behavior
   - Test file (new or existing) - Add tests for the collapse/expand behavior

6. **Assumptions I'm Making**:
   - "Channels" should default to expanded (unlike archived which defaults to collapsed)
   - The collapse state should persist to localStorage (matching the archived pattern)
   - When collapsed, the section should still show the header with a count of active channels
   - The triangle should use the same ▶/▼ pattern as Archived

This is a well-scoped, self-contained feature with clear acceptance criteria implied by the existing code patterns. The ticket is actionable.

```json
{"disposition": "continue"}
```
