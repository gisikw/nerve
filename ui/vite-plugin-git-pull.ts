// Vite plugin: auto-pull from git remote.
//
// In dev mode, periodically fetches from the git remote and fast-forward
// merges if new commits are available. Vite's file watcher handles the
// actual reload — this plugin just keeps the working tree up to date.
//
// Enabled by setting NERVE_GIT_PULL=1 (or any truthy value).

import type { Plugin } from "vite";
import { execSync } from "child_process";
import { resolve } from "path";

const POLL_INTERVAL_MS = 5_000;

function git(cmd: string, cwd: string): string {
  return execSync(`git ${cmd}`, { cwd, encoding: "utf-8" }).trim();
}

export default function gitPullPlugin(): Plugin {
  let timer: ReturnType<typeof setInterval> | null = null;

  return {
    name: "nerve-git-pull",
    apply: "serve",

    configureServer(server) {
      if (!process.env.NERVE_GIT_PULL) return;

      const root = resolve(server.config.root, "..");

      // Verify we're in a git repo with a remote
      try {
        git("rev-parse --git-dir", root);
        git("remote get-url origin", root);
      } catch {
        console.warn("[git-pull] Not a git repo with remote — disabled");
        return;
      }

      console.log(`[git-pull] Watching for remote changes every ${POLL_INTERVAL_MS / 1000}s`);

      let lastHead = git("rev-parse HEAD", root);

      timer = setInterval(() => {
        try {
          git("fetch --quiet", root);
          const localHead = git("rev-parse HEAD", root);
          const remoteHead = git("rev-parse @{u}", root);

          if (localHead === remoteHead) return;

          // Check if fast-forward is possible
          const mergeBase = git(`merge-base ${localHead} ${remoteHead}`, root);
          if (mergeBase !== localHead) {
            console.warn("[git-pull] Remote has diverged — skipping (manual merge needed)");
            return;
          }

          console.log(`[git-pull] New commits detected, pulling...`);
          git("merge --ff-only @{u}", root);

          const newHead = git("rev-parse --short HEAD", root);
          console.log(`[git-pull] Updated to ${newHead}`);
        } catch (err) {
          // Silent failure on fetch errors (network issues, etc.)
        }
      }, POLL_INTERVAL_MS);
    },

    closeBundle() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
  };
}
