Now I see it clearly. Both buttons have `height: 1.75rem` and `margin-top: 0`. The alignment issue might be subtle - perhaps related to how text baselines work vs flex-centered icons. Let me also check if the SVG needs any specific sizing:

## Summary

After thorough investigation, I've identified the issues:

**Files to modify:**
1. `ui/styles/layout.css` - Fix button alignment and potentially SVG visibility

**Issues identified:**

1. **Alignment Issue**: Both `#streams-toggle` (lines 105-128) and `#logout-btn` (lines 130-144) have the same height (`1.75rem`) and both override `margin-top: 0`. However, the Logout button contains text which may have different vertical metrics than the icon-only streams toggle. The issue is likely that text naturally sits on a baseline, while the icon button uses `display: flex` with `align-items: center` and `justify-content: center`, creating perfect centering. The Logout button doesn't have these flex properties.

2. **Missing Icon**: The SVG in `App.svelte:99-104` uses `stroke="currentColor"` which should inherit the button's `color: var(--text-muted)`. The SVG might not be visible, but more likely the stroke width or size might be an issue. The SVG is 16×16 inside a 1.75rem (38.5px at 22px base font) button, so it should be visible.

**Solution approach:**
- Add `display: flex`, `align-items: center`, and `justify-content: center` to `#logout-btn` to ensure consistent vertical centering with `#streams-toggle`
- Verify the SVG stroke properties are correct (they appear correct in the code)
- The SVG issue might resolve itself once we can test, or may need adjustments to stroke-width or dimensions

**Assumptions:**
- The alignment issue is due to text baseline vs flex centering difference
- The SVG icon issue is likely a rendering problem that will be visible when tested
- Both buttons should maintain their current heights and styling, just fix the alignment

```json
{"disposition": "continue"}
```
