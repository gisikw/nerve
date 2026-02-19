import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import fakeBackendPlugin from "./vite-plugin-fake";
import gitPullPlugin from "./vite-plugin-git-pull";

export default defineConfig({
  plugins: [svelte(), fakeBackendPlugin(), gitPullPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
