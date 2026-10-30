import { taxonomyPair } from "./taxonomy";
import type { RositaAction, RositaState } from "@/types/state";
import { productInputSchema, isValidAt } from "./admin-validation";
export const activeUser = (s: RositaState) =>
  s.users.find((u) => u.id === s.sessionUserId);
export const isAdmin = (s: RositaState) => activeUser(s)?.role === "admin";
export function adminOperation(
  state: RositaState,
  action: Extract<
    RositaAction,
    { type: "admin/product-save" | "admin/product-active" | "admin/stock" }
  >,
): RositaState {
  const fail = (error: string) => ({
    ...state,
    adminResult: { operationId: action.operationId, ok: false, error },
  });
  if (!isAdmin(state))
    return fail(
      "Solo el administrador de demostración puede realizar esta acción.",
    );
  if (state.processedAdminOperations.includes(action.operationId)) return state;
  if (!action.operationId || !isValidAt(action.at))
    return fail("La operación necesita un identificador y una fecha válidos.");
  const actor = activeUser(state)!,
    ok = (next: RositaState): RositaState => ({
      ...next,
      processedAdminOperations: [
        ...state.processedAdminOperations,
        action.operationId,
      ],
      adminResult: { operationId: action.operationId, ok: true, error: "" },
    });
  if (action.type === "admin/stock") {
    const p = state.products.find((p) => p.id === action.id),
      item = state.inventory[action.id];
    if (!p || !item)
      return fail("El producto ya no está disponible para ajustar.");
    if (item.stock !== action.expectedStock)
      return fail(
        "El stock cambió mientras editabas. Cierra y abre el ajuste para revisar el valor actual.",
      );
    if (
      !["entry", "manual-out", "count"].includes(action.kind) ||
      !Number.isSafeInteger(action.quantity) ||
      action.quantity < 0 ||
      action.quantity > 1000000 ||
      !action.reason.trim() ||
      action.reason.trim().length < 5 ||
      action.reason.length > 200
    )
      return fail(
        "Indica una cantidad entera válida y un motivo de 5–200 caracteres.",
      );
    if (action.kind !== "count" && action.quantity === 0)
      return fail("La entrada o salida debe ser mayor que cero.");
    const after =
      action.kind === "count"
        ? action.quantity
        : item.stock + (action.kind === "entry" ? 1 : -1) * action.quantity;
    if (after < 0 || after > 1000000)
      return fail("El ajuste dejaría existencias fuera del rango 0–1 000 000.");
    if (after === item.stock)
      return fail(
        "El conteo no cambia el stock. No se registra un movimiento sin diferencia.",
      );
    return ok({
      ...state,
      inventory: { ...state.inventory, [p.id]: { ...item, stock: after } },
      movements: [
        {
          id: action.operationId,
          operationId: action.operationId,
          productId: p.id,
          productName: p.name,
          kind: action.kind,
          delta: after - item.stock,
          before: item.stock,
          after,
          reason: action.reason.trim(),
          at: action.at,
          actorId: actor.id,
          actorLabel: actor.name,
          orderId: null,
        },
        ...state.movements,
      ],
    });
  }
  if (action.type === "admin/product-active") {
    const p = state.products.find((p) => p.id === action.id);
    if (!p) return fail("No encontramos el producto.");
    if (p.updatedAt !== action.expectedUpdatedAt)
      return fail("El producto cambió. Vuelve a abrirlo antes de guardar.");
    if (p.active === action.active)
      return fail("El producto ya tiene ese estado.");
    return ok({
      ...state,
      products: state.products.map((p) =>
        p.id === action.id
          ? { ...p, active: action.active, updatedAt: action.at }
          : p,
      ),
    });
  }
  const parsed = productInputSchema.safeParse(action.input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  if (!taxonomyPair(state, parsed.data.category, parsed.data.subcategory))
    return fail("Selecciona una subcategoría de la categoría elegida.");
  if (
    parsed.data.imageKey.startsWith("upload:") &&
    !state.media[parsed.data.imageKey.slice(7)]
  )
    return fail("La imagen no está preparada. Vuelve a subirla.");
  const v = parsed.data,
    p = state.products.find((p) => p.id === v.id);
  if (action.editing && !p)
    return fail("No encontramos el producto que editabas.");
  if (!action.editing && p)
    return fail("Ese identificador ya existe. Elige otro código.");
  if (p && p.updatedAt !== action.expectedUpdatedAt)
    return fail(
      "El producto cambió. Cierra y abre la edición antes de guardar.",
    );
  if (
    state.products.some(
      (other) =>
        other.id !== v.id &&
        other.name.trim().toLocaleLowerCase("es") ===
          v.name.toLocaleLowerCase("es") &&
        other.brand.toLocaleLowerCase("es") ===
          v.brand.toLocaleLowerCase("es") &&
        other.presentation.toLocaleLowerCase("es") ===
          v.presentation.toLocaleLowerCase("es"),
    )
  )
    return fail(
      "Ya existe un producto con el mismo nombre, marca y presentación.",
    );
  const product = {
    id: v.id,
    name: v.name,
    brand: v.brand,
    category: v.category as RositaState["products"][number]["category"],
    subcategory: v.subcategory,
    description: v.description,
    presentation: v.presentation,
    imageKey: v.imageKey,
    active: v.active,
    lowStockThreshold: v.lowStockThreshold,
    origin: p?.origin || ("demo" as const),
    createdAt: p?.createdAt || (!p ? action.at : null),
    updatedAt: action.at,
    previousPrice: p?.previousPrice,
    featured: p?.featured,
  };
  const movements =
    !p && v.initialStock > 0
      ? [
          {
            id: action.operationId,
            operationId: action.operationId,
            productId: v.id,
            productName: v.name,
            kind: "entry" as const,
            delta: v.initialStock,
            before: 0,
            after: v.initialStock,
            reason: "Stock inicial de producto nuevo",
            at: action.at,
            actorId: actor.id,
            actorLabel: actor.name,
            orderId: null,
          },
          ...state.movements,
        ]
      : state.movements;
  return ok({
    ...state,
    products: p
      ? state.products.map((old) => (old.id === v.id ? product : old))
      : [...state.products, product],
    inventory: {
      ...state.inventory,
      [v.id]: {
        stock: p ? state.inventory[v.id].stock : v.initialStock,
        priceCents: v.priceCents,
      },
    },
    movements,
  });
}
export function advanceOrder(
  state: RositaState,
  action: Extract<RositaAction, { type: "order/advance" }>,
): RositaState {
  const actor = activeUser(state),
    order = state.orders.find((o) => o.id === action.id);
  const fail = (error: string) => ({
    ...state,
    adminResult: { operationId: action.operationId || "", ok: false, error },
  });
  if (!actor || !order || (!isAdmin(state) && actor.id !== order.userId))
    return fail("Tu perfil no puede modificar este pedido.");
  if (state.processedAdminOperations.includes(action.operationId)) return state;
  if (
    !action.operationId ||
    !isValidAt(action.at) ||
    order.status !== action.expectedStatus ||
    order.status >= 3
  )
    return fail(
      "El estado cambió o la simulación terminó. Revisa el pedido antes de continuar.",
    );
  return {
    ...state,
    orders: state.orders.map((o) =>
      o.id === order.id
        ? {
            ...o,
            status: o.status + 1,
            statusHistory: [
              ...o.statusHistory,
              {
                id: action.operationId,
                from: o.status,
                to: o.status + 1,
                at: action.at,
                actorId: actor.id,
                actorLabel: actor.name,
                origin: actor.role === "admin" ? "admin-demo" : "client-demo",
              },
            ],
          }
        : o,
    ),
    processedAdminOperations: [
      ...state.processedAdminOperations,
      action.operationId,
    ],
    adminResult: { operationId: action.operationId, ok: true, error: "" },
  };
}
