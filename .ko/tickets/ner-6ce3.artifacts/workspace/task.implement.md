nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
## Summary

All three tasks completed with no deviations from the plan.

**Task 1 — `ui/src/App.svelte:107`**
Replaced `Logout` text with a Lucide-style log-out SVG (door with arrow pointing right, matching Lucide's `log-out` icon: `path` for the door frame + `polyline` + `line` for the arrow). Added `title="Logout"` on the button.

**Task 2 — `ui/styles/layout.css`**
In `#room-header #logout-btn`: replaced `padding: 0 0.55rem` → `padding: 0`, replaced `font-size: 0.7rem` → `width: 1.75rem`. Added `#room-header #logout-btn svg { display: block; }` rule after the button block.

**Task 3 — `ui/src/lib/ui-layout.test.ts`**
Updated description "logout button uses flexbox for text centering" → "logout button uses flexbox for icon centering". Added two new tests: "logout button has matching fixed width" (asserts `width: 1.75rem`) and "logout button SVG has display block" (asserts the `svg { display: block }` rule exists).

All 387 tests pass.
