You are implementing a ticket for Nerve, a Matrix chat client built with Tauri
(Rust backend) + Svelte 5 (frontend). The triage stage has already confirmed
this ticket is actionable, and its analysis is provided as previous stage output.

Read `INVARIANTS.md` before writing any code. These are architectural contracts
— your implementation must comply. Key constraints:

- **Svelte 5 runes only.** Use `$state`, `$derived`, `$effect`, `$props`.
  Never use Svelte 4 patterns (`writable`, `derived`, `$:`, `export let`).
- **CSS uses design tokens.** Reference `var(--accent)`, `var(--bg-surface)`,
  etc. from `ui/styles/base.css`. No hardcoded colors.
- **Tauri IPC via typed wrapper.** Components use `src/lib/tauri.ts`, never
  `window.__TAURI__` directly.
- **500 lines max per file.** If a file is approaching the limit, split along
  behavioral seams.
- **No new dependencies** unless the ticket explicitly calls for them.

Implement the changes described in the ticket. Follow these rules:

1. **Read before writing.** Always read existing files before modifying them.
2. **Minimal changes.** Only change what the ticket requires. Don't refactor
   surrounding code, add comments to unchanged code, or "improve" things that
   aren't broken.
3. **Follow existing patterns.** Match the style, naming conventions, and
   architecture of the existing codebase.
4. **Update the fake backend** (`ui/fake-state.ts`) if the change affects
   commands or state that the fake backend simulates.
5. **Do NOT commit, push, or close the ticket.** Leave changes uncommitted.
   The pipeline handles git operations and ticket lifecycle separately.

## Specs and tests — mandatory

These are not optional. INVARIANTS.md treats missing specs and tests as defects.

- **New behavior → new spec + new test.** Add or update a `specs/*.feature`
  file (gherkin, one per behavioral domain, named for the domain). Then add
  a corresponding test in `ui/src/**/*.test.ts` (vitest) or
  `src-tauri/src/*.rs` (Rust `#[test]`).
- **Bug fix → regression test.** If you're fixing a bug, add a test that
  reproduces the broken behavior and verifies the fix. The test must fail
  without your fix and pass with it.
- **Spec files are named for the behavioral domain** (`message_compose.feature`),
  not the implementation (`ComposeBar_test.feature`). Check `specs/` for an
  existing file in the right domain before creating a new one.
- **Pure logic** (formatting, parsing, decision functions) gets unit tests.
  **UI behavior** (textarea resizing, scroll position, focus management) gets
  a spec describing the expected behavior, even if there's no automated test
  runner for it yet — the spec is still the source of truth.

### Test quality

Every test must assert something meaningful. A test that passes without
exercising real logic is worse than no test — it builds false confidence,
wastes CI time, and burns tokens in future reviews.

- **No vacuous assertions.** `expect(true).toBe(true)`, `expect(1).toBe(1)`,
  or any assertion that is tautologically true is forbidden. If a test doesn't
  call the function under test or inspect its output, it is not a test.
- **No "documentation-only" tests.** Comments explaining behavior belong in
  specs or code comments, not in test bodies with dummy assertions. If you
  can't figure out how to assert something meaningful, write the spec and
  skip the test — a missing test is honest; a fake test is a lie.
- **Tests must exercise the code path they claim to cover.** A regression test
  for a bug fix must reproduce the conditions that triggered the bug and
  verify the correct outcome. A test for a pure function must call the
  function with representative inputs and assert on outputs.

If you are unsure whether a spec or test applies, err on the side of writing
one. A superfluous test is trivially deleted; a missing test is a latent defect.

When you're done, provide a brief summary of what you changed and why, including
which specs and tests you added or updated.
