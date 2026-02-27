## Goal
Fix vertical misalignment between the streams toggle button and logout button in the room header.

## Context
The room header contains two buttons in a flex container (`#room-header-actions`) with `align-items: center`:
- `#streams-toggle` — an icon-only button (SVG) at 1.75rem height
- `#logout-btn` — a text button at 1.75rem height

Both buttons have the same fixed height, and their parent container uses flexbox with vertical centering. However, they appear misaligned.

**Root cause**: The `#streams-toggle` button (lines 105-118 in `ui/styles/layout.css`) uses `display: flex`, `align-items: center`, and `justify-content: center` to center its SVG icon within the button bounds. The `#logout-btn` button (lines 135-144) lacks these flexbox properties, so its text content doesn't center properly within the fixed 1.75rem height.

The global button style (`ui/styles/login.css:49-61`) applies `padding: 0.5rem 0.85rem` to all buttons. The `#streams-toggle` explicitly resets padding to 0 (line 111) and uses flexbox centering. The `#logout-btn` overrides padding with `padding: 0 0.55rem` (line 137), which sets vertical padding to 0, but still needs flexbox centering to align text properly.

**Existing tests**: `ui/src/lib/ui-layout.test.ts` verifies button styling. The spec at `specs/ui_layout.feature:4-8` explicitly requires vertical alignment and consistent height.

**Project conventions** (from INVARIANTS.md):
- CSS uses design tokens from `styles/base.css`
- Bug fixes require regression tests
- All tests must pass before commit

## Approach
Add flexbox centering properties (`display: flex`, `align-items: center`, `justify-content: center`) to the `#room-header #logout-btn` CSS rule to match the approach used by `#streams-toggle`. Add a regression test to verify the logout button uses these flexbox properties.

## Tasks
1. [ui/styles/layout.css:135-144] — Add `display: flex`, `align-items: center`, and `justify-content: center` to the `#room-header #logout-btn` rule. This matches the centering approach used by `#streams-toggle` and ensures the button text is vertically centered within the fixed 1.75rem height.
   Verify: Visual inspection in browser shows both buttons vertically aligned.

2. [ui/src/lib/ui-layout.test.ts] — Add a regression test in the "button alignment" describe block verifying that `#logout-btn` uses `display: flex`, `align-items: center`, and `justify-content: center`. This mirrors the existing test for `#streams-toggle` (lines 53-62) and prevents future regressions.
   Verify: `npm test` passes in the `ui` directory.

## Open Questions
None — the fix mirrors the existing pattern used by `#streams-toggle`, which already achieves proper alignment. The diagnosis confirms this approach resolves the issue.
