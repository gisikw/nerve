nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
All tasks complete. Here's a summary:

---

**Task 1 — `ui/src/ChannelSwitcher.svelte:135`**
Added `class:unread={room.notification_count > 0 || room.highlight_count > 0}` to the `<li class="switcher-item">` element so rooms with unreads receive the `unread` class.

**Task 2 — `ui/styles/switcher.css:59-61`**
Added `.switcher-item.unread { font-weight: 600; }` after the `.switcher-item.selected` block, matching the sidebar pattern.

**Task 3 — `specs/channel_switcher.feature:91-99`**
Added "Channels with unreads appear bold in the switcher" scenario covering `notification_count > 0`, `highlight_count > 0`, and the no-unreads case.

**Additional (INVARIANTS.md compliance) — `ui/src/ChannelSwitcher.test.ts`**
Added a regression test verifying the `class:unread` binding exists in the component source, per the "every spec has a test" invariant.

All 388 tests pass.
