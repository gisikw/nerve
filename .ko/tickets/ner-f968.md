---
id: ner-f968
status: open
deps: [ner-3f09, ner-0f04]
links: []
created: 2026-02-19T04:01:12Z
type: task
priority: 2
---
# Port message list and rendering to Svelte

## Scope

This is the big one. The message list is the core of the client and where
the Elm virtual DOM diffing hurts most.

## Components

- `MessageList.svelte` — scrollable container, receives messages from store
- `MessageGroup.svelte` — grouped messages from same sender (header + body)
- `MessageBody.svelte` — markdown rendering, image display, audio player
- `ReactionRow.svelte` — emoji reaction pills

## Key behaviors to port

- Message grouping by sender + time gap (currently in `renderGrouped`)
- Markdown rendering (currently `Markdown.render` in Elm)
- Image messages with mxc:// resolution (currently in JS MutationObserver)
- Audio message playback (currently in JS click handler)
- Autoscroll: scroll to bottom on new messages if already near bottom,
  preserve position when viewing history
- Pagination: load older messages on scroll-to-top
- Pinned message bar

## What should improve

- Svelte's keyed `{#each}` means adding a message updates one DOM node,
  not a full list diff
- mxc:// resolution can happen in the component lifecycle (`onMount` or
  `$effect`) instead of a MutationObserver hack
- Audio playback state can be a Svelte store instead of module-level
  JS variables
- Autoscroll via `$effect` watching the message store, using
  `element.scrollTop` directly
