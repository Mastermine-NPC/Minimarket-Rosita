import { z } from "zod";
import { products, categories } from "@/data/catalog";
import { productImages } from "@/data/product-images";
const cents = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const text = z.string().max(500);
const delivery = z.object({
  recipient: text,
  phone: text,
  address: text,
  zone: text,
  reference: text,
});
const payment = z.object({
  method: z.enum(["cash", "yape-demo", "plin-demo"]),
  cashAmount: z.string().max(16),
});
const line = z
  .object({
    productId: z.string(),
    name: text,
    presentation: text,
    quantity: z.number().int().min(1).max(1000000),
    unitPriceCents: cents,
    lineTotalCents: cents,
  })
  .refine((l) => l.unitPriceCents * l.quantity === l.lineTotalCents);
const quoteFields = {
  lines: z.array(line).min(1).max(100),
  subtotalCents: cents,
  shippingCents: cents,
  totalCents: cents,
  zoneLabel: text,
  estimate: text,
  cashTenderCents: cents.nullable(),
};
const quote = z.object({ ...quoteFields, fingerprint: z.string().max(100000) });
const order = z
  .object({
    ...quoteFields,
    id: z.string().regex(/^ROS-[A-Za-z0-9-]+$/),
    requestId: z.string().min(1).max(100),
    userId: z.string().min(1),
    createdAt: z.iso.datetime(),
    delivery,
    payment: z.enum(["cash", "yape-demo", "plin-demo"]),
    status: z.number().int().min(0).max(3),
    legacyHistory: z.boolean(),
    customerName: text.nullable(),
    customerEmail: text.nullable(),
    statusHistory: z
      .array(
        z.object({
          id: z.string().min(1),
          from: z.number().int().min(0).max(2).nullable(),
          to: z.number().int().min(0).max(3),
          at: z.iso.datetime(),
          actorId: z.string().min(1),
          actorLabel: text,
          origin: z.enum(["order-created", "client-demo", "admin-demo"]),
        }),
      )
      .max(4),
  })
  .refine(
    (o) =>
      new Set(o.statusHistory.map((e) => e.id)).size ===
        o.statusHistory.length &&
      (o.legacyHistory || o.statusHistory[0]?.origin === "order-created") &&
      (o.statusHistory.length === 0 ||
        o.statusHistory[o.statusHistory.length - 1].to === o.status) &&
      o.statusHistory.every(
        (e, i) =>
          (e.from === null
            ? e.to === 0 && e.origin === "order-created" && i === 0
            : e.to === e.from + 1 && e.origin !== "order-created") &&
          (i === 0 || e.from === o.statusHistory[i - 1].to),
      ) &&
      new Set(o.lines.map((l) => l.productId)).size === o.lines.length &&
      o.lines.reduce((s, l) => s + l.lineTotalCents, 0) === o.subtotalCents &&
      o.totalCents === o.subtotalCents + o.shippingCents &&
      (o.payment !== "cash" ||
        (o.cashTenderCents !== null && o.cashTenderCents >= o.totalCents)),
  );
export const legacySchema = z
  .object({ demoQuantity: z.number().int().min(0).max(products[0].stock) })
  .strict();
export const v2Schema = legacySchema.extend({
  cart: z.record(z.string(), z.number().int().min(1).max(9999)),
});
export const v4Schema = z
  .object({
    products: z
      .array(
        z.object({
          id: z.string().regex(/^[A-Z0-9][A-Z0-9_-]{2,39}$/),
          name: z.string().min(3).max(100),
          brand: z.string().min(2).max(60),
          category: z.enum(categories.map((c) => c.id)),
          presentation: z.string().min(2).max(100),
          description: z.string().min(10).max(500),
          imageKey: z
            .string()
            .refine((v) => productImages.some((i) => i.key === v)),
          active: z.boolean(),
          lowStockThreshold: z.number().int().min(0).max(1000000),
          previousPrice: z.number().positive().optional(),
          featured: z.boolean().optional(),
          origin: z.enum(["seed", "demo"]),
          createdAt: z.iso.datetime().nullable(),
          updatedAt: z.iso.datetime().nullable(),
        }),
      )
      .min(1)
      .max(10000),
    movements: z
      .array(
        z
          .object({
            id: z.string().min(1),
            operationId: z.string().min(1),
            productId: z.string().min(1),
            productName: text,
            kind: z.enum(["entry", "manual-out", "count", "order-out"]),
            delta: z.number().int(),
            before: z.number().int().min(0),
            after: z.number().int().min(0).max(1000000),
            reason: z.string().min(5).max(200),
            at: z.iso.datetime(),
            actorId: z.string().min(1),
            actorLabel: text,
            orderId: z.string().nullable(),
          })
          .refine(
            (m) =>
              m.after - m.before === m.delta &&
              m.delta !== 0 &&
              (m.kind !== "order-out" || (m.delta < 0 && m.orderId !== null)) &&
              (m.kind !== "entry" || m.delta > 0) &&
              (m.kind !== "manual-out" || m.delta < 0),
          ),
      )
      .max(100000),
    recordingSince: z.iso.datetime(),
    processedAdminOperations: z.array(z.string().min(1)).max(100000),
    adminResult: z.object({
      operationId: z.string(),
      ok: z.boolean(),
      error: text,
    }),
    demoQuantity: z.number().int().min(0).max(products[0].stock),
    cart: z.record(z.string(), z.number().int().min(1).max(1000000)),
    users: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          role: z.enum(["customer", "admin"]),
          name: z.string().min(2).max(80),
          email: z
            .email()
            .max(200)
            .refine((v) => v === v.trim().toLowerCase()),
          salt: z.string().regex(/^[a-f0-9]{32}$/),
          verifier: z.string().regex(/^[a-f0-9]{64}$/),
          iterations: z.number().int().min(100000).max(1000000),
          createdAt: z.iso.datetime(),
        }),
      )
      .max(1000),
    sessionUserId: z.string().nullable(),
    inventory: z.record(
      z.string(),
      z.object({
        stock: z.number().int().min(0).max(1000000),
        priceCents: z.number().int().min(0).max(100000000),
      }),
    ),
    orders: z.array(order).max(10000),
    checkout: z.object({
      token: z.string().max(100),
      step: z.number().int().min(0).max(2),
      delivery,
      payment,
      quote: quote.nullable(),
      error: text,
    }),
    authError: text,
  })
  .superRefine((s, ctx) => {
    const ids = new Set(s.users.map((u) => u.id)),
      emails = new Set(s.users.map((u) => u.email));
    if (
      s.users.filter((u) => u.role === "admin").length !== 1 ||
      ids.size !== s.users.length ||
      emails.size !== s.users.length ||
      (s.sessionUserId !== null && !ids.has(s.sessionUserId)) ||
      s.orders.some((o) => !ids.has(o.userId)) ||
      new Set(s.orders.map((o) => o.id)).size !== s.orders.length ||
      new Set(s.orders.map((o) => o.requestId)).size !== s.orders.length ||
      s.products.some((p) => !s.inventory[p.id]) ||
      new Set(s.products.map((p) => p.id)).size !== s.products.length ||
      s.orders.some((o) =>
        o.lines.some((l) => !s.products.some((p) => p.id === l.productId)),
      ) ||
      new Set(s.movements.map((m) => m.id)).size !== s.movements.length ||
      new Set(
        s.movements
          .filter((m) => m.kind === "order-out")
          .map((m) => m.orderId + ":" + m.productId),
      ).size !== s.movements.filter((m) => m.kind === "order-out").length ||
      s.orders.some(
        (o) =>
          !o.legacyHistory &&
          o.lines.some(
            (l) =>
              !s.movements.some(
                (m) =>
                  m.kind === "order-out" &&
                  m.orderId === o.id &&
                  m.productId === l.productId &&
                  m.delta === -l.quantity &&
                  m.operationId === o.requestId,
              ),
          ),
      ) ||
      s.movements.some(
        (m) =>
          !s.products.some((p) => p.id === m.productId) ||
          !ids.has(m.actorId) ||
          (m.orderId !== null && !s.orders.some((o) => o.id === m.orderId)),
      ) ||
      new Set(s.processedAdminOperations).size !==
        s.processedAdminOperations.length ||
      Object.keys(s.inventory).some(
        (id) => !s.products.some((p) => p.id === id),
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "Referencias locales inconsistentes",
      });
  });
