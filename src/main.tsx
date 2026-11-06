import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import Entry from "@/app/root-entry";
import { bootstrapTheme } from "@/design/theme";
await bootstrapTheme();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<p role="status">Cargando…</p>}><Entry /></Suspense>
  </StrictMode>,
);
