---
id: ner-bfa2
status: closed
deps: [ner-5190, ner-b5bd]
links: []
created: 2026-02-17T03:23:10Z
type: task
priority: 2
---
# Elm migration: Update function and tests

## Notes

**2026-02-17 03:24:12 UTC:** Update.elm: all Msg branches. Cmd helpers encode JSON via sendToTauri. Key flows: session restore, login, room list, room switch, message send, polling timers. Tests in ui/tests/UpdateTest.elm.
