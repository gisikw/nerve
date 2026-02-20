---
id: ner-7a3c
status: closed
deps: []
links: []
created: 2026-02-20T16:44:23Z
type: task
priority: 2
---
# macOS dock icon too small — need full-bleed content without baked-in rounded corners

## Notes

**2026-02-20 16:49:08 UTC:** macOS does NOT auto-apply squircle mask on app icons (unlike iOS). Must bake in: 824x824 content area centered in 1024x1024 (100px gutter), 185.4px continuous corner radius, drop shadow (28px blur, 12px Y-offset, black 50%), transparent background outside squircle. Current icon is fully square — need to regenerate. Refs: developer.apple.com/forums/thread/670578, liamrosenfeld.com/posts/apple_icon_quest/
