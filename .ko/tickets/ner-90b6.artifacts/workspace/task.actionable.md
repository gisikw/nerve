nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Perfect. The plan is complete, feasible, and actionable:

✅ **Open Questions**: None — plan explicitly states there are no open questions.

✅ **Completeness**: The plan has:
- Clear goal (distinguish mentions from unreads)
- All referenced files exist with correct line ranges
- 6 ordered tasks with verification steps
- Context explaining the data model and existing CSS support

✅ **Feasibility**:
- `RoomInfo` interface has both `highlight_count` and `notification_count` ✓
- `formatNotificationBadge()` exists in `ui/src/lib/sidebar.ts` ✓
- Sidebar uses the correct condition at lines 71-72 (currently checks `notification_count > 0`) ✓
- `.unread` class is already applied at line 62 for styling ✓
- Test pattern references are valid (`ui/src/lib/channel-switcher.test.ts` exists)
- Environment context (Nix, vitest) is correctly noted

The plan is ready for implementation.

```json
{"disposition": "continue"}
```
