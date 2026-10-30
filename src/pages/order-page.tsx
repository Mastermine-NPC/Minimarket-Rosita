import { ConfirmAction } from "@/components/operation-confirmation";
import { StatusHistory } from "@/features/pedidos/status-history";
import { Link, useLocation, useParams } from "react-router";
import {
  Check,
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useRosita } from "@/hooks/use-rosita";
import { CustomerGate } from "@/features/acceso/customer-gate";
import { OrderSummary } from "@/features/pedidos/order-summary";
import { orderStages } from "@/data/delivery";
import { Button } from "@/components/ui/button";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { orderDate } from "@/lib/order-date";
export function OrderPage({
  mode,
}: {
  mode: "detalle" | "confirmacion" | "seguimiento";
}) {
  const { state } = useRosita(),
    { id } = useParams(),
    location = useLocation(),
    heading = useHeadingFocus(),
    order = state.orders.find(
      (o) => o.id === id && o.userId === state.sessionUserId,
    );
  if (!state.sessionUserId)
    return <CustomerGate returnTo={location.pathname} />;
  if (!order)
    return (
      <section className="container customer-empty">
        <Package size={40} aria-hidden="true" />
        <h1 ref={heading} tabIndex={-1}>
          No encontramos este pedido.
        </h1>
        <p>
          Revisa el enlace o entra con el cliente de demostración que lo creó.
        </p>
        <Button asChild>
          <Link to="/mis-pedidos">Ver mis pedidos</Link>
        </Button>
      </section>
    );
  const tracking = mode === "seguimiento",
    confirmation = mode === "confirmacion";
  return (
    <div className="container customer-page order-page">
      <Link className="back-link" to="/mis-pedidos">
        <ArrowLeft size={16} aria-hidden="true" />
        Mis pedidos
      </Link>
      <div
        className={"order-heading " + (confirmation ? "order-confirmed" : "")}
      >
        {confirmation ? (
          <CheckCircle2 size={42} aria-hidden="true" />
        ) : tracking ? (
          <Truck size={38} aria-hidden="true" />
        ) : (
          <Package size={38} aria-hidden="true" />
        )}
        <span className="eyebrow">
          {confirmation
            ? "CONFIRMACIÓN DE DEMOSTRACIÓN"
            : tracking
              ? "SEGUIMIENTO SIMULADO"
              : "DETALLE DEL PEDIDO"}
        </span>
        <h1 ref={heading} tabIndex={-1}>
          {confirmation
            ? "¡Tu pedido de prueba está listo!"
            : tracking
              ? "Así va tu pedido."
              : "Todo lo que elegiste."}
        </h1>
        <p className="order-code">{order.id}</p>
        <time dateTime={order.createdAt}>{orderDate(order.createdAt)}</time>
        <p>No se ha enviado al negocio. No hay pago ni reparto real.</p>
      </div>
      <div className="checkout-grid">
        <section className="customer-panel">
          <h2>Resumen de tu pedido</h2>
          <OrderSummary
            quote={order}
            delivery={order.delivery}
            payment={order.payment}
          />
        </section>
        <aside className="customer-panel order-next">
          {tracking ? (
            <>
              <span className="eyebrow">ESTADO ACTUAL</span>
              <h2 aria-live="polite">{orderStages[order.status]}</h2>
              <ol className="tracking-steps" aria-label="Etapas del pedido">
                {orderStages.map((s, i) => (
                  <li
                    key={s}
                    className={
                      i < order.status
                        ? "complete"
                        : i === order.status
                          ? "current"
                          : ""
                    }
                    aria-current={i === order.status ? "step" : undefined}
                  >
                    <span>
                      {i < order.status ? (
                        <Check size={16} aria-hidden="true" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <div>
                      <strong>{s}</strong>
                      <small>
                        {i < order.status
                          ? "Completado en la simulación"
                          : i === order.status
                            ? "Estado actual"
                            : "Próxima etapa"}
                      </small>
                    </div>
                  </li>
                ))}
              </ol>
              <StatusHistory order={order} />
              <div className="simulation-controls">
                <h3>Área de demostración</h3>
                <p>
                  {order.status === 3
                    ? "Terminó la simulación. No representa una entrega real."
                    : "Avanza manualmente para probar el seguimiento. No hay ubicación ni reparto en vivo."}
                </p>
                {order.status < 3 ? (
                  <ConfirmAction
                    trigger={
                      <Button aria-describedby="tracking-help">
                        Simular siguiente estado
                      </Button>
                    }
                    title="¿Avanzar la simulación?"
                    description={
                      orderStages[order.status] +
                      " → " +
                      orderStages[order.status + 1] +
                      ". No representa un reparto real y no descuenta stock."
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
                  <Button disabled aria-describedby="tracking-help">
                    Simular siguiente estado
                  </Button>
                )}
                <p className="hint" id="tracking-help">
                  {order.status === 3
                    ? "El pedido ya está en la última etapa."
                    : "Consultar o avanzar no vuelve a descontar inventario."}
                </p>
              </div>
            </>
          ) : (
            <>
              <span className="status-chip">{orderStages[order.status]}</span>
              <h2>
                {confirmation
                  ? "Gracias por probar Rosita."
                  : "Tu compra de demostración."}
              </h2>
              <p>Entrega estimada ficticia: {order.estimate}.</p>
              <Button asChild>
                <Link to={"/pedido/" + order.id + "/seguimiento"}>
                  Seguir pedido <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/mis-pedidos">Ver historial</Link>
              </Button>
            </>
          )}
          <Link className="text-link" to="/catalogo">
            Continuar comprando <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
