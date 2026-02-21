Perfect! Now I have a complete understanding of the issue. Let me analyze what I found:

## Current State Analysis

**ComposeBar.svelte (lines 232-380):**
- The voice recording button IS fully functional — it has `onclick={toggleRecording}` (line 367)
- It records audio using MediaRecorder API
- It sends voice messages via `sendVoiceMessage()` 
- The ticket description is INCORRECT about this button being non-functional

**MessageItem.svelte (lines 43-49, 72-83):**
- The TTS "Speak" button IS fully wired up — it has `onclick={handleSpeak}` (line 76)
- The `handleSpeak` function calls `ttsUnlockContext()` and `speakText(message.body)`
- It properly enqueues audio via `ttsEnqueue(audio)`
- The ticket description is INCORRECT about this button being non-functional

**Backend Integration:**
- `speakText()` is defined in `ui/src/lib/tauri.ts` (line 203-205)
- The Rust command `speak_text` exists in `src-tauri/src/commands.rs` (line 379-381)
- The TTS implementation in `src-tauri/src/tts.rs` synthesizes text and returns base64 mp3
- The audio playback queue in `ui/main.ts` (lines 45-103) handles playback

## Conclusion

After thorough investigation, **both buttons are already fully functional**:

1. The microphone (push-to-talk) button in ComposeBar.svelte has working event handlers and full recording implementation
2. The TTS playback buttons in MessageItem.svelte have working event handlers and proper integration with the audio queue

The ticket description states these buttons "don't respond to clicks" and are "not wired up to anything," but the code clearly shows:
- Event handlers (`onclick={...}`) are present on both buttons
- Complete implementation logic exists
- Backend commands are integrated
- Audio playback infrastructure is in place

This ticket appears to be based on incorrect information or may have been created before the implementation was completed. The functionality described as missing is actually fully implemented.

```json
{"disposition": "fail", "reason": "Ticket description is incorrect — both the microphone button in ComposeBar.svelte (line 367, onclick={toggleRecording}) and TTS buttons in MessageItem.svelte (line 76, onclick={handleSpeak}) are fully wired up with complete implementations. The buttons have event handlers, the recording/playback logic is implemented, and backend integration exists. No work is needed."}
```
