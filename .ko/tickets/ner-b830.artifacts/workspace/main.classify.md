nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Looking at this ticket, I need to classify the work required.

The ticket states: **"Use Matrix lowpriority status for determining that a channel is archived, not a local UI setting"**

This is clearly describing **what to build** - a specific code change to replace one mechanism (a local UI setting) with another mechanism (Matrix lowpriority status) for determining whether a channel is archived.

This is a feature request/task with a clear direction for implementation.

```json
{"disposition": "route", "workflow": "task"}
```
