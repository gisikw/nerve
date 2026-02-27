## Goal
Fix vertical alignment of unread badge and archive button in channel sidebar list items.

## Context
The sidebar displays a list of channels with several inline elements:
- Room name text (flex: 1, takes available space)
- Unread badge (conditionally shown, 16px height with explicit line-height)
- Archive button (always present, contains 14px SVG icon)
- Typing badge (conditionally shown)

Parent container (`#room-list li` in `ui/styles/sidebar.css:17-31`) uses flexbox with `align-items: center` and `gap: 0.25rem`.

The unread badge has explicit dimensions (height: 16px, line-height: 16px) while the archive button lacks explicit height constraints. The SVG inside is only 14px tall. This causes misalignment because:
1. The badge occupies exactly 16px vertically
2. The button's effective height may differ due to default button behavior
3. The 2px difference between SVG (14px) and badge (16px) height compounds the issue

Both active channels (#room-list, lines 51-86 in Sidebar.svelte) and archived channels (archived-rooms, lines 102-138) use the same CSS classes, so they're both affected.

A prior diagnosis exists at `.ko/tickets/ner-99a6.artifacts/diagnosis.md` with detailed analysis.

## Approach
Add explicit height and flexbox centering properties to `.room-action-btn` to match the unread badge's vertical dimensions. Use display: flex with align-items: center to properly center the SVG icon within the button, and set height: 16px to match the badge.

## Tasks
1. [ui/styles/sidebar.css:80-90] — Update `.room-action-btn` rule to add explicit dimensions and flexbox centering.
   - Add `display: flex` to enable flexbox layout for centering the SVG
   - Add `align-items: center` and `justify-content: center` to center the icon
   - Add `height: 16px` to match the unread badge height
   - Add `width: 16px` for a consistent square clickable area
   - Keep existing properties (padding: 0, background: none, etc.)
   Verify: Visual inspection in the app shows badge and button aligned on the same baseline. Test both active and archived channel lists.

## Open Questions
None. The fix is a straightforward CSS adjustment with no logic changes needed. Both the unread badge and archive button already use `flex-shrink: 0`, so they won't break the parent flexbox layout. The typing badge should remain unaffected as it's a separate flex child.
