export const paymentNames = {
  cash: "Efectivo",
  "card-demo": "Tarjeta simulada",
  "yape-demo": "Yape de demostración",
  "plin-demo": "Plin de demostración",
} as const;
export const paymentName = (method: string) =>
  paymentNames[method as keyof typeof paymentNames] || "Pago de demostración";
export const movementNames = {
  entry: "Entrada",
  "manual-out": "Salida manual",
  count: "Corrección de conteo",
  "sale-out": "Venta presencial",
  "order-out": "Salida por pedido",
} as const;
