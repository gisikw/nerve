---
id: ner-d360
status: in_progress
deps: []
links: []
created: 2026-02-22T00:27:50Z
type: task
priority: 2
---
# Split messages.rs (632 lines, over 500 line limit) along behavioral seams: fetch, reactions, send, pinning

## Notes

**2026-02-22 01:54:13 UTC:** ko: FAIL at node 'verify' — node 'verify' failed after 3 attempts: command failed: exit status 1
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

 ✓ src/lib/streams.test.ts (36 tests) 8ms
 ✓ src/lib/sidebar.test.ts (21 tests) 10ms
 ✓ src/lib/tts-playback.test.ts (15 tests) 11ms
 ✓ src/lib/channel-switcher.test.ts (20 tests) 14ms
 ✓ src/lib/voice-recording.test.ts (16 tests) 28ms
 ✓ src/lib/markdown.test.ts (16 tests) 62ms
 ❯ src/lib/stores/toasts.test.ts (13 tests | 1 failed) 49ms
   ✓ Toast store > starts with no toasts 9ms
   ✓ Toast store > adds a toast with showToast 5ms
   ✓ Toast store > generates unique IDs for each toast 2ms
   ✓ Toast store > defaults to error type and 5000ms duration 1ms
   ✓ Toast store > dismisses a toast by ID 1ms
   ✓ Toast store > auto-dismisses toast after duration 3ms
   ✓ Toast store > supports multiple toasts simultaneously 1ms
   ✓ Toast store > dismisses only the specified toast 2ms
   ✓ Toast store > showError creates an error toast 1ms
   ✓ Toast store > showInfo creates an info toast 2ms
   ✓ Toast store > does nothing when dismissing non-existent toast 1ms
   ✓ Toast store > handles rapid sequential additions 2ms
   × Toast store > auto-dismisses each toast independently 18ms
     → expected [ { id: 'toast-27', …(3) }, …(1) ] to have a length of 3 but got 2
 ✓ src/lib/stores/rooms.test.ts (23 tests) 33ms
 ✓ src/lib/image-attachment.test.ts (14 tests) 21ms
 ✓ src/lib/icon.test.ts (8 tests) 10ms
 ✓ src/lib/scroll.test.ts (16 tests) 11ms
 ✓ src/lib/message-grouping.test.ts (25 tests) 16ms
 ✓ src/lib/message-pinning.test.ts (30 tests) 16ms
 ✓ src/lib/typing-ui.test.ts (12 tests) 8ms
 ✓ src/Toast.test.ts (12 tests) 633ms
   ✓ Toast component > dismisses toast when dismiss button is clicked  355ms
 ✓ src/Login.test.ts (10 tests) 1078ms
   ✓ Login component > rendering with props > renders the login form with all input fields  442ms
 ✓ src/lib/ui-layout.test.ts (13 tests) 6ms
 ✓ src/lib/truncate.test.ts (7 tests) 5ms
 ✓ src/lib/compose.test.ts (6 tests) 3ms
 ✓ src/ChannelSwitcher.test.ts (3 tests) 4ms
 ✓ src/lib/viewport.test.ts (2 tests) 3ms
 ❯ src/ComposeBar.test.ts (1 test | 1 failed) 1676ms
   × ComposeBar component > textarea height management > resets textarea height to auto after sending a message 1675ms
     → expected 0 to be greater than 30

Ignored nodes: comments, script, style
[36m<html>[39m
  [36m<head />[39m
  [36m<body>[39m
    [36m<div>[39m
      [0m [0m
      [36m<form[39m
        [33mdata-room-id[39m=[32m"!test:example.com"[39m
        [33mid[39m=[32m"compose"[39m
      [36m>[39m
        [0m [0m
        [36m<textarea[39m
          [33mid[39m=[32m"compose-input"[39m
          [33mplaceholder[39m=[32m"Send a message..."[39m
          [33mrows[39m=[32m"1"[39m
          [33mstyle[39m=[32m"height: 0px; overflow-y: hidden;"[39m
        [36m/>[39m
        [0m [0m
        [36m<button[39m
          [33mclass[39m=[32m"voice-btn"[39m
          [33mtitle[39m=[32m"Record voice message"[39m
          [33mtype[39m=[32m"button"[39m
        [36m>[39m
          [36m<svg[39m
            [33mfill[39m=[32m"none"[39m
            [33mheight[39m=[32m"18"[39m
            [33mstroke[39m=[32m"currentColor"[39m
            [33mstroke-linecap[39m=[32m"round"[39m
            [33mstroke-linejoin[39m=[32m"round"[39m
            [33mstroke-width[39m=[32m"2"[39m
            [33mviewBox[39m=[32m"0 0 24 24"[39m
            [33mwidth[39m=[32m"18"[39m
          [36m>[39m
            [36m<path[39m
              [33md[39m=[32m"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"[39m
            [36m/>[39m
            [36m<path[39m
              [33md[39m=[32m"M19 10v2a7 7 0 0 1-14 0v-2"[39m
            [36m/>[39m
            [36m<line[39m
              [33mx1[39m=[32m"12"[39m
              [33mx2[39m=[32m"12"[39m
              [33my1[39m=[32m"19"[39m
              [33my2[39m=[32m"22"[39m
            [36m/>[39m
          [36m</svg>[39m
        [36m</button>[39m
        [0m [0m
        [36m<button[39m
          [33mclass[39m=[32m"send-btn"[39m
          [33mtitle[39m=[32m"Send message"[39m
          [33mtype[39m=[32m"submit"[39m
        [36m>[39m
          [36m<svg[39m
            [33mfill[39m=[32m"none"[39m
            [33mheight[39m=[32m"18"[39m
            [33mstroke[39m=[32m"currentColor"[39m
            [33mstroke-linecap[39m=[32m"round"[39m
            [33mstroke-linejoin[39m=[32m"round"[39m
            [33mstroke-width[39m=[32m"2"[39m
            [33mviewBox[39m=[32m"0 0 24 24"[39m
            [33mwidth[39m=[32m"18"[39m
          [36m>[39m
            [36m<line[39m
              [33mx1[39m=[32m"22"[39m
              [33mx2[39m=[32m"11"[39m
              [33my1[39m=[32m"2"[39m
              [33my2[39m=[32m"13"[39m
            [36m/>[39m
            [36m<polygon[39m
              [33mpoints[39m=[32m"22 2 15 22 11 13 2 9 22 2"[39m
            [36m/>[39m
          [36m</svg>[39m
        [36m</button>[39m
      [36m</form>[39m
      [0m[0m
    [36m</div>[39m
  [36m</body>[39m
[36m</html>[39m

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/ComposeBar.test.ts > ComposeBar component > textarea height management > resets textarea height to auto after sending a message
AssertionError: expected 0 to be greater than 30

Ignored nodes: comments, script, style
[36m<html>[39m
  [36m<head />[39m
  [36m<body>[39m
    [36m<div>[39m
      [0m [0m
      [36m<form[39m
        [33mdata-room-id[39m=[32m"!test:example.com"[39m
        [33mid[39m=[32m"compose"[39m
      [36m>[39m
        [0m [0m
        [36m<textarea[39m
          [33mid[39m=[32m"compose-input"[39m
          [33mplaceholder[39m=[32m"Send a message..."[39m
          [33mrows[39m=[32m"1"[39m
          [33mstyle[39m=[32m"height: 0px; overflow-y: hidden;"[39m
        [36m/>[39m
        [0m [0m
        [36m<button[39m
          [33mclass[39m=[32m"voice-btn"[39m
          [33mtitle[39m=[32m"Record voice message"[39m
          [33mtype[39m=[32m"button"[39m
        [36m>[39m
          [36m<svg[39m
            [33mfill[39m=[32m"none"[39m
            [33mheight[39m=[32m"18"[39m
            [33mstroke[39m=[32m"currentColor"[39m
            [33mstroke-linecap[39m=[32m"round"[39m
            [33mstroke-linejoin[39m=[32m"round"[39m
            [33mstroke-width[39m=[32m"2"[39m
            [33mviewBox[39m=[32m"0 0 24 24"[39m
            [33mwidth[39m=[32m"18"[39m
          [36m>[39m
            [36m<path[39m
              [33md[39m=[32m"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"[39m
            [36m/>[39m
            [36m<path[39m
              [33md[39m=[32m"M19 10v2a7 7 0 0 1-14 0v-2"[39m
            [36m/>[39m
            [36m<line[39m
              [33mx1[39m=[32m"12"[39m
              [33mx2[39m=[32m"12"[39m
              [33my1[39m=[32m"19"[39m
              [33my2[39m=[32m"22"[39m
            [36m/>[39m
          [36m</svg>[39m
        [36m</button>[39m
        [0m [0m
        [36m<button[39m
          [33mclass[39m=[32m"send-btn"[39m
          [33mtitle[39m=[32m"Send message"[39m
          [33mtype[39m=[32m"submit"[39m
        [36m>[39m
          [36m<svg[39m
            [33mfill[39m=[32m"none"[39m
            [33mheight[39m=[32m"18"[39m
            [33mstroke[39m=[32m"currentColor"[39m
            [33mstroke-linecap[39m=[32m"round"[39m
            [33mstroke-linejoin[39m=[32m"round"[39m
            [33mstroke-width[39m=[32m"2"[39m
            [33mviewBox[39m=[32m"0 0 24 24"[39m
            [33mwidth[39m=[32m"18"[39m
          [36m>[39m
            [36m<line[39m
              [33mx1[39m=[32m"22"[39m
              [33mx2[39m=[32m"11"[39m
              [33my1[39m=[32m"2"[39m
              [33my2[39m=[32m"13"[39m
            [36m/>[39m
            [36m<polygon[39m
              [33mpoints[39m=[32m"22 2 15 22 11 13 2 9 22 2"[39m
            [36m/>[39m
          [36m</svg>[39m
        [36m</button>[39m
      [36m</form>[39m
      [0m[0m
    [36m</div>[39m
  [36m</body>[39m
[36m</html>[39m
 ❯ src/ComposeBar.test.ts:50:29
     48|         // Parse the height value - it should be greater than the defa…
     49|         const heightValue = parseInt(height, 10);
     50|         expect(heightValue).toBeGreaterThan(30); // Reasonable minimum…
       |                             ^
     51|       });
     52| 
 ❯ runWithExpensiveErrorDiagnosticsDisabled node_modules/@testing-library/dom/dist/config.js:47:12
 ❯ checkCallback node_modules/@testing-library/dom/dist/wait-for.js:124:77
 ❯ Timeout.checkRealTimersCallback node_modules/@testing-library/dom/dist/wait-for.js:118:16

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  src/lib/stores/toasts.test.ts > Toast store > auto-dismisses each toast independently
AssertionError: expected [ { id: 'toast-27', …(3) }, …(1) ] to have a length of 3 but got 2

[32m- Expected[39m
[31m+ Received[39m

[32m- 3[39m
[31m+ 2[39m

 ❯ src/lib/stores/toasts.test.ts:126:25
    124| 
    125|     // First should dismiss at 1000ms
    126|     expect(getToasts()).toHaveLength(3);
       |                         ^
    127|     vi.advanceTimersByTime(1);
    128|     expect(getToasts()).toHaveLength(2);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  2 failed | 20 passed (22)
      Tests  2 failed | 317 passed (319)
   Start at  01:54:08
   Duration  4.89s (transform 1.98s, setup 2.10s, collect 7.71s, tests 3.71s, environment 21.58s, prepare 3.13s)

error: Recipe `test` failed on line 11 with exit code 1


**2026-02-22 05:14:06 UTC:** ko: FAIL at node 'review' — Test failures in unrelated code (toast store and ComposeBar) indicate the implementation stage left a dirty tree mixing multiple tickets. The messages.rs split itself is correct (compiles, under 500 lines, proper behavioral seams, has tests), but INVARIANTS.md requires all tests to pass before commit. The toast timing test and ComposeBar scrollHeight test must be fixed before this can proceed.
