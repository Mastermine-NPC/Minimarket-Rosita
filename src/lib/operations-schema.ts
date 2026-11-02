import { z } from "zod";
export const geoPointSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  label: z.string().max(200),
  source: z.string().max(500),
});
const coord = z.tuple([
  z.number().finite().min(-180).max(180),
  z.number().finite().min(-90).max(90),
]);
export const roadRouteSchema = z.object({
  coordinates: z.array(coord).min(2).max(5000),
  distance: z.number().positive().max(200000),
  duration: z.number().positive().max(86400),
  provider: z.string().max(200),
  fetchedAt: z.iso.datetime(),
  origin: geoPointSchema,
  destination: geoPointSchema,
  start: coord,
  end: coord,
  fallback: z.boolean().optional(),
});
export const deliveryExtras = {
  phoneCountry: z.string().regex(/^[A-Z]{2}$/).optional(),
  phoneType: z.enum(["mobile", "fixed", "other"]).optional(),
  mode: z.enum(["delivery", "pickup"]).optional(),
  origin: geoPointSchema.optional(),
  point: geoPointSchema.optional(),
  pointConfirmed: z.boolean().optional(),
  route: roadRouteSchema.optional(),
};
const cents = z.number().int().min(0).max(1000000000);
const receipt = z
  .object({
    reference: z.string().regex(/^DEMO-[a-f0-9-]{36}$/),
    brand: z.literal("Demo"),
    last4: z.literal("0001"),
  })
  .strict();
export const saleSchema = z.object({
  id: z.string().min(2).max(100),
  requestId: z.string().min(1).max(100),
  agentId: z.string(),
  agentName: z.string(),
  shiftId: z.string(),
  createdAt: z.iso.datetime(),
  lines: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        presentation: z.string(),
        quantity: z.number().int().positive().max(1000000),
        unitPriceCents: cents,
        lineTotalCents: cents,
        code: z.string(),
        barcode: z.string(),
      }),
    )
    .min(1)
    .max(1000),
  totalCents: cents,
  payment: z.enum(["cash", "card-demo"]),
  cashTenderCents: cents.nullable(),
  changeCents: cents,
  cardReceipt: receipt.optional(),
});
export const shiftSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  openedAt: z.iso.datetime(),
  initialCents: cents,
  closedAt: z.iso.datetime().nullable(),
  countedCents: cents.nullable(),
  expectedCents: cents.nullable(),
  differenceCents: z.number().int().nullable(),
});
export const cashDraftSchema = z.object({
  token: z.string().max(100),
  revision: z.number().int().min(0),
  cart: z.record(z.string(), z.number().int().positive().max(1000000)),
});
