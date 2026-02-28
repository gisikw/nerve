Plan written to `.ko/tickets/ner-a6be.artifacts/plan.md`.

**Summary:** The fix is a two-line CSS change in `ui/styles/sidebar.css`:

- `#sidebar-actions` container padding: `0.35rem` → `0.2rem`
- `.sidebar-action-btn` vertical padding: `0.3rem 0.5rem` → `0.15rem 0.5rem`

The "+" section's `border-top` and the compose bar's `border-top` are the two horizontal splits that aren't quite aligned. Both are at the bottom of their respective panels. The sidebar-actions (~2.3rem) is shorter than the compose bar (~3.3rem), so halving the sidebar-actions makes it more compact — less height means less visual weight, and the near-coincidence of heights that draws attention to the misalignment goes away.
