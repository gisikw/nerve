import { defineConfig } from "vite";
import elmPlugin from "vite-plugin-elm";
import fakeBackendPlugin from "./vite-plugin-fake";
import gitPullPlugin from "./vite-plugin-git-pull";

export default defineConfig({
  plugins: [elmPlugin({ debug: false }), fakeBackendPlugin(), gitPullPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
