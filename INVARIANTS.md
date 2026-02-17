# Invariants

Explicit architectural and taste decisions for the nerve codebase.
These are contracts, not suggestions. Violating an invariant is a bug.
If an invariant is wrong, update the invariant first — then change the code.

These invariants reflect engineering judgment about how this codebase should
work. They will sometimes be wrong — that's the point of making them explicit.
Challenge them by updating them, not by silently ignoring them.

Existing code that violates these invariants is out of compliance and should
be ticketed for remediation. No grandfathering.

## Architecture

- **Tauri is the shell, not the application.** The Rust backend owns Matrix
  state (sync, E2EE, room list, message store). The frontend is a view layer
  that renders what the backend tells it. Business logic does not live in
  JavaScript.
- **matrix-rust-sdk is the Matrix layer.** No raw HTTP calls to the Matrix
  API. If the SDK doesn't expose something, wrap it — don't bypass it.
- **Commands are the API boundary.** Frontend communicates with backend
  exclusively through Tauri commands (IPC). No shared mutable state, no
  direct FFI, no global singletons bridging the two layers.
- **Events flow one direction for state.** Backend emits events to frontend
  via Tauri's event system. Frontend sends commands to backend via IPC.
  The frontend never mutates backend state directly.

## E2EE

- **E2EE is not optional.** All rooms are encrypted. The client does not
  support unencrypted rooms as a first-class path. If an unencrypted room
  exists, it works, but no design decisions optimize for it.
- **Key backup and verification must work before launch.** A Matrix client
  without working key backup is a data loss vector. This blocks MVP.
- **Crypto state is persistent.** The SDK's crypto store is backed by a
  persistent store (sled or sqlite). Losing crypto state means losing
  message history. Treat the store path as critical data.

## Frontend

- **System webview only.** No bundled Chromium. WebKitGTK on Linux, WebKit
  on macOS. This is a Tauri decision we're committed to — it keeps the
  binary small and the resource footprint low.
- **Semantic HTML first.** Markdown rendering, message layout, room lists —
  these are HTML structures styled with CSS, not canvas draws or framework
  abstractions over basic layout. Accessibility comes from semantic markup.
- **Typography matters.** Message rendering should be clean and readable.
  Good line height, sensible max-width, monospace for code blocks, proper
  quote styling. This is a daily-driver client, not a prototype.

## Specifications and Tests

- **Every behavior has a spec.** Behavioral specs live in `specs/*.feature`
  (gherkin syntax). These are the source of truth for what the system promises
  to do. They are documentation artifacts, not executable test suites.
- **Every spec has a test.** A spec without a corresponding test is an
  unverified claim. A test without a corresponding spec is a test that can be
  silently removed — there's no way to know if it's validating the right thing.
- **Specs and tests are independent artifacts.** A discrepancy between a spec
  and its corresponding test (missing test, skipped test, test that doesn't
  actually validate the spec's claim) is always a defect — the question is
  which one is wrong.
- **Spec before code.** Every new behavior gets a spec before or alongside the
  implementation. Not after. The spec is how we know what we're building.
  Writing the test first is fine; writing the code first and speccing it later
  is how intent gets lost.
- **Specs are named for the behavioral domain, not the implementation.**
  `message_rendering.feature`, not `ViewMessages_test.feature`. The spec
  describes what the system does, not which module does it.
- **One spec file per behavioral domain.** Don't split a domain across files.
  Don't combine unrelated domains.

### Test layers

- **Elm unit tests** (`ui/tests/*.elm`) verify decoders, update logic, and
  view helpers. Run with `cd ui && npx elm-test`. These are fast, pure, and
  cover all state transitions and JSON parsing.
- **Elm view tests** use a fake backend (mock ports) to drive the full Elm
  app with canned data, snapshot the virtual DOM, and assert on structure.
  No Matrix dependency. This is how the frontend gets "seen" without a
  running server.
- **Rust unit tests** (`#[cfg(test)] mod tests` inline or `*_test.rs`) verify
  backend decision logic — message formatting, room filtering, notification
  counting. Run with `cd src-tauri && cargo test`.
- **Integration tests** are deferred until the IPC boundary stabilizes. The
  port protocol (tagged JSON envelopes) is simple enough that decoder tests
  on both sides of the boundary provide sufficient coverage for now.

### Test enforcement

- **All tests must pass before commit.** This is enforced by convention, not
  by hooks (Tauri's Rust build is too slow for a pre-commit gate). An agent
  that commits with failing tests is out of compliance with this invariant.
- **New features require new specs and tests.** A PR that adds behavior
  without a corresponding spec and test is incomplete.
- **Bug fixes require regression tests.** If it broke once, it gets a test
  so it can't break again silently.

## Code Organization

- **Decision logic is pure.** Functions that make decisions — should we
  show a notification? how do we render this event? is this room unread? —
  take data in and return decisions out. No SDK calls, no IPC, no I/O.
- **I/O is plumbing, not logic.** Tauri command handlers and event emitters
  are thin orchestrators: gather data, call pure decision functions, act on
  results.
- **New logic goes into testable functions first.** If the first thing you
  write is a Tauri command handler, you're doing it backwards. Write the
  decision function, write the test, then wire it into the command.
- **No multi-purpose functions.** A function that decides *and* acts is
  doing two things. Separate the decision from the effect.

## File Size

- **500 lines max per file.** This is an ergonomic constraint, not an
  aesthetic one. Every edit requires a preceding read. At 2500 lines, a
  single task burns 5+ partial reads just to orient — that's context window
  spent on navigation instead of reasoning. 500 lines fits in one read and
  leaves room to think.
- **Split along behavioral seams, not alphabetically.** A file should be
  one coherent unit: room sync, message rendering, crypto operations,
  notification decisions. Not "functions A-M" and "functions N-Z".
- **Tests mirror source files.** `rooms.rs` → `rooms_test.rs` (or inline
  `#[cfg(test)] mod tests`). Frontend test files mirror component files.
- **No `util.rs` or `helpers.js`.** If a function is useful, it belongs
  with the domain that uses it. Grab-bag utility files are a smell.
- **Existing files over 500 lines are out of compliance.** Ticket the
  split, don't let new work make them bigger.

## Error Handling

- **Rust errors are typed, not stringly.** Use `thiserror` or equivalent
  for error enums. `anyhow` is fine at the binary boundary (main, command
  handlers). Library-style code within the project uses typed errors.
- **Frontend errors are surfaced, not swallowed.** If a command fails, the
  user sees feedback. Silent failures are bugs. Console.error is not user
  feedback.
- **SDK errors get context.** When a matrix-rust-sdk call fails, wrap the
  error with what we were trying to do. "Failed to send message to room
  !abc:matrix.org" not just the SDK's error string.

## Naming

- **Rust follows Rust conventions.** `snake_case` for functions and
  variables, `CamelCase` for types, `SCREAMING_SNAKE` for constants.
  No project-specific naming schemes.
- **Tauri commands are `verb_noun`.** `send_message`, `list_rooms`,
  `get_room_messages`. The frontend calls these by name — clarity matters.
- **Elm follows Elm conventions.** `CamelCase` module names matching file
  names (`View/Login.elm` → `View.Login`). `camelCase` for functions and
  values. Ports use `camelCase` (`sendToTauri`, `receiveFromTauri`).

## Build

- **Single binary output.** `cargo tauri build` produces one artifact per
  platform. No sidecar processes, no companion daemons, no runtime
  downloads.
- **Dev mode must hot-reload the frontend.** `cargo tauri dev` watches
  frontend assets and reloads the webview. Rust changes trigger a rebuild.
  The dev loop must be fast enough to stay in flow.

## Policy

- **Decisions that shape code are explicit, not implicit.** If an agent
  would need to read three files and infer a pattern, that pattern should
  be documented here instead. Code is evidence of decisions; this file is
  where the decisions themselves live.
- **No implicit patterns.** "Look at how the other files do it" is not a
  policy. If a convention matters, it's written here. If it's not written
  here, it's not a convention — it's a coincidence.
