Perfect! I've created the implementation plan for fixing the vertical alignment issue between the unread badge and archive button in the channel sidebar.

## Summary

The plan identifies a straightforward CSS fix for the misalignment issue:

**Root cause:** The unread badge has explicit dimensions (16px height) while the archive button lacks height constraints, causing them to render at slightly different vertical positions despite the parent's `align-items: center`.

**Solution:** Add explicit flexbox properties to `.room-action-btn` in `ui/styles/sidebar.css`:
- `display: flex` with `align-items: center` and `justify-content: center` to center the SVG icon
- `height: 16px` and `width: 16px` to match the badge dimensions and create a consistent clickable area

The fix is low-risk, requires only CSS changes (no logic modifications), and will automatically apply to both active and archived channel lists since they share the same CSS classes.

The plan has been written to `/home/dev/Projects/nerve/.ko/tickets/ner-99a6.artifacts/plan.md` and is ready for your review and approval.
