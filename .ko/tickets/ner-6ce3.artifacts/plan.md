## Goal
Replace the "Logout" text label in the room header button with an inline SVG icon.

## Context
The logout button lives in `ui/src/App.svelte:107` inside `#room-header-actions`. The neighboring `#streams-toggle` button is the established pattern for icon-only buttons: it uses an inline SVG (`stroke="currentColor"`, 16×16), `width: 1.75rem; height: 1.75rem; padding: 0`, and a `svg { display: block }` rule to suppress inline-element spacing.

The logout button's current CSS in `ui/styles/layout.css` (lines 135–152) uses text-specific properties: `padding: 0 0.55rem` and `font-size: 0.7rem`. Once text is replaced with an SVG, those should be swapped for `width: 1.75rem; padding: 0` to match the icon-button convention.

Tests in `ui/src/lib/ui-layout.test.ts` cover the logout button's CSS. None of the current assertions check `padding` or `font-size`, so no tests will break. Test *descriptions* say "text centering" — those should be updated to "icon centering" for accuracy.

## Approach
Replace `Logout` text in the button with a Lucide-style log-out SVG (arrow-out-of-rectangle). Add a `title` attribute for accessibility. Update `layout.css` to use icon-button sizing. Update test descriptions and add a `svg { display: block }` assertion to match the `#streams-toggle` test pattern.

## Tasks
1. [`ui/src/App.svelte:107`] — Replace the text content `Logout` with an inline SVG log-out icon. Add `title="Logout"` on the button for tooltip/accessibility.
   Verify: Button renders as an icon in the UI with no visible text; tooltip appears on hover.

2. [`ui/styles/layout.css:135–152`] — In `#room-header #logout-btn`: replace `padding: 0 0.55rem` with `padding: 0`, replace `font-size: 0.7rem` with `width: 1.75rem`. Add a `#room-header #logout-btn svg { display: block; }` rule after the existing block.
   Verify: `npm run test` (vitest) passes with no regressions.

3. [`ui/src/lib/ui-layout.test.ts`] — Update the description "logout button uses flexbox for text centering" → "logout button uses flexbox for icon centering". Add a new test: "logout button has matching fixed width" asserting `width: 1.75rem` in the CSS rule. Add a new test: "logout button SVG has display block" asserting `#room-header #logout-btn svg { display: block }`.
   Verify: All tests pass.

## Open Questions
None — the icon pattern is clear from `#streams-toggle`, and a log-out arrow icon is the unambiguous choice for a logout button.
