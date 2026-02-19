---
id: ner-35da
status: closed
deps: [ner-be48]
links: []
created: 2026-02-19T04:01:12Z
type: task
priority: 2
---
# Scaffold Svelte + Vite + TypeScript frontend alongside existing Elm

## Scope

Set up the Svelte project structure alongside the existing Elm code so
both can build. This is scaffolding only — no feature porting yet.

## Deliverables

- `ui/` gets Svelte + Vite + TypeScript config (`svelte.config.js`,
  updated `vite.config.js`, `tsconfig.json` adjustments)
- `ui/src/App.svelte` — minimal shell with placeholder
- `ui/src/lib/tauri.ts` — typed wrapper around `@tauri-apps/api` for
  commands and event subscriptions (replaces the Elm port bridge)
- `ui/src/lib/stores/` — Svelte stores for rooms, messages, typing, etc.
  Wired to Tauri push events from ner-be48
- Vite builds the Svelte app. Tauri loads it. Login screen renders.
- Elm source stays in tree but is no longer the build target
- Update INVARIANTS.md with Svelte conventions

## Key decisions

- Svelte 5 with runes (`$state`, `$derived`, `$effect`) — not Svelte 4
  stores syntax. Runes are the future and the reactivity model is cleaner.
- No SvelteKit. No router. Single-page app, Vite as build tool.
- CSS: keep existing design language (variables, base.css). Components
  use `<style>` blocks with scoped CSS.
- The fake backend adapts to work without Elm ports — Svelte calls the
  same fetch-based fake invoke directly.
