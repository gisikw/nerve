# Diagnosis: Unread Badge and Archive Button Vertical Alignment Issue

## Symptoms

In the channel sidebar, the unread badge and archive button aren't vertically aligned within room list items. These elements should be centered on the same baseline, but appear misaligned.

## Root Cause

The vertical alignment issue stems from inconsistent CSS properties between the `.unread-badge` and `.room-action-btn` elements.

**Current state:**

- **Parent container** (`#room-list li`, line 17-31 in `ui/styles/sidebar.css`):
  - Uses `display: flex` with `align-items: center`
  - Has `gap: 0.25rem` between flex children

- **Unread badge** (`.unread-badge`, lines 55-68):
  - Has explicit dimensions: `height: 16px` and `line-height: 16px`
  - Uses `flex-shrink: 0` to prevent shrinking
  - Properly constrained with padding and border-radius

- **Archive button** (`.room-action-btn`, lines 80-90):
  - Has `padding: 0` but no explicit height
  - Uses `flex-shrink: 0` to prevent shrinking
  - Contains an SVG with `width="14" height="14"`
  - **Missing**: explicit height or alignment properties to match the badge

While the parent's `align-items: center` attempts to center all children vertically, the unread badge's explicit 16px height creates a specific vertical reference, but the archive button's effective height may differ due to:
1. The SVG's 14px height vs the badge's 16px height (2px difference)
2. No explicit height constraint on the button itself
3. Default button padding/line-height behavior that may add unintended space

## Affected Code

**File:** `ui/styles/sidebar.css`

- **Lines 17-31**: Parent flex container styling for `#room-list li`
- **Lines 55-68**: Unread badge styling (`.unread-badge`)
- **Lines 80-101**: Archive button styling (`.room-action-btn`)

**File:** `ui/src/Sidebar.svelte`

- **Lines 68-70**: Unread badge conditional rendering
- **Lines 71-81**: Archive button structure with SVG icon
- **Lines 119-121**: Archived rooms unread badge
- **Lines 122-132**: Archived rooms archive button

## Recommended Fix

Add explicit height and display properties to `.room-action-btn` to match the unread badge's vertical dimensions:

1. Set `display: flex` with `align-items: center` and `justify-content: center` on `.room-action-btn`
2. Set explicit `height: 16px` to match `.unread-badge`
3. Optionally set `width: 16px` for a square clickable area
4. This ensures the button and badge occupy the same vertical space and align properly

**Alternative approach:** If the button should remain visually distinct in size, ensure both elements use the same vertical centering mechanism by:
- Adding `align-self: center` to both `.unread-badge` and `.room-action-btn`
- Or wrapping both in a shared container with consistent vertical constraints

## Risk Assessment

**Low Risk Fix:**

- The change is purely cosmetic and affects only CSS
- No logic changes required in Svelte components
- Both active and archived room lists use the same CSS classes, so the fix will apply consistently
- The elements are already using `flex-shrink: 0`, so they won't break the layout

**Potential Concerns:**

1. **Clickable area**: Setting explicit width/height on the button may reduce the clickable area. Mitigation: Use padding or a larger hit area if needed.
2. **Icon scaling**: The 14px SVG inside a 16px button leaves 1px on each side. Should be fine, but verify visual appearance.
3. **Cross-browser consistency**: Flexbox alignment should be consistent, but test on WebKitGTK (the app's target platform).
4. **Hover state**: The button's hover state (lines 92-101) should still work correctly with the new dimensions.

**What else it might affect:**

- The typing badge (`.typing-badge`) is also a sibling element. It uses `flex-shrink: 0` and should remain unaffected, but verify it still aligns correctly.
- Both active rooms (`#room-list li`) and archived rooms (`.archived-rooms li`) share the `.room-action-btn` class, so both will change consistently.
- The gap between elements (`gap: 0.25rem`) should remain visually consistent.

## Additional Notes

The issue exists in both the active channels list (lines 51-86 in Sidebar.svelte) and the archived channels list (lines 102-138), since they share the same CSS classes. The fix will address both locations simultaneously.
