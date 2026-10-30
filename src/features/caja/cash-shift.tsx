import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { useState } from "react";
import { useRosita } from "@/hooks/use-rosita";
import { useOperation } from "@/hooks/use-operation";
import { expectedCash, openShift } from "@/lib/operations";
import { isAdmin } from "@/lib/admin-operations";
import { solesToCents } from "@/lib/checkout-validation";
import { money } from "@/lib/currency";
import { orderDate } from "@/lib/order-date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmAction } from "@/components/operation-confirmation";
export function CashShiftPanel() {
  const heading = useHeadingFocus(),
    { state } = useRosita(),
    shift = openShift(state),
    [amount, Amount] = useState(""),
    [error, Error] = useState(""),
    operation = useOperation(() => Amount(""), "Turno abierto"),
    cents = solesToCents(amount),
    sales = state.sales.filter((s) => s.shiftId === shift?.id);
  return (
    <section className="cash-panel">
      <h2 ref={heading} tabIndex={-1}>
        Turno de caja
      </h2>
      {!shift ? (
        <form
          className="customer-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (cents === null) {
              Error("Indica un fondo válido con hasta dos decimales.");
              return;
            }
            Error("");
            operation.run((operationId, at) => ({
              type: "shift/open",
              operationId,
              at,
              id: "TUR-" + crypto.randomUUID(),
              initialCents: cents,
            }));
          }}
        >
          <label htmlFor="shift-float">Fondo inicial ficticio (soles)</label>
          <Input
            id="shift-float"
            value={amount}
            inputMode="decimal"
            onChange={(e) => Amount(e.target.value)}
          />
          <Button type="submit" disabled={operation.pending}>
            Abrir turno
          </Button>
          {(error || operation.error) && (
            <p role="alert" className="field-error">
              ⚠ {error || operation.error}
            </p>
          )}
        </form>
      ) : (
        <>
          <p>
            Turno {shift.id}
            <br />
            Abierto {orderDate(shift.openedAt)} · Fondo inicial{" "}
            {money(shift.initialCents)}
          </p>
          <p>
            Ventas en efectivo:{" "}
            {money(
              sales
                .filter((s) => s.payment === "cash")
                .reduce((n, s) => n + s.totalCents, 0),
            )}
            <br />
            Tarjetas simuladas:{" "}
            {money(
              sales
                .filter((s) => s.payment === "card-demo")
                .reduce((n, s) => n + s.totalCents, 0),
            )}
            <br />
            <strong>
              Efectivo esperado: {money(expectedCash(state, shift.id))}
            </strong>
          </p>
          <p className="hint">
            Fondo inicial + efectivo recibido − vuelto. No incluye tarjetas ni
            pedidos digitales pendientes de pago.
          </p>
          <label htmlFor="shift-count">
            Efectivo contado para cerrar (soles)
          </label>
          <Input
            id="shift-count"
            inputMode="decimal"
            value={amount}
            onChange={(e) => Amount(e.target.value)}
          />
          <p>
            Diferencia:{" "}
            {cents === null
              ? "Introduce un importe válido"
              : money(cents - expectedCash(state, shift.id))}
          </p>
          <ConfirmAction
            trigger={<Button disabled={cents === null}>Cerrar turno</Button>}
            title="¿Cerrar este turno?"
            description="El fondo, efectivo contado y diferencia quedarán guardados como historial. Vacía antes cualquier venta pendiente."
            label="Confirmar cierre"
            success="Turno cerrado"
            build={(operationId, at) => ({
              type: "shift/close",
              operationId,
              at,
              id: shift.id,
              countedCents: cents ?? -1,
            })}
          />
        </>
      )}
      <h3>Cierres históricos</h3>
      <div className="cash-table">
        <table>
          <thead>
            <tr>
              <th>Agente / turno</th>
              <th>Cierre</th>
              <th>Esperado</th>
              <th>Contado</th>
              <th>Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {state.shifts
              .filter(
                (s) =>
                  s.closedAt &&
                  (isAdmin(state) || s.agentId === state.sessionUserId),
              )
              .map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.agentName}
                    <br />
                    {s.id}
                  </td>
                  <td>{orderDate(s.closedAt!)}</td>
                  <td>{money(s.expectedCents!)}</td>
                  <td>{money(s.countedCents!)}</td>
                  <td>{money(s.differenceCents!)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
