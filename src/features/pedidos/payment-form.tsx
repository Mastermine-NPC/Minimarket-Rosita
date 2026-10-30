import { CardSimulation } from "./card-simulation";
import { prepareQuote } from "@/lib/order-transaction";
import type { CardApproval } from "@/types/commerce";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, ArrowRight, Banknote, Smartphone } from "lucide-react";
import { useRosita } from "@/hooks/use-rosita";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { paymentLabels } from "@/data/delivery";
import { paymentProblem, solesToCents } from "@/lib/checkout-validation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Payment } from "@/types/commerce";
import { money } from "@/lib/currency";
export function PaymentForm({
  totalCents,
  approval,
  onApproval,
}: {
  totalCents: number;
  approval: CardApproval | null;
  onApproval: (a: CardApproval | null) => void;
}) {
  const { state, dispatch } = useRosita(),
    heading = useHeadingFocus(),
    {
      register,
      control,
      getValues,
      handleSubmit,
      setError,
      formState: { errors },
    } = useForm<Payment>({ defaultValues: state.checkout.payment }),
    method = useWatch({ control, name: "method" }),
    cash = solesToCents(useWatch({ control, name: "cashAmount" }));
  return (
    <section className="customer-panel">
      <span className="eyebrow">PASO 2 DE 3</span>
      <h2 ref={heading} tabIndex={-1}>
        Un pago, solo de prueba.
      </h2>
      <p>
        No se realiza ningún cobro. Usa solo datos ficticios; no necesitas
        comprobantes ni transferencias reales.
      </p>
      <form
        className="customer-form"
        noValidate
        onChange={() => {
          onApproval(null);
          dispatch({ type: "checkout/draft-payment", payment: getValues() });
        }}
        onSubmit={handleSubmit((payment) => {
          const problem = paymentProblem(payment, totalCents);
          if (
            payment.method === "card-demo" &&
            (!approval ||
              approval.fingerprint !== prepareQuote(state).quote?.fingerprint ||
              approval.token !== state.checkout.token ||
              approval.userId !== state.sessionUserId)
          ) {
            setError("root", {
              message:
                "Simula y aprueba la tarjeta de prueba antes de revisar.",
            });
            return;
          }
          if (problem) {
            setError("cashAmount", { message: problem }, { shouldFocus: true });
            return;
          }
          dispatch({ type: "checkout/payment", payment });
        })}
      >
        <fieldset className="payment-options">
          <legend>Elige un método simulado</legend>
          {(Object.keys(paymentLabels) as Payment["method"][]).map((m) => (
            <label
              key={m}
              className={
                method === m ? "payment-option selected" : "payment-option"
              }
            >
              <input type="radio" value={m} {...register("method")} />
              {m === "cash" ? (
                <Banknote aria-hidden="true" />
              ) : (
                <Smartphone aria-hidden="true" />
              )}
              <span>
                {paymentLabels[m]}
                <small>
                  {m === "cash"
                    ? "Indica con cuánto pagarías."
                    : "Sin QR, enlaces de pago ni transferencias."}
                </small>
              </span>
            </label>
          ))}
        </fieldset>
        {method === "cash" && (
          <div className="field">
            <Label htmlFor="cash-amount">Pagaría con (S/)</Label>
            <Input
              id="cash-amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Ej. 50.00"
              {...register("cashAmount")}
              aria-invalid={!!errors.cashAmount}
              aria-describedby={errors.cashAmount ? "cash-error" : "cash-hint"}
            />
            <p className="hint" id="cash-hint">
              Total con envío: {money(totalCents)}.{" "}
              {cash !== null && cash >= totalCents
                ? "Vuelto simulado: " + money(cash - totalCents)
                : "El monto debe cubrir el total."}
            </p>
            {errors.cashAmount && (
              <p className="field-error" id="cash-error" role="alert">
                ⚠ {errors.cashAmount.message}
              </p>
            )}
          </div>
        )}
        {method === "card-demo" && (
          <CardSimulation
            totalCents={totalCents}
            onApproval={onApproval}
            approval={approval}
          />
        )}
        {errors.root && (
          <p role="alert" className="field-error">
            ⚠ {errors.root.message}
          </p>
        )}
        <div className="customer-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch({ type: "checkout/step", step: 0 })}
          >
            <ArrowLeft aria-hidden="true" />
            Volver a entrega
          </Button>
          <Button type="submit">
            Revisar pedido <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </form>
    </section>
  );
}
