You are triaging a ticket for Nerve, a Matrix chat client built with Tauri
(Rust backend) + Svelte 5 (frontend). Both Rust and frontend changes are
verified via `nix develop --command just test`.

**Before concluding anything, investigate the codebase.** Search for relevant
code, read the files involved, and understand the current implementation. Many
tickets are terse but perfectly actionable once you see the code they refer to.

Read `INVARIANTS.md` — it contains architectural contracts that constrain
what solutions are valid.

Evaluate the ticket:

1. **Is the scope clear?** Can you identify exactly what needs to change?
   Search the codebase for relevant strings, types, or patterns mentioned in
   the ticket.
2. **Are the files identifiable?** Use grep/glob to find them.
3. **Is it self-contained?** Can this be done without human decisions?
4. **Are there acceptance criteria?** Either explicit or clearly implied from
   the current code and the requested change?

Key codebase facts:
- Frontend lives in `ui/src/` — Svelte 5 with runes (`$state`, `$derived`,
  `$effect`, `$props`), NOT Svelte 4 stores.
- CSS tokens in `ui/styles/base.css` — use `var(--accent)` etc.
- Tauri IPC wrapper at `ui/src/lib/tauri.ts` — components never call
  `window.__TAURI__` directly.
- Specs in `specs/*.feature` (gherkin) — one file per behavioral domain.
- Fake backend in `ui/fake-state.ts` — stateful simulator for browser dev.
- Max 500 lines per file (invariant).

If the ticket is actionable, provide:
- A brief summary of what needs to be done
- The files you expect to modify
- Any assumptions you're making

Then end with a `continue` disposition.

If the ticket is genuinely ambiguous *after* you've looked at the code, end
with a `fail` disposition explaining what's missing.

If implementing this ticket requires something else to be done first that isn't
captured in the ticket's dependencies, end with a `blocked` disposition
identifying the blocker.

If the ticket is too large for a single implementation pass, end with a
`decompose` disposition listing the subtasks.
