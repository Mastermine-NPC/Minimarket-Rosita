import { currentProducts } from "./catalog-state";
import type { RositaState } from "@/types/state";
export function dashboardMetrics(s: RositaState) {
  const active = currentProducts(s).filter((p) => p.active);
  return {
    active: active.length,
    soldOut: active.filter((p) => s.inventory[p.id].stock === 0).length,
    low: active.filter(
      (p) =>
        s.inventory[p.id].stock > 0 &&
        s.inventory[p.id].stock <= (p.lowStockThreshold || 0),
    ).length,
    received: s.orders.length,
    pending: s.orders.filter((o) => o.status < 3).length,
    totalCents: s.orders.reduce((n, o) => n + o.totalCents, 0),
    seed: s.products.filter((p) => p.origin === "seed").length,
    created: s.products.filter((p) => p.origin === "demo").length,
  };
}
