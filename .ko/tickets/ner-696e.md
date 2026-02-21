---
id: ner-696e
status: blocked
deps: []
links: []
created: 2026-02-20T19:01:01Z
type: task
priority: 2
---
# Push-to-talk and TTS buttons are non-functional

The microphone (push-to-talk) and any TTS playback buttons in the UI don't respond to clicks. These are currently rendered but not wired up to anything.

**Location:** `ComposeBar.svelte` (mic button), message rendering for TTS playback.

## Notes

**2026-02-21 14:45:13 UTC:** ko: FAIL at node 'triage' — Ticket description is incorrect — both the microphone button in ComposeBar.svelte (line 367, onclick={toggleRecording}) and TTS buttons in MessageItem.svelte (line 76, onclick={handleSpeak}) are fully wired up with complete implementations. The buttons have event handlers, the recording/playback logic is implemented, and backend integration exists. No work is needed.
