import {
  catalogAdditions,
  additionGroups,
  catalogRevision,
} from "@/data/catalog-additions";
import type { RositaState } from "@/types/state";
import type { CatalogRecord } from "@/types/catalog";
const normalized = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
export const articleIdentity = (
  p: Pick<CatalogRecord, "name" | "brand" | "category" | "presentation">,
) => [p.name, p.brand, p.category, p.presentation].map(normalized).join("|");
/** One-time enrichment. Never changes canonical IDs, inventory of existing records or history. */
export function integrateCatalog(input: RositaState) {
  if (input.catalogRevision === catalogRevision) return input;
  const state = {
    ...input,
    products: input.products.map((p) => ({ ...p, code: p.code || p.id })),
    inventory: { ...input.inventory },
    subcategories: input.subcategories.map((s) => ({ ...s })),
    catalogRevision,
  };
  const groups = new Map<string, string>();
  for (const g of additionGroups) {
    const existing = state.subcategories.find(
      (s) =>
        s.category === g.category &&
        (s.id === g.id || normalized(s.name) === normalized(g.name)),
    );
    if (existing) {
      groups.set(g.id, existing.id);
      continue;
    }
    const used = new Set(
      state.subcategories.flatMap((s) => [s.id, s.slug, ...s.aliases]),
    );
    let id = g.id,
      n = 1;
    while (used.has(id)) id = g.id + "-" + n++;
    state.subcategories.push({
      ...g,
      id,
      slug: id,
      aliases: [],
      active: true,
      order: state.subcategories.length,
      description: "Productos de " + g.name.toLowerCase() + ".",
    });
    groups.set(g.id, id);
  }
  const reserved = new Set(catalogAdditions.map((p) => p.code));
  function freeCode() {
    let n = 63;
    while (
      state.products.some(
        (p) => p.code === "ROS-" + String(n).padStart(3, "0"),
      ) ||
      reserved.has("ROS-" + String(n).padStart(3, "0"))
    )
      n++;
    return "ROS-" + String(n).padStart(3, "0");
  }
  // Only byte-equivalent commercial duplicates are archived; inventory is not summed speculatively.
  const canonical = new Map<string, (typeof state.products)[number]>();
  for (const p of state.products) {
    if (p.archived) continue;
    const key = articleIdentity(p),
      old = canonical.get(key);
    if (
      old &&
      JSON.stringify(state.inventory[old.id]) ===
        JSON.stringify(state.inventory[p.id]) &&
      old.imageKey === p.imageKey
    ) {
      p.archived = true;
      p.active = false;
    } else if (!old) canonical.set(key, p);
  }
  for (const item of catalogAdditions) {
    const exact = state.products.find(
      (p) => !p.archived && articleIdentity(p) === articleIdentity(item),
    );
    for (const other of state.products.filter(
      (p) => p.code === item.code && p.id !== exact?.id,
    ))
      other.code = freeCode();
    if (exact) {
      exact.code = item.code;
      if (!exact.imageKey.startsWith("upload:")) {
        exact.imageKey = "catalog-" + item.code;
        exact.imageNote = item.imageNote;
      }
      continue;
    }
    let id = item.code,
      n = 1;
    while (state.products.some((p) => p.id === id))
      id = item.code + "-IMPORT" + (n++ === 1 ? "" : "-" + (n - 1));
    state.products.push({
      id,
      code: item.code,
      name: item.name,
      brand: item.brand,
      category: item.category,
      subcategory: groups.get(item.subcategory) || item.subcategory,
      presentation: item.presentation,
      description:
        item.name +
        " · " +
        item.brand +
        ". Datos y precio inicial de referencia para el prototipo.",
      imageKey: "catalog-" + item.code,
      active: true,
      lowStockThreshold: 5,
      origin: "seed",
      createdAt: null,
      updatedAt: null,
      ...(item.imageNote ? { imageNote: item.imageNote } : {}),
    });
    state.inventory[id] = { priceCents: item.priceCents, stock: item.stock };
  }
  return state;
}
