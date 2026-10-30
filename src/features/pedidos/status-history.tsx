import type { Order } from "@/types/commerce";
import { orderDate } from "@/lib/order-date";
import { orderStages } from "@/data/delivery";
export function StatusHistory({ order }: { order: Order }) {
  return (
    <section className="status-history">
      <h3>Historial de estados</h3>
      {order.legacyHistory && (
        <p className="hint">
          Pedido anterior a 0.4.0: no se registraban transiciones. No se
          reconstruyen fechas pasadas.
        </p>
      )}
      {order.statusHistory.length ? (
        <ol>
          {order.statusHistory.map((e) => (
            <li key={e.id}>
              <strong>
                {e.from === null ? "Confirmación" : orderStages[e.from] + " →"}{" "}
                {orderStages[e.to]}
              </strong>
              <span>
                {orderDate(e.at)} · {e.actorLabel}
              </span>
              <small>
                {e.origin === "admin-demo"
                  ? "Administración de demostración"
                  : e.origin === "client-demo"
                    ? "Control de simulación del cliente"
                    : "Creación del pedido"}
              </small>
            </li>
          ))}
        </ol>
      ) : (
        <p className="hint">Sin transiciones registradas desde la migración.</p>
      )}
    </section>
  );
}
