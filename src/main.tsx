import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Providers } from "@/app/providers";
import { AppRouter } from "@/app/router";
import "@/styles/globals.css";
import "@/styles/modules.css";
import "@/styles/polish.css";
import "@/styles/rosita-editorial.css";
import "@/styles/product-glass.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </StrictMode>,
);
