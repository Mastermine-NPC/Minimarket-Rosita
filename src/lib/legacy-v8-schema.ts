import { z } from "zod";
import { v4Schema } from "./legacy-v4-schema";
import { productImages } from "@/data/product-images";
export { legacySchema, v2Schema } from "./legacy-v4-schema";
const id = z.string().regex(/^[a-z0-9][a-z0-9-]{1,79}$/);
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(80);
const common = {
  id,
  name: z.string().min(2).max(70),
  slug,
  aliases: z.array(slug).max(100),
  description: z.string().max(500),
  active: z.boolean(),
  order: z.number().int().min(0).max(9999),
};
export const v8Schema = v4Schema
  .safeExtend({
    catalogRevision: z.string().max(100).optional(),
    // Widen only the payment enum; safeExtend retains all legacy order invariants.
    orders: z
      .array(
        v4Schema.shape.orders.element.safeExtend({
          payment: z.enum([
            "cash",
            "yape-demo",
            "plin-demo",
            "card-demo",
          ]) as typeof v4Schema.shape.orders.element.shape.payment,
          cardReceipt: z
            .object({
              reference: z.string().regex(/^DEMO-[a-f0-9-]{36}$/),
              brand: z.literal("Demo"),
              last4: z.literal("0001"),
            })
            .strict()
            .optional(),
        }),
      )
      .max(10000),
    checkout: v4Schema.shape.checkout.extend({
      payment: z.object({
        method: z.enum([
          "cash",
          "yape-demo",
          "plin-demo",
          "card-demo",
        ]) as typeof v4Schema.shape.checkout.shape.payment.shape.method,
        cashAmount: z.string().max(16),
      }),
    }),
    categories: z
      .array(
        z.object({
          ...common,
          imageProductId: z.string(),
          tone: z.string().max(20),
          imageKey: z.string(),
        }),
      )
      .min(1)
      .max(200),
    subcategories: z
      .array(
        z.object({
          ...common,
          category: z.string(),
          pending: z.boolean().optional(),
        }),
      )
      .min(1)
      .max(2000),
    media: z.record(
      z.string(),
      z.object({
        id: z.string().uuid(),
        width: z.number().int().min(1).max(1600),
        height: z.number().int().min(1).max(1600),
        bytes: z.number().int().min(1).max(1250000),
        mime: z.enum(["image/webp", "image/jpeg", "image/png"]),
        createdAt: z.iso.datetime(),
      }),
    ),
    users: z
      .array(
        v4Schema.shape.users.element.extend({
          demoAccess: z.boolean().optional(),
        }),
      )
      .max(1000),
    products: z
      .array(
        v4Schema.shape.products.element.extend({
          category: z.string(),
          subcategory: z.string(),
          code: z
            .string()
            .regex(/^[A-Z0-9][A-Z0-9_-]{2,39}$/)
            .optional(),
          archived: z.boolean().optional(),
          imageNote: z.string().max(300).optional(),
          imageKey: z.string(),
        }),
      )
      .min(1)
      .max(10000),
  })
  .superRefine((s, ctx) => {
    const unique = (
      items: { id: string; slug: string; aliases: string[]; name: string }[],
    ) =>
      new Set(items.map((x) => x.id)).size === items.length &&
      new Set(items.map((x) => x.name.trim().toLocaleLowerCase("es"))).size ===
        items.length &&
      new Set(items.flatMap((x) => [...new Set([x.id, x.slug, ...x.aliases])]))
        .size ===
        items.reduce(
          (n, x) => n + new Set([x.id, x.slug, ...x.aliases]).size,
          0,
        );
    const validImage = (key: string) =>
      productImages.some((i) => i.key === key) ||
      (key.startsWith("upload:") && !!s.media[key.slice(7)]);
    if (
      s.orders.some(
        (o) => String(o.payment) === "card-demo" && !o.cardReceipt,
      ) ||
      new Set(s.products.map((p) => p.code || p.id)).size !==
        s.products.length ||
      !unique(s.categories) ||
      new Set(s.subcategories.map((x) => x.id)).size !==
        s.subcategories.length ||
      Object.keys(s.media).length > 1000 ||
      Object.entries(s.media).some(([id, m]) => id !== m.id) ||
      s.categories.some((c) => !validImage(c.imageKey)) ||
      s.subcategories.some(
        (x) => !s.categories.some((c) => c.id === x.category),
      ) ||
      s.categories.some(
        (c) => !unique(s.subcategories.filter((x) => x.category === c.id)),
      ) ||
      s.products.some(
        (p) =>
          !s.categories.some((c) => c.id === p.category) ||
          !s.subcategories.some(
            (x) => x.id === p.subcategory && x.category === p.category,
          ) ||
          !validImage(p.imageKey),
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "Taxonomía o referencias de imagen inconsistentes.",
      });
  });
