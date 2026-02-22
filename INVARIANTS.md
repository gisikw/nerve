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
  state (sync, room list, message store). The frontend is a view layer
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

### Svelte conventions

- **Svelte 5 with runes.** Use `$state`, `$derived`, `$effect`, `$props`
  — not the Svelte 4 store syntax (`writable`, `derived`, `$:`). Runes
  are the reactivity model going forward.
- **No SvelteKit.** This is a Tauri SPA. Vite is the build tool. No
  router, no server-side rendering, no `+page.svelte` conventions.
- **Components are TypeScript.** All `<script>` blocks use `lang="ts"`.
- **Stores are `.svelte.ts` files.** Reactive state lives in
  `src/lib/stores/*.svelte.ts` using module-level `$state` runes. These
  files export getter functions and mutation functions — not raw state
  variables. Components call `getRooms()`, not `rooms`.
- **Tauri IPC via typed wrapper.** `src/lib/tauri.ts` exports typed
  functions for every Tauri command and event subscription. Components
  never call `window.__TAURI__` directly.
- **CSS uses existing design tokens.** Components use `<style>` blocks
  with scoped CSS, referencing the CSS custom properties from
  `styles/base.css` (`var(--accent)`, `var(--bg-surface)`, etc.).
  Global styles stay in `styles/*.css`.
- **`main.ts` is infrastructure.** It mounts the Svelte app and handles
  concerns outside Svelte's component tree: zoom control and TTS playback
  queue. Media resolution and audio playback are handled by Svelte
  components directly.

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
- **Spec-to-test naming convention.** A spec file `specs/foo_bar.feature`
  maps to one or more test files named for the same domain:
  `foo-bar.test.ts`, `foo_bar.test.ts`, or `FooBar.test.ts`. The name
  should be recognizably the same domain. A test file with no corresponding
  spec is an orphan — either add the spec or delete the test.

### Test layers

- **Component tests** use `@testing-library/svelte` with `jsdom` via
  vitest. Config lives in `ui/vitest.config.ts` (environment: jsdom,
  setup: vitest.setup.ts). Use component tests for DOM structure,
  user interaction, and rendering behavior that can't be tested via
  pure function extraction.

- **Fake backend** (`ui/fake-state.ts`) is a stateful in-memory simulator
  that replaces Tauri when running in a browser via `npx vite`. Supports
  all commands, maintains message and session state across round-trips,
  and exposes a driver interface for external test scripts. See the Fake
  Backend section below for details.
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
  one coherent unit: room sync, message rendering, typing state,
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
  feedback. The `.catch(() => {})` pattern is banned — it hides failures
  from both users and developers. For user-facing operations (send message,
  send image, fetch messages), show an error in the UI. For background
  operations (typing notices, stream fetches), log with context via
  `console.error` at minimum.
- **SDK errors get context.** When a matrix-rust-sdk call fails, wrap the
  error with what we were trying to do. "Failed to send message to room
  !abc:matrix.org" not just the SDK's error string.

## Naming

- **Rust follows Rust conventions.** `snake_case` for functions and
  variables, `CamelCase` for types, `SCREAMING_SNAKE` for constants.
  No project-specific naming schemes.
- **Tauri commands are `verb_noun`.** `send_message`, `list_rooms`,
  `get_room_messages`. Single-word auth commands (`login`, `logout`) are
  fine — they're universally understood without a noun. The frontend calls
  these by name — clarity matters.
- **Svelte follows Svelte conventions.** `PascalCase` for component
  filenames (`Login.svelte`, `RoomList.svelte`). `camelCase` for
  functions, variables, and store files (`rooms.svelte.ts`).
  Props use `$props()`, not the legacy `export let` syntax.

## Build

- **Single binary output.** `cargo tauri build` produces one artifact per
  platform. No sidecar processes, no companion daemons, no runtime
  downloads.
- **Dev mode must hot-reload the frontend.** `cargo tauri dev` watches
  frontend assets and reloads the webview. Rust changes trigger a rebuild.
  The dev loop must be fast enough to stay in flow.

## Fake Backend

The fake backend lets the UI run in a regular browser without Tauri or a
Matrix server. It's a stateful simulator — not just canned data. Messages
sent via the compose box persist and appear on the next poll. Login/logout
toggle session state.

### Files

- **`ui/fake-state.ts`** — State, command handlers, and driver actions.
  Runs server-side in Vite's Node process. This is the source of truth.
- **`ui/fake.ts`** — Browser-side client. Calls `fetch("/fake/command")`
  to route commands to the Vite server.
- **`ui/vite-plugin-fake.ts`** — Vite plugin that mounts HTTP middleware
  and a WebSocket server. Loaded in `vite.config.js`.
- **`ui/main.ts`** — Mounts the Svelte app. The `invoke` function in
  `src/lib/tauri.ts` falls through to `fakeInvoke` when `window.__TAURI__`
  is absent.

### Running

`cd ui && npx vite` — opens on `http://localhost:3000`. The app boots
into MainPage with seed data (rooms, messages, session). Send messages,
switch rooms, log out — it all works.

### Driver interface

External processes can manipulate state to set up specific UI scenarios.
Two transports, same protocol:

- **WebSocket** `ws://localhost:3001` — persistent connection, send JSON
- **HTTP** `POST /fake/driver` — stateless, same JSON in request body

Actions:

| Action                   | Fields                                          |
|--------------------------|-------------------------------------------------|
| `inject_message`         | `roomId`, `sender`, `body`, `msgType?`, `timestamp?`, `mediaUrl?` |
| `add_room`               | `id`, `name`, `is_direct?`, `notification_count?` |
| `remove_room`            | `roomId`                                        |
| `set_notification_count` | `roomId`, `count`                               |
| `clear_messages`         | `roomId`                                        |
| `set_session`            | `loggedIn?`, `userId?`                          |
| `get_state`              | *(none — returns full state snapshot)*           |
| `reset`                  | *(none — restores seed data)*                   |

All responses are JSON: `{"ok": true}` on success, `{"ok": false, "error": "..."}` on failure. `get_state` returns `{"ok": true, "state": {...}}`.

### Design decisions

- **State lives server-side.** The Vite Node process holds state; the
  browser fetches it. This lets external drivers and the browser see the
  same state without cross-frame messaging.
- **No frontend changes.** The fake backend is invisible to the Svelte
  app. Same command names, same JSON shapes. The `invoke` function in
  `src/lib/tauri.ts` routes to `fetch()` instead of Tauri IPC when
  running in a browser.
- **Seed data is realistic.** Rooms and messages reflect actual usage
  patterns (group rooms, DMs, notices, multi-party conversation) so the
  UI renders representatively without setup.
- **The plugin only activates in dev mode.** `apply: "serve"` in the
  Vite plugin config means production builds don't include any of this.

## Screenshot Pipeline

Headless UI capture using the fake backend. Starts Vite, optionally
drives the fake backend into a specific state, renders in headless
Chromium (via puppeteer-core), and saves a PNG.

### Usage

```bash
cd ui && npx tsx screenshot.ts [options]
# or: npm run screenshot -- [options]
```

| Option              | Description                                      |
|---------------------|--------------------------------------------------|
| `--output, -o`      | Output path (required)                           |
| `--width`           | Viewport width in px (default: 1280)             |
| `--height`          | Viewport height in px (default: 800)             |
| `--room <name>`     | Click a room in the sidebar before capture       |
| `--scene <name>`    | Apply a predefined state setup                   |
| `--delay <ms>`      | Extra delay before capture (default: 500)        |
| `--vite-url <url>`  | Use existing Vite server instead of starting one |

### Scenes

Predefined state configurations applied via the driver before capture:

- **`default`** — seed data, no room selected
- **`login`** — logged-out state, shows login page
- **`busy`** — high notification counts on multiple rooms
- **`fresh`** — reset to clean seed data

New scenes are defined in `screenshot.ts` as arrays of driver actions.

### Requirements

- Chromium in the nix store (auto-detected via `find /nix/store`)
- `puppeteer-core` and `tsx` (dev dependencies)
- Fake backend (Vite plugin) — starts automatically

## Secrets

- **No hostnames, credentials, or environment-specific values in tracked
  files.** Use environment variables or gitignored config. Homeserver URLs,
  usernames, API keys — none of these belong in source. If a script needs
  a default, it reads from an env var, not a hardcoded string.

## Policy

- **Decisions that shape code are explicit, not implicit.** If an agent
  would need to read three files and infer a pattern, that pattern should
  be documented here instead. Code is evidence of decisions; this file is
  where the decisions themselves live.
- **No implicit patterns.** "Look at how the other files do it" is not a
  policy. If a convention matters, it's written here. If it's not written
  here, it's not a convention — it's a coincidence.
