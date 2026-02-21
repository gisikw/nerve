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

 ✓ src/lib/truncate.test.ts (7 tests) 4ms
 ✓ src/lib/compose.test.ts (6 tests) 4ms
 ✓ src/lib/sidebar.test.ts (8 tests) 6ms
 ✓ src/lib/markdown.test.ts (16 tests) 30ms

 Test Files  4 passed (4)
      Tests  37 passed (37)
   Start at  04:46:53
   Duration  461ms (transform 101ms, setup 0ms, collect 162ms, tests 44ms, environment 1ms, prepare 473ms)

cd ui && npx vite build
vite v6.4.1 building for production...
transforming...
✓ 130 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                  0.39 kB │ gzip:  0.26 kB
dist/assets/index-Dcp4NtMk.css  19.74 kB │ gzip:  3.90 kB
dist/assets/index-W3_nPXa-.js   75.91 kB │ gzip: 28.37 kB
✓ built in 926ms
cd src-tauri && cargo test
   Compiling nerve v0.1.0 (/home/dev/Projects/nerve/src-tauri)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 16.75s
     Running unittests src/main.rs (target/debug/deps/nerve-149dc6cd523a5670)

running 36 tests
test client::tests::save_and_load_homeserver ... ok
test error::tests::parse_room_id_error_includes_input ... ok
test error::tests::parse_room_id_invalid_empty ... ok
test error::tests::parse_room_id_valid ... ok
test error::tests::nerve_error_display_formats ... ok
test error::tests::parse_server_name_valid ... ok
test error::tests::parse_server_name_invalid_empty ... ok
test error::tests::parse_event_id_valid ... ok
test error::tests::parse_event_id_error_includes_input ... ok
test error::tests::parse_server_name_with_port ... ok
test client::tests::load_homeserver_returns_none_when_missing ... ok
test error::tests::parse_room_id_invalid_missing_bang ... ok
test messages::tests::reaction_accumulator_different_events ... ok
test error::tests::parse_event_id_invalid ... ok
test messages::tests::reaction_accumulator_invalid_event_id_returns_empty ... ok
test client::tests::clear_credentials_removes_files ... ok
test messages::tests::reaction_accumulator_empty ... ok
test messages::tests::reaction_accumulator_multiple_emoji ... ok
test messages::tests::reaction_accumulator_include_self ... ok
test messages::tests::reaction_accumulator_single_reaction ... ok
test messages::tests::reaction_accumulator_unknown_event_returns_empty ... ok
test messages::tests::reaction_accumulator_not_include_self ... ok
test client::tests::load_homeserver_trims_whitespace ... ok
test messages::tests::reaction_accumulator_multiple_senders_same_emoji ... ok
test client::tests::load_homeserver_returns_none_for_empty ... ok
test streams::tests::append_to_closed_stream_ignored ... ok
test streams::tests::get_streams_empty_cache ... ok
test typing::tests::get_typing_users_empty_cache ... ok
test streams::tests::new_cache_is_empty ... ok
test typing::tests::get_typing_users_invalid_room_id ... ok
test streams::tests::get_streams_invalid_room_id ... ok
test streams::tests::stream_lifecycle ... ok
test typing::tests::get_typing_users_populated_cache ... ok
test typing::tests::new_cache_is_empty ... ok
test streams::tests::get_streams_with_data ... ok
test typing::tests::get_typing_users_wrong_room ... ok

test result: ok. 36 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

