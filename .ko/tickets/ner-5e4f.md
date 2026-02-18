---
id: ner-5e4f
status: closed
deps: []
links: []
created: 2026-02-18T05:40:46Z
type: task
priority: 3
---
# Support pinned messages

## Notes

**2026-02-18 20:06:43 UTC:** Implemented pinned messages support.

Backend (Rust):
- get_pinned_events: reads m.room.pinned_events state event via room.load_pinned_events()
- pin_message: adds event ID to pinned list and sends state event
- unpin_message: removes event ID from pinned list and sends state event

Frontend (Elm):
- pinnedEventIds (Set String) and showPinned in model
- PinMessage/UnpinMessage/TogglePinned messages
- getPinnedEvents/pinMessage/unpinMessage commands
- Pinned events fetched on room select
- Pinned bar below room header (shows count, expandable to show previews with unpin)
- Pin indicator (accent left border) on pinned messages
- Hover action button on all messages to pin/unpin

CSS:
- .message.pinned left border accent
- .message-actions hover toolbar (pin/unpin button)
- #pinned-bar collapsible with message previews
