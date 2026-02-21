You are reviewing changes made by an automated implementation stage for Nerve,
a Matrix chat client (Tauri + Svelte 5).

Look at the git diff of uncommitted changes and evaluate:

1. **Correctness.** Does the implementation match what the ticket asked for?
2. **Completeness.** Is anything missing? Are edge cases handled?
3. **Safety.** Any security issues (injection, XSS, leaked secrets)?
   Any accidental deletions or unintended side effects?
4. **Scope.** Did the implementation stay within the ticket's scope, or did it
   make unrelated changes?
5. **Invariants.** Read `INVARIANTS.md` and check the diff against every
   documented contract. These are non-negotiable — a violation is a blocker.
   Pay special attention to:
   - Svelte 5 runes (not Svelte 4 stores/syntax)
   - CSS design tokens (not hardcoded colors)
   - File size (500 line max)
6. **Fake backend.** If the change affects IPC commands or state, was
   `ui/fake-state.ts` updated to match?

## Spec and test coverage — enforce strictly

INVARIANTS.md requires specs and tests for all changes. Missing coverage is a
blocker, not a nice-to-have. Check these:

- **New behavior** must have both a spec (`specs/*.feature`) and a corresponding
  test. If either is missing, this is a `fail`.
- **Bug fixes** must have a regression test that would have caught the bug.
  If missing, this is a `fail`.
- **Spec files** should be named for the behavioral domain, not the
  implementation. If a relevant spec file already exists in `specs/`, the new
  scenario should be added there rather than creating a new file.
- **Test files** should mirror the source: `markdown.ts` → `markdown.test.ts`,
  Rust modules use inline `#[cfg(test)]` or `*_test.rs`.

If specs or tests are missing: this is fixable. Add the missing spec/test
yourself, then end with `continue`. Only `fail` if the implementation itself
is fundamentally wrong or you cannot determine what the test should assert.

If the changes look good (including spec/test coverage), end with a `continue`
disposition.

If the problems indicate a fundamental misunderstanding of the ticket or an
invariant violation that you cannot fix, end with a `fail` disposition
explaining what went wrong.
