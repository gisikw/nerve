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
- **Specs before code.** New behavior gets a `specs/*.feature` file (gherkin).
  One file per behavioral domain, named for the domain not the implementation.
- **No new dependencies** unless the ticket explicitly calls for them.

Implement the changes described in the ticket. Follow these rules:

1. **Read before writing.** Always read existing files before modifying them.
2. **Minimal changes.** Only change what the ticket requires. Don't refactor
   surrounding code, add comments to unchanged code, or "improve" things that
   aren't broken.
3. **Follow existing patterns.** Match the style, naming conventions, and
   architecture of the existing codebase.
4. **Write tests** if the codebase has tests and the change is testable.
5. **Update the fake backend** (`ui/fake-state.ts`) if the change affects
   commands or state that the fake backend simulates.
6. **Do NOT commit, push, or close the ticket.** Leave changes uncommitted.
   The pipeline handles git operations and ticket lifecycle separately.

When you're done, provide a brief summary of what you changed and why.
