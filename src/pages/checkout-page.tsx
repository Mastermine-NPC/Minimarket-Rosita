import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Check, LoaderCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import { useRosita } from "@/hooks/use-rosita";
import { useCart } from "@/hooks/use-cart";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { motionTokens } from "@/lib/motion";
import { CustomerGate } from "@/features/acceso/customer-gate";
import { DeliveryForm } from "@/features/pedidos/delivery-form";
import { PaymentForm } from "@/features/pedidos/payment-form";
import { OrderSummary } from "@/features/pedidos/order-summary";
import { money } from "@/lib/currency";
import { priceCart, deliveryAmounts } from "@/lib/cart-pricing";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
export function CheckoutPage() {
  const { state, dispatch } = useRosita(),
    { count } = useCart(),
    heading = useHeadingFocus(),
    reduced = useMotionPreference(),
    navigate = useNavigate(),
    [busy, Busy] = useState(false),
    [request, Request] = useState(""),
    lock = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    errorRef = useRef<HTMLDivElement>(null),
    draft = state.checkout;
  const created = state.orders.find(
      (o) => o.requestId === request && o.userId === state.sessionUserId,
    ),
    { subtotalCents } = priceCart(state),
    { zone, totalCents } = deliveryAmounts(subtotalCents, draft.delivery.zone);
  useEffect(() => {
    if (state.sessionUserId && count && !draft.token)
      dispatch({ type: "checkout/start", token: crypto.randomUUID() });
  }, [state.sessionUserId, count, draft.token, dispatch]);
  useEffect(() => {
    if (created)
      navigate("/pedido/" + created.id + "/confirmacion", { replace: true });
  }, [created, navigate]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (draft.error) errorRef.current?.focus();
  }, [draft.error]);
  function confirm() {
    if (lock.current || !draft.quote) return;
    lock.current = true;
    Busy(true);
    Request(draft.token);
    const action = {
      type: "order/confirm" as const,
      token: draft.token,
      id: "ROS-" + crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    timer.current = setTimeout(() => {
      dispatch(action);
      lock.current = false;
      Busy(false);
    }, 350);
  }
  if (created)
    return (
      <div role="status" className="container customer-empty">
        Pedido creado. Abriendo confirmación…
      </div>
    );
  if (!count)
    return (
      <section className="container customer-empty">
        <h1 ref={heading} tabIndex={-1}>
          Primero, algo para tu carrito.
        </h1>
        <p>No hay productos para preparar un pedido.</p>
        <Button asChild>
          <Link to="/catalogo">Explorar productos</Link>
        </Button>
      </section>
    );
  if (!state.sessionUserId) return <CustomerGate returnTo="/checkout" />;
  if (
    state.users.find((u) => u.id === state.sessionUserId)?.role !== "customer"
  )
    return (
      <section className="container customer-empty">
        <h1 ref={heading} tabIndex={-1}>
          Compra con un cliente de demostración.
        </h1>
        <p>
          El administrador gestiona el negocio. Cierra su sesión para
          identificarte como cliente; tu carrito se conserva.
        </p>
        <Button asChild>
          <Link to="/admin">Volver al panel</Link>
        </Button>
      </section>
    );
  return (
    <div className="container customer-page checkout-page">
      <Link className="back-link" to="/carrito">
        <ArrowLeft size={16} aria-hidden="true" />
        Volver al carrito
      </Link>
      <div className="checkout-title">
        <div>
          <span className="eyebrow">TU COMPRA, PASO A PASO</span>
          <h1 ref={heading} tabIndex={-1}>
            Ya casi lo tienes.
          </h1>
        </div>
        <p>
          <ShieldCheck aria-hidden="true" />
          Pedido de demostración
          <br />
          Sin cobros ni reparto real
        </p>
      </div>
      <ol className="checkout-steps" aria-label="Pasos del checkout">
        {["Entrega", "Pago simulado", "Revisión"].map((label, i) => (
          <li
            key={label}
            aria-current={draft.step === i ? "step" : undefined}
            className={
              draft.step === i ? "current" : draft.step > i ? "complete" : ""
            }
          >
            <span>
              {draft.step > i ? <Check size={16} aria-hidden="true" /> : i + 1}
            </span>
            {i < draft.step ? (
              <button
                disabled={busy}
                onClick={() => dispatch({ type: "checkout/step", step: i })}
              >
                {label}
              </button>
            ) : (
              <strong>{label}</strong>
            )}
          </li>
        ))}
      </ol>
      <div className="checkout-grid">
        <div>
          {draft.error && (
            <Alert
              variant="destructive"
              className="checkout-error"
              tabIndex={-1}
              ref={errorRef}
            >
              <AlertTitle>Revisa antes de continuar</AlertTitle>
              <AlertDescription>{draft.error}</AlertDescription>
            </Alert>
          )}
          <motion.div
            key={draft.step}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduced ? 0 : motionTokens.control,
              ease: motionTokens.ease,
            }}
          >
            {draft.step === 0 ? (
              <DeliveryForm />
            ) : draft.step === 1 ? (
              <PaymentForm totalCents={totalCents} />
            ) : (
              <ReviewStep busy={busy} onConfirm={confirm} />
            )}
          </motion.div>
        </div>
        <aside
          className="customer-panel checkout-aside"
          aria-label="Resumen de importes"
        >
          <span className="eyebrow">EN TU CARRITO</span>
          <h2>
            {count} {count === 1 ? "unidad" : "unidades"}
          </h2>
          <dl className="order-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotalCents)}</dd>
            </div>
            <div>
              <dt>Envío de prueba</dt>
              <dd>{zone ? money(zone.feeCents) : "Elige una zona"}</dd>
            </div>
            <div className="order-total">
              <dt>{zone ? "Total" : "Subtotal actual"}</dt>
              <dd>{money(totalCents)}</dd>
            </div>
          </dl>
          <p className="hint">
            Las tarifas son ficticias y se muestran antes de confirmar. El stock
            se descuenta una sola vez al crear el pedido.
          </p>
          <Link className="text-link" to="/carrito">
            Editar productos
          </Link>
        </aside>
      </div>
    </div>
  );
}
function ReviewStep({
  busy,
  onConfirm,
}: {
  busy: boolean;
  onConfirm: () => void;
}) {
  const { state, dispatch } = useRosita(),
    heading = useHeadingFocus(),
    draft = state.checkout;
  return (
    <section className="customer-panel">
      <span className="eyebrow">PASO 3 DE 3</span>
      <h2 ref={heading} tabIndex={-1}>
        Todo en su lugar.
      </h2>
      <p>
        Revisa los productos, el envío y los datos antes de crear tu pedido
        ficticio.
      </p>
      {draft.quote ? (
        <OrderSummary
          quote={draft.quote}
          delivery={draft.delivery}
          payment={draft.payment.method}
        />
      ) : (
        <div className="review-refresh">
          <p>
            El resumen necesita una nueva revisión. Si no hay stock suficiente,
            corrige primero tu carrito.
          </p>
          <Button onClick={() => dispatch({ type: "checkout/review" })}>
            Actualizar revisión
          </Button>
          <Link className="text-link" to="/carrito">
            Revisar cantidades del carrito
          </Link>
        </div>
      )}
      <div className="customer-actions review-edit">
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => dispatch({ type: "checkout/step", step: 0 })}
        >
          Editar entrega
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => dispatch({ type: "checkout/step", step: 1 })}
        >
          Editar pago
        </Button>
      </div>
      <Button
        className="full-width"
        disabled={busy || !draft.quote}
        aria-busy={busy}
        aria-describedby="confirm-demo-note"
        onClick={onConfirm}
      >
        {busy ? (
          <>
            <LoaderCircle aria-hidden="true" />
            Creando pedido…
          </>
        ) : (
          "Confirmar pedido de demostración"
        )}
      </Button>
      <p id="confirm-demo-note" className="hint">
        Este pedido solo existe en tu navegador. No se enviará al negocio ni se
        realizará un pago.
      </p>
      {busy && (
        <p role="status">
          Procesando una única confirmación. Espera un momento.
        </p>
      )}
    </section>
  );
}
