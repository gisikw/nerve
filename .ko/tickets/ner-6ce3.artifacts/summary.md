# Summary

## What was done

Replaced the "Logout" text label in the room header logout button with an inline SVG log-out icon, matching the established pattern of the `#streams-toggle` button.

**Changes:**

- **`ui/src/App.svelte`**: Replaced `Logout` text with a Lucide-style log-out SVG (arrow-out-of-rectangle). Added `title="Logout"` for tooltip/accessibility.
- **`ui/styles/layout.css`**: Replaced text-specific properties (`padding: 0 0.55rem`, `font-size: 0.7rem`) with icon-button sizing (`width: 1.75rem`, `padding: 0`). Added `#room-header #logout-btn svg { display: block; }` rule.
- **`ui/src/lib/ui-layout.test.ts`**: Updated test description from "text centering" to "icon centering". Added two new tests: one asserting `width: 1.75rem` and one asserting `svg { display: block }`.
- **`specs/ui_layout.feature`** (fixed during review): Added a "Logout button displays icon" scenario — the plan omitted this but the INVARIANTS require every new behavior to have a spec.

## Notable decisions

- The SVG icon used matches the Lucide `log-out` icon (arrow-out-of-rectangle), consistent with the spec's suggestion.
- The icon is 16×16 with `stroke="currentColor"` matching the streams-toggle pattern exactly.

## What a future reader should know

- The plan did not include updating `specs/ui_layout.feature`. This was caught during review and fixed. All three artifacts (spec, test, code) are now in sync.
- All 387 tests pass.
