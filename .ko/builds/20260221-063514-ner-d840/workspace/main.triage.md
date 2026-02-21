Based on my investigation, I can now provide my triage analysis:

## Triage Analysis

After investigating the codebase, I've identified the scope and files involved:

**Current State:**
- The channel switcher (`ChannelSwitcher.svelte`) displays rooms in alphabetical order (sorted in `rooms.rs:61`)
- `RoomInfo` struct currently has: `id`, `name`, `is_direct`, `notification_count`, `typing_users`, `topic`
- Archived status is frontend-only (stored in localStorage)

**What needs to be done:**

1. **Backend changes** (`src-tauri/src/rooms.rs`):
   - Add `highlight_count` field to `RoomInfo` struct (Matrix SDK's `unread_notification_counts()` has both `notification_count` and `highlight_count`)
   - Add `last_activity_timestamp` field to track when the room last had activity (need to extract from Matrix SDK's latest event)
   - Remove alphabetical sorting (line 61) — sorting will move to frontend

2. **Frontend type updates** (`ui/src/lib/tauri.ts`):
   - Add `highlight_count: number` and `last_activity_timestamp?: number` to `RoomInfo` interface

3. **Frontend sorting logic** (`ui/src/lib/channel-switcher.ts` or new file):
   - Create a `sortRoomsByPriority()` function that groups and sorts rooms:
     1. Mentioned (highlight_count > 0)
     2. Unreads (notification_count > 0, but no mentions)
     3. Read (notification_count === 0)
     4. Archived (from localStorage set)
   - Within each group, sort by last_activity_timestamp descending

4. **Component updates** (`ui/src/ChannelSwitcher.svelte`):
   - Apply the new sorting to the `filtered` derived state
   - Optionally add visual grouping/separators between priority groups

5. **Fake backend** (`ui/fake-state.ts`):
   - Add `highlight_count` and `last_activity_timestamp` to `FakeRoom` interface
   - Add seed data for these fields

6. **Spec updates** (`specs/channel_switcher.feature`):
   - Add scenarios describing the sorting behavior

**Critical architectural question:**

The Matrix SDK may not directly expose `last_activity_timestamp` on the Room object. I need to either:
- Extract it from the latest event in the room (requires fetching message events)
- Use a simpler heuristic (track locally when rooms receive new messages)
- Use room recency from Matrix sync response ordering

**This is a medium discretion issue, so I should make a reasonable assumption**: The Matrix SDK likely tracks room ordering from the sync response, which implicitly represents recency. If not directly available, we can track this client-side when new messages arrive via the `onMessagesUpdated` event handler.

**Assumptions I'm making:**
1. Matrix SDK's `unread_notification_counts()` has a `highlight_count` field (standard Matrix spec)
2. We can derive or track `last_activity_timestamp` from sync ordering or message events
3. Visual grouping in the UI is implied but not required — sorting alone satisfies the ticket

The scope is clear and self-contained. All files are identifiable. The implementation is straightforward once we confirm how to get last activity timestamps from the Matrix SDK.

```json
{"disposition": "continue"}
```
