import { normalizePhone, phoneProblem } from "./phone";
import { z } from "zod";
import { deliveryExtras } from "./operations-schema";
import { withinCoverage } from "@/data/geography";
import { distanceBetween } from "./geography";
import { deliveryZones } from "@/data/delivery";
export function solesToCents(value: string): number | null {
  const raw = value.trim().replace(",", ".");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(raw)) return null;
  const [whole, fraction = ""] = raw.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
export const deliverySchema = z
  .object({
    ...deliveryExtras,
    recipient: z
      .string()
      .trim()
      .min(3, "Escribe el nombre de quien recibe (mínimo 3 caracteres).")
      .max(80, "Usa hasta 80 caracteres."),
    phone: z.string().trim().max(48, "Usa hasta 48 caracteres."),
    address: z.string().trim().max(180, "Usa hasta 180 caracteres."),
    zone: z
      .string()
      .refine(
        (v) => deliveryZones.some((z) => z.id === v),
        "Selecciona una zona de demostración.",
      ),
    reference: z
      .string()
      .trim()
      .max(140, "Usa hasta 140 caracteres para la referencia."),
  })
  .superRefine((v, ctx) => {
    const error = (key: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [key], message });
    const phoneError = phoneProblem(v.phone, v.phoneCountry, v.phoneType);
    if (phoneError) error("phone", phoneError);
    if (!v.origin || !withinCoverage(v.origin))
      error("origin", "Configura un origen válido en Arequipa.");
    if (v.mode === "pickup") {
      if (v.zone !== "pickup") error("zone", "El recojo no lleva envío.");
      return;
    }
    if (v.address.length < 6)
      error("address", "Indica calle y número de entrega.");
    if (!v.point || !withinCoverage(v.point))
      error("point", "Selecciona un punto dentro del área de demostración.");
    if (!v.pointConfirmed || !v.route)
      error(
        "pointConfirmed",
        "Confirma el punto y espera una ruta vial válida.",
      );
    if (
      v.route &&
      v.point &&
      v.origin &&
      (distanceBetween(v.route.destination, v.point) > 2 ||
        distanceBetween(v.route.origin, v.origin) > 2)
    )
      error(
        "route",
        "La ruta no corresponde a los puntos actuales. Confirma de nuevo.",
      );
    if (v.route && v.zone !== (v.route.distance <= 7000 ? "demo-a" : "demo-b"))
      error(
        "zone",
        "La tarifa debe corresponder al recorrido de demostración.",
      );
  }).transform(v => ({ ...v, phone: normalizePhone(v.phone, v.phoneCountry) }));
export const paymentSchema = z.object({
  method: z.enum(["cash", "yape-demo", "plin-demo", "card-demo"]),
  cashAmount: z.string().max(16),
});
export function paymentProblem(
  payment: z.infer<typeof paymentSchema>,
  totalCents: number,
): string | null {
  if (payment.method !== "cash") return null;
  const amount = solesToCents(payment.cashAmount);
  if (amount === null)
    return "Indica un monto en soles con hasta dos decimales.";
  if (amount < totalCents)
    return "El efectivo indicado debe cubrir el total, incluido el envío.";
  return null;
}
