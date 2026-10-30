export const deliveryZones = [
  {
    id: "demo-a",
    name: "Zona A · demostración",
    feeCents: 400,
    estimate: "45–60 minutos desde la confirmación (simulación)",
  },
  {
    id: "demo-b",
    name: "Zona B · demostración",
    feeCents: 650,
    estimate: "60–90 minutos desde la confirmación (simulación)",
  },
] as const;
export const paymentLabels = {
  cash: "Efectivo contra entrega (simulado)",
  "yape-demo": "Yape de demostración",
  "plin-demo": "Plin de demostración",
} as const;
export const orderStages = [
  "Pedido recibido",
  "En preparación",
  "En camino",
  "Entregado",
] as const;
