---
id: ner-bd2f
status: open
deps: [ner-cf90]
links: []
created: 2026-02-22T00:27:50Z
type: task
priority: 1
---
# Surface error feedback on message send failure in ComposeBar (silent .catch(() => {}))

## Notes

**2026-02-22 00:58:25 UTC:** ko: FAIL at node 'review' — Test file is completely vacuous (tests reimplemented logic instead of calling component code). Implementation has scope creep (handles both message AND image send failures, ticket says image only). Missing fake-state.ts updates for error testing. Ticket already blocked on error UI architecture decision - cannot write correct tests until scope is clarified.
