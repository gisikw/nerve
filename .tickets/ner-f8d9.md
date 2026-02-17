---
id: ner-f8d9
status: open
deps: [ner-9e50]
links: []
created: 2026-02-17T03:23:08Z
type: task
priority: 2
---
# Elm migration: wire Tauri to Vite dev server

## Notes

**2026-02-17 03:24:12 UTC:** Update tauri.conf.json: devUrl=localhost:5173, frontendDist=../ui/dist, beforeDevCommand/beforeBuildCommand for npm. Update flake.nix: add nodejs, elmPackages.elm/elm-format/elm-test. Verify cargo tauri dev shows Hello from Elm.
