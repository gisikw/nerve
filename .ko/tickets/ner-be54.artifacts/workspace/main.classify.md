nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Looking at the ticket title "The drawer expand and logout buttons are misaligned vertically", this is describing a **visual defect** - unexpected behavior where UI elements are not positioned correctly.

The ticket asserts a problem (buttons ARE misaligned), not asking whether there's a problem. It's also not asking for investigation into why this is happening - it's reporting an existing issue that needs diagnosis and fixing.

This fits the **bug** classification because:
- It reports unexpected behavior (misalignment)
- The root cause isn't immediately clear from the title alone (could be CSS, layout logic, component sizing, etc.)
- It needs investigation to understand what's causing the misalignment before a fix can be applied

```json
{"disposition": "route", "workflow": "bug"}
```
