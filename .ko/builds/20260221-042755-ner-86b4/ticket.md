---
id: ner-86b4
status: open
deps: []
links: []
created: 2026-02-20T19:46:25Z
type: task
priority: 2
---
# Sidebar: move activity indicator to rightmost position, ahead of archive button

The "..." typing/activity indicator on channel entries in the sidebar is great, but it should be the rightmost element — the thing your eye hits first scanning down the list. Currently the archive button sits to its right, which buries the activity signal. Swap the order so activity indicator is rightmost, archive button is secondary.

**Location:** `Sidebar.svelte` — channel row layout.
