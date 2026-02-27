nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
## Summary

I've diagnosed the vertical misalignment issue between the drawer expand (streams toggle) and logout buttons in the room header.

**Root Cause**: The `#streams-toggle` button uses flexbox properties (`display: flex`, `align-items: center`, `justify-content: center`) to properly center its SVG icon within the fixed `1.75rem` height, while the `#logout-btn` lacks these properties, causing its text content to align inconsistently.

**Affected Code**: `ui/styles/layout.css:135-144` (the `#logout-btn` rule)

**Recommended Fix**: Add the same flexbox centering properties to `#logout-btn` that `#streams-toggle` already has. This is a low-risk, CSS-only change that will ensure both buttons align properly within the `#room-header-actions` flex container.

The diagnosis has been written to `/home/dev/Projects/nerve/.ko/tickets/ner-be54.artifacts/diagnosis.md` with full details on the symptoms, root cause, affected code, recommended fix approach, and risk assessment.
