nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Perfect! I've written the implementation plan to `/home/dev/Projects/nerve/.ko/tickets/ner-be54.artifacts/plan.md`.

## Summary

The plan addresses the vertical misalignment between the drawer expand (streams toggle) and logout buttons in the room header. 

**The issue**: The streams toggle button uses flexbox centering properties to align its SVG icon, while the logout button lacks these properties, causing its text to not center properly within the fixed button height.

**The fix**: Add `display: flex`, `align-items: center`, and `justify-content: center` to the logout button's CSS rule to match the streams toggle button's approach. This is a simple CSS change that follows the existing pattern in the codebase.

**The verification**: Add a regression test to ensure the logout button has these flexbox properties, preventing future misalignment issues.

This is a straightforward fix with no open questions — it mirrors the working pattern already used by the streams toggle button.
