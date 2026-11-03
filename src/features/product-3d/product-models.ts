import { laysFlavours } from "@/data/model-catalog";
import type { Product } from "@/types/catalog";
import type { ProductModelConfig } from "./types";
/** The supplied coca_cola_cans.glb is NOT the 600 ml bottle. Never substitute it. */
export const cocaColaBottle: ProductModelConfig = {
  modelUrl: null,
  label: "Botella Coca-Cola de 600 ml",
  fallbackMessage: "Vista fotográfica. El modelo 3D de la botella todavía no está disponible.",
  camera: { position: [0, 0.25, 6.6], fov: 36, minDistance: 3.1, maxDistance: 9, minPolarAngle: 0.3, maxPolarAngle: Math.PI - 0.3 },
  model: { height: 3.2, rotation: [0, -0.15, 0] },
  lighting: { ambient: 1.1, key: 5, rim: 7, exposure: 1.1 },
  background: { color: "#f3f1ed", accent: "#b71925", distortion: 0.055, speed: 0.35, parallax: 0.14 },
  interaction: { rotateSpeed: 0.7, zoomSpeed: 0.65, damping: 0.09 },
  animation: { duration: 1.2, cameraTravel: 1.3, modelTravel: 0.45 },
};

export const productModels: Record<string, ProductModelConfig> = {
  "ROS-001": cocaColaBottle,
  "ROS-022": {
    ...cocaColaBottle, modelUrl: "/models/ball/beach-ball.glb", label: "Pelota infantil", fallbackMessage: "Vista alternativa de la pelota.",
    model: { height: 2.7, rotation: [0.1, -0.4, 0] },
    background: { ...cocaColaBottle.background, color: "#e1ebef", accent: "#4887a1" },
    attribution: { author: "the_ normalgamer", url: "https://poly.pizza/m/4IwPTeOmq6c", license: "CC BY 3.0", licenseUrl: "https://creativecommons.org/licenses/by/3.0/" },
  },
  "ROS-002": {
    ...cocaColaBottle, modelUrl: "/models/lays/classic.glb", label: "Papas Lay’s clásicas", fallbackMessage: "Vista fotográfica de Lay’s clásicas.",
    model: { height: 3.2, rotation: [0, 0, 0] },
    background: { ...cocaColaBottle.background, color: "#f3eccc", accent: "#c89c28" },
    attribution: { author: "NKaap", url: "https://sketchfab.com/3d-models/lays-bags-10-different-flavours-gameready-3b3a1f7654a5447eb25c9845152cfc89", license: "CC BY 4.0 · Classic aislada del conjunto", licenseUrl: "https://creativecommons.org/licenses/by/4.0/" },
  },
};

/** Keys live on the persisted catalog record; imports with a colliding ID retain their mapping. */
export const catalogModelConfigs: Record<string, ProductModelConfig> = {
  "coca-cola-can": {
    ...cocaColaBottle, modelUrl: "/models/coca-cola/can.glb", label: "Coca-Cola en lata", fallbackMessage: "Render 3D de Coca-Cola en lata.",
    model: { height: 3.2, rotation: [0, 0.3, 0], roughness: 0.32, metalness: 0.8 },
    lighting: { ambient: 1.2, fill: 2.2, key: 4, rim: 5, exposure: 1.1 },
    attribution: { author: "Safat_Rules", url: "https://sketchfab.com/3d-models/coca-cola-cans-fe5ba57722a74dba8d19f513e4672e1c", license: "CC BY 4.0 · una lata aislada del conjunto", licenseUrl: "https://creativecommons.org/licenses/by/4.0/" },
  },
  "nivea-aftershave": {
    ...cocaColaBottle, modelUrl: "/images/video/archivos-glb/nivea_aftershave.glb", label: "Nivea Aftershave", fallbackMessage: "Render 3D de Nivea Aftershave.",
    model: { height: 3, rotation: [0, Math.PI, 0] },
    lighting: { ambient: 1, key: 2.5, rim: 3, exposure: 1 },
    background: { ...cocaColaBottle.background, color: "#e5e8ef", accent: "#294d88" },
    attribution: { author: "Qlone", url: "https://sketchfab.com/3d-models/nivea-aftershave-7b3a3b4287264351ab9dcbe5cbb203e2", license: "CC BY-ND 4.0 · archivo original sin modificar", licenseUrl: "https://creativecommons.org/licenses/by-nd/4.0/" },
  },
  "sunsilk-shampoo": {
    ...cocaColaBottle, modelUrl: "/models/sunsilk/bottle.glb", label: "Champú Sunsilk", fallbackMessage: "Render 3D de champú Sunsilk.",
    model: { height: 3.2, rotation: [0, 0, 0] },
    lighting: { ambient: 1, key: 3, rim: 4, exposure: 1 },
    background: { ...cocaColaBottle.background, color: "#f1e4ec", accent: "#bb477e" },
    attribution: { author: "Samer_Arab_S5", url: "https://sketchfab.com/3d-models/sunsilk-shampoo-bottle-405fbff6a52f4958b19702200561901b", license: "CC BY 4.0 · una botella aislada del conjunto", licenseUrl: "https://creativecommons.org/licenses/by/4.0/" },
  },
};

for (const flavour of laysFlavours) catalogModelConfigs["lays-" + flavour.slug] = {
  ...productModels["ROS-002"], modelUrl: `/models/lays/${flavour.slug}.glb`, label: "Papas Lay’s " + flavour.name,
  model: { height: 3.2, rotation: [0, 0, 0] },
  attribution: { ...productModels["ROS-002"].attribution!, license: "CC BY 4.0 · " + flavour.name + " aislada del conjunto" },
};
export function productModelFor(product: Pick<Product, "id" | "modelKey">) {
  return (product.modelKey ? catalogModelConfigs[product.modelKey] : undefined) || productModels[product.id];
}
