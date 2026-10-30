import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "validation", test: /node_modules[\\/]zod[\\/]/ },
            {
              name: "motion-runtime",
              test: /node_modules[\\/](?:motion|framer-motion|motion-dom|motion-utils)[\\/]/,
            },
            {
              name: "state-model",
              test: /[\\/]src[\\/](?:data[\\/]|lib[\\/](?:state-schema|legacy-v[345]-schema|admin-validation|admin-operations|module-operations)\.ts)/,
            },
          ],
        },
      },
    },
  },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
