import { z } from "zod";
import { deliveryZones } from "@/data/delivery";
export function solesToCents(value: string): number | null {
  const raw = value.trim().replace(",", ".");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(raw)) return null;
  const [whole, fraction = ""] = raw.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
export const deliverySchema = z.object({
  recipient: z
    .string()
    .trim()
    .min(3, "Escribe el nombre de quien recibe (mínimo 3 caracteres).")
    .max(80, "Usa hasta 80 caracteres."),
  phone: z
    .string()
    .trim()
    .regex(
      /^9\d{8}$/,
      "Escribe un celular peruano de 9 dígitos que comience con 9.",
    ),
  address: z
    .string()
    .trim()
    .min(
      6,
      "Indica calle, número y los datos necesarios para ubicar la entrega.",
    )
    .max(180, "Usa hasta 180 caracteres."),
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
});
export const paymentSchema = z.object({
  method: z.enum(["cash", "yape-demo", "plin-demo"]),
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
