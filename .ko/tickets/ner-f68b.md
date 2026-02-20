---
id: ner-f68b
status: closed
deps: [ner-777d]
links: []
created: 2026-02-19T04:01:12Z
type: task
priority: 2
---
# Audit and fix: SVG icons, autoscroll, room switching, TTS/STT

## Context

Post-migration polish pass. Many of these bugs exist in the Elm version
and should be resolved in the Svelte rewrite, but this ticket is the
explicit checkpoint to verify they're actually fixed.

## Known issues to verify

- [ ] SVG icons render correctly (some don't display in current Elm build)
- [ ] Autoscroll is consistent (works initially then stops)
- [ ] Room switching is fast (currently 5+ seconds for nav to load)
- [ ] Room switching properly cleans up previous room state (memory)
- [ ] Pinned message bar doesn't hide conversation content
- [ ] Image drag-and-drop works
- [ ] Image paste works
- [ ] Image + caption sends correctly
- [ ] TTS playback works
- [ ] Voice recording works
- [ ] No visible flickering during normal use

## Approach

Run through each item manually in the Tauri dev build on macOS. File
sub-tickets for anything that needs code changes. This is a gate — the
parent ticket (ner-c84b) doesn't close until everything here passes.
