nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Looking at this ticket:

**Title:** "In the channel switcher, bold channels that have unreads"

This is a straightforward feature request. It describes:
- **What to build:** A visual change to the channel switcher UI
- **The requirement:** Bold channels that have unreads
- **Expected output:** Committed code implementing this behavior

This is clearly a **task** — it asks for specific code changes with a well-defined outcome. The test failure notes are implementation details from a prior attempt, but don't change the nature of the request itself.

```json
{"disposition": "route", "workflow": "task"}
```
