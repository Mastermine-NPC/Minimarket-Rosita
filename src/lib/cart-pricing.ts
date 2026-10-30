import { taxonomyEnabled } from "./taxonomy";
import { deliveryZones } from "@/data/delivery";
import type { RositaState } from "@/types/state";
import type { OrderLine } from "@/types/commerce";
export function priceCart(state: RositaState) {
  const lines: OrderLine[] = [];
  let count = 0;
  let error = "";
  const fail = (message: string) => ({
    lines,
    count,
    subtotalCents: 0,
    error: message,
  });
  for (const [id, quantity] of Object.entries(state.cart)) {
    const p = state.products.find((p) => p.id === id),
      item = state.inventory[id];
    if (
      !p ||
      !item ||
      !Number.isSafeInteger(item.priceCents) ||
      item.priceCents <= 0 ||
      !Number.isSafeInteger(item.stock) ||
      item.stock < 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    )
      return fail(
        "El carrito contiene una referencia inválida. Revisa los productos.",
      );
    if (p.archived || !p.active || !taxonomyEnabled(state, p))
      error =
        "Hay productos desactivados en tu carrito. Elimínalos antes de confirmar.";
    else if (quantity > item.stock)
      error =
        "El stock disponible cambió o es insuficiente. Corrige las cantidades o elimina el producto.";
    const lineTotalCents = item.priceCents * quantity;
    if (!Number.isSafeInteger(lineTotalCents))
      return fail(
        "El importe no se puede representar de forma válida. Revisa tu carrito.",
      );
    lines.push({
      productId: id,
      name: p.name,
      presentation: p.presentation,
      quantity,
      unitPriceCents: item.priceCents,
      lineTotalCents,
    });
    count += quantity;
  }
  const subtotalCents = lines.reduce((s, l) => s + l.lineTotalCents, 0);
  if (!Number.isSafeInteger(subtotalCents))
    return fail(
      "El importe no se puede representar de forma válida. Revisa tu carrito.",
    );
  return {
    lines,
    count,
    subtotalCents,
    error: lines.length
      ? error
      : "Tu carrito está vacío. Agrega productos antes de continuar.",
  };
}
export function deliveryAmounts(subtotalCents: number, zoneId: string) {
  const zone = deliveryZones.find((z) => z.id === zoneId),
    shippingCents = zone?.feeCents || 0;
  return { zone, shippingCents, totalCents: subtotalCents + shippingCents };
}
