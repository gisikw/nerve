import { defineConfig } from "vite";
import elmPlugin from "vite-plugin-elm";
import fakeBackendPlugin from "./vite-plugin-fake";

export default defineConfig({
  plugins: [elmPlugin({ debug: false }), fakeBackendPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
