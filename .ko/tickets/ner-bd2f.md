---
id: ner-bd2f
status: closed
deps: [ner-cf90]
links: []
created: 2026-02-22T00:27:50Z
type: task
priority: 1
---
# Surface error feedback on message send failure in ComposeBar (silent .catch(() => {}))

## Notes

**2026-02-22 00:58:25 UTC:** ko: FAIL at node 'review' — Test file is completely vacuous (tests reimplemented logic instead of calling component code). Implementation has scope creep (handles both message AND image send failures, ticket says image only). Missing fake-state.ts updates for error testing. Ticket already blocked on error UI architecture decision - cannot write correct tests until scope is clarified.

**2026-02-22 06:40:02 UTC:** ko: FAIL at node 'triage' — Both ner-1c2d and ner-bd2f are already implemented. ComposeBar.svelte shows all user-facing operations (sendMessage line 109-112, sendImage line 135-140, sendVoiceMessage line 277-280) already have .catch() handlers with showError() toast feedback. The only remaining .catch(() => {}) patterns are for typing notices (lines 91, 115), which are background operations that should be silent per INVARIANTS.md. This work was completed as part of dependency ner-cf90. Tickets should be marked as closed/duplicate.
