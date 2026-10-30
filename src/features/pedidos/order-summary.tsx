import { money } from "@/lib/currency";
import type { Quote, Delivery, PaymentMethod } from "@/types/commerce";
import { paymentLabels } from "@/data/delivery";
export function OrderSummary({
  quote,
  delivery,
  payment,
}: {
  quote: Omit<Quote, "fingerprint">;
  delivery?: Delivery;
  payment?: PaymentMethod;
}) {
  return (
    <div className="order-summary">
      <ul className="review-lines">
        {quote.lines.map((line) => (
          <li key={line.productId}>
            <div>
              <strong>{line.name}</strong>
              <span>{line.presentation}</span>
              <small>
                {line.quantity} × {money(line.unitPriceCents)}
              </small>
            </div>
            <strong>{money(line.lineTotalCents)}</strong>
          </li>
        ))}
      </ul>
      <dl className="order-totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{money(quote.subtotalCents)}</dd>
        </div>
        <div>
          <dt>Envío de demostración</dt>
          <dd>{money(quote.shippingCents)}</dd>
        </div>
        <div className="order-total">
          <dt>Total</dt>
          <dd>{money(quote.totalCents)}</dd>
        </div>
      </dl>
      {delivery && (
        <div className="order-info">
          <h3>Entrega de demostración</h3>
          <p>
            <strong>{delivery.recipient}</strong>
            <br />
            {delivery.phone}
            <br />
            {delivery.address}
            <br />
            {quote.zoneLabel}
            {delivery.reference && (
              <>
                <br />
                Referencia: {delivery.reference}
              </>
            )}
          </p>
          <p className="hint">
            Estimación ficticia: {quote.estimate}. No representa cobertura ni un
            reparto real.
          </p>
        </div>
      )}
      {payment && (
        <div className="order-info">
          <h3>Pago</h3>
          <p>{paymentLabels[payment]}</p>
          {quote.cashTenderCents !== null && (
            <p>
              Efectivo previsto: {money(quote.cashTenderCents)} · Vuelto
              simulado: {money(quote.cashTenderCents - quote.totalCents)}
            </p>
          )}
          <p className="hint">No se ha realizado ningún cobro.</p>
        </div>
      )}
    </div>
  );
}
