import type { RositaState } from "@/types/state";
import { currentProducts } from "./catalog-state";
export interface ReportFilters {
  type: "inventory" | "low" | "orders" | "digital" | "cash" | "top";
  from: string;
  to: string;
  status: string;
  category: string;
}
export const defaultReportFilters: ReportFilters = {
  type: "inventory",
  from: "",
  to: "",
  status: "",
  category: "",
};
export function peruDay(iso: string) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Lima" }).format(
    new Date(iso),
  );
}
export function periodError(from: string, to: string) {
  return from && to && from > to
    ? "La fecha inicial no puede ser posterior a la final."
    : "";
}
export function analytics(state: RositaState, from = "", to = "", status = "") {
  const error = periodError(from, to),
    orders = error
      ? []
      : state.orders.filter(
          (o) =>
            (!from || peruDay(o.createdAt) >= from) &&
            (!to || peruDay(o.createdAt) <= to) &&
            (!status || String(o.status) === status),
        );
  const top = new Map<
      string,
      { id: string; name: string; units: number; cents: number }
    >(),
    days = new Map<string, { day: string; count: number; cents: number }>();
  for (const order of orders) {
    for (const line of order.lines) {
      const row = top.get(line.productId) || {
        id: line.productId,
        name: line.name,
        units: 0,
        cents: 0,
      };
      row.units += line.quantity;
      row.cents += line.lineTotalCents;
      top.set(line.productId, row);
    }
    const day = peruDay(order.createdAt),
      d = days.get(day) || { day, count: 0, cents: 0 };
    d.count++;
    d.cents += order.totalCents;
    days.set(day, d);
  }
  const products = currentProducts(state),
    active = products.filter((p) => p.active);
  return {
    error,
    orders,
    totalCents: orders.reduce((n, o) => n + o.totalCents, 0),
    subtotalCents: orders.reduce((n, o) => n + o.subtotalCents, 0),
    shippingCents: orders.reduce((n, o) => n + o.shippingCents, 0),
    byStatus: [0, 1, 2, 3].map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    })),
    top: [...top.values()].sort(
      (a, b) => b.units - a.units || a.id.localeCompare(b.id),
    ),
    days: [...days.values()].sort((a, b) => a.day.localeCompare(b.day)),
    products,
    active,
    distribution: state.categories.map((c) => ({
      id: c.id,
      name: c.name,
      count: active.filter((p) => p.category === c.id).length,
    })),
  };
}
export function buildReport(
  state: RositaState,
  f: ReportFilters,
  generatedAt: string,
) {
  const a = analytics(state, f.from, f.to, f.status),
    dateRelevant = !["inventory", "low"].includes(f.type),
    error = dateRelevant ? a.error : "";
  let title: string,
    headers: string[],
    rows: (string | number)[][],
    total: string;
  const money = (c: number) => (c / 100).toFixed(2);
  if (f.type === "inventory" || f.type === "low") {
    title =
      f.type === "low"
        ? "Inventario: agotados y stock bajo"
        : "Inventario actual";
    headers = [
      "Código",
      "Producto",
      "Categoría",
      "Estado comercial",
      "Stock",
      "Umbral",
      "Precio S/",
    ];
    rows = a.products
      .filter(
        (p) =>
          (!f.category || p.category === f.category) &&
          (f.type !== "low" || p.stock <= (p.lowStockThreshold || 0)),
      )
      .map((p) => [
        p.id,
        p.name,
        state.categories.find((c) => c.id === p.category)?.name || p.category,
        p.active ? "Activo" : "Inactivo",
        p.stock,
        p.lowStockThreshold || 0,
        money(state.inventory[p.id].priceCents),
      ]);
    total =
      rows.length +
      " productos · " +
      rows.reduce((n, r) => n + Number(r[4]), 0) +
      " unidades actuales";
  } else if (f.type === "orders" || f.type === "digital") {
    title =
      f.type === "orders"
        ? "Pedidos por fecha y estado"
        : "Ventas digitales · pedidos confirmados";
    headers = [
      "Pedido",
      "Fecha Perú",
      "Estado",
      "Productos S/",
      "Envío S/",
      "Total S/",
      "Pago seleccionado",
    ];
    rows = a.orders.map((o) => [
      o.id,
      peruDay(o.createdAt),
      ["Recibido", "En preparación", "En camino", "Entregado"][o.status],
      money(o.subtotalCents),
      money(o.shippingCents),
      money(o.totalCents),
      o.payment,
    ]);
    total =
      a.orders.length +
      " pedidos · S/ " +
      money(a.totalCents) +
      " de importe confirmado (no cobrado)";
  } else if (f.type === "top") {
    title = "Productos más vendidos · pedidos digitales";
    headers = [
      "Código",
      "Nombre al comprar",
      "Unidades",
      "Importe de productos S/",
    ];
    rows = a.top.map((p) => [p.id, p.name, p.units, money(p.cents)]);
    total =
      a.top.reduce((n, p) => n + p.units, 0) +
      " unidades · S/ " +
      money(a.subtotalCents) +
      " de mercadería (sin envío)";
  } else {
    title = "Ventas presenciales";
    headers = ["Canal", "Observación"];
    rows = [];
    total = "Caja no implementada: no se atribuyen ventas presenciales.";
  }
  const filters = dateRelevant
    ? `Fechas Perú: ${f.from || "sin límite"} a ${f.to || "sin límite"}; estado: ${f.status ? ["Recibido", "En preparación", "En camino", "Entregado"][Number(f.status)] : "todos"}`
    : `Categoría: ${state.categories.find((c) => c.id === f.category)?.name || "todas"}; stock actual`;
  return { title, headers, rows, total, generatedAt, filters, error };
}
export function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^\s*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export function reportCSV(report: ReturnType<typeof buildReport>) {
  const headers = [
    ...report.headers,
    "Generado",
    "Filtros",
    "Resumen",
    "Datos",
  ];
  const rows = report.rows.length
    ? report.rows
    : [["Sin registros", ...Array(report.headers.length - 1).fill("")]];
  return (
    "\uFEFF" +
    [
      headers,
      ...rows.map((row) => [
        ...row,
        report.generatedAt,
        report.filters,
        report.total,
        "Demostración; sin ingresos reales",
      ]),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n") +
    "\r\n"
  );
}
