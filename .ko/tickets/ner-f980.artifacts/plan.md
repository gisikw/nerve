## Goal
Bold channel names in the channel switcher when they have unreads (notification_count > 0 or highlight_count > 0).

## Context
The channel switcher (ChannelSwitcher.svelte) displays a filtered list of rooms sorted by group (mentioned, unread, read, archived) and last activity. Rooms already track notification_count and highlight_count via the RoomInfo type from tauri.ts. The sidebar (sidebar.css) already has a pattern for bolding unread rooms using the `.unread` class with `font-weight: 600`.

Key files:
- ui/src/ChannelSwitcher.svelte:139 — Renders each room name in the switcher list
- ui/src/lib/channel-switcher.ts — Contains getRoomGroup() which categorizes rooms by Mentioned/Unread/Read/Archived based on notification_count and highlight_count
- ui/styles/switcher.css:43-58 — Styles for .switcher-item
- specs/channel_switcher.feature:84-89 — Existing scenario ensures "Create new" option is NOT bold

## Approach
Add a CSS class to switcher items that have unreads (notification_count > 0 or highlight_count > 0) and style it with `font-weight: 600` to match the sidebar pattern. The logic for determining unreads already exists in getRoomGroup() but needs to be applied to the template.

## Tasks
1. [ui/src/ChannelSwitcher.svelte:139] — Add a class binding for `unread` on the switcher-item li element. The condition should be `room.notification_count > 0 || room.highlight_count > 0`.
   Verify: Inspect the switcher in dev mode and confirm rooms with unreads have the `unread` class applied.

2. [ui/styles/switcher.css:43] — Add `.switcher-item.unread { font-weight: 600; }` rule after the base .switcher-item styles.
   Verify: Open the switcher and confirm that channels with notification_count > 0 or highlight_count > 0 are rendered in bold.

3. [specs/channel_switcher.feature] — Add a new scenario documenting that channels with unreads appear bold in the switcher.
   Verify: Feature file accurately describes the expected behavior.

## Open Questions
None — this follows the established pattern from the sidebar where `.unread` rooms get `font-weight: 600`.
