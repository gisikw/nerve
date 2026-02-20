---
id: ner-d840
status: open
deps: []
links: []
created: 2026-02-20T19:01:01Z
type: task
priority: 2
---
# Channel switcher: sort by last activity, group by mentioned/unread/read/archived

The channel switcher (Cmd+K) currently lists rooms in an unstructured order. Should be sorted by last activity within groups, with groups ordered:

1. Mentioned (rooms where you have @-mentions)
2. Has unreads
3. Read (no unreads)
4. Archived / low-priority

This mirrors the mental model of "what needs attention" and makes the switcher actually useful for triage.

**Location:** `ChannelSwitcher.svelte` — needs room state (unread counts, mentions, last activity timestamp) piped through from the backend.
