---
id: ner-1c2d
status: blocked
deps: [ner-cf90]
links: []
created: 2026-02-22T00:27:50Z
type: task
priority: 1
---
# Surface error feedback on image send failure in ComposeBar (silent .catch(() => {}))

## Notes

**2026-02-22 00:51:00 UTC:** ko: FAIL at node 'triage' — Architectural decision needed: Multiple tickets (ner-1c2d, ner-bd2f, ner-fe11, ner-d4f0) require error feedback UI for transient operation failures. Should these share a common toast/notification component, or implement localized solutions? Current codebase has inline error state (Login.svelte) but only for persistent errors. Need decision on: (1) Create shared error notification system first, or (2) Implement inline error state per-component, or (3) Other approach. This decision affects 4+ tickets and sets UX consistency precedent.

**2026-02-22 06:39:16 UTC:** ko: FAIL at node 'triage' — Ticket already implemented. Image send failure already surfaces error feedback via showError() toast (ComposeBar.svelte:135-140). Remaining .catch(() => {}) patterns are for typing notices (background operations), which are correctly silent per INVARIANTS.md. This work was completed as part of dependency ticket ner-cf90.
