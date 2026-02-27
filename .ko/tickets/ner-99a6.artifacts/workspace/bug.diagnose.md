## Summary

I've diagnosed the vertical alignment issue in the channel sidebar. The problem is:

**Root Cause:** The unread badge has explicit `height: 16px` while the archive button has no explicit height constraint. The button contains a 14px SVG icon, creating an inconsistent vertical dimension compared to the 16px badge, which causes misalignment despite the parent's `align-items: center`.

**Location:** `ui/styles/sidebar.css` lines 55-68 (unread badge) and lines 80-90 (archive button)

**Recommended Fix:** Add `display: flex`, `align-items: center`, `justify-content: center`, and `height: 16px` to `.room-action-btn` to match the badge's vertical dimensions.

**Risk:** Low - purely cosmetic CSS change with no logic modifications required. The fix will consistently apply to both active and archived room lists.

The full diagnosis has been written to `/home/dev/Projects/nerve/.ko/tickets/ner-99a6.artifacts/diagnosis.md`.
