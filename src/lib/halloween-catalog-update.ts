import { halloweenProducts, halloweenRevision } from "@/data/halloween-catalog";
import { articleIdentity } from "./catalog-update";
import { demoBarcode } from "./operations-init";
import type { RositaState } from "@/types/state";
/** Additive, idempotent campaign: existing records, stock, prices and history win. */
export function integrateHalloweenCatalog(input: RositaState): RositaState {
  if (input.halloweenRevision === halloweenRevision) return input;
  const state = { ...input, categories: [...input.categories], subcategories: [...input.subcategories], products: [...input.products], inventory: { ...input.inventory }, halloweenRevision };
  const normalize = (value: string) => value.trim().toLocaleLowerCase("es");
  const occupied = (records: { id: string; slug: string; aliases: string[] }[], value: string) => records.some(record => [record.id, record.slug, ...record.aliases].includes(value));
  function free(records: { id: string; slug: string; aliases: string[] }[], preferred: string) { let id = preferred, n = 1; while (occupied(records, id)) id = preferred + "-" + n++; return id; }
  let category = state.categories.find(item => normalize(item.name) === "halloween");
  if (!category) {
    const id = free(state.categories, "halloween");
    category = { id, slug: id, aliases: [], name: "Halloween", description: "Dulces, calabazas y disfraces para tus planes especiales.", imageProductId: "", tone: "toys", imageKey: "none", active: true, order: Math.max(-1, ...state.categories.map(item => item.order)) + 1 };
    state.categories.push(category);
  }
  const groupIds = new Map<string, string>();
  for (const [preferred, name] of [["halloween-accesorios", "Calabazas y accesorios"], ["halloween-dulces", "Bolsas de dulces"], ["halloween-disfraces", "Disfraces temáticos"]]) {
    let group = state.subcategories.find(item => item.category === category.id && normalize(item.name) === normalize(name));
    if (!group) { const id = free(state.subcategories, preferred); group = { id, slug: id, aliases: [], category: category.id, name, description: name + " de Halloween.", active: true, order: state.subcategories.length }; state.subcategories.push(group); }
    groupIds.set(preferred, group.id);
  }
  for (const seed of halloweenProducts) {
    const identity = { ...seed, brand: "Rosita", category: category.id };
    const existing = state.products.find(item => articleIdentity(item) === articleIdentity(identity));
    if (existing) continue;
    let number = Number(seed.id.slice(4)), id = seed.id;
    while (state.products.some(item => item.id === id || item.code === id)) id = "ROS-" + String(++number).padStart(3,"0");
    let barcodeNumber = 81000 + number;
    while (state.products.some(item => item.barcode === demoBarcode(barcodeNumber))) barcodeNumber++;
    state.products.push({ id, code: id, barcode: demoBarcode(barcodeNumber), category: category.id, subcategory: groupIds.get(seed.subcategory)!, name: seed.name, brand: "Rosita", presentation: seed.presentation,
      description: `${seed.name}. Artículo de campaña con precio e inventario de demostración, editables en administración. Ilustración de referencia; no representa una fotografía ni una oferta comercial real.`, imageKey: "halloween-" + seed.image, imageNote: "Ilustración de referencia de campaña. Datos comerciales de demostración.", active: true, lowStockThreshold: 3, origin: "seed", createdAt: null, updatedAt: null });
    state.inventory[id] = { priceCents: seed.priceCents, stock: seed.stock };
  }
  return state;
}
