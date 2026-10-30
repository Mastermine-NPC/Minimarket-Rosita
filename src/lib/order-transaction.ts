import { priceCart, deliveryAmounts } from "./cart-pricing";
import { emptyCheckout } from "@/data/demo";
import {
  deliverySchema,
  paymentProblem,
  paymentSchema,
  solesToCents,
} from "./checkout-validation";
import type { RositaState } from "@/types/state";
import type { CardApproval, Quote } from "@/types/commerce";
export function prepareQuote(state: RositaState): {
  quote: Quote | null;
  error: string;
} {
  const delivery = deliverySchema.safeParse(state.checkout.delivery),
    payment = paymentSchema.safeParse(state.checkout.payment);
  if (!delivery.success)
    return {
      quote: null,
      error: "Revisa los datos de entrega antes de continuar.",
    };
  if (!payment.success)
    return {
      quote: null,
      error: "Selecciona un método de pago de demostración.",
    };
  const priced = priceCart(state);
  if (priced.error) return { quote: null, error: priced.error };
  const { lines, subtotalCents } = priced;
  const inventorySnapshot = lines.map((l) => ({
    id: l.productId,
    ...state.inventory[l.productId],
  }));
  const { zone, shippingCents, totalCents } = deliveryAmounts(
    subtotalCents,
    delivery.data.zone,
  );
  if (!zone || !Number.isSafeInteger(totalCents))
    return { quote: null, error: "Revisa la zona y el importe del pedido." };
  const problem = paymentProblem(payment.data, totalCents);
  if (problem) return { quote: null, error: problem };
  const cashTenderCents =
    payment.data.method === "cash"
      ? solesToCents(payment.data.cashAmount)
      : null;
  const contents = {
    lines,
    subtotalCents,
    shippingCents,
    totalCents,
    zoneLabel: zone.name,
    estimate: zone.estimate,
    cashTenderCents,
  };
  return {
    quote: {
      ...contents,
      fingerprint: JSON.stringify({
        contents,
        inventorySnapshot,
        delivery: delivery.data,
        payment: payment.data,
      }),
    },
    error: "",
  };
}
export function confirmOrder(
  state: RositaState,
  request: {
    token: string;
    id: string;
    createdAt: string;
    cardApproval?: CardApproval | null;
  },
): RositaState {
  if (
    state.orders.some(
      (o) => o.requestId === request.token || o.id === request.id,
    )
  )
    return state;
  const fail = (error: string): RositaState => ({
    ...state,
    checkout: { ...state.checkout, error, quote: null },
  });
  if (
    !state.sessionUserId ||
    !state.users.some(
      (u) =>
        u.id === state.sessionUserId &&
        u.role === "customer" &&
        u.active !== false,
    )
  )
    return fail(
      "Identifícate con una cuenta de demostración antes de confirmar.",
    );
  if (
    !request.token ||
    state.checkout.token !== request.token ||
    state.checkout.step !== 2 ||
    !state.checkout.quote
  )
    return fail("Prepara nuevamente la revisión antes de confirmar.");
  if (
    !/^ROS-[A-Za-z0-9-]+$/.test(request.id) ||
    !Number.isFinite(Date.parse(request.createdAt))
  )
    return fail(
      "No se pudo crear un identificador válido. Vuelve a intentarlo.",
    );
  const current = prepareQuote(state);
  if (!current.quote) return fail(current.error);
  if (current.quote.fingerprint !== state.checkout.quote.fingerprint)
    return fail(
      "Los productos, precios, stock o datos de entrega cambiaron. Actualiza y revisa el resumen antes de volver a confirmar.",
    );
  const approval = request.cardApproval;
  if (
    state.checkout.payment.method === "card-demo" &&
    (!approval ||
      approval.fingerprint !== current.quote.fingerprint ||
      approval.token !== request.token ||
      approval.userId !== state.sessionUserId ||
      approval.brand !== "Demo" ||
      approval.last4 !== "0001" ||
      state.orders.some(
        (o) => o.cardReceipt?.reference === approval.reference,
      ) ||
      state.sales.some(
        (s) => s.cardReceipt?.reference === approval.reference,
      ) ||
      !/^DEMO-[a-f0-9-]{36}$/.test(approval.reference))
  )
    return fail(
      "La aprobación de tarjeta ya no corresponde a esta compra. Vuelve al pago y simula de nuevo.",
    );
  const { fingerprint: _fingerprint, ...snapshot } = current.quote;
  void _fingerprint;
  const inventory = { ...state.inventory };
  for (const line of snapshot.lines)
    inventory[line.productId] = {
      ...inventory[line.productId],
      stock: inventory[line.productId].stock - line.quantity,
    };
  return {
    ...state,
    inventory,
    movements: [
      ...snapshot.lines.map((line) => ({
        id: request.token + ":" + line.productId,
        operationId: request.token,
        productId: line.productId,
        productName: line.name,
        kind: "order-out" as const,
        delta: -line.quantity,
        before: state.inventory[line.productId].stock,
        after: inventory[line.productId].stock,
        reason: "Pedido de demostración confirmado",
        at: request.createdAt,
        actorId: state.sessionUserId!,
        actorLabel: state.users.find((u) => u.id === state.sessionUserId)!.name,
        orderId: request.id,
      })),
      ...state.movements,
    ],
    cart: {},
    checkout: emptyCheckout(),
    orders: [
      {
        ...snapshot,
        id: request.id,
        requestId: request.token,
        userId: state.sessionUserId,
        createdAt: request.createdAt,
        delivery: structuredClone(
          deliverySchema.parse(state.checkout.delivery),
        ),
        payment: state.checkout.payment.method,
        ...(state.checkout.payment.method === "card-demo" && approval
          ? {
              cardReceipt: {
                reference: approval.reference,
                brand: approval.brand,
                last4: approval.last4,
              },
            }
          : {}),
        status: 0,
        legacyHistory: false,
        customerName: state.users.find((u) => u.id === state.sessionUserId)!
          .name,
        customerEmail: state.users.find((u) => u.id === state.sessionUserId)!
          .email,
        statusHistory: [
          {
            id: request.token + ":created",
            from: null,
            to: 0,
            at: request.createdAt,
            actorId: state.sessionUserId!,
            actorLabel: state.users.find((u) => u.id === state.sessionUserId)!
              .name,
            origin: "order-created",
          },
        ],
      },
      ...state.orders,
    ],
  };
}
