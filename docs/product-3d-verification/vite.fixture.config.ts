import { defineConfig, mergeConfig } from "vite";
import { fileURLToPath } from "node:url";
import base from "../../vite.config.ts";
export default mergeConfig(base, defineConfig({ build: {
  outDir: "/tmp/rosita-product-3d-fixture",
  emptyOutDir: true,
  rolldownOptions: { input: fileURLToPath(new URL("./fixture.html", import.meta.url)) },
} }));
