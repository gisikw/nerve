nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Looking at this ticket, I need to classify what kind of work it represents.

**Ticket Analysis:**

The title states: "Use Matrix lowpriority status for determining that a channel is archived, not a local UI setting"

This is a **feature request/architectural change** that describes:
- **What to build**: Use Matrix's `lowpriority` status instead of a local UI setting to determine if a channel is archived
- **Expected outcome**: Code changes to implement this approach

The notes show a test failure, but that's secondary context about the current state - the ticket itself is clearly prescriptive about the solution direction.

This is a **task** - it's asking for specific code changes to switch from one implementation approach (local UI setting) to another (Matrix lowpriority status).

```json
{"disposition": "route", "workflow": "task"}
```
