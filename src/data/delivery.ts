export const deliveryZones = [
  {
    id: "pickup",
    name: "Recojo en Minimarket Rosita",
    feeCents: 0,
    estimate: "Preparación y recojo de demostración, sin reparto",
  },
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
  "card-demo": "Tarjeta de crédito/débito — simulación",
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

export const pickupStages = [
  "Pedido recibido",
  "En preparación",
  "Listo para recoger",
  "Recogido",
] as const;
export const stagesFor = (delivery: { mode?: string }) =>
  delivery.mode === "pickup" ? pickupStages : orderStages;

export const combinedOrderStages = [
  "Pedido recibido",
  "En preparación",
  "En camino / Listo para recoger",
  "Entregado / Recogido",
] as const;
