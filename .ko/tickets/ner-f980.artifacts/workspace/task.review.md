nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
All three planned tasks were completed correctly:

- `class:unread` binding added to the switcher `<li>` with the correct condition
- `.switcher-item.unread { font-weight: 600; }` added to CSS, matching the sidebar pattern
- Feature spec scenario added covering notification_count, highlight_count, and no-unreads cases
- A markup regression test was also added (beyond the plan, but required by INVARIANTS "every spec has a test")

No INVARIANTS violations. Implementation is clean and scoped correctly.

```json
{"disposition": "continue"}
```
