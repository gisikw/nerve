nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Looking at this ticket, I can analyze what it's asking for:

**Ticket Summary:**
- Reports that unread count badge and archive button circles are too big relative to their surrounding elements
- Suggests expanding the circles by a few pixels
- Already has a decision: circles should be 22px in diameter (with 4px padding per side)

**Analysis:**
This ticket describes a **specific visual problem** ("unread count and archive button are too big") and proposes a **clear solution** ("expand the circles by a few px"). The decision has already been made about the exact dimensions (22px diameter).

The ticket is not asking "should we do this?" or "is this a problem?" — it's asserting that there's a sizing issue and has already determined the fix. This is straightforward work to adjust CSS/component sizes in the sidebar.

This is a **task**: it specifies what code changes are needed (increase circle diameter to 22px) with a clear expected output (committed code changes to the sidebar component).

```json
{"disposition": "route", "workflow": "task"}
```
