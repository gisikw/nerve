---
id: ner-a2be
status: open
deps: []
links: []
created: 2026-02-20T18:47:09Z
type: task
priority: 2
---
# Fix room header button alignment and missing streams icon

The Logout button and streams sidebar toggle in the room header are vertically misaligned. The streams toggle button also renders as an empty square — the SVG icon inside it isn't visible (likely a fill/stroke color issue against the background).

**Location:** Top-right of the room header (`App.svelte` #room-header-actions area, styled in the app CSS).
