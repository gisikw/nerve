All tasks done. Here's a summary:

---

## Summary

**Task 1** — `ui/src/Sidebar.svelte:71`: Changed active rooms badge condition from `room.notification_count > 0` to `room.highlight_count > 0`.

**Task 2** — `ui/src/Sidebar.svelte:122`: Changed archived rooms badge condition from `room.notification_count > 0` to `room.highlight_count > 0`.

**Task 3** — `ui/src/lib/sidebar.ts:28-35`: Renamed `formatNotificationBadge` → `formatHighlightBadge` and updated the JSDoc to clarify it formats mention counts (`highlight_count`).

**Task 4** — Updated all references to use `formatHighlightBadge`:
- `ui/src/Sidebar.svelte:11, 72, 123` — import and both call sites
- `ui/src/lib/room-navigation.test.ts:2, 117, 119-138` — import, describe label, and all call sites

**Task 5** — Created `ui/src/lib/sidebar.test.ts` with tests for `formatHighlightBadge` (capping at 99+) and badge display logic (rooms with `notification_count > 0` / `highlight_count = 0` have no badge; rooms with `highlight_count > 0` do).

**Task 6** — Updated `specs/room_navigation.feature`:
- Renamed "Rooms with notifications show badge" → "Rooms with mentions show number badge" (uses `highlight_count`)
- Added new scenario: "Rooms with unreads but no mentions show bold text only"
- Renamed "Notification badge caps at 99+" → "Mention badge caps at 99+"
- Renamed "Archived rooms show notification badges" → "Archived rooms show mention badges"

No deviations from the plan.
