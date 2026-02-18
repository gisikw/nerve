---
id: ner-766e
status: open
deps: []
links: []
created: 2026-02-18T05:40:27Z
type: task
priority: 2
---
# Message edits not reflected in UI

## Notes

**2026-02-18 05:41:38 UTC:** The backend handles m.replace edits in fetch_messages (messages.rs:157-167) but edits arriving after initial load aren't reflected. Likely need real-time sync event handling to patch in-place. Tests for the ReactionAccumulator exist now but the edit-patching path is untested — add test coverage alongside the fix.
