---
id: ner-1bcc
status: open
deps: []
links: []
created: 2026-02-22T00:27:50Z
type: task
priority: 2
---
# Reconcile spec/test naming: establish convention mapping specs/foo_bar.feature to test files, fix inconsistencies

## Notes

**2026-02-22 01:47:49 UTC:** ko: FAIL at node 'triage' — Ticket requires architectural decision: Should we enforce ONE naming style (kebab-case, snake_case, or PascalCase) for spec-to-test mapping, or keep all three as acceptable? INVARIANTS.md currently allows all three. Need clarification on whether to: (1) pick one style and rename all tests to match, or (2) simply ensure test names map recognizably to spec names regardless of style. Recommend option 1 with kebab-case based on existing usage patterns.

**2026-02-22 05:01:15 UTC:** ko: FAIL at node 'triage' — Architectural decision required: INVARIANTS.md line 86-90 explicitly permits three naming styles (kebab-case, snake_case, PascalCase) for spec-to-test mapping. Ticket requires choosing: (1) enforce single style (recommend kebab-case based on frontend conventions), or (2) keep all three styles valid but ensure semantic equivalence (e.g., error_feedback→toasts violates this). Current codebase shows kebab-case as dominant pattern for multi-word test files. Need human decision on whether to standardize or maintain flexibility.
