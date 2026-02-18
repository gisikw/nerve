---
id: ner-b5bd
status: closed
deps: [ner-cb78]
links: []
created: 2026-02-17T03:23:09Z
type: task
priority: 2
---
# Elm migration: ports and JS glue layer

## Notes

**2026-02-17 03:24:12 UTC:** Port.elm: sendToTauri (out) and receiveFromTauri (in). port-glue.js: subscribe sendToTauri, map camelCase to snake_case Tauri cmds, invoke, send tagged response. checkSession on startup. MutationObserver for scroll-to-bottom. ui/src/main.js entrypoint.
