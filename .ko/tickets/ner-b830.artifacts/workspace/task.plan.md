nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Perfect! I've updated the plan with the critical corrections based on my investigation. The key changes are:

## Summary of Plan Updates

I've verified the existing plan and made important corrections:

### Critical API Corrections:
1. **`is_low_priority()` is synchronous** (not async) - returns `bool` directly
2. **`set_is_low_priority()` signature** includes an optional `tag_order: Option<f64>` parameter that wasn't mentioned in the original plan - we'll pass `None`

### Architectural Clarification:
3. **Show/hide archived toggle** should move to local component state in `Sidebar.svelte`, not remain in the global store (Task 12 clarified)

### Plan Status:
- ✅ All 17 tasks remain valid with minor corrections
- ✅ No open questions - the Matrix SDK APIs are well-documented
- ✅ No partial implementation detected - clean slate to start from
- ✅ The approach aligns with INVARIANTS.md (backend owns state, frontend is view layer)

The plan is ready for implementation.

**Sources:**
- [Room in matrix_sdk::room - Rust](https://matrix-org.github.io/matrix-rust-sdk/matrix_sdk/room/struct.Room.html)
- [Release matrix-sdk 0.16.0 · matrix-org/matrix-rust-sdk](https://github.com/matrix-org/matrix-rust-sdk/releases/tag/matrix-sdk-0.16.0)
