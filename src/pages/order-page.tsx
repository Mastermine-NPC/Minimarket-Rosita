import { OrderTrackingPage } from "@/features/entrega/order-tracking-page";
import { Link, useLocation, useParams } from "react-router";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useRosita } from "@/hooks/use-rosita";
import { CustomerGate } from "@/features/acceso/customer-gate";
import { OrderSummary } from "@/features/pedidos/order-summary";
import { stagesFor } from "@/data/delivery";
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
  if (tracking) return <OrderTrackingPage order={order} />;
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
        ) : (
          <Package size={38} aria-hidden="true" />
        )}
        <span className="eyebrow">
          {confirmation
            ? "CONFIRMACIÓN DE DEMOSTRACIÓN"
            : "DETALLE DEL PEDIDO"}
        </span>
        <h1 ref={heading} tabIndex={-1}>
          {confirmation
            ? "¡Tu pedido de prueba está listo!"
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
            cardReceipt={order.cardReceipt}
          />
        </section>
        <aside className="customer-panel order-next">
              <span className="status-chip">
                {stagesFor(order.delivery)[order.status]}
              </span>
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
          <Link className="text-link" to="/catalogo">
            Continuar comprando <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
