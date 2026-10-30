import { z } from "zod";
import { v8Schema } from "./legacy-v8-schema";
import {
  geoPointSchema,
  deliveryExtras,
  saleSchema,
  shiftSchema,
  cashDraftSchema,
} from "./operations-schema";
export { legacySchema, v2Schema } from "./legacy-v4-schema";
export const stateSchema = v8Schema
  .safeExtend({
    operationsRevision: z.string().optional(),
    storeLocation: geoPointSchema,
    sales: z.array(saleSchema).max(10000),
    shifts: z.array(shiftSchema).max(10000),
    cashDrafts: z.record(z.string(), cashDraftSchema),
    tracking: z.record(
      z.string(),
      z.object({
        progress: z.number().min(0).max(1),
        speed: z.union([
          z.literal(1),
          z.literal(2),
          z.literal(4),
          z.literal(8),
        ]),
      }),
    ),
    users: z
      .array(
        v8Schema.shape.users.element.extend({
          role: z.enum([
            "customer",
            "admin",
            "cashier",
          ]) as typeof v8Schema.shape.users.element.shape.role,
          active: z.boolean().optional(),
          cashierDemo: z.boolean().optional(),
        }),
      )
      .max(1000),
    products: z
      .array(
        v8Schema.shape.products.element.extend({
          barcode: z
            .string()
            .regex(/^[A-Za-z0-9_-]{4,64}$/)
            .optional(),
        }),
      )
      .min(1)
      .max(10000),
    orders: z
      .array(
        v8Schema.shape.orders.element.safeExtend({
          delivery:
            v8Schema.shape.orders.element.shape.delivery.extend(deliveryExtras),
        }),
      )
      .max(10000),
    checkout: v8Schema.shape.checkout.extend({
      delivery: v8Schema.shape.checkout.shape.delivery.extend(deliveryExtras),
    }),
    movements: z
      .array(
        v8Schema.shape.movements.element.safeExtend({
          kind: z.enum([
            "entry",
            "manual-out",
            "count",
            "order-out",
            "sale-out",
          ]) as typeof v8Schema.shape.movements.element.shape.kind,
          saleId: z.string().optional(),
        }),
      )
      .max(100000),
  })
  .superRefine((s, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    const unique = (a: string[]) => new Set(a).size === a.length;
    if (
      !unique(s.products.flatMap((p) => (p.barcode ? [p.barcode] : []))) ||
      !unique(s.sales.map((x) => x.id)) ||
      !unique(s.sales.map((x) => x.requestId)) ||
      !unique(s.shifts.map((x) => x.id))
    )
      fail("Identificadores de operaciones duplicados.");
    if (
      s.shifts.some(
        (x) =>
          !s.users.some((u) => u.id === x.agentId) ||
          (x.closedAt !== null &&
            x.expectedCents !==
              x.initialCents +
                s.sales
                  .filter(
                    (sale) => sale.shiftId === x.id && sale.payment === "cash",
                  )
                  .reduce(
                    (n, sale) =>
                      n + (sale.cashTenderCents || 0) - sale.changeCents,
                    0,
                  )) ||
          (x.closedAt === null
            ? x.countedCents !== null ||
              x.expectedCents !== null ||
              x.differenceCents !== null
            : x.countedCents === null ||
              x.expectedCents === null ||
              x.differenceCents !== x.countedCents - x.expectedCents),
      )
    )
      fail("Turno inconsistente.");
    if (
      !unique(s.shifts.filter((x) => x.closedAt === null).map((x) => x.agentId))
    )
      fail("Solo un turno abierto por agente.");
    for (const sale of s.sales) {
      if (
        !s.users.some((u) => u.id === sale.agentId) ||
        !s.shifts.some(
          (x) => x.id === sale.shiftId && x.agentId === sale.agentId,
        ) ||
        !unique(sale.lines.map((l) => l.productId)) ||
        sale.totalCents !==
          sale.lines.reduce((n, l) => n + l.lineTotalCents, 0) ||
        sale.lines.some(
          (l) =>
            !s.products.some((p) => p.id === l.productId) ||
            l.lineTotalCents !== l.unitPriceCents * l.quantity,
        ) ||
        (sale.payment === "cash"
          ? sale.cashTenderCents === null ||
            sale.cashTenderCents < sale.totalCents ||
            sale.changeCents !== sale.cashTenderCents - sale.totalCents
          : !sale.cardReceipt ||
            sale.cashTenderCents !== null ||
            sale.changeCents !== 0)
      )
        fail("Venta inconsistente.");
      for (const l of sale.lines)
        if (
          s.movements.filter(
            (m) =>
              m.saleId === sale.id &&
              m.productId === l.productId &&
              String(m.kind) === "sale-out" &&
              m.delta === -l.quantity,
          ).length !== 1
        )
          fail("La venta debe tener una salida por producto.");
    }
    if (
      s.movements.some(
        (m) =>
          String(m.kind) === "sale-out" &&
          (!m.saleId ||
            m.delta >= 0 ||
            !s.sales.some((x) => x.id === m.saleId)),
      )
    )
      fail("Salida de caja sin venta.");
    if (
      Object.entries(s.cashDrafts).some(
        ([id, d]) =>
          !s.users.some((u) => u.id === id) ||
          Object.keys(d.cart).some(
            (id) => !s.products.some((p) => p.id === id),
          ),
      ) ||
      Object.keys(s.tracking).some((id) => !s.orders.some((o) => o.id === id))
    )
      fail("Referencias de borradores o seguimiento inválidas.");
    const receipts = [
      ...s.sales.flatMap((x) =>
        x.cardReceipt ? [x.cardReceipt.reference] : [],
      ),
      ...s.orders.flatMap((x) =>
        x.cardReceipt ? [x.cardReceipt.reference] : [],
      ),
    ];
    if (!unique(receipts)) fail("Aprobación de tarjeta reutilizada.");
  });
