nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Looking at this ticket, I need to classify the type of work it requires.

**Ticket Analysis:**

The title "Use Matrix lowpriority status for determining that a channel is archived, not a local UI setting" clearly describes **what to build**:
- It's specifying a change in implementation approach
- Instead of using a local UI setting to determine if a channel is archived
- Use the Matrix "lowpriority" status for this determination

This is a concrete code change request with a clear direction on how to implement it (use Matrix status instead of local setting).

The notes show prior attempts had infrastructure issues (missing `npx` command), but the core ticket itself is asking for a specific feature/refactoring.

```json
{"disposition": "route", "workflow": "task"}
```
