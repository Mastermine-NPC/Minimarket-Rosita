import { paymentName, movementNames } from "@/data/operation-labels";
import type { RositaState } from "@/types/state";
import type { ReportFilters } from "./analytics";
import { stagesFor } from "@/data/delivery";
const day = (s: string) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Lima" }).format(
    new Date(s),
  );
export function operationRows(state: RositaState, f: ReportFilters) {
  const inDate = (at: string) =>
    (!f.from || day(at) >= f.from) && (!f.to || day(at) <= f.to);
  const orders = state.orders.filter(
    (o) =>
      inDate(o.createdAt) &&
      (!f.status || String(o.status) === f.status) &&
      (!f.channel ||
        f.channel === (o.delivery.mode === "pickup" ? "pickup" : "delivery")) &&
      (!f.payment || o.payment === f.payment) &&
      !f.agent &&
      !f.shift,
  );
  const sales = state.sales.filter(
    (s) =>
      inDate(s.createdAt) &&
      (!f.channel || f.channel === "cash") &&
      (!f.agent || s.agentId === f.agent) &&
      (!f.shift || s.shiftId === f.shift) &&
      (!f.payment || s.payment === f.payment) &&
      !f.status,
  );
  return { orders, sales };
}
export function operationsReport(state: RositaState, f: ReportFilters) {
  const inDate = (at: string) =>
    (!f.from || day(at) >= f.from) && (!f.to || day(at) <= f.to);
  const { orders, sales } = operationRows(state, f),
    money = (n: number) => (n / 100).toFixed(2);
  let title = "",
    headers: string[] = [],
    rows: (string | number)[][] = [],
    total = "";
  if (f.type === "cash") {
    title = "Ventas presenciales de demostración";
    headers = [
      "Venta",
      "Fecha Perú",
      "Agente",
      "Turno",
      "Pago",
      "Total S/",
      "Recibido S/",
      "Vuelto S/",
    ];
    rows = sales.map((s) => [
      s.id,
      day(s.createdAt),
      s.agentName,
      s.shiftId,
      paymentName(s.payment),
      money(s.totalCents),
      s.cashTenderCents === null ? "" : money(s.cashTenderCents),
      money(s.changeCents),
    ]);
    total =
      sales.length +
      " ventas · S/ " +
      money(sales.reduce((n, s) => n + s.totalCents, 0)) +
      " cobrado simulado";
  } else if (f.type === "channels") {
    title = "Operaciones por fecha y canal";
    headers = [
      "ID",
      "Fecha Perú",
      "Canal",
      "Estado",
      "Total S/",
      "Interpretación",
    ];
    rows = [
      ...orders.map((o) => [
        o.id,
        day(o.createdAt),
        o.delivery.mode === "pickup"
          ? "Digital · recojo"
          : "Digital · delivery",
        stagesFor(o.delivery)[o.status],
        money(o.totalCents),
        o.payment === "cash"
          ? "Confirmado, efectivo no cobrado"
          : "Pago exclusivamente simulado",
      ]),
      ...sales.map((s) => [
        s.id,
        day(s.createdAt),
        "Caja presencial",
        "Confirmada",
        money(s.totalCents),
        "Cobrado simulado",
      ]),
    ];
    total =
      orders.length +
      " pedidos digitales y " +
      sales.length +
      " ventas de caja; canales separados, sin sumar movimientos como ingresos";
  } else if (f.type === "agents") {
    title = "Ventas presenciales por agente";
    headers = [
      "Agente",
      "Ventas",
      "Efectivo S/",
      "Tarjeta demo S/",
      "Total S/",
    ];
    const ids = [...new Set(sales.map((s) => s.agentId))];
    rows = ids.map((id) => {
      const own = sales.filter((s) => s.agentId === id),
        cash = own
          .filter((s) => s.payment === "cash")
          .reduce((n, s) => n + s.totalCents, 0),
        card = own
          .filter((s) => s.payment === "card-demo")
          .reduce((n, s) => n + s.totalCents, 0);
      return [
        own[0].agentName,
        own.length,
        money(cash),
        money(card),
        money(cash + card),
      ];
    });
    total = sales.length + " ventas presenciales";
  } else if (f.type === "payments") {
    title = "Medios de pago por canal";
    headers = ["Medio", "Canal", "Operaciones", "Total S/", "Condición"];
    for (const pay of ["cash", "card-demo", "yape-demo", "plin-demo"]) {
      const digital = orders.filter((o) => o.payment === pay),
        cash = sales.filter((s) => s.payment === pay);
      if (digital.length)
        rows.push([
          paymentName(pay),
          "Digital",
          digital.length,
          money(digital.reduce((n, o) => n + o.totalCents, 0)),
          pay === "cash"
            ? "Efectivo previsto; no cobrado"
            : "Simulación, sin cobro real",
        ]);
      if (cash.length)
        rows.push([
          paymentName(pay),
          "Caja",
          cash.length,
          money(cash.reduce((n, s) => n + s.totalCents, 0)),
          "Cobrado simulado",
        ]);
    }
    total =
      "El efectivo digital previsto no forma parte del efectivo físico del turno.";
  } else if (f.type === "shifts") {
    title = "Turnos y diferencias de caja";
    headers = [
      "Turno",
      "Agente",
      "Apertura",
      "Cierre",
      "Fondo S/",
      "Esperado S/",
      "Contado S/",
      "Diferencia S/",
    ];
    rows = state.shifts
      .filter(
        (s) =>
          (!f.agent || s.agentId === f.agent) &&
          (!f.shift || s.id === f.shift) &&
          (!f.channel || f.channel === "cash") &&
          inDate(s.openedAt),
      )
      .map((s) => [
        s.id,
        s.agentName,
        day(s.openedAt),
        s.closedAt ? day(s.closedAt) : "Abierto",
        money(s.initialCents),
        s.expectedCents === null ? "Pendiente" : money(s.expectedCents),
        s.countedCents === null ? "Pendiente" : money(s.countedCents),
        s.differenceCents === null ? "Pendiente" : money(s.differenceCents),
      ]);
    total = rows.length + " turnos; cierres conservados sin edición";
  } else if (f.type === "movements") {
    title = "Movimientos de inventario";
    headers = [
      "Fecha",
      "Producto al registrar",
      "Tipo",
      "Antes",
      "Variación",
      "Después",
      "Agente",
      "Pedido / venta",
    ];
    const saleIds = new Set(sales.map((s) => s.id)),
      orderIds = new Set(orders.map((o) => o.id));
    rows = state.movements
      .filter(
        (m) =>
          inDate(m.at) &&
          (!f.agent || m.actorId === f.agent) &&
          (!f.payment ||
            (!!m.saleId && saleIds.has(m.saleId)) ||
            (!!m.orderId && orderIds.has(m.orderId))) &&
          (!f.category ||
            state.products.find((p) => p.id === m.productId)?.category ===
              f.category) &&
          (!f.shift || (!!m.saleId && saleIds.has(m.saleId))) &&
          (!f.channel ||
            (f.channel === "cash"
              ? !!m.saleId && saleIds.has(m.saleId)
              : !!m.orderId && orderIds.has(m.orderId))),
      )
      .map((m) => [
        day(m.at),
        m.productName,
        movementNames[m.kind],
        m.before,
        m.delta,
        m.after,
        m.actorLabel,
        m.orderId || m.saleId || "Ajuste",
      ]);
    total = rows.length + " movimientos; no representan ingresos";
  } else if (f.type === "top") {
    title = "Productos vendidos · canales seleccionados";
    headers = ["ID estable", "Nombre al vender", "Unidades", "Mercadería S/"];
    const grouped = new Map<
      string,
      { name: string; qty: number; cents: number }
    >();
    for (const l of [
      ...orders.flatMap((o) => o.lines),
      ...sales.flatMap((s) => s.lines),
    ]) {
      const g = grouped.get(l.productId) || { name: l.name, qty: 0, cents: 0 };
      g.qty += l.quantity;
      g.cents += l.lineTotalCents;
      grouped.set(l.productId, g);
    }
    rows = [...grouped]
      .sort((a, b) => b[1].qty - a[1].qty)
      .map(([id, g]) => [id, g.name, g.qty, money(g.cents)]);
    total =
      rows.reduce((n, r) => n + Number(r[2]), 0) +
      " unidades; sin envío y sin duplicar salidas de inventario";
  }
  return { title, headers, rows, total };
}
