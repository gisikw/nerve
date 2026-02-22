---
id: ner-cf90
status: open
deps: []
links: []
created: 2026-02-22T01:10:29Z
type: task
priority: 1
---
# Add shared toast/notification component for transient error feedback

## Notes

**2026-02-22 01:27:47 UTC:** ko: FAIL at node 'verify' — node 'verify' failed after 3 attempts: command failed: exit status 1
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

 ✓ src/lib/ui-layout.test.ts (13 tests) 8ms
 ✓ src/lib/voice-recording.test.ts (16 tests) 15ms
 ✓ src/lib/tts-playback.test.ts (15 tests) 7ms
 ✓ src/lib/markdown.test.ts (16 tests) 41ms
 ✓ src/lib/sidebar.test.ts (21 tests) 25ms
 ✓ src/lib/image-attachment.test.ts (14 tests) 19ms
 ❯ src/lib/stores/toasts.test.ts (13 tests | 1 failed) 50ms
   ✓ Toast store > starts with no toasts 9ms
   ✓ Toast store > adds a toast with showToast 5ms
   ✓ Toast store > generates unique IDs for each toast 3ms
   ✓ Toast store > defaults to error type and 5000ms duration 1ms
   ✓ Toast store > dismisses a toast by ID 1ms
   ✓ Toast store > auto-dismisses toast after duration 3ms
   ✓ Toast store > supports multiple toasts simultaneously 2ms
   ✓ Toast store > dismisses only the specified toast 2ms
   ✓ Toast store > showError creates an error toast 1ms
   ✓ Toast store > showInfo creates an info toast 1ms
   ✓ Toast store > does nothing when dismissing non-existent toast 1ms
   ✓ Toast store > handles rapid sequential additions 2ms
   × Toast store > auto-dismisses each toast independently 19ms
     → expected [ { id: 'toast-27', …(3) }, …(1) ] to have a length of 3 but got 2
 ✓ src/lib/stores/rooms.test.ts (23 tests) 23ms
 ✓ src/lib/streams.test.ts (36 tests) 20ms
 ✓ src/lib/icon.test.ts (8 tests) 12ms
 ✓ src/lib/channel-switcher.test.ts (20 tests) 14ms
 ✓ src/lib/typing-ui.test.ts (12 tests) 9ms
 ✓ src/lib/message-grouping.test.ts (25 tests) 12ms
 ✓ src/lib/message-pinning.test.ts (30 tests) 17ms
 ✓ src/Toast.test.ts (12 tests) 669ms
   ✓ Toast component > dismisses toast when dismiss button is clicked  395ms
 ✓ src/lib/scroll.test.ts (16 tests) 5ms
 ✓ src/Login.test.ts (10 tests) 1098ms
   ✓ Login component > rendering with props > renders the login form with all input fields  371ms
 ✓ src/lib/truncate.test.ts (7 tests) 6ms
 ✓ src/ChannelSwitcher.test.ts (3 tests) 3ms
 ✓ src/lib/compose.test.ts (6 tests) 5ms
 ✓ src/lib/viewport.test.ts (2 tests) 4ms
 ❯ src/ComposeBar.test.ts (1 test | 1 failed) 1659ms
   × ComposeBar component > textarea height management > resets textarea height to auto after sending a message 1657ms
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
   Start at  01:27:42
   Duration  4.86s (transform 1.86s, setup 2.26s, collect 7.80s, tests 3.72s, environment 21.42s, prepare 3.13s)

error: Recipe `test` failed on line 11 with exit code 1


**2026-02-22 04:59:52 UTC:** ko: FAIL at node 'verify' — node 'verify' failed after 3 attempts: command failed: exit status 101
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

 ✓ src/lib/ui-layout.test.ts (13 tests) 10ms
 ✓ src/lib/streams.test.ts (36 tests) 10ms
 ✓ src/lib/markdown.test.ts (16 tests) 32ms
 ✓ src/lib/tts-playback.test.ts (15 tests) 14ms
 ✓ src/lib/image-attachment.test.ts (14 tests) 15ms
 ✓ src/lib/voice-recording.test.ts (16 tests) 23ms
 ✓ src/lib/stores/toasts.test.ts (13 tests) 34ms
 ✓ src/lib/stores/rooms.test.ts (23 tests) 36ms
 ✓ src/lib/typing-ui.test.ts (12 tests) 10ms
 ✓ src/lib/message-grouping.test.ts (25 tests) 11ms
 ✓ src/lib/message-pinning.test.ts (30 tests) 20ms
 ✓ src/lib/scroll.test.ts (16 tests) 16ms
 ✓ src/lib/sidebar.test.ts (21 tests) 19ms
 ✓ src/lib/channel-switcher.test.ts (20 tests) 15ms
 ✓ src/ComposeBar.test.ts (1 test) 653ms
   ✓ ComposeBar component > textarea height management > resets textarea height to auto after sending a message  650ms
 ✓ src/Toast.test.ts (12 tests) 663ms
   ✓ Toast component > dismisses toast when dismiss button is clicked  413ms
 ✓ src/Login.test.ts (10 tests) 1096ms
   ✓ Login component > rendering with props > renders the login form with all input fields  395ms
 ✓ src/lib/icon.test.ts (8 tests) 6ms
 ✓ src/lib/compose.test.ts (6 tests) 5ms
 ✓ src/lib/truncate.test.ts (7 tests) 4ms
 ✓ src/lib/viewport.test.ts (2 tests) 3ms
 ✓ src/ChannelSwitcher.test.ts (3 tests) 3ms

 Test Files  22 passed (22)
      Tests  319 passed (319)
   Start at  04:59:42
   Duration  4.58s (transform 2.22s, setup 2.17s, collect 7.67s, tests 2.70s, environment 21.68s, prepare 3.11s)

cd ui && npx vite build
vite v6.4.1 building for production...
transforming...
✓ 136 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                  0.39 kB │ gzip:  0.26 kB
dist/assets/index-Bz0SOFsx.css  20.40 kB │ gzip:  4.01 kB
dist/assets/index-DXbwc30Q.js   78.74 kB │ gzip: 29.17 kB
✓ built in 943ms
cd src-tauri && cargo test
   Compiling nerve v0.1.0 (/home/dev/Projects/nerve/src-tauri)
error[E0761]: file for module `messages` found at both "src/messages.rs" and "src/messages/mod.rs"
 --> src/main.rs:7:1
  |
7 | mod messages;
  | ^^^^^^^^^^^^^
  |
  = help: delete or rename one of them to remove the ambiguity

error[E0282]: type annotations needed
   --> src/commands.rs:133:9
    |
133 | /         messages::fetch_messages(client, &room_id, 50, from.as_deref())
134 | |             .await
    | |__________________^ cannot infer type

error[E0282]: type annotations needed
   --> src/commands.rs:150:9
    |
150 | /         messages::mark_read(client, &room_id, &event_id)
151 | |             .await
    | |__________________^ cannot infer type

error[E0282]: type annotations needed
   --> src/commands.rs:167:9
    |
167 | /         messages::send_message(client, &room_id, &body)
168 | |             .await
    | |__________________^ cannot infer type

error[E0282]: type annotations needed
   --> src/commands.rs:185:9
    |
185 | /         messages::send_reaction(client, &room_id, &event_id, &emoji)
186 | |             .await
    | |__________________^ cannot infer type

error[E0282]: type annotations needed
   --> src/commands.rs:253:9
    |
253 | /         messages::send_image(
254 | |             client,
255 | |             &room_id,
256 | |             &filename,
...   |
261 | |         .await
    | |______________^ cannot infer type

error[E0282]: type annotations needed
   --> src/commands.rs:284:9
    |
284 | /         messages::send_voice_message(
285 | |             client,
286 | |             &room_id,
287 | |             &filename,
...   |
292 | |         .await
    | |______________^ cannot infer type

error[E0282]: type annotations needed
   --> src/commands.rs:308:9
    |
308 | /         messages::download_media(client, &mxc_uri)
309 | |             .await
    | |__________________^ cannot infer type

error[E0282]: type annotations needed
   --> src/commands.rs:324:9
    |
324 | /         messages::get_pinned_events(client, &room_id)
325 | |             .await
    | |__________________^ cannot infer type

error[E0282]: type annotations needed
   --> src/commands.rs:341:9
    |
341 | /         messages::pin_message(client, &room_id, &event_id)
342 | |             .await
    | |__________________^ cannot infer type

error[E0282]: type annotations needed
   --> src/commands.rs:358:9
    |
358 | /         messages::unpin_message(client, &room_id, &event_id)
359 | |             .await
    | |__________________^ cannot infer type

Some errors have detailed explanations: E0282, E0761.
For more information about an error, try `rustc --explain E0282`.
error: could not compile `nerve` (bin "nerve" test) due to 11 previous errors
error: Recipe `test` failed on line 13 with exit code 101

