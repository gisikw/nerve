---
id: ner-820a
status: closed
deps: []
links: []
created: 2026-02-20T19:01:01Z
type: task
priority: 2
---
# Replace colored emoji icons with monochrome SVGs for channel archive/unarchive

The archive/unarchive action icons in the channel list appear to be emoji characters (colored), which is visually inconsistent with the monochrome SVG iconography used everywhere else in the app. Replace with monochrome SVG icons to match the design language.

**Location:** `Sidebar.svelte` or wherever archive/unarchive actions are rendered.

## Notes

**2026-02-21 19:31:01 UTC:** Unblocked — was incorrectly blocked during manual agent cleanup, not by a pipeline failure. The task is straightforward: replace emoji characters (📥/📤) with monochrome SVG icons in Sidebar.svelte.

**2026-02-21 21:09:10 UTC:** ko: SUCCEED
