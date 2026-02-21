Perfect! Now let me check if the fake backend needs any updates. Since this is purely a CSS change and doesn't affect commands or state, the fake backend doesn't need modifications.

Let me create a summary of the changes:

## Summary

I've successfully implemented the fix to prevent elastic/bouncy scroll on the browser window. Here's what was changed:

### Changes Made

1. **CSS Fix (ui/styles/base.css:39-40)**: Added two critical CSS properties to the `html, body, #app` selector:
   - `overflow: hidden` - Prevents document-level scrolling
   - `overscroll-behavior: none` - Prevents elastic/rubber-banding effects on macOS and other platforms

2. **Specification (specs/viewport_behavior.feature)**: Created a new behavioral spec describing:
   - The requirement for a fixed-layout application where body-level scrolling should not occur
   - Scenarios verifying that html, body, and #app elements have the correct CSS properties
   - A macOS-specific scenario for elastic scrolling prevention

3. **Test (ui/src/lib/viewport.test.ts)**: Created tests that verify:
   - The base.css file contains `overflow: hidden` in the html, body, #app rule
   - The base.css file contains `overscroll-behavior: none` in the html, body, #app rule

### Why This Works

- **`overflow: hidden`** prevents the document body from scrolling when content exceeds the viewport, which is appropriate for a fixed-layout chat client where all scrolling happens within designated containers (message views, sidebar, etc.)
- **`overscroll-behavior: none`** specifically prevents the elastic/rubber-banding scroll effect on macOS and other platforms that support this behavior, ensuring the window remains fixed when users scroll beyond content boundaries

### Compliance

- ✅ Followed existing patterns in base.css
- ✅ No new dependencies added
- ✅ Created both spec and test as required by INVARIANTS.md
- ✅ Tests verify the actual CSS file content, not vacuous assertions
- ✅ Minimal change - only added the required CSS properties
- ✅ No changes needed to fake backend (purely CSS, no command/state impact)

The implementation is complete and ready for testing by the pipeline.
