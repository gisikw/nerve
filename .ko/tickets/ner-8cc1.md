---
id: ner-8cc1
status: closed
deps: [ner-3441]
links: []
created: 2026-02-17T03:23:13Z
type: task
priority: 2
---
# Elm migration: Messages view with grouping and images

## Notes

**2026-02-17 03:24:12 UTC:** View/Messages.elm ~200 lines. Message grouping via List.foldl (same sender within 5min). Image rendering with mediaUrl. Sender localpart extraction. Time formatting via Time.here Task. Enter-to-send via preventDefaultOn keydown decoder.
