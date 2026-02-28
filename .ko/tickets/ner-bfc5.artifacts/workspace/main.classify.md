nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Looking at this ticket:

**What it describes:** A specific visual adjustment needed - expand the circles containing the unread count and archive button from their current size to 22px diameter.

**Key indicators:**
- It identifies the problem clearly: elements are "too big relative to their surrounding circles"
- The solution is already determined: increase circle diameter to 22px (decided in the notes)
- Expected output: CSS/code changes to the channel sidebar

This is asking **what to build**, not **what's broken** or **what to investigate**. The fix is concrete and scoped.

```json
{"disposition": "route", "workflow": "task"}
```
