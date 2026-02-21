---
id: ner-5125
status: open
deps: []
links: []
created: 2026-02-20T18:52:10Z
type: task
priority: 2
---
# Add floating scroll-to-bottom button in chat pane

When the user has scrolled up into history, show a floating button in the bottom-right of the chat pane that scrolls to the latest messages on click. Standard chat UX affordance — lets you jump back to the present without manually scrolling.

**Location:** `MessageList.svelte` or parent layout — needs scroll position tracking and a conditionally-visible button.
