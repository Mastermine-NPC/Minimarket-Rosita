import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingBag, LogOut } from "lucide-react";
import { useRosita } from "@/hooks/use-rosita";
import { isStaff, openShift, priceCashDraft } from "@/lib/operations";
import { isAdmin, activeUser } from "@/lib/admin-operations";
import { solesToCents } from "@/lib/checkout-validation";
import { money } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmAction } from "@/components/operation-confirmation";
import { CardSimulation } from "@/features/pedidos/card-simulation";
import { CashCatalog } from "@/features/caja/cash-catalog";
import { CashShiftPanel } from "@/features/caja/cash-shift";
import { CashHistory } from "@/features/caja/cash-history";
import { SaleReceipt } from "@/features/caja/sale-receipt";
import type { CardApproval } from "@/types/commerce";
import type { RositaState } from "@/types/state";
import { motionTokens } from "@/lib/motion";
export function CashPage() {
  const { state } = useRosita();
  if (!isStaff(state))
    return (
      <main className="container customer-empty">
        <h1>Caja de Rosita</h1>
        <p>
          Requiere un agente de caja o administrador activo de demostración. La
          separación local no equivale a seguridad de servidor.
        </p>
        <Button asChild>
          <Link to="/personal">Acceso de personal</Link>
        </Button>
        <Link to="/">Volver a tienda</Link>
      </main>
    );
  return <CashWorkspace key={state.sessionUserId} />;
}
function CashWorkspace() {
  const { state, dispatch, initialNotice } = useRosita(),
    navigate = useNavigate(),
    [tab, Tab] = useState("venta"),
    actor = activeUser(state)!,
    shift = openShift(state);
  return (
    <main className="cash-page">
      <a className="skip-link" href="#cash-content">
        Saltar al contenido
      </a>
      <header className="cash-header">
        <div>
          <span className="eyebrow">MINIMARKET ROSITA · PERSONAL</span>
          <h1>
            <ShoppingBag aria-hidden="true" /> Caja de demostración
          </h1>
          <p>
            {actor.name} ·{" "}
            {shift ? "Turno abierto" : "Abre un turno para vender"}
          </p>
        </div>
        <div className="customer-actions">
          <Button asChild variant="outline">
            <Link to="/">Ver tienda</Link>
          </Button>
          {isAdmin(state) && (
            <Button asChild variant="outline">
              <Link to="/admin">Administración</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              dispatch({ type: "auth/logout" });
              navigate("/personal");
            }}
          >
            <LogOut aria-hidden="true" /> Salir
          </Button>
        </div>
      </header>
      {initialNotice && <p role="status">{initialNotice}</p>}
      <p className="hint">
        Operaciones ficticias, sin cobros reales. Los datos se guardan en este
        navegador.
      </p>
      <nav className="cash-tabs" aria-label="Secciones de caja">
        {[
          ["venta", "Nueva venta"],
          ["turno", "Turno y cierre"],
          ["historial", "Historial"],
        ].map(([id, label]) => (
          <Button
            key={id}
            variant={tab === id ? "default" : "outline"}
            aria-current={tab === id ? "page" : undefined}
            onClick={() => Tab(id)}
          >
            {label}
          </Button>
        ))}
      </nav>
      <div id="cash-content">
        {tab === "venta" ? (
          <>
            {!shift && (
              <div className="cash-panel">
                <p>Necesitas abrir un turno con fondo inicial.</p>
                <Button onClick={() => Tab("turno")}>
                  Ir a apertura de turno
                </Button>
              </div>
            )}
            <div className="cash-grid">
              <CashCatalog disabled={!shift} />
              <CashSale />
            </div>
          </>
        ) : tab === "turno" ? (
          <CashShiftPanel key={shift?.id || "closed"} />
        ) : (
          <CashHistory />
        )}
      </div>
    </main>
  );
}
function CashSale() {
  const { state, dispatch } = useRosita(),
    priced = priceCashDraft(state),
    actor = activeUser(state)!,
    shift = openShift(state),
    draft = state.cashDrafts[actor.id],
    [method, Method] = useState<"cash" | "card-demo">("cash"),
    [amount, Amount] = useState(""),
    [approval, Approval] = useState<CardApproval | null>(null),
    [processing, Processing] = useState(false),
    [receipt, Receipt] = useState(""),
    [error, Error] = useState(""),
    [invalid, Invalid] = useState<Record<string, boolean>>({}),
    lock = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    latest = useRef<RositaState>(state);
  useEffect(() => {
    latest.current = state;
  }, [state]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const received = solesToCents(amount),
    cardValid =
      approval?.fingerprint === priced.fingerprint &&
      approval.token === priced.token &&
      approval.userId === actor.id;
  function charge() {
    if (lock.current) return;
    const problem =
      (Object.keys(draft?.cart || {}).some((id) => invalid[id])
        ? "Corrige la cantidad indicada antes de cobrar."
        : "") ||
      priced.error ||
      (!shift ? "Abre un turno." : "") ||
      (method === "cash"
        ? received === null
          ? "Introduce el efectivo recibido."
          : received < priced.subtotalCents
            ? "El efectivo recibido no cubre el total."
            : ""
        : !cardValid
          ? "Simula una tarjeta aprobada para esta venta."
          : "");
    if (problem) {
      Error(problem);
      return;
    }
    lock.current = true;
    Processing(true);
    Error("");
    const captured = priced.fingerprint,
      token = priced.token,
      user = actor.id;
    timer.current = setTimeout(() => {
      lock.current = false;
      Processing(false);
      const current = latest.current;
      if (
        current.sessionUserId !== user ||
        priceCashDraft(current).fingerprint !== captured
      ) {
        Error("La venta cambió durante el procesamiento. Revisa de nuevo.");
        return;
      }
      const id = "CAJA-" + crypto.randomUUID();
      Receipt(id);
      dispatch({
        type: "cash/confirm",
        operationId: crypto.randomUUID(),
        at: new Date().toISOString(),
        id,
        token,
        fingerprint: captured,
        payment: method,
        cashTenderCents: received,
        cardApproval: approval,
      });
      Approval(null);
      Amount("");
    }, motionTokens.processing * 1000);
  }
  return (
    <section className="cash-panel">
      <h2>Venta actual</h2>
      <p>
        Precios compartidos con la tienda. El borrador no descuenta existencias.
      </p>
      {Object.entries(draft?.cart || {}).map(([id, qty]) => {
        const p = state.products.find((p) => p.id === id)!;
        return (
          <div className="cash-line" key={id}>
            <strong>{p.name}</strong>
            <small>
              {p.presentation} · Precio unitario{" "}
              {money(state.inventory[id].priceCents)} · Stock{" "}
              {state.inventory[id].stock}
            </small>
            <div className="cash-line-controls">
              <Button
                variant="outline"
                disabled={processing || qty <= 1}
                aria-label={"Disminuir " + p.name}
                onClick={() =>
                  dispatch({
                    type: "cash/cart",
                    kind: "set",
                    id,
                    quantity: qty - 1,
                    token: priced.token,
                  })
                }
              >
                −
              </Button>
              <CashQuantity
                key={id + ":" + qty}
                name={p.name}
                value={qty}
                disabled={processing}
                max={state.inventory[id].stock}
                onValidity={(valid) =>
                  Invalid((old) => ({ ...old, [id]: !valid }))
                }
                onChange={(quantity) =>
                  dispatch({
                    type: "cash/cart",
                    kind: "set",
                    id,
                    quantity,
                    token: priced.token,
                  })
                }
              />
              <Button
                variant="outline"
                disabled={processing || qty >= state.inventory[id].stock}
                aria-label={"Aumentar " + p.name}
                onClick={() =>
                  dispatch({
                    type: "cash/cart",
                    kind: "set",
                    id,
                    quantity: qty + 1,
                    token: priced.token,
                  })
                }
              >
                +
              </Button>
              <Button
                variant="ghost"
                disabled={processing}
                onClick={() =>
                  dispatch({
                    type: "cash/cart",
                    kind: "remove",
                    id,
                    quantity: 0,
                    token: priced.token,
                  })
                }
              >
                Eliminar
              </Button>
              <strong>{money(qty * state.inventory[id].priceCents)}</strong>
            </div>
          </div>
        );
      })}
      {!Object.keys(draft?.cart || {}).length && (
        <p>Venta vacía. Busca un producto o lee su código para comenzar.</p>
      )}
      <div className="cash-total">
        <span>Total</span>
        <strong>{money(priced.subtotalCents)}</strong>
      </div>
      {priced.error && Object.keys(draft?.cart || {}).length > 0 && (
        <p role="alert" className="field-error">
          ⚠ {priced.error}
        </p>
      )}
      <div className="customer-form">
        <label htmlFor="cash-method">Medio de pago</label>
        <select
          id="cash-method"
          value={method}
          disabled={processing}
          onChange={(e) => {
            Method(e.target.value as "cash" | "card-demo");
            Approval(null);
            Error("");
          }}
        >
          <option value="cash">Efectivo simulado</option>
          <option value="card-demo">Tarjeta simulada</option>
        </select>
        {method === "cash" ? (
          <>
            <label htmlFor="cash-received">Efectivo recibido (soles)</label>
            <Input
              id="cash-received"
              inputMode="decimal"
              value={amount}
              disabled={processing}
              onChange={(e) => {
                Amount(e.target.value);
                Error("");
              }}
            />
            <p aria-live="polite">
              {received === null
                ? "Indica un monto válido."
                : received < priced.subtotalCents
                  ? "Efectivo insuficiente · faltan " +
                    money(priced.subtotalCents - received)
                  : "Vuelto simulado: " +
                    money(received - priced.subtotalCents)}
            </p>
          </>
        ) : (
          <CardSimulation
            key={priced.token}
            totalCents={priced.subtotalCents}
            chargeContext={{
              fingerprint: priced.fingerprint,
              token: priced.token,
              userId: actor.id,
            }}
            approval={cardValid ? approval : null}
            onApproval={Approval}
          />
        )}
        <Button
          disabled={
            processing ||
            !shift ||
            !!priced.error ||
            Object.keys(draft?.cart || {}).some((id) => invalid[id])
          }
          aria-busy={processing}
          onClick={charge}
        >
          {processing ? "Procesando venta…" : "Cobrar venta simulada"}
        </Button>
        <p className="hint">
          Revisamos de nuevo precios y stock al confirmar. No se permite un
          cobro duplicado.
        </p>
        <ConfirmAction
          trigger={
            <Button
              variant="outline"
              disabled={processing || !Object.keys(draft?.cart || {}).length}
            >
              Vaciar venta
            </Button>
          }
          title="¿Vaciar el borrador de caja?"
          description="No elimina ventas históricas ni modifica existencias."
          label="Confirmar vaciado"
          success="Borrador vaciado"
          build={(operationId) => ({
            operationId,
            type: "cash/cart",
            kind: "clear",
            id: "",
            quantity: 0,
            token: priced.token,
          })}
        />
        {(error || (!state.adminResult.ok && state.adminResult.error)) && (
          <p role="alert" className="field-error">
            ⚠ {error || state.adminResult.error}
          </p>
        )}
      </div>
      <SaleReceipt
        sale={state.sales.find(
          (s) => s.id === receipt && s.agentId === actor.id,
        )}
        onClose={() => {
          Receipt("");
          requestAnimationFrame(() =>
            document.getElementById("cash-scan")?.focus(),
          );
        }}
      />
    </section>
  );
}
function CashQuantity({
  name,
  value,
  max,
  disabled,
  onChange,
  onValidity,
}: {
  onValidity: (valid: boolean) => void;
  name: string;
  value: number;
  max: number;
  disabled: boolean;
  onChange: (v: number) => void;
}) {
  const [draft, Draft] = useState(String(value)),
    [error, Error] = useState("");
  return (
    <div>
      <Input
        aria-label={"Cantidad de " + name}
        aria-invalid={!!error}
        inputMode="numeric"
        disabled={disabled}
        value={draft}
        onChange={(e) => {
          Draft(e.target.value);
          const n = Number(e.target.value);
          if (
            !/^\d+$/.test(e.target.value) ||
            !Number.isSafeInteger(n) ||
            n < 1 ||
            n > max
          ) {
            onValidity(false);
            Error("Usa 1–" + max + " unidades enteras.");
            return;
          }
          Error("");
          onValidity(true);
          onChange(n);
        }}
      />
      {error && (
        <small role="alert" className="field-error">
          ⚠ {error}
        </small>
      )}
    </div>
  );
}
