## Goal
Reduce the height of the sidebar's "+" (channel add) section to roughly half, so it doesn't visually dwarf the compose bar footer in the main panel.

## Context

The layout has two panels side by side:
- **Left: sidebar** — channel list, with `#sidebar-actions` at the bottom containing the "+" button
- **Right: chat** — `#room-header` at top, `#compose` at bottom

Both `#sidebar-actions` and `#compose` have a `border-top` that creates a horizontal dividing line. For the split lines to align vertically, the two footer areas should be the same height.

Current heights (approximate, assuming 1rem = 16px):
- `#sidebar-actions`: `padding: 0.35rem` container + button `padding: 0.3rem 0.5rem` → **~2.3rem total**
- `#compose`: `padding: 0.55rem 0.85rem` container + `2.2rem` buttons → **~3.3rem total**

The sidebar footer is currently *shorter* than the compose bar, so its border-top sits lower on screen (closer to the bottom). Halving the sidebar-actions height makes it smaller and more compact, which is the user's intent. The "almost-but-not-quite aligned" comment explains *why* they notice it — the current proportions are close enough to draw the eye.

Files:
- `ui/styles/sidebar.css` — the only file to change

## Approach

Reduce the padding on both the `#sidebar-actions` container and the `.sidebar-action-btn` button, approximately halving the vertical space each contributes. No structural or markup changes needed.

## Tasks

1. [`ui/styles/sidebar.css:175-198`] — Reduce `#sidebar-actions` container padding from `0.35rem` to `0.2rem`, and reduce `.sidebar-action-btn` vertical padding from `0.3rem 0.5rem` to `0.15rem 0.5rem`. This brings the total section height from ~2.3rem down to ~1.7rem — noticeably more compact while still being tappable/usable.
   Verify: visually inspect in browser; sidebar "+" section appears roughly half as tall as before.

## Open Questions

None. The change is purely cosmetic padding reduction with no architectural decisions.
