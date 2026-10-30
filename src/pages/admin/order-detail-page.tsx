import { Link, useParams } from "react-router";
import { useRosita } from "@/hooks/use-rosita";
import { orderStages } from "@/data/delivery";
import { orderDate } from "@/lib/order-date";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/features/pedidos/order-summary";
import { StatusHistory } from "@/features/pedidos/status-history";
import {
  AdminHeading,
  AdminEmpty,
} from "@/features/administracion/admin-common";
import { ConfirmAction } from "@/components/operation-confirmation";
export function AdminOrderDetailPage() {
  const { state } = useRosita(),
    { id } = useParams(),
    order = state.orders.find((o) => o.id === id);
  if (!order)
    return (
      <div className="admin-page">
        <AdminHeading
          eyebrow="PEDIDOS"
          title="No encontramos este pedido."
          description="Revisa el identificador o vuelve a la lista."
        />
        <AdminEmpty
          title="El pedido no está disponible."
          description="No se muestran datos de un identificador inexistente."
        >
          <Button asChild>
            <Link to="/admin/pedidos">Volver a pedidos</Link>
          </Button>
        </AdminEmpty>
      </div>
    );
  const customer = state.users.find((u) => u.id === order.userId);
  return (
    <div className="admin-page">
      <Link to="/admin/pedidos" className="back-link">
        ← Volver a pedidos
      </Link>
      <AdminHeading
        eyebrow="PEDIDO DE DEMOSTRACIÓN"
        title="Todo el detalle, a mano."
        description={order.id}
      />
      <div className="admin-order-detail-grid">
        <section className="admin-panel">
          <h2>Resumen guardado al comprar</h2>
          <p className="hint">
            {orderDate(order.createdAt)} · No se modifica con el catálogo
            actual.
          </p>
          <OrderSummary
            quote={order}
            delivery={order.delivery}
            payment={order.payment}
          />
        </section>
        <aside className="admin-panel">
          <span className="eyebrow">CLIENTE DE DEMOSTRACIÓN</span>
          <h2>{order.customerName || customer?.name}</h2>
          <p>{order.customerEmail || customer?.email}</p>
          {order.legacyHistory && (
            <p className="hint">
              Datos de la cuenta local; este pedido no guardaba una copia del
              perfil de cliente.
            </p>
          )}
          <div className="admin-order-progress">
            <span className="status-chip">{orderStages[order.status]}</span>
            <h3>
              {order.status === 3 ? "Simulación terminada" : "Siguiente acción"}
            </h3>
            {order.status < 3 ? (
              <ConfirmAction
                trigger={
                  <Button>Avanzar a {orderStages[order.status + 1]}</Button>
                }
                title="¿Avanzar el pedido de demostración?"
                description={
                  orderStages[order.status] +
                  " → " +
                  orderStages[order.status + 1] +
                  ". Esta transición se registra; no representa un reparto real ni descuenta stock de nuevo."
                }
                label="Confirmar avance de estado"
                success="Estado del pedido actualizado"
                build={(operationId, at) => ({
                  type: "order/advance",
                  operationId,
                  at,
                  id: order.id,
                  expectedStatus: order.status,
                })}
              />
            ) : (
              <p>
                El pedido llegó a Entregado dentro de la simulación. No hay
                reparto real.
              </p>
            )}
            <p className="hint">
              Solo se permite avanzar una etapa. Sin cancelaciones, devoluciones
              o reposición automática.
            </p>
          </div>
          <StatusHistory order={order} />
        </aside>
      </div>
    </div>
  );
}
