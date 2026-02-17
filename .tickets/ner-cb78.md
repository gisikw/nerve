---
id: ner-cb78
status: open
deps: [ner-f8d9]
links: []
created: 2026-02-17T03:23:08Z
type: task
priority: 2
---
# Elm migration: types, decoders, and decoder tests

## Notes

**2026-02-17 03:24:12 UTC:** Types.elm: Room, Message, SessionStatus, LoginResult, LoginForm. Decode.elm: tagged envelope pattern, single receiveFromTauri port, dispatch on tag field. media_url uses D.maybe. Tests in ui/tests/DecodeTest.elm.
