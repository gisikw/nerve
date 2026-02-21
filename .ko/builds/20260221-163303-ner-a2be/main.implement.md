Perfect! Let me create a summary of the changes:

## Summary

I've successfully fixed the room header button alignment and missing streams icon issues. Here's what was changed:

### Changes Made

**1. Fixed button alignment** (`ui/styles/layout.css`)
   - Added explicit `padding: 0` to `#streams-toggle` (line 111) to prevent browser default padding from affecting vertical alignment with the logout button
   - Both buttons already had matching `height: 1.75rem` and the container used `align-items: center`, so the explicit padding reset ensures consistent alignment

**2. Fixed missing streams icon** (`ui/styles/layout.css`)
   - Added `#streams-toggle svg { display: block; }` rule (lines 131-133)
   - SVG elements have `display: inline` by default, which can cause extra spacing and make the icon appear incorrectly
   - Setting `display: block` ensures the SVG renders correctly and the `stroke="currentColor"` attribute properly inherits the button's color

### Specs and Tests Added

**3. Created UI layout spec** (`specs/ui_layout.feature`)
   - Added 4 scenarios covering:
     - Room header button vertical alignment
     - Streams toggle icon visibility and color inheritance
     - Streams toggle active state styling
     - Logout button design token compliance

**4. Created UI layout test** (`ui/src/lib/ui-layout.test.ts`)
   - 13 tests organized in 3 suites:
     - Button alignment tests (verify flexbox, fixed heights, padding reset)
     - Streams icon visibility tests (verify centering, color inheritance, SVG display)
     - Design token usage tests (verify all buttons use CSS custom properties)
   - All tests validate the CSS rules that fix the bugs, providing regression protection

### Test Results
- ✅ All 13 new tests pass
- ✅ All 99 frontend tests pass
- ✅ All 36 Rust tests pass

The fixes are minimal and surgical—only the CSS properties needed to fix the alignment and icon visibility issues were modified. No refactoring or unnecessary changes were made.
