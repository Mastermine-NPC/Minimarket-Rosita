import { useState, useMemo } from "react";
import { useRosita } from "@/hooks/use-rosita";
import { analytics } from "@/lib/analytics";
import { money } from "@/lib/currency";
import { orderStages } from "@/data/delivery";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
export function AnalyticsPanel() {
  const { state } = useRosita(),
    [from, From] = useState(""),
    [to, To] = useState(""),
    a = useMemo(() => analytics(state, from, to), [state, from, to]);
  return (
    <section className="analytics-panel">
      <h2>Estadísticas de la demostración</h2>
      <p>
        Pedidos confirmados del canal digital; sus importes no acreditan cobros.
        Caja presencial no implementada.
      </p>
      <div className="date-filters">
        <div>
          <Label htmlFor="stats-from">Desde · fecha Perú</Label>
          <Input
            type="date"
            id="stats-from"
            value={from}
            onChange={(e) => From(e.target.value)}
            aria-invalid={!!a.error}
          />
        </div>
        <div>
          <Label htmlFor="stats-to">Hasta · fecha Perú</Label>
          <Input
            type="date"
            id="stats-to"
            value={to}
            onChange={(e) => To(e.target.value)}
            aria-invalid={!!a.error}
          />
        </div>
      </div>
      {a.error && (
        <p role="alert" className="field-error">
          ⚠ {a.error}
        </p>
      )}
      <div className="analytics-summary">
        <strong>{a.orders.length} pedidos confirmados</strong>
        <span>Mercadería: {money(a.subtotalCents)}</span>
        <span>Envíos: {money(a.shippingCents)}</span>
        <span>Total confirmado: {money(a.totalCents)}</span>
        <span>
          Cobros reales: ninguno · sin registro separado de cobros simulados
        </span>
      </div>
      <table>
        <caption>Importes por canal · periodo seleccionado</caption>
        <thead>
          <tr>
            <th>Canal</th>
            <th>Operaciones</th>
            <th>Importe confirmado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Pedidos digitales</td>
            <td>{a.orders.length}</td>
            <td>{money(a.totalCents)} · incluye envío de prueba</td>
          </tr>
          <tr>
            <td>Caja presencial</td>
            <td colSpan={2}>
              No implementada; no se registra como cero ventas reales.
            </td>
          </tr>
        </tbody>
      </table>
      <div className="analytics-grid">
        <section>
          <h3>Pedidos por estado</h3>
          <div
            role="img"
            aria-label={
              "Pedidos por estado: " +
              a.byStatus
                .map((r) => orderStages[r.status] + " " + r.count)
                .join(", ")
            }
          >
            {a.byStatus.map((r) => (
              <div className="metric-bar" key={r.status}>
                <span>
                  {orderStages[r.status]} · {r.count}
                </span>
                <i
                  style={{
                    width:
                      (a.orders.length
                        ? (r.count / a.orders.length) * 100
                        : 0) + "%",
                  }}
                />
              </div>
            ))}
          </div>
          <table>
            <caption>Alternativa en tabla: estados</caption>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {a.byStatus.map((r) => (
                <tr key={r.status}>
                  <td>{orderStages[r.status]}</td>
                  <td>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <h3>Distribución actual por categoría</h3>
          <p className="hint">
            Productos activos comercialmente; no son ventas históricas. Este
            inventario no depende del rango de pedidos.
          </p>
          <table>
            <caption>Productos activos por categoría</caption>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Productos</th>
              </tr>
            </thead>
            <tbody>
              {a.distribution.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <h3>Más vendidos en pedidos digitales</h3>
          {a.top.length ? (
            <table>
              <caption>Unidades e importe de mercadería, sin envío</caption>
              <thead>
                <tr>
                  <th>Producto al comprar</th>
                  <th>Unidades</th>
                  <th>Importe</th>
                </tr>
              </thead>
              <tbody>
                {a.top.slice(0, 10).map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.name}
                      <small>{r.id}</small>
                    </td>
                    <td>{r.units}</td>
                    <td>{money(r.cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>
              No hay pedidos en este periodo. Registra una compra de
              demostración para obtener datos.
            </p>
          )}
        </section>
        <section>
          <h3>Evolución por fecha</h3>
          {a.days.length < 2 && (
            <p className="hint">
              {a.days.length
                ? "Hay una sola fecha; no hay evolución comparable todavía."
                : "Sin fechas con pedidos; no se insertan operaciones ficticias."}
            </p>
          )}
          <table>
            <caption>
              Fechas Perú · importes confirmados, no ingresos reales
            </caption>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Pedidos</th>
                <th>Total con envío</th>
              </tr>
            </thead>
            <tbody>
              {a.days.map((d) => (
                <tr key={d.day}>
                  <td>{d.day}</td>
                  <td>{d.count}</td>
                  <td>{money(d.cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </section>
  );
}
