nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Excellent! All tests pass, including the new regression test I added. The test suite shows:
- 27 test files passed (27)
- 385 tests passed (385)

The stderr warning about voice message is a pre-existing issue and not related to my changes. All 14 tests in `ui-layout.test.ts` passed, including the new regression test for the logout button's flexbox properties.

## Summary

I've successfully implemented both tasks from the plan:

### Task 1: CSS Fix (ui/styles/layout.css:135-147)
Added three flexbox centering properties to the `#room-header #logout-btn` rule:
- `display: flex`
- `align-items: center`
- `justify-content: center`

This matches the approach used by `#streams-toggle` and ensures the button text is vertically centered within the fixed 1.75rem height.

### Task 2: Regression Test (ui/src/lib/ui-layout.test.ts:51-63)
Added a new test in the "button alignment" describe block that verifies the logout button uses the three flexbox properties. This mirrors the existing test pattern for `#streams-toggle` and prevents future regressions.

**Verification Results:**
- ✅ All tests pass (385/385)
- ✅ New regression test validates the flexbox properties on the logout button
- ✅ CSS changes follow the existing pattern used by `#streams-toggle`

**No deviations from the plan.** The implementation followed the plan exactly as specified, using the same approach and conventions established in the codebase.
