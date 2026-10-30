import { AnalyticsPanel } from "@/features/administracion/analytics-panel";
import { Link } from "react-router";
import {
  ArrowUpRight,
  Package,
  PackageX,
  TriangleAlert,
  ClipboardList,
  Truck,
  Wallet,
} from "lucide-react";
import { useRosita } from "@/hooks/use-rosita";
import { useCatalog } from "@/hooks/use-catalog";
import { dashboardMetrics } from "@/lib/admin-selectors";
import { money } from "@/lib/currency";
import { orderDate } from "@/lib/order-date";
import { combinedOrderStages as orderStages, stagesFor } from "@/data/delivery";
import {
  AdminHeading,
  AdminEmpty,
} from "@/features/administracion/admin-common";
export function AdminDashboardPage() {
  const { state } = useRosita(),
    products = useCatalog(),
    m = dashboardMetrics(state),
    alerts = products
      .filter((p) => p.active && p.stock <= (p.lowStockThreshold || 0))
      .sort((a, b) => a.stock - b.stock),
    recent = [...state.orders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
  const indicators = [
    {
      key: "active",
      label: "Productos activos",
      value: m.active,
      note: "Disponibles para nueva compra; incluye agotados.",
      icon: Package,
    },
    {
      key: "soldOut",
      label: "Productos agotados",
      value: m.soldOut,
      note: "Activos con cero unidades.",
      icon: PackageX,
    },
    {
      key: "low",
      label: "Stock bajo",
      value: m.low,
      note: "Activos con 1 a su umbral de alerta.",
      icon: TriangleAlert,
    },
    {
      key: "received",
      label: "Pedidos recibidos",
      value: m.received,
      note: "Todos los pedidos de demostración confirmados.",
      icon: ClipboardList,
    },
    {
      key: "pending",
      label: "Pendientes de entrega",
      value: m.pending,
      note: "Pedidos que aún no están en Entregado.",
      icon: Truck,
    },
    {
      key: "totalCents",
      label: "Importe de pedidos",
      value: money(m.totalCents),
      note: "Incluye envío. No es dinero cobrado.",
      icon: Wallet,
    },
  ];
  return (
    <div className="admin-page">
      <AdminHeading
        eyebrow="UNA MIRADA A ROSITA"
        title="Todo bajo control."
        description="Un resumen de los datos actuales de esta demostración, sin cifras inventadas."
      />
      <section className="admin-welcome">
        <div>
          <span>PROTOTIPO, CON DATOS CONECTADOS</span>
          <h2>
            Tu tienda de siempre.
            <br />
            Una gestión más clara.
          </h2>
        </div>
        <p>
          {m.seed} productos del catálogo inicial · {m.created} creados durante
          la demostración.
          <br />
          Registro de movimientos desde {orderDate(state.recordingSince)}.
        </p>
      </section>
      <section className="admin-metrics" aria-label="Indicadores calculados">
        {indicators.map((i) => (
          <article className="admin-metric" key={i.key} data-metric={i.key}>
            <i.icon size={22} aria-hidden="true" />
            <h2>{i.label}</h2>
            <strong>{i.value}</strong>
            <p>{i.note}</p>
          </article>
        ))}
      </section>
      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-section-title">
            <h2>Pedidos recientes</h2>
            <Link to="/admin/pedidos">
              Ver todos <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          {recent.length ? (
            <ul className="admin-recent-orders">
              {recent.map((o) => (
                <li key={o.id}>
                  <div>
                    <Link to={"/admin/pedidos/" + o.id}>{o.id}</Link>
                    <span>{orderDate(o.createdAt)}</span>
                  </div>
                  <div>
                    <span className="status-chip">
                      {stagesFor(o.delivery)[o.status]}
                    </span>
                    <strong>{money(o.totalCents)}</strong>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <AdminEmpty
              title="Aún no hay pedidos."
              description="Confirma uno desde la tienda con un cliente de prueba."
            />
          )}
          <h3 className="admin-chart-title">Pedidos por estado</h3>
          <div className="admin-status-bars">
            {orderStages.map((label, i) => {
              const count = state.orders.filter((o) => o.status === i).length;
              return (
                <div key={label}>
                  <span>{label}</span>
                  <div aria-hidden="true">
                    <span
                      style={{
                        width: state.orders.length
                          ? (count / state.orders.length) * 100 + "%"
                          : "0%",
                      }}
                    />
                  </div>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-section-title">
            <h2>Atención al inventario</h2>
            <Link to="/admin/inventario?estado=alertas">
              Revisar <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          {alerts.length ? (
            <ul className="admin-stock-alerts">
              {alerts.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <div>
                    <strong>{p.name}</strong>
                    <span>
                      {p.stock === 0
                        ? "Agotado"
                        : p.stock + " unidades · umbral " + p.lowStockThreshold}
                    </span>
                  </div>
                  <Link to={"/admin/inventario?q=" + encodeURIComponent(p.id)}>
                    Ver stock
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <AdminEmpty
              title="Sin alertas por ahora."
              description="Todos los productos activos superan su umbral."
            />
          )}
          <p className="hint">
            Las existencias iniciales no son movimientos históricos. Solo se
            registra lo realizado desde la etapa 0.4.0.
          </p>
        </section>
      </div>
      <AnalyticsPanel />
      <section className="cash-panel">
        <h2>Caja presencial y canales</h2>
        <p>
          {state.sales.length} ventas presenciales · Total simulado{" "}
          {money(state.sales.reduce((n, s) => n + s.totalCents, 0))}
        </p>
        <p>
          {state.orders.filter((o) => o.delivery.mode === "pickup").length}{" "}
          pedidos digitales con recojo ·{" "}
          {state.orders.filter((o) => o.delivery.mode !== "pickup").length} con
          delivery
        </p>
        <p>
          {state.shifts.filter((s) => s.closedAt === null).length} turnos
          abiertos. Los pedidos digitales no cuentan como efectivo cobrado en
          caja.
        </p>
        <Link className="text-link" to="/admin/reportes">
          Consultar reportes por canal, agente y turno
        </Link>
      </section>
    </div>
  );
}
