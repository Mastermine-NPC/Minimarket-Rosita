import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Package } from "lucide-react";
import type { Order } from "@/types/commerce";
import { stagesFor } from "@/data/delivery";
import { orderDate } from "@/lib/order-date";
import { OrderSummary } from "@/features/pedidos/order-summary";
import { StatusHistory } from "@/features/pedidos/status-history";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { useRosita } from "@/hooks/use-rosita";
import { OrderTimeline } from "@/features/pedidos/order-timeline";
import { OrderNotificationCenter } from "@/features/pedidos/order-notification-center";
import { DeliveryTracking } from "./delivery-tracking";
import "@/styles/order-tracking.css";
export function OrderTrackingPage({ order }: { order: Order }) {
  const heading = useHeadingFocus(), stages = stagesFor(order.delivery), { state } = useRosita();
  return <div className="container customer-page order-page tracking-page">
    <Link className="back-link" to="/mis-pedidos"><ArrowLeft size={16} aria-hidden="true" />Mis pedidos</Link>
    <header className="tracking-page-heading"><div><h1 ref={heading} tabIndex={-1}>Así va tu pedido.</h1><p className="tracking-order-code">{order.id}</p></div><div><time dateTime={order.createdAt}>{orderDate(order.createdAt)}</time><p>Pedido de demostración · Sin cobros ni reparto real</p></div></header>
    <div className="tracking-layout">
      <section className="customer-panel tracking-order-panel" aria-labelledby="tracking-order-title">
        <div className="tracking-current-state"><Package size={24} aria-hidden="true" /><div><span>Estado del pedido</span><h2 id="tracking-order-title" aria-live="polite">{stages[order.status]}</h2></div></div>
        <OrderTimeline order={order} />
        <h3 className="tracking-summary-title">Resumen de tu pedido</h3>
        <OrderSummary quote={order} delivery={order.delivery} payment={order.payment} cardReceipt={order.cardReceipt} />
        <OrderNotificationCenter />
        <details className="tracking-history"><summary>Historial del pedido</summary><StatusHistory order={order} /><p className="tracking-hint">Los cambios del pedido se registran desde administración. La demostración del mapa no cambia este historial.</p></details>
        <Link className="text-link tracking-continue" to="/catalogo">Continuar comprando<ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
      <DeliveryTracking key={`${order.id}:${state.storeLocation.lat}:${state.storeLocation.lng}`} order={order} />
    </div>
  </div>;
}
