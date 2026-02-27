---
id: ner-90b6
status: blocked
deps: []
created: 2026-02-27T12:31:38Z
type: task
priority: 2
---
# Channel sidebar is showing number badge for unreads - should bold for unreads, show numbers only for mentions

## Notes

**2026-02-27 14:39:45 UTC:** ko: FAIL at node 'verify' — node 'verify' failed after 3 attempts: command failed: exit status 127
cd ui && [ -x node_modules/.bin/vitest ] || npm install
cd ui && npx vitest run
sh: line 1: npx: command not found
error: Recipe `test` failed on line 11 with exit code 127


**2026-02-27 15:16:52 UTC:** ko: FAIL at node 'verify' — node 'verify' failed after 3 attempts: command failed: exit status 127
sh: line 1: if [ -f flake.nix ]; then nix develop --command just test; else just test; fi: command not found

