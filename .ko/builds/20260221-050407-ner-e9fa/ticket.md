---
id: ner-e9fa
status: in_progress
deps: []
links: []
created: 2026-02-20T19:01:01Z
type: task
priority: 2
---
# Channel switcher: default selection should prefer matching rooms over create-new

When typing in the channel switcher, if there are matching existing rooms, the first match should be the default selection — not "Create new #whatever". Currently typing "ner" shows the #nerve room in results but defaults to creating a new channel called #ner. The "Create new" option should only be the default when no existing rooms match the query.

**Location:** `ChannelSwitcher.svelte` — selection index logic.
