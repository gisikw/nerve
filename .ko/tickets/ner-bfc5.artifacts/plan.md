## Goal
Increase the circular backgrounds for unread badges and archive buttons to provide proper visual padding around their content.

## Context
The diagnosis identified the issue in `ui/styles/sidebar.css`:
- **Unread badge** (lines 55-68): Currently uses 16px height with 8px border-radius for a circular shape. The 0.65rem font (~14.3px) with only 4px horizontal padding makes the content cramped, especially for "99+" counts.
- **Archive button** (lines 80-90): Currently has no circular background—only the 14px SVG icon. The ticket implies it should have a circular background matching the unread badge aesthetic.

Both elements appear in the channel sidebar (Sidebar.svelte lines 69-81 and 120-132) alongside room names and typing indicators.

The spec (room_navigation.feature:31-35) requires that typing indicators remain rightmost in channel rows, with archive buttons appearing before them. This layout constraint must be preserved.

## Approach
Increase both circle sizes to 20px (or 22px) to provide 3-4px of padding on each side of their content. This maintains visual consistency between the two elements while improving touch target accessibility. The unread badge needs larger height/border-radius, while the archive button needs an explicit circular background added.

## Tasks
1. [ui/styles/sidebar.css:55-68] — Increase unread badge circle size from 16px to 20px. Update `height: 16px` → `height: 20px`, `line-height: 16px` → `line-height: 20px`, and `border-radius: 8px` → `border-radius: 10px` (half of height for perfect circle). Consider increasing horizontal padding from `4px` to `5px` or `6px` for better breathing room.
   Verify: Launch the app with `cargo tauri dev`, navigate to rooms with various notification counts (1, 9, 99, 100+) and confirm badges look visually balanced without text cramping.

2. [ui/styles/sidebar.css:80-90] — Add circular background to archive button. Add `width: 20px`, `height: 20px`, and `border-radius: 10px` to match unread badge. Add `display: flex`, `align-items: center`, and `justify-content: center` to center the 14px SVG icon within the 20px circle.
   Verify: Launch the app, hover over channel rows to reveal archive buttons, confirm the icons are centered in circles matching the unread badge size.

3. [ui/styles/sidebar.css:92-101] — Verify hover states still work correctly. The existing opacity transitions should apply to the entire circular button including its new background.
   Verify: Test archive button hover interactions (both archive and unarchive) and confirm click targets work properly at the new size.

## Open Questions
Should the circle size be 20px or 22px? 20px provides 3px padding per side around the 14px icon, while 22px provides 4px. The diagnosis suggests either would work—20px is the minimum for adequate spacing, 22px is more generous. Starting with 20px is reasonable; if it still feels cramped in practice, bump to 22px in a follow-up.
