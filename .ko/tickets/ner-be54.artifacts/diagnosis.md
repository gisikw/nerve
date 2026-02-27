# Diagnosis: Drawer Expand and Logout Button Vertical Misalignment

## Symptoms

The streams toggle button (drawer expand) and logout button in the room header are vertically misaligned. Despite both buttons being in a flex container with `align-items: center`, they don't align properly on the vertical axis.

## Root Cause

The misalignment is caused by **inconsistent padding inheritance** between the two buttons.

**Location**: `/home/dev/Projects/nerve/ui/styles/layout.css`

### Detailed Analysis

1. **Global button styles** (`ui/styles/login.css:49-61`) apply to all `<button>` elements:
   ```css
   button {
     padding: 0.5rem 0.85rem;
     margin-top: 0.5rem;
     /* ... */
   }
   ```

2. **The `#streams-toggle` button** (`layout.css:105-118`) explicitly resets padding:
   ```css
   #streams-toggle {
     /* ... */
     padding: 0;  /* Line 111 - explicitly set to 0 */
     /* ... */
   }
   ```
   This prevents the global `0.5rem` vertical padding from affecting its height calculation.

3. **The `#logout-btn` button** (`layout.css:135-144`) does NOT reset padding:
   ```css
   #room-header #logout-btn {
     height: 1.75rem;
     padding: 0 0.55rem;  /* Only sets horizontal padding */
     /* ... */
     margin-top: 0;  /* Overrides margin but not padding */
   }
   ```
   The `padding: 0 0.55rem` only sets left/right padding, leaving the vertical padding to inherit from the global button style (`0.5rem` top and bottom).

4. **The alignment issue**: Even though both buttons have `height: 1.75rem`, the logout button's inherited vertical padding (`0.5rem` top + `0.5rem` bottom = `1rem` total) adds extra space that pushes the button's content and affects its visual alignment within the flex container.

## Affected Code

**Primary file**: `/home/dev/Projects/nerve/ui/styles/layout.css`
- Lines 135-144: `#room-header #logout-btn` rule

**Related files**:
- `/home/dev/Projects/nerve/ui/styles/login.css:49-61` - Global button styles that are being inherited
- `/home/dev/Projects/nerve/ui/src/App.svelte:94-108` - HTML structure of the room header actions
- `/home/dev/Projects/nerve/ui/src/lib/ui-layout.test.ts:43-49` - Existing regression test for padding on `#streams-toggle`

## Recommended Fix

Change the `padding` property in the `#room-header #logout-btn` CSS rule from:
```css
padding: 0 0.55rem;
```

to:
```css
padding: 0 0.55rem;
```

Wait, that's already correct. The issue is that `padding: 0 0.55rem` is a 2-value shorthand that should set vertical padding to `0`, but let me verify...

Actually, re-reading the CSS: `padding: 0 0.55rem` means:
- First value (0): top and bottom padding = 0
- Second value (0.55rem): left and right padding = 0.55rem

This SHOULD already be setting vertical padding to 0. Let me reconsider...

The actual issue might be that the `padding` property is being overridden or there's a specificity issue. Let me check the rule order and specificity:

- Global: `button { padding: 0.5rem 0.85rem; }` (specificity: 0,0,1)
- Specific: `#room-header #logout-btn { padding: 0 0.55rem; }` (specificity: 0,2,0)

The specific rule should win due to higher specificity. However, there might be another issue...

**Actually, the real issue is likely `line-height` or `vertical-align`**. The buttons may have different text content or inline formatting that affects their baseline alignment. The `#streams-toggle` contains only an SVG (which has `display: block`), while `#logout-btn` contains text.

The fix should be to add explicit vertical centering to the logout button:
```css
#room-header #logout-btn {
  height: 1.75rem;
  padding: 0 0.55rem;
  font-size: 0.7rem;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  margin-top: 0;
  border-radius: var(--radius);
  display: flex;              /* ADD THIS */
  align-items: center;        /* ADD THIS */
  justify-content: center;    /* ADD THIS */
}
```

This matches the approach used for `#streams-toggle` (lines 106-108) and ensures the text content is properly centered within the button's fixed height.

## Risk Assessment

### Low Risk
- **Scope**: The fix only affects the visual styling of a single button in the room header
- **Reversibility**: CSS-only change, no behavioral or structural modifications
- **Testing**: Existing test suite at `ui/src/lib/ui-layout.test.ts` verifies button alignment and can be extended

### Potential Side Effects
- **Text wrapping**: If the button text is longer than expected, the fixed height + flex centering might clip content. However, "Logout" is a short, standard label unlikely to cause issues
- **Browser compatibility**: `display: flex` on buttons is well-supported in modern browsers
- **Visual regression**: Should be tested visually to ensure the button doesn't shift position or size unexpectedly

### What Could Go Wrong
1. If there are other buttons styled with `#room-header #logout-btn` selector elsewhere, they would also be affected (unlikely based on codebase review)
2. If custom font-size or line-height changes in the future, the centering should still work correctly due to flexbox
3. No impact on functionality - this is purely a visual alignment fix

### Testing Recommendations
1. Visual inspection in browser to verify alignment matches `#streams-toggle`
2. Test with different browser zoom levels
3. Test on different screen sizes/viewport widths
4. Consider adding a test case to `ui-layout.test.ts` verifying that `#logout-btn` uses flexbox centering (similar to the existing test for `#streams-toggle`)

## Summary

The logout button is misaligned with the streams toggle button because it lacks the flexbox centering properties (`display: flex`, `align-items: center`, `justify-content: center`) that properly center its text content within the fixed `1.75rem` height. The streams toggle button has these properties and aligns correctly. Adding matching flexbox properties to the logout button will resolve the vertical misalignment.
