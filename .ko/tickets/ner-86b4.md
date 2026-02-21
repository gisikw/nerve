---
id: ner-86b4
status: open
deps: [ner-c2b8]
links: []
created: 2026-02-20T19:46:25Z
type: task
priority: 2
---
# Sidebar: move activity indicator to rightmost position, ahead of archive button

The "..." typing/activity indicator on channel entries in the sidebar is great, but it should be the rightmost element — the thing your eye hits first scanning down the list. Currently the archive button sits to its right, which buries the activity signal. Swap the order so activity indicator is rightmost, archive button is secondary.

**Location:** `Sidebar.svelte` — channel row layout.

## Notes

**2026-02-21 04:34:31 UTC:** ko: FAIL at node 'review' — Missing meaningful test coverage. Implementation is correct, spec exists (specs/room_navigation.feature), but cannot write a unit test that validates the actual DOM ordering without component testing infrastructure (@testing-library/svelte or similar). Current project only tests pure functions (markdown.test.ts, compose.test.ts). This DOM structure change has no extractable logic to test. Attempted test would either be vacuous (helper function not used by component) or require adding testing dependencies outside ticket scope. Needs architectural decision on component testing approach.
