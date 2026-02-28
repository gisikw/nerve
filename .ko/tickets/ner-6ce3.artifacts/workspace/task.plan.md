nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
Plan written to `.ko/tickets/ner-6ce3.artifacts/plan.md`. Here's a summary:

**Goal:** Replace the "Logout" text with an inline SVG icon in the room header button.

**3 tasks:**
1. **`App.svelte:107`** — Swap `Logout` text for a Lucide-style log-out SVG icon; add `title="Logout"` for accessibility.
2. **`styles/layout.css`** — Change the logout button CSS from text-sizing (`padding: 0 0.55rem`, `font-size: 0.7rem`) to icon-sizing (`width: 1.75rem`, `padding: 0`), matching the `#streams-toggle` pattern. Add `svg { display: block }` rule.
3. **`ui-layout.test.ts`** — Update stale description ("text centering" → "icon centering") and add width + SVG display-block assertions.

No open questions — the `#streams-toggle` button is a clear precedent for the icon button pattern.
