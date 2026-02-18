---
id: ner-572d
status: closed
deps: []
links: []
created: 2026-02-18T05:40:46Z
type: task
priority: 3
---
# Image drop zone: drag-and-drop media upload with optional caption modal

## Notes

**2026-02-18 19:23:37 UTC:** Implemented: drag-and-drop image upload with caption modal. Backend send_image command uploads base64 to Matrix media repo. JS handles drag/drop/paste events, caption modal with preview. Elm exposes room ID via data attr and handles sendImage response. Also added clipboard paste support for images.
