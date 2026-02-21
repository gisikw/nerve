---
id: ner-50ae
status: open
deps: []
links: []
created: 2026-02-20T19:44:24Z
type: task
priority: 2
---
# Prevent elastic/bouncy scroll on the browser window

The overall browser/webview window allows macOS elastic overscroll (rubber-banding). The app is a fixed-layout chat client — the document body should never scroll. Apply `overscroll-behavior: none` on `html`/`body` and ensure `overflow: hidden` at the top level.

**Location:** Global CSS (`styles/` or `index.html`).
