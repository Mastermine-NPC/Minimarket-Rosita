const peruCurrency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});
export function formatPEN(amount: number) {
  return peruCurrency.format(amount);
}

export const money = (cents: number) => formatPEN(cents / 100);
