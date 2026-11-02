import { createRoot } from "react-dom/client";
import { ProductPresentation } from "../../src/features/product-3d/product-presentation";
import { cocaColaBottle } from "../../src/features/product-3d/product-models";
import "../../src/styles/globals.css";
// Isolated dev harness; never imported by the shop or included in its production routes.
const fixture = {
  ...cocaColaBottle,
  label: "Latas Coca-Cola · prueba técnica, no botella",
  modelUrl: "/images/video/archivos-glb/coca_cola_cans.glb",
  attribution: { author: "Safat_Rules", url: "https://sketchfab.com/3d-models/coca-cola-cans-fe5ba57722a74dba8d19f513e4672e1c", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/" },
};
createRoot(document.getElementById("root")!).render(<main style={{ maxWidth: 800, margin: "24px auto" }}><h1>Prueba técnica · modelo de latas</h1><p>Este recurso no representa la botella de 600 ml ni se publica en su ficha.</p><ProductPresentation config={fixture} brand="Recurso de referencia" presentation="Latas" fallback={<p>Fotografía alternativa de prueba</p>} /></main>);
