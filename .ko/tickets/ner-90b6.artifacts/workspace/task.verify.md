warning: Git tree '/home/dev/Projects/nerve' is dirty
cd ui && [ -x node_modules/.bin/vitest ] || npm install
cd ui && npx vitest run

 RUN  v3.2.4 /home/dev/Projects/nerve/ui

 ✓ src/ComposeBar.test.ts (8 tests) 605ms
stdout | src/ComposeBar-voice.test.ts
Sending voice message: 10 bytes, 19ms, audio/webm;codecs=opus

stderr | src/ComposeBar-voice.test.ts
Failed to send voice message: TypeError: Failed to parse URL from /fake/command
[90m    at node:internal/deps/undici/undici:16416:13[39m
    at fakeInvoke [90m(/home/dev/Projects/nerve/ui/[39mfake.ts:14:15[90m)[39m
    at Module.track_reactivity_loss [90m(/home/dev/Projects/nerve/ui/[39mnode_modules/[4msvelte[24m/src/internal/client/reactivity/async.js:156:14[90m)[39m
    at [90m/home/dev/Projects/nerve/ui/[39msrc/ComposeBar.svelte:334:6 {
  [cause]: TypeError: Invalid URL: /fake/command
      at new URLImpl [90m(/home/dev/Projects/nerve/ui/[39mnode_modules/[4mwhatwg-url[24m/lib/URL-impl.js:21:13[90m)[39m
      at Object.exports.setup [90m(/home/dev/Projects/nerve/ui/[39mnode_modules/[4mwhatwg-url[24m/lib/URL.js:54:12[90m)[39m
      at new URL [90m(/home/dev/Projects/nerve/ui/[39mnode_modules/[4mwhatwg-url[24m/lib/URL.js:115:22[90m)[39m
  [90m    at new Request (node:internal/deps/undici/undici:10971:25)[39m
  [90m    at fetch (node:internal/deps/undici/undici:11891:25)[39m
  [90m    at fetch (node:internal/deps/undici/undici:16414:10)[39m
  [90m    at fetch (node:internal/bootstrap/web/exposed-window-or-worker:83:12)[39m
      at fakeInvoke [90m(/home/dev/Projects/nerve/ui/[39mfake.ts:14:21[90m)[39m
      at sendVoiceMessage [90m(/home/dev/Projects/nerve/ui/[39msrc/lib/tauri.ts:148:10[90m)[39m
      at [90m/home/dev/Projects/nerve/ui/[39msrc/ComposeBar.svelte:271:31
}

 ✓ src/ComposeBar-voice.test.ts (17 tests) 727ms
 ✓ src/Login.test.ts (10 tests) 597ms
 ✓ src/ComposeBar.image-attachment.test.ts (10 tests) 482ms
 ✓ src/ComposeBar.image-mime.test.ts (4 tests) 385ms
 ✓ src/ComposeBar.image-send.test.ts (5 tests) 408ms
 ✓ src/lib/markdown.test.ts (16 tests) 28ms
 ✓ src/Toast.test.ts (12 tests) 251ms
 ✓ src/lib/room-navigation.test.ts (21 tests) 8ms
 ✓ src/lib/stores/error-feedback.test.ts (13 tests) 14ms
 ✓ src/lib/voice-recording.test.ts (16 tests) 13ms
 ✓ src/lib/image-attachment.test.ts (14 tests) 9ms
 ✓ src/lib/streams.test.ts (40 tests) 10ms
 ✓ src/lib/error-logging.test.ts (18 tests) 8ms
 ✓ src/lib/message-pinning.test.ts (30 tests) 9ms
 ✓ src/lib/channel-switcher.test.ts (20 tests) 5ms
 ✓ src/lib/ui-layout.test.ts (16 tests) 5ms
 ✓ src/lib/sidebar.test.ts (8 tests) 3ms
 ✓ src/lib/text-to-speech.test.ts (15 tests) 5ms
 ✓ src/lib/message-display.test.ts (25 tests) 5ms
 ✓ src/lib/typing-indicators.test.ts (12 tests) 4ms
 ✓ src/lib/stores/rooms.test.ts (5 tests) 4ms
 ✓ src/lib/app-icon.test.ts (8 tests) 4ms
 ✓ src/lib/scroll.test.ts (16 tests) 4ms
 ✓ src/lib/truncate.test.ts (7 tests) 3ms
 ✓ src/lib/message-compose.test.ts (6 tests) 3ms
 ✓ src/ChannelSwitcher.test.ts (4 tests) 3ms
 ✓ src/lib/viewport-behavior.test.ts (2 tests) 2ms

 Test Files  28 passed (28)
      Tests  378 passed (378)
   Start at  03:15:17
   Duration  14.06s (transform 714ms, setup 1.36s, collect 3.54s, tests 3.60s, environment 13.04s, prepare 1.65s)

cd ui && npx vite build
vite v6.4.1 building for production...
transforming...
✓ 140 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                  0.39 kB │ gzip:  0.26 kB
dist/assets/index-4AixoP31.css  21.58 kB │ gzip:  4.22 kB
dist/assets/index-Df_1UtLk.js   80.46 kB │ gzip: 29.67 kB
✓ built in 977ms
cd src-tauri && cargo test
   Compiling nerve v0.1.0 (/home/dev/Projects/nerve/src-tauri)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 17.83s
     Running unittests src/main.rs (target/debug/deps/nerve-149dc6cd523a5670)

running 44 tests
test error::tests::parse_event_id_invalid ... ok
test client::tests::save_and_load_homeserver ... ok
test client::tests::load_homeserver_trims_whitespace ... ok
test error::tests::parse_event_id_valid ... ok
test error::tests::nerve_error_display_formats ... ok
test client::tests::load_homeserver_returns_none_for_empty ... ok
test error::tests::parse_room_id_error_includes_input ... ok
test error::tests::parse_event_id_error_includes_input ... ok
test error::tests::parse_room_id_invalid_empty ... ok
test client::tests::clear_credentials_removes_files ... ok
test error::tests::parse_room_id_invalid_missing_bang ... ok
test error::tests::parse_room_id_valid ... ok
test error::tests::parse_server_name_invalid_empty ... ok
test error::tests::parse_server_name_valid ... ok
test client::tests::load_homeserver_returns_none_when_missing ... ok
test messages::fetch::tests::reaction_accumulator_different_events ... ok
test messages::fetch::tests::reaction_accumulator_empty ... ok
test messages::fetch::tests::reaction_accumulator_include_self ... ok
test messages::fetch::tests::reaction_accumulator_multiple_emoji ... ok
test messages::fetch::tests::reaction_accumulator_multiple_senders_same_emoji ... ok
test messages::fetch::tests::reaction_accumulator_not_include_self ... ok
test error::tests::parse_server_name_with_port ... ok
test messages::fetch::tests::reaction_accumulator_invalid_event_id_returns_empty ... ok
test messages::fetch::tests::reaction_accumulator_single_reaction ... ok
test streams::tests::get_streams_empty_cache ... ok
test messages::fetch::tests::reaction_accumulator_unknown_event_returns_empty ... ok
test streams::tests::stream_lifecycle ... ok
test streams::tests::new_cache_is_empty ... ok
test streams::tests::get_streams_with_data ... ok
test tts::tests::truncate_text_at_boundary ... ok
test streams::tests::append_to_closed_stream_ignored ... ok
test tts::tests::truncate_text_handles_empty_string ... ok
test tts::tests::truncate_text_truncates_when_over_limit ... ok
test streams::tests::get_streams_invalid_room_id ... ok
test typing::tests::get_typing_users_empty_cache ... ok
test typing::tests::get_typing_users_invalid_room_id ... ok
test typing::tests::new_cache_is_empty ... ok
test tts::tests::truncate_text_returns_unchanged_when_at_limit ... ok
test tts::tests::truncate_text_returns_unchanged_when_under_limit ... ok
test typing::tests::get_typing_users_wrong_room ... ok
test tts::tests::find_output_file_matches_suffix ... ok
test tts::tests::find_output_file_ignores_non_matching_files ... ok
test typing::tests::get_typing_users_populated_cache ... ok
test tts::tests::find_output_file_returns_none_for_nonexistent_dir ... ok

test result: ok. 44 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

