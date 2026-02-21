---
id: ner-5c0c
status: blocked
deps: []
links: []
created: 2026-02-21T19:31:47Z
type: task
priority: 2
---
# Add spec and tests for room archiving (visibility, recovery, sidebar behavior)

## Notes

**2026-02-21 20:19:51 UTC:** ko: FAIL at node 'verify' — node 'verify' failed after 3 attempts: command failed: exit status 1
warning: Git tree '/home/dev/Projects/nerve' is dirty
nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
cd ui && [ -x node_modules/.bin/vitest ] || npm install
cd ui && npx vitest run

 RUN  v3.2.4 /home/dev/Projects/nerve/ui

 ✓ src/lib/ui-layout.test.ts (13 tests) 11ms
 ❯ src/lib/image-attachment.test.ts (14 tests | 1 failed) 16ms
   ✓ guessMime > detects PNG files 1ms
   ✓ guessMime > detects JPG files 0ms
   ✓ guessMime > detects JPEG files 0ms
   ✓ guessMime > detects GIF files 0ms
   ✓ guessMime > detects WebP files 0ms
   ✓ guessMime > handles uppercase extensions 0ms
   ✓ guessMime > handles mixed case extensions 0ms
   ✓ guessMime > returns empty string for unknown extensions 0ms
   ✓ guessMime > returns empty string for files without extensions 0ms
   ✓ guessMime > uses the last extension for multiple dots 0ms
   ✓ guessMime > returns empty string for empty filename 0ms
   ✓ readFileAsBase64 > reads file and strips data URI prefix 2ms
   × readFileAsBase64 > rejects when FileReader encounters an error 5ms
     → ProgressEvent is not defined
   ✓ readFileAsBase64 > handles empty base64 data gracefully 6ms
 ✓ src/lib/stores/rooms.test.ts (15 tests) 12ms
 ✓ src/lib/sidebar.test.ts (18 tests) 9ms
 ✓ src/lib/icon.test.ts (8 tests) 11ms
 ✓ src/lib/tts-playback.test.ts (15 tests) 10ms
 ✓ src/lib/typing-ui.test.ts (12 tests) 9ms
 ✓ src/lib/message-grouping.test.ts (25 tests) 10ms
 ✓ src/lib/channel-switcher.test.ts (20 tests) 14ms
 ✓ src/lib/scroll.test.ts (16 tests) 8ms
 ✓ src/lib/markdown.test.ts (16 tests) 48ms
 ✓ src/lib/truncate.test.ts (7 tests) 4ms
 ✓ src/lib/viewport.test.ts (2 tests) 3ms
 ✓ src/lib/compose.test.ts (6 tests) 3ms
 ✓ src/ChannelSwitcher.test.ts (3 tests) 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/lib/image-attachment.test.ts > readFileAsBase64 > rejects when FileReader encounters an error
ReferenceError: ProgressEvent is not defined
 ❯ src/lib/image-attachment.test.ts:115:69
    113|     globalThis.FileReader = MockFileReader as unknown as typeof FileRe…
    114| 
    115|     await expect(readFileAsBase64(mockFile)).rejects.toBeInstanceOf(Pr…
       |                                                                     ^
    116| 
    117|     globalThis.FileReader = originalFileReader;

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯

Vitest caught 1 unhandled error during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

⎯⎯⎯⎯⎯ Uncaught Exception ⎯⎯⎯⎯⎯
ReferenceError: ProgressEvent is not defined
 ❯ Timeout._onTimeout src/lib/image-attachment.test.ts:107:66
    105|         setTimeout(() => {
    106|           if (this.onerror) {
    107|             this.onerror.call(this as unknown as FileReader, new Progr…
       |                                                                  ^
    108|           }
    109|         }, 0);
 ❯ listOnTimeout node:internal/timers:605:17
 ❯ processTimers node:internal/timers:541:7

This error originated in "src/lib/image-attachment.test.ts" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.
The latest test that might've caused the error is "handles empty base64 data gracefully". It might mean one of the following:
- The error was thrown, while Vitest was running this test.
- If the error occurred after the test had been completed, this was the last documented test before it was thrown.
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯


 Test Files  1 failed | 14 passed (15)
      Tests  1 failed | 189 passed (190)
     Errors  1 error
   Start at  20:19:50
   Duration  980ms (transform 529ms, setup 0ms, collect 1.11s, tests 171ms, environment 4ms, prepare 2.00s)

error: Recipe `test` failed on line 11 with exit code 1

