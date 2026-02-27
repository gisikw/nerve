nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Looking at the ticket:

**Title:** "The drawer expand and logout buttons are misaligned vertically"

**Key observations:**
- The ticket describes a specific, observable problem (misalignment of UI elements)
- It's asserting that something is broken, not asking whether it's broken
- The expected resolution is code changes to fix the alignment issue
- The note shows a test failure, but that's secondary to the core issue being reported

This is a **bug** - it reports unexpected behavior (misalignment) without providing a clear fix. Investigation will be needed to understand the root cause (CSS, layout issue, component structure, etc.) before determining the appropriate code changes.

```json
{"disposition": "route", "workflow": "bug"}
```
