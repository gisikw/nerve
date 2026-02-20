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
   - Spec coverage for new behavior
6. **Fake backend.** If the change affects IPC commands or state, was
   `ui/fake-state.ts` updated to match?

If the changes look good, end with a `continue` disposition.

If there are problems that you can fix, fix them and end with `continue`.

If the problems indicate a fundamental misunderstanding of the ticket or an
invariant violation that you cannot fix, end with a `fail` disposition
explaining what went wrong.
