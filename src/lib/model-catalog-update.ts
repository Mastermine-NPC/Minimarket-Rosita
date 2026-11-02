import { modelCatalogProducts, modelCatalogRevision } from "@/data/model-catalog";
import { demoBarcode } from "./operations-init";
import type { RositaState } from "@/types/state";
/** Add new records and normalize legacy public codes without changing canonical foreign keys. */
export function integrateModelCatalog(input: RositaState): RositaState {
  if (input.modelCatalogRevision === modelCatalogRevision) return input;
  const state = { ...input, products: [...input.products], inventory: { ...input.inventory }, modelCatalogRevision };
  const usedBarcodes = new Set(state.products.map(product => product.barcode));
  let barcodeNumber = 70000;
  function freeCode(preferred: string, ownerId?: string) {
    const occupied = (code: string) => state.products.some(product => product.id !== ownerId && (product.id === code || product.code === code));
    let number = Number(preferred.slice(4));
    let code = preferred;
    while (occupied(code)) code = "ROS-" + String(++number).padStart(3, "0");
    return code;
  }
  for (const seed of modelCatalogProducts) {
    const assigned = state.products.find(product => product.modelKey === seed.modelKey);
    if (assigned) {
      // Canonical IDs are foreign keys in immutable order/sale snapshots. Normalize the
      // public commercial code and URL, keeping those historical references intact.
      const legacyCode = /^ROS-3D-/.test(assigned.code || assigned.id);
      if (legacyCode || (seed.featured && assigned.featured === undefined)) state.products = state.products.map(product => product.id === assigned.id ? {
        ...product,
        code: legacyCode ? freeCode(seed.id, assigned.id) : product.code,
        featured: product.featured ?? seed.featured,
      } : product);
      continue;
    }
    const identity = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const equivalent = state.products.find(product => !product.archived && product.category === seed.category && identity(product.name) === identity(seed.name) && identity(product.brand) === identity(seed.brand) && identity(product.presentation) === identity(seed.presentation));
    if (equivalent) {
      state.products = state.products.map(product => product.id === equivalent.id ? { ...product, modelKey: seed.modelKey, ...(product.imageKey === "none" ? { imageKey: "model-" + seed.modelKey } : {}) } : product);
      continue;
    }
    const id = freeCode(seed.id);
    const code = id;
    while (usedBarcodes.has(demoBarcode(barcodeNumber))) barcodeNumber++;
    const barcode = demoBarcode(barcodeNumber++);
    usedBarcodes.add(barcode);
    state.products.push({
      id, code, barcode, featured: seed.featured, modelKey: seed.modelKey, demoCommercialData: true,
      name: seed.name, brand: seed.brand, category: seed.category, subcategory: seed.subcategory,
      presentation: seed.presentation,
      description: `${seed.name}. Presentación interactiva del artículo. Precio y existencias de demostración, configurables en administración; no representan una oferta comercial real.`,
      imageKey: "model-" + seed.modelKey,
      imageNote: "Visualización renderizada del modelo 3D. Precio y stock de prueba, editables en administración.",
      active: true, lowStockThreshold: 5, origin: "seed", createdAt: null, updatedAt: null,
    });
    state.inventory[id] = { priceCents: seed.priceCents, stock: seed.stock };
  }
  return state;
}
