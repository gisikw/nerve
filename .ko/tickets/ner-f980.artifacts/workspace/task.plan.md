nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
The previous agent's changes are not present — the implementation hasn't been applied. The plan is accurate and still valid. No updates needed.

The plan at `/home/dev/Projects/nerve/.ko/tickets/ner-f980.artifacts/plan.md` is current and ready for implementation. All three tasks remain to be done:

1. Add `class:unread={room.notification_count > 0 || room.highlight_count > 0}` to the `<li>` in `ChannelSwitcher.svelte:134`
2. Add `.switcher-item.unread { font-weight: 600; }` to `switcher.css` after line 58
3. Add a feature spec scenario in `specs/channel_switcher.feature`
