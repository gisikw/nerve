## Goal
Show number badges only for mentions (highlight_count > 0), bold text for general unreads (notification_count > 0 with highlight_count = 0).

## Context
The sidebar currently shows number badges for all unreads (`notification_count > 0`), but it should distinguish between:
- **Mentions** (`highlight_count > 0`): Show number badge with the count
- **General unreads** (`notification_count > 0` and `highlight_count = 0`): Bold the room name, no number badge

Key files:
- `ui/src/Sidebar.svelte:68-70` — Currently shows badge when `notification_count > 0`
- `ui/src/lib/sidebar.ts:35-40` — `formatNotificationBadge()` formats the count
- `ui/styles/sidebar.css:55-68` — `.unread-badge` styles the badge pill
- `ui/styles/sidebar.css:43-46` — `.unread` class already bolds the room name
- `ui/src/lib/tauri.ts:17-26` — `RoomInfo` type defines both `notification_count` and `highlight_count`

The codebase already has the data model distinction (`highlight_count` vs `notification_count`). The channel switcher (`ui/src/lib/channel-switcher.ts`) correctly distinguishes mentions from unreads for grouping purposes.

Existing spec at `specs/room_navigation.feature:9-11` says "Rooms with notifications show badge", which is now ambiguous and should be updated to reflect the new behavior.

Testing pattern: vitest with `@testing-library/svelte`. Example: `ui/src/lib/channel-switcher.test.ts` shows how to test functions that operate on `RoomInfo`.

**Environment**: This project uses Nix for dependency management. The test suite requires running inside the Nix development shell (`nix develop --command just test`) to access npx and other Node.js tooling. The pipeline's verify step (`.ko/pipeline.yml:47`) automatically wraps test execution in `nix develop` when `flake.nix` exists.

## Approach
Update the Sidebar component to conditionally render the number badge only when `highlight_count > 0`. The existing `.unread` class (applied when `notification_count > 0`) already provides the bold styling for general unreads. Update the spec to clarify the new badge behavior. Add tests to verify the distinction.

## Tasks
1. [ui/src/Sidebar.svelte:68-70] — Change the badge condition from `room.notification_count > 0` to `room.highlight_count > 0`.
   Verify: Visual inspection in browser or screenshot shows badges only on mentions.

2. [ui/src/Sidebar.svelte:119-121] — Update the same condition in the archived rooms section to use `room.highlight_count > 0`.
   Verify: Archived rooms also show badges only for mentions.

3. [ui/src/lib/sidebar.ts] — Rename `formatNotificationBadge` to `formatHighlightBadge` and update its JSDoc comment to clarify it formats mention counts, not general notification counts.
   Verify: Function name accurately describes its purpose.

4. [ui/src/Sidebar.svelte:14, 69, 120] — Update imports and calls to use the renamed `formatHighlightBadge`.
   Verify: No TypeScript errors, build succeeds.

5. [ui/src/lib/sidebar.test.ts] — Create new test file for sidebar badge logic. Test that `formatHighlightBadge` caps at 99+. Test that rooms with only notification_count > 0 don't show badge, rooms with highlight_count > 0 do show badge.
   Verify: `nix develop --command just test` passes all new tests (requires Nix environment for npx).

6. [specs/room_navigation.feature:9-18] — Update scenarios 2 and 3 to specify that badges show for mentions (highlight_count > 0), and add a new scenario for unreads without mentions showing bold text only.
   Verify: Spec accurately describes the new behavior.

## Open Questions
None — the data model already distinguishes mentions from general unreads via `highlight_count` and `notification_count`. The visual treatment (badge vs. bold) is a straightforward UI change with existing CSS support.
