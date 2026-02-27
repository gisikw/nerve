## Summary

I've diagnosed the UI sizing issue in the channel sidebar. The problem is that the **unread count badge and archive button content are too large for their circular containers**:

**Unread Badge**: Currently uses a 16px circle (8px border-radius) but the 0.65rem text with minimal padding is cramped inside, especially for double-digit counts or "99+".

**Archive Button**: Has a 14px SVG icon but **no circular background** is currently defined in CSS, though the ticket implies there should be one to match the badge aesthetic.

**Root cause**: Insufficient sizing in `/home/dev/Projects/nerve/ui/styles/sidebar.css` at lines 55-68 (unread badge) and 80-101 (archive button).

**Recommended fix**: Increase both elements to 20-22px circular containers with proper padding - this provides visual breathing room while maintaining consistency between the two elements.

This is a low-risk CSS-only change that would actually improve accessibility by providing larger touch targets.
