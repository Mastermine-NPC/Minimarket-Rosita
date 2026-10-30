import { Link } from "react-router";
import { Package, ArrowUpRight } from "lucide-react";
import { useRosita } from "@/hooks/use-rosita";
import { CustomerGate } from "@/features/acceso/customer-gate";
import { Button } from "@/components/ui/button";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { money } from "@/lib/currency";
import { orderStages } from "@/data/delivery";
import { orderDate } from "@/lib/order-date";
export function OrdersPage() {
  const { state } = useRosita(),
    heading = useHeadingFocus(),
    orders = state.orders.filter((o) => o.userId === state.sessionUserId);
  if (!state.sessionUserId) return <CustomerGate returnTo="/mis-pedidos" />;
  return (
    <div className="container customer-page">
      <span className="eyebrow">TU HISTORIAL LOCAL</span>
      <h1 ref={heading} tabIndex={-1}>
        Tus pedidos, a mano.
      </h1>
      <p>
        Solo los pedidos de tu cliente activo. Son simulaciones, sin cobros ni
        entregas reales.
      </p>
      {!orders.length ? (
        <section className="customer-panel history-empty">
          <Package size={40} aria-hidden="true" />
          <h2>Aún no tienes pedidos.</h2>
          <p>Cuando confirmes una compra de demostración aparecerá aquí.</p>
          <Button asChild>
            <Link to="/catalogo">Explorar productos</Link>
          </Button>
        </section>
      ) : (
        <div className="order-history">
          {orders.map((o) => (
            <article className="customer-panel order-history-card" key={o.id}>
              <div>
                <span className="status-chip">{orderStages[o.status]}</span>
                <h2>{o.id}</h2>
                <time dateTime={o.createdAt}>{orderDate(o.createdAt)}</time>
              </div>
              <div className="order-history-products">
                {o.lines.map((l) => (
                  <p key={l.productId}>
                    {l.quantity} × {l.name}
                  </p>
                ))}
                <strong>{money(o.totalCents)}</strong>
              </div>
              <div className="customer-actions">
                <Button asChild>
                  <Link to={"/pedido/" + o.id + "/seguimiento"}>
                    Seguir pedido <ArrowUpRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={"/pedido/" + o.id}>Ver detalle</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="hint">
        La separación de clientes es local y no equivale a autorización de
        servidor.
      </p>
    </div>
  );
}
