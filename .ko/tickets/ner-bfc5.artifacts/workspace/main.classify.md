nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Looking at this ticket, I need to classify what type of work it requires.

**Analysis:**

The ticket describes:
- A specific visual problem: "unread count and archive button are too big relative to their surrounding circles"
- A clear, concrete fix: "probably expand the circles by a few px radius"
- Supporting notes that confirm the desired size: 22px diameter with 4px padding per side

This is a straightforward styling/layout adjustment with:
- ✅ A well-defined problem (proportions are off)
- ✅ A clear solution (increase circle diameter)
- ✅ Specific dimensions already decided (22px)
- ✅ Expected output: code changes to CSS/styling

This matches the definition of a **task** - it describes what to build (larger circles) rather than what's broken or what needs investigation.

```json
{"disposition": "route", "workflow": "task"}
```
