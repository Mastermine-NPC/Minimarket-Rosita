import { storeAddress } from "@/data/geography";
import { money } from "@/lib/currency";
import type {
  Quote,
  Delivery,
  PaymentMethod,
  CardReceipt,
} from "@/types/commerce";
import { paymentLabels } from "@/data/delivery";
export function OrderSummary({
  quote,
  delivery,
  payment,
  cardReceipt,
}: {
  quote: Omit<Quote, "fingerprint">;
  delivery?: Delivery;
  payment?: PaymentMethod;
  cardReceipt?: CardReceipt;
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
          <h3>
            {delivery.mode === "pickup"
              ? "Recojo en tienda"
              : "Entrega de demostración"}
          </h3>
          <p>
            <strong>{delivery.recipient}</strong>
            <br />
            {delivery.phone}
            <br />
            {delivery.mode === "pickup" ? storeAddress : delivery.address}
            <br />
            {quote.zoneLabel}
            {delivery.point && (
              <>
                <br />
                Punto confirmado: {delivery.point.lat.toFixed(6)},{" "}
                {delivery.point.lng.toFixed(6)}
              </>
            )}
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
          {cardReceipt && (
            <p>
              Demo · terminada en {cardReceipt.last4}
              <br />
              Referencia ficticia: {cardReceipt.reference}
            </p>
          )}
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
