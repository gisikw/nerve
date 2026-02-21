---
id: ner-fdcf
status: open
deps: []
links: []
created: 2026-02-20T19:44:24Z
type: task
priority: 2
---
# Sidebar channels section should be collapsible with activity-aware twirldown

The CHANNELS header in the sidebar should be a twirldown (disclosure triangle). When collapsed, it should still show channels that have activity (unreads, mentions) but hide everything else. This lets you keep the sidebar compact while never missing something that needs attention.

**Location:** `Sidebar.svelte` — needs a collapsed/expanded state for the channels section, with filtering logic that exempts active channels from being hidden.
