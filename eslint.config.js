import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", ".agents/**", ".taste-skill/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "error",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ["*.{js,ts}", "scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
  {
    files: [
      "docs/verification/*.mjs",
      "docs/editorial-verification/*.mjs",
      "docs/models-integration-verification/*.mjs",
      "docs/normal-catalog-verification/*.mjs",
      "docs/ux-card-verification/*.mjs",
      "docs/sticky-filter-verification/*.mjs",
      "docs/navigation-panel-verification/*.mjs",
      "docs/catalog-responsive-verification/*.mjs",
      "docs/tracking-experience-verification/*.mjs",
      "docs/dark-night-map-verification/*.mjs",
      "docs/order-flow-verification/*.mjs",
      "docs/liquid-video-verification/*.mjs",
      "docs/global-liquid-verification/*.mjs",
      "docs/intro-liquid-verification/*.mjs",
      "docs/category-tilt-verification/*.mjs",
      "docs/category-liquid-glass-verification/*.mjs",
      "docs/catalog-checkout-verification/*.mjs",
      "docs/halloween-verification/*.mjs",
      "docs/cinematic-verification/*.mjs",
      "docs/global-cinema-verification/*.mjs",
      "docs/product-3d-verification/*.mjs",
      "docs/commerce-verification/*.mjs",
      "docs/order-verification/*.mjs",
      "docs/admin-verification/*.mjs",
      "docs/home-verification/**/*.mjs",
      "docs/zoom-verification/**/*.mjs",
      "docs/subcategory-verification/**/*.mjs",
      "docs/module-verification/**/*.mjs",
      "docs/polish-verification/**/*.mjs",
      "docs/catalog-verification/**/*.mjs",
    ],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ["src/components/ui/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
);
