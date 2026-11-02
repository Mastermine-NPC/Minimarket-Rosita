import type { Product } from "@/types/catalog";
export const sortOptions = [
  ["relevancia", "Destacados"],
  ["precio-asc", "Menor precio"],
  ["precio-desc", "Mayor precio"],
  ["nombre", "Nombre: A a Z"],
] as const;
export function normalizeText(value: string) {
  return value
    .replace(/[’']/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-PE");
}
export function getFilters(params: URLSearchParams) {
  const raw = Number(params.get("max") || Number.MAX_SAFE_INTEGER);
  return {
    query: params.get("q") || "",
    subcategory: params.get("subcategoria") || "",
    brand: params.get("marca") || "",
    max: Number.isFinite(raw)
      ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, raw))
      : Number.MAX_SAFE_INTEGER,
    inStock: params.get("disponibles") === "1",
    offers: params.get("ofertas") === "1",
    sort: sortOptions.some(([value]) => value === params.get("orden"))
      ? params.get("orden")!
      : "relevancia",
  };
}
export function filterProducts(
  products: readonly Product[],
  params: URLSearchParams,
  category?: string,
) {
  const f = getFilters(params);
  return products
    .filter(
      (p) =>
        p.active !== false &&
        (!category || p.category === category) &&
        (!f.subcategory || p.subcategory === f.subcategory) &&
        (!f.query ||
          normalizeText(
            (p.code || p.id) + " " + p.name + " " + p.brand,
          ).includes(normalizeText(f.query))) &&
        (!f.brand || p.brand === f.brand) &&
        p.price <= f.max &&
        (!f.inStock || p.stock > 0) &&
        (!f.offers || !!p.previousPrice),
    )
    .sort((a, b) =>
      f.sort === "precio-asc"
        ? a.price - b.price
        : f.sort === "precio-desc"
          ? b.price - a.price
          : f.sort === "nombre"
            ? a.name.localeCompare(b.name, "es")
            : Number(!!b.featured) - Number(!!a.featured) || a.name.localeCompare(b.name, "es"),
    );
}
export function safeReturnPath(raw: string | null) {
  return raw && /^\/(?:catalogo|categoria\/[a-z-]+)(?:\?|$)/.test(raw)
    ? raw
    : "/catalogo";
}
