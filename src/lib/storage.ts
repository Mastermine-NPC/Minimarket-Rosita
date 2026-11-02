import { integrateModelCatalog } from "./model-catalog-update";
import { initializeOperations } from "./operations-init";
import { v8Schema } from "./legacy-v8-schema";
import { products as legacyCatalogProducts } from "@/data/catalog";
import { integrateCatalog } from "./catalog-update";
import { v7Schema } from "./legacy-v7-schema";
import { v6Schema } from "./legacy-v6-schema";
import { v5Schema } from "./legacy-v5-schema";
import { seedCategories, seedSubcategories } from "@/data/taxonomy-seed";
import { withDemoClient } from "@/data/client-seed";
import { v4Schema } from "./legacy-v4-schema";
import { inferSubcategory } from "@/data/subcategories";
import { v3Schema } from "./legacy-v3-schema";
import { withDemoAdmin } from "@/data/admin-seed";
import { initialState, emptyCheckout } from "@/data/demo";
import { legacySchema, v2Schema, stateSchema } from "./state-schema";
import type { RositaState } from "@/types/state";
export const STORAGE_PREFIX = "minimarket-rosita:";
export const STATE_KEY = STORAGE_PREFIX + "app";
export const STORAGE_VERSION = 9;
export interface StoredState {
  data: RositaState;
  status:
    | "empty"
    | "loaded"
    | "migrated"
    | "repaired"
    | "invalid"
    | "future"
    | "unavailable";
  notice: string;
}
function empty(): RositaState {
  return {
    ...initialState,
    cart: {},
    users: initialState.users.map((u) => ({ ...u })),
    products: initialState.products.map((p) => ({ ...p })),
    inventory: Object.fromEntries(
      Object.entries(initialState.inventory).map(([id, v]) => [id, { ...v }]),
    ),
    movements: [],
    processedAdminOperations: [],
    recordingSince: new Date().toISOString(),
    adminResult: { operationId: "", ok: false, error: "" },
    orders: [],
    checkout: emptyCheckout(),
  };
}
function target(storage?: Storage) {
  return storage || window.localStorage;
}
export function readRositaState(storage?: Storage): StoredState {
  try {
    const raw = target(storage).getItem(STATE_KEY);
    if (raw === null) return { data: empty(), status: "empty", notice: "" };
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== "object" ||
      value === null ||
      !("version" in value) ||
      !("data" in value)
    )
      throw new SyntaxError();
    if (typeof value.version === "number" && value.version > STORAGE_VERSION)
      return {
        data: empty(),
        status: "future",
        notice:
          "Hay datos de una versión más reciente. Esta sesión es temporal y no los sobrescribirá; restablece Rosita para guardar de nuevo.",
      };
    let data: RositaState,
      migrated = false;
    if (value.version === 1) {
      const old = legacySchema.parse(value.data);
      data = { ...empty(), demoQuantity: old.demoQuantity };
      migrated = true;
    } else if (value.version === 2) {
      const old = v2Schema.parse(value.data);
      data = { ...empty(), ...old };
      migrated = true;
    } else if (value.version === 3) {
      const old = v3Schema.parse(value.data);
      data = {
        ...empty(),
        ...old,
        catalogRevision: undefined,
        products: initialState.products.filter((p) =>
          legacyCatalogProducts.some((old) => old.id === p.id),
        ),
        users: withDemoAdmin(
          old.users.map((u) => ({ ...u, role: "customer" })),
        ),
        orders: old.orders.map((o) => ({
          ...o,
          statusHistory: [],
          legacyHistory: true,
          customerName: null,
          customerEmail: null,
        })),
      };
      migrated = true;
    } else if (value.version === 4) {
      const old = v4Schema.parse(value.data);
      data = {
        ...empty(),
        ...old,
        categories: seedCategories,
        subcategories: seedSubcategories,
        media: {},
        products: old.products.map((product) => ({
          ...product,
          subcategory: inferSubcategory(product),
        })),
      };
      data = { ...empty(), ...v8Schema.parse(data) };
      migrated = true;
    } else if (value.version === 5) {
      const old = v5Schema.parse(value.data);
      data = {
        ...empty(),
        ...old,
        categories: seedCategories,
        subcategories: seedSubcategories,
        media: {},
      };
      migrated = true;
    } else if (value.version === 6) {
      data = { ...empty(), ...v8Schema.parse(v6Schema.parse(value.data)) };
      migrated = true;
    } else if (value.version === 7) {
      data = { ...empty(), ...v7Schema.parse(value.data) };
      migrated = true;
    } else if (value.version === 8) {
      data = { ...empty(), ...v8Schema.parse(value.data) };
      migrated = true;
    } else if (value.version === 9) data = stateSchema.parse(value.data);
    else throw new SyntaxError();
    if (value.version < 6)
      data = { ...data, users: withDemoClient(data.users) };
    if (value.version < 8) data = integrateCatalog(data);
    if (value.version < 9) data = initializeOperations(data);
    const enriched = integrateModelCatalog(data);
    if (enriched !== data) { data = enriched; migrated = true; }
    data = stateSchema.parse(data);
    const cart = Object.fromEntries(
      Object.entries(data.cart).flatMap(([id, n]) => {
        const stock = data.inventory[id]?.stock ?? 0;
        return stock > 0 ? [[id, Math.min(n, stock)]] : [];
      }),
    );
    const repaired = JSON.stringify(cart) !== JSON.stringify(data.cart);
    data = {
      ...data,
      cart,
      authError: "",
      checkout: repaired
        ? {
            ...data.checkout,
            quote: null,
            error: "Revisa el carrito ajustado al stock disponible.",
          }
        : data.checkout,
    };
    return {
      data,
      status: migrated ? "migrated" : repaired ? "repaired" : "loaded",
      notice: migrated && value.version === 9
        ? "Añadimos productos 3D de demostración; conservamos precios, existencias y pedidos anteriores."
        : migrated
        ? "Datos migrados: conservamos catálogo, precios, stock e historial; añadimos entrega, recojo y caja de demostración."
        : repaired
          ? "Ajustamos el carrito al stock disponible. Revisa las cantidades."
          : "",
    };
  } catch (error) {
    const blocked =
      !(error instanceof SyntaxError) &&
      !(error instanceof Error && error.name === "ZodError");
    return {
      data: empty(),
      status: blocked ? "unavailable" : "invalid",
      notice: blocked
        ? "Almacenamiento bloqueado: continúas en una sesión temporal. Cuentas, pedidos y cambios podrían perderse al recargar."
        : "No se pudo leer el contenido guardado de Rosita. Se inició una sesión temporal vacía; los datos originales se conservan hasta que realices un cambio o restablezcas Rosita.",
    };
  }
}
export function writeRositaState(
  state: RositaState,
  storage?: Storage,
): { ok: boolean; message?: string } {
  try {
    const data = stateSchema.parse(state);
    target(storage).setItem(
      STATE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, data }),
    );
    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "No se pudieron guardar los cambios. Continúas en una sesión temporal; cuentas, pedidos e inventario podrían perderse al recargar.",
    };
  }
}
export function resetRositaStorage(storage?: Storage): {
  ok: boolean;
  message?: string;
} {
  try {
    const store = target(storage);
    const keys = Array.from({ length: store.length }, (_, i) =>
      store.key(i),
    ).filter((k): k is string => k !== null && k.startsWith(STORAGE_PREFIX));
    for (const key of keys) store.removeItem(key);
    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "Solo se restableció la sesión temporal. El navegador no permite modificar el almacenamiento local.",
    };
  }
}
