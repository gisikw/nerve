---
id: ner-5cf2
status: open
deps: []
links: []
created: 2026-02-20T18:52:10Z
type: task
priority: 2
---
# Auto-scroll to bottom when near bottom of chat

Currently the message list respects scroll position to avoid yanking you out of scrollback, but it's too aggressive — if you're within ~200px of the bottom, new messages and typing indicators should auto-scroll you to the bottom. Only preserve scroll position when the user has intentionally scrolled up into history.

**Screenshot:** `notes/attachments/2026-02-20_18-51-53_Screenshot 2026-02-20 at 12.47.29 PM.png` — shows "exo is typing..." visible but chat not scrolled fully to bottom.
**Location:** `MessageList.svelte` — scroll logic on new messages / typing indicator updates.
