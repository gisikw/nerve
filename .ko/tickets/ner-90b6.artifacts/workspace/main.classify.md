nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Looking at this ticket:

**Title**: "Channel sidebar is showing number badge for unreads - should bold for unreads, show numbers only for mentions"

**Analysis**:
- This describes a specific feature requirement (how to display channel status)
- It states what *should* happen: bold for unreads, numbers only for mentions
- This is a clear specification of what to build, not a question or investigation
- The expected output is code changes to the sidebar component
- The notes show test failures, but these are environment/setup issues, not blockers on the classification itself

This is a **task** - it's asking for code changes with a clear specification of the desired behavior.

```json
{"disposition": "route", "workflow": "task"}
```
