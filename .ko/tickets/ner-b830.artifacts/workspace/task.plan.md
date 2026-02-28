The plan at `.ko/tickets/ner-b830.artifacts/plan.md` is complete and accurate. The codebase is in its original state — no implementation has been started. The previous attempt's verify step failed due to `npx` not being found in the shell environment (the dev shell uses `just test` instead), but no code changes were persisted.

The existing plan requires no updates:

- **Goal**: Replace localStorage-based room archiving with Matrix's `m.lowpriority` tag
- **17 tasks** covering Rust backend, TypeScript/Svelte frontend, tests, fake backend, and specs
- **All open questions resolved**: Matrix SDK APIs confirmed (`is_low_priority()` is synchronous, `set_is_low_priority()` is async with `Option<f64>` tag_order)
- **Key architectural note**: `toggleShowArchived()`/`getShowArchived()` moves to local Sidebar component state (not removed entirely)

The plan is ready for implementation.
