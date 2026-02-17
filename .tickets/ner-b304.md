---
id: ner-b304
status: open
deps: [ner-eabd]
links: []
created: 2026-02-17T03:23:16Z
type: task
priority: 2
---
# Elm migration: CSS cleanup and visual parity

## Notes

**2026-02-17 03:24:12 UTC:** Remove [hidden] CSS rule. Elm views use Html.Attributes.id to match existing CSS selectors — zero CSS rewrite. Delete .old files. Verify visual parity.
