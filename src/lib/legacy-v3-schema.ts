import { z } from "zod";
import { products } from "@/data/catalog";
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
  })
  .refine(
    (o) =>
      new Set(o.lines.map((l) => l.productId)).size === o.lines.length &&
      o.lines.every((l) => products.some((p) => p.id === l.productId)) &&
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
export const v3Schema = z
  .object({
    demoQuantity: z.number().int().min(0).max(products[0].stock),
    cart: z.record(z.string(), z.number().int().min(1).max(1000000)),
    users: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
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
      ids.size !== s.users.length ||
      emails.size !== s.users.length ||
      (s.sessionUserId !== null && !ids.has(s.sessionUserId)) ||
      s.orders.some((o) => !ids.has(o.userId)) ||
      new Set(s.orders.map((o) => o.id)).size !== s.orders.length ||
      new Set(s.orders.map((o) => o.requestId)).size !== s.orders.length ||
      products.some((p) => !s.inventory[p.id]) ||
      Object.keys(s.inventory).some((id) => !products.some((p) => p.id === id))
    )
      ctx.addIssue({
        code: "custom",
        message: "Referencias locales inconsistentes",
      });
  });
