nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Perfect! The plan is accurate. I can see:

1. `channel-switcher.ts` line 54 currently takes `archivedIds: Set<string>` parameter - matches the plan's Context section
2. `commands.rs` exists and follows the pattern for Tauri commands - good foundation for adding the new command
3. The plan accurately describes all the changes needed

The plan is comprehensive, well-structured, and ready for implementation. All open questions have been resolved. The 17 tasks are properly ordered with clear verification steps. The plan aligns with INVARIANTS.md (backend owns state via matrix-rust-sdk, frontend is view layer).

## Summary

The existing plan at `.ko/tickets/ner-b830.artifacts/plan.md` is **complete and ready for implementation**. No updates are needed.

**Key points:**
- ✅ **Goal**: Clear - replace localStorage-based archiving with Matrix's `m.lowpriority` tag
- ✅ **Context**: Accurate - verified current implementation uses localStorage and identified all affected files
- ✅ **Approach**: Sound - add field to backend, remove localStorage code, call SDK methods
- ✅ **Tasks**: 17 ordered tasks covering backend (Rust), frontend (TypeScript/Svelte), tests, fake backend, and specs
- ✅ **Open Questions**: All resolved - Matrix SDK APIs confirmed, architectural decisions clarified
- ✅ **No partial implementation**: Grep confirms `is_low_priority` doesn't exist in source code yet

The plan follows INVARIANTS.md principles:
- Backend owns state via matrix-rust-sdk (not bypassing with raw HTTP)
- Frontend is view layer that renders backend data
- Commands are the API boundary (new `set_room_low_priority` command)
- Tests mirror the changes (update/remove localStorage tests, update component tests)

The plan is ready to proceed to implementation.
