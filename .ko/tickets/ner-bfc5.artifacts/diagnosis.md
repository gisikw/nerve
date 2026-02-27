# Diagnosis: Unread Count and Archive Button Circle Sizing

## Symptoms

In the channel sidebar, the unread count badge and archive button icons appear too large relative to their circular backgrounds. The content is cramped within the circles, creating a visually unbalanced appearance.

## Root Cause

The issue stems from insufficient padding/sizing between the visual elements and their circular containers in `ui/styles/sidebar.css`:

### Unread Badge (lines 55-68)
- **Current circle size**: `height: 16px`, `border-radius: 8px` (creates perfect circle)
- **Content**: Text with `font-size: 0.65rem` (~14.3px at base 22px font size)
- **Horizontal padding**: `0 4px`
- **Problem**: A 16px circle with 8px total horizontal padding leaves only 8px for text content, which is insufficient for the 0.65rem font size. Numbers like "99+" are especially cramped.

### Archive Button (lines 80-90)
- **Current**: No circular background defined - only the SVG icon exists
- **Icon size**: `14px × 14px` (defined in Sidebar.svelte:76, 127)
- **Problem**: The ticket implies there should be a circular background around the archive button (to match the unread badge aesthetic), but none is currently styled in CSS. If one were added at the minimal size to contain a 14px icon, it would be too tight.

## Affected Code

**Primary file**: `/home/dev/Projects/nerve/ui/styles/sidebar.css`
- Lines 55-68: `.unread-badge` styling
- Lines 80-101: `.room-action-btn` styling

**Secondary file**: `/home/dev/Projects/nerve/ui/src/Sidebar.svelte`
- Lines 69, 120: Unread badge usage
- Lines 71-81, 122-132: Archive button with SVG icon

## Recommended Fix

Increase the circle dimensions to provide proper visual breathing room:

### For Unread Badge
- Increase `height` from `16px` to `20px` or `22px`
- Adjust `border-radius` to match (half of height for perfect circles)
- Keep `line-height` matched to new height
- Consider increasing horizontal padding from `4px` to `5px` or `6px`

### For Archive Button
Add an explicit circular background:
- Add `width` and `height` properties (suggested: `20px` or `22px`)
- Add `border-radius: 50%` to create circular shape
- Add subtle background color (e.g., `background: rgba(0, 0, 0, 0.05)` on hover)
- Ensure SVG icon is centered within the circle using flexbox
- The 14px icon in a 20-22px circle would provide 3-4px of padding on each side

The goal is to have both elements use similar circle sizes (likely 20-22px) to maintain visual consistency while providing adequate space around their content.

## Risk Assessment

**Risk Level**: Low

This is a purely visual/CSS change with minimal risk:

### Potential Issues
1. **Layout shift**: Slightly larger circles may affect the overall row height or spacing in the sidebar
   - **Mitigation**: The flex layout should accommodate this naturally. Test with various room name lengths and notification counts.

2. **Visual consistency**: Changing one size might make other elements appear unbalanced
   - **Mitigation**: Both elements should be sized together to maintain visual harmony. Consider the typing badge (0.75rem font) as well.

3. **Accessibility**: Larger touch targets are generally better, but too large could be problematic
   - **Impact**: Positive - 20-22px circles provide better touch targets than 16px, improving mobile/touchscreen usability.

4. **Text overflow**: With larger badges, longer numbers might still need testing
   - **Mitigation**: The existing `formatNotificationBadge()` function (line 69, 120) already handles "99+" capping per spec (room_navigation.feature:13-15).

### Affected Components
- Channel list items (active and archived)
- Both regular and archived room sections
- All notification badge displays
- Archive/unarchive button hover states

### Testing Recommendations
- Verify appearance with various notification counts: 1, 9, 10, 99, 100+
- Test archive button hover states and click targets
- Check alignment with room names and typing indicators
- Ensure changes work in both light theme (only theme currently)
- Validate against the spec requirement that typing indicator remains rightmost (room_navigation.feature:31-35)
