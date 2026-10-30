import { z } from "zod";
import { activeUser, isAdmin } from "./admin-operations";
import { priceCart } from "./cart-pricing";
import { withinCoverage } from "@/data/geography";
import { geoPointSchema } from "./operations-schema";
import type { RositaState } from "@/types/state";
import type { OperationsAction, Sale } from "@/types/operations";
export const isStaff = (s: RositaState) => {
  const u = activeUser(s);
  return (
    !!u && u.active !== false && (u.role === "admin" || u.role === "cashier")
  );
};
export const openShift = (s: RositaState) =>
  s.shifts.find((x) => x.agentId === s.sessionUserId && x.closedAt === null);
export function priceCashDraft(s: RositaState) {
  const actor = activeUser(s),
    draft = actor ? s.cashDrafts[actor.id] : undefined;
  const priced = priceCart({ ...s, cart: draft?.cart || {} });
  const lines = priced.lines.map((l) => {
    const p = s.products.find((p) => p.id === l.productId)!;
    return { ...l, code: p.code || p.id, barcode: p.barcode || "" };
  });
  return {
    ...priced,
    lines,
    token: draft?.token || "",
    fingerprint: JSON.stringify({
      actor: actor?.id,
      shift: openShift(s)?.id,
      draft,
      lines,
      inventory: lines.map((l) => s.inventory[l.productId]),
    }),
  };
}
export function expectedCash(s: RositaState, shiftId: string) {
  const shift = s.shifts.find((x) => x.id === shiftId);
  return (
    (shift?.initialCents || 0) +
    s.sales
      .filter((x) => x.shiftId === shiftId && x.payment === "cash")
      .reduce((n, x) => n + (x.cashTenderCents || 0) - x.changeCents, 0)
  );
}
const moneyValid = (n: number) =>
  Number.isSafeInteger(n) && n >= 0 && n <= 1000000000;
export function operationsOperation(
  s: RositaState,
  a: OperationsAction,
): RositaState {
  const actor = activeUser(s);
  if (a.type === "tracking/save") {
    const o = s.orders.find((o) => o.id === a.id);
    if (
      !actor ||
      actor.active === false ||
      !o ||
      (!isAdmin(s) && (actor.role !== "customer" || o.userId !== actor.id)) ||
      !Number.isFinite(a.progress) ||
      a.progress < 0 ||
      a.progress > 1 ||
      ![1, 2, 4, 8].includes(a.speed)
    )
      return s;
    if (
      s.tracking[o.id]?.progress === a.progress &&
      s.tracking[o.id]?.speed === a.speed
    )
      return s;
    return {
      ...s,
      tracking: {
        ...s.tracking,
        [o.id]: { progress: a.progress, speed: a.speed },
      },
    };
  }
  const fail = (error: string): RositaState => ({
    ...s,
    adminResult: {
      operationId:
        ("operationId" in a ? a.operationId : undefined) || "cash-draft",
      ok: false,
      error,
    },
  });
  if (!isStaff(s) || !actor)
    return fail(
      "Esta acción requiere un administrador o agente de caja activo.",
    );
  if (a.type === "cash/cart") {
    if (!openShift(s))
      return fail("Abre un turno antes de registrar productos.");
    const old = s.cashDrafts[actor.id] || {
        token: a.token,
        revision: 0,
        cart: {},
      },
      cart = { ...old.cart };
    if (a.kind === "clear") Object.keys(cart).forEach((id) => delete cart[id]);
    else if (a.kind === "remove") delete cart[a.id];
    else {
      if (!Number.isSafeInteger(a.quantity) || a.quantity < 1)
        return fail("Usa una cantidad entera mayor que cero.");
      cart[a.id] =
        a.kind === "add" ? (cart[a.id] || 0) + a.quantity : a.quantity;
      const candidate = priceCart({ ...s, cart: { [a.id]: cart[a.id] } });
      if (candidate.error) return fail(candidate.error);
    }
    return {
      ...s,
      cashDrafts: {
        ...s.cashDrafts,
        [actor.id]: {
          token: old.token || a.token,
          revision: old.revision + 1,
          cart,
        },
      },
      adminResult: {
        operationId: a.operationId || "cash-draft",
        ok: true,
        error: "",
      },
    };
  }
  if (!a.operationId || !z.iso.datetime().safeParse(a.at).success)
    return fail("Identificador o fecha inválidos.");
  if (s.processedAdminOperations.includes(a.operationId)) return s;
  const ok = (next: RositaState): RositaState => ({
    ...next,
    processedAdminOperations: [...s.processedAdminOperations, a.operationId],
    adminResult: { operationId: a.operationId, ok: true, error: "" },
  });
  if (a.type === "agent/save") {
    if (!isAdmin(s))
      return fail("Solo administración puede gestionar agentes.");
    const u = s.users.find((u) => u.id === a.id),
      email = a.email.trim().toLowerCase();
    if (
      (u && u.role !== "cashier") ||
      !a.id ||
      a.name.trim().length < 2 ||
      a.name.length > 80 ||
      !z.email().max(200).safeParse(email).success ||
      s.users.some((u) => u.email === email && u.id !== a.id) ||
      (!u && !a.credentials)
    )
      return fail("Revisa el nombre, correo único y perfil de caja.");
    if (
      a.credentials &&
      (!/^[a-f0-9]{32}$/.test(a.credentials.salt) ||
        !/^[a-f0-9]{64}$/.test(a.credentials.verifier) ||
        a.credentials.iterations < 100000 ||
        a.credentials.iterations > 1000000)
    )
      return fail("Verificador de acceso inválido.");
    if (
      u &&
      a.active === false &&
      s.shifts.some((x) => x.agentId === u.id && x.closedAt === null)
    )
      return fail("Cierra el turno del agente antes de desactivarlo.");
    const next = {
      ...(u || { id: a.id, createdAt: a.at, role: "cashier" as const }),
      ...a.credentials,
      name: a.name.trim(),
      email,
      active: a.active,
    } as RositaState["users"][number];
    return ok({
      ...s,
      users: u
        ? s.users.map((x) => (x.id === u.id ? next : x))
        : [...s.users, next],
    });
  }
  if (a.type === "store/location") {
    if (
      !isAdmin(s) ||
      !geoPointSchema.safeParse(a.point).success ||
      !withinCoverage(a.point)
    )
      return fail(
        "Selecciona un origen válido dentro del área de demostración.",
      );
    return ok({
      ...s,
      storeLocation: { ...a.point },
      checkout: {
        ...s.checkout,
        quote: null,
        delivery: {
          ...s.checkout.delivery,
          origin: { ...a.point },
          route: undefined,
          pointConfirmed: false,
        },
      },
    });
  }
  if (a.type === "shift/open") {
    if (
      openShift(s) ||
      !moneyValid(a.initialCents) ||
      !a.id ||
      s.shifts.some((x) => x.id === a.id)
    )
      return fail(
        "Revisa el fondo inicial; solo puedes tener un turno abierto.",
      );
    return ok({
      ...s,
      shifts: [
        {
          id: a.id,
          agentId: actor.id,
          agentName: actor.name,
          openedAt: a.at,
          initialCents: a.initialCents,
          closedAt: null,
          countedCents: null,
          expectedCents: null,
          differenceCents: null,
        },
        ...s.shifts,
      ],
    });
  }
  if (a.type === "shift/close") {
    const shift = s.shifts.find((x) => x.id === a.id);
    if (
      !shift ||
      shift.agentId !== actor.id ||
      shift.closedAt !== null ||
      !moneyValid(a.countedCents)
    )
      return fail(
        "No puedes cerrar este turno o el importe contado es inválido.",
      );
    if (Object.keys(s.cashDrafts[actor.id]?.cart || {}).length)
      return fail("Completa o vacía la venta pendiente antes de cerrar.");
    const expected = expectedCash(s, shift.id);
    if (!moneyValid(expected))
      return fail("El efectivo esperado supera el límite de demostración.");
    return ok({
      ...s,
      shifts: s.shifts.map((x) =>
        x.id === shift.id
          ? {
              ...x,
              closedAt: a.at,
              countedCents: a.countedCents,
              expectedCents: expected,
              differenceCents: a.countedCents - expected,
            }
          : x,
      ),
    });
  }
  const shift = openShift(s),
    priced = priceCashDraft(s);
  if (s.sales.some((x) => x.requestId === a.token || x.id === a.id)) return s;
  if (
    !shift ||
    priced.error ||
    !moneyValid(priced.subtotalCents) ||
    !a.token ||
    priced.token !== a.token ||
    priced.fingerprint !== a.fingerprint
  )
    return fail(
      priced.error ||
        "La venta cambió o el turno no está abierto. Revisa y cobra de nuevo.",
    );
  if (
    a.payment === "cash" &&
    (a.cashTenderCents === null ||
      !moneyValid(a.cashTenderCents) ||
      a.cashTenderCents < priced.subtotalCents)
  )
    return fail("El efectivo recibido no cubre el total.");
  const approval = a.cardApproval;
  if (
    a.payment === "card-demo" &&
    (!approval ||
      approval.fingerprint !== a.fingerprint ||
      approval.token !== a.token ||
      approval.userId !== actor.id ||
      approval.brand !== "Demo" ||
      approval.last4 !== "0001" ||
      !/^DEMO-[a-f0-9-]{36}$/.test(approval.reference) ||
      s.sales.some((x) => x.cardReceipt?.reference === approval.reference) ||
      s.orders.some((x) => x.cardReceipt?.reference === approval.reference))
  )
    return fail("Vuelve a simular la tarjeta para esta venta.");
  if (!["cash", "card-demo"].includes(a.payment) || !a.id)
    return fail("Método de pago inválido.");
  const sale: Sale = {
    id: a.id,
    requestId: a.token,
    agentId: actor.id,
    agentName: actor.name,
    shiftId: shift.id,
    createdAt: a.at,
    lines: structuredClone(priced.lines),
    totalCents: priced.subtotalCents,
    payment: a.payment,
    cashTenderCents: a.payment === "cash" ? a.cashTenderCents : null,
    changeCents:
      a.payment === "cash" ? a.cashTenderCents! - priced.subtotalCents : 0,
    ...(a.payment === "card-demo" && approval
      ? {
          cardReceipt: {
            reference: approval.reference,
            brand: approval.brand,
            last4: approval.last4,
          },
        }
      : {}),
  };
  const inventory = { ...s.inventory };
  for (const line of sale.lines)
    inventory[line.productId] = {
      ...inventory[line.productId],
      stock: inventory[line.productId].stock - line.quantity,
    };
  return ok({
    ...s,
    sales: [sale, ...s.sales],
    inventory,
    cashDrafts: {
      ...s.cashDrafts,
      [actor.id]: { token: "", revision: 0, cart: {} },
    },
    movements: [
      ...sale.lines.map((l) => ({
        id: a.operationId + ":" + l.productId,
        operationId: a.operationId,
        productId: l.productId,
        productName: l.name,
        kind: "sale-out" as const,
        delta: -l.quantity,
        before: s.inventory[l.productId].stock,
        after: inventory[l.productId].stock,
        reason: "Venta presencial de demostración",
        at: a.at,
        actorId: actor.id,
        actorLabel: actor.name,
        orderId: null,
        saleId: sale.id,
      })),
      ...s.movements,
    ],
  });
}
