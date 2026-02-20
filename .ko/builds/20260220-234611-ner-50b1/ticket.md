---
id: ner-50b1
status: open
deps: []
links: []
created: 2026-02-20T18:52:10Z
type: task
priority: 2
---
# Reset compose textarea height after sending a message

After sending a message (especially a long one that expanded the textarea), the compose input stays at its expanded height instead of collapsing back to single-line. It does reset once you start typing the next message, but it should reset immediately on submit.

**Screenshot:** `notes/attachments/2026-02-20_18-51-53_Screenshot 2026-02-20 at 12.47.29 PM.png`
**Location:** `ComposeBar.svelte` — the submit handler needs to reset textarea height.

## Notes

**2026-02-20 23:17:40 UTC:** ko: FAIL at node 'review' — No implementation: ticket marked in_progress but no code changes made to ComposeBar.svelte submit handler

**2026-02-20 23:22:29 UTC:** ko: FAIL at node 'review' — No implementation: ticket marked in_progress but no code changes made to ComposeBar.svelte. The submit handler needs to reset textarea height after sending.
