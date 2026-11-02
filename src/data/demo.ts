import { integrateModelCatalog } from "@/lib/model-catalog-update";
import { initializeOperations } from "@/lib/operations-init";
import { storeOrigin } from "./geography";
import { integrateCatalog } from "@/lib/catalog-update";
import { seedCategories, seedSubcategories } from "./taxonomy-seed";
import { withDemoClient } from "./client-seed";
import { withDemoAdmin } from "./admin-seed";
import { defaultImageKey } from "./product-images";
import type { RositaState } from "@/types/state";
import { products, categories as catalogCategories } from "./catalog";
export const demoProduct = { ...products[0], unit: products[0].presentation };
export const emptyCheckout = (): RositaState["checkout"] => ({
  token: "",
  step: 0,
  delivery: {
    mode: "delivery",
    recipient: "",
    phone: "",
    address: "",
    zone: "",
    reference: "",
  },
  payment: { method: "cash", cashAmount: "" },
  quote: null,
  error: "",
});
const baseState: RositaState = {
  storeLocation: storeOrigin,
  cashDrafts: {},
  sales: [],
  shifts: [],
  tracking: {},
  categories: seedCategories,
  subcategories: seedSubcategories,
  media: {},
  demoQuantity: 0,
  cart: {},
  products: products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    subcategory: p.subcategory,
    presentation: p.presentation,
    description: p.description,
    imageKey: defaultImageKey(p.id, p.imageIndex),
    active: true,
    lowStockThreshold: 5,
    previousPrice: p.previousPrice,
    featured: p.featured,
    origin: "seed",
    createdAt: null,
    updatedAt: null,
  })),
  users: withDemoClient(withDemoAdmin([])),
  movements: [],
  recordingSince: new Date().toISOString(),
  processedAdminOperations: [],
  adminResult: { operationId: "", ok: false, error: "" },
  sessionUserId: null,
  inventory: Object.fromEntries(
    products.map((p) => [
      p.id,
      { stock: p.stock, priceCents: Math.round(p.price * 100) },
    ]),
  ),
  orders: [],
  checkout: emptyCheckout(),
  authError: "",
};
export const initialState: RositaState = initializeOperations(
  integrateModelCatalog(integrateCatalog(baseState)),
);
export const categories = catalogCategories.map((category) => category.name);
