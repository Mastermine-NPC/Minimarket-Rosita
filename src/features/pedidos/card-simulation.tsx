import { motionTokens } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRosita } from "@/hooks/use-rosita";
import { prepareQuote } from "@/lib/order-transaction";
import type { CardApproval } from "@/types/commerce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money } from "@/lib/currency";
const cardFixtures = {
  approved: "0000 0000 0000 0001",
  declined: "0000 0000 0000 0002",
  error: "0000 0000 0000 0003",
} as const;
const schema = z.object({
  holder: z
    .string()
    .trim()
    .refine((v) => v === "CLIENTE DEMO", "Usa exclusivamente CLIENTE DEMO."),
  number: z
    .string()
    .transform((v) => v.replaceAll(" ", ""))
    .refine(
      (v) =>
        ["0000000000000001", "0000000000000002", "0000000000000003"].includes(
          v,
        ),
      "Usa uno de los tres números ficticios indicados.",
    ),
  expiry: z
    .string()
    .refine((v) => v === "12/99", "Usa el vencimiento ficticio 12/99."),
  cvv: z
    .string()
    .refine((v) => v === "123", "Usa el CVV ficticio indicado: 123."),
});
export function CardSimulation({
  totalCents,
  chargeContext,
  approval,
  onApproval,
}: {
  totalCents: number;
  chargeContext?: { fingerprint: string; token: string; userId: string };
  approval: CardApproval | null;
  onApproval: (a: CardApproval | null) => void;
}) {
  const { state } = useRosita(),
    [status, Status] = useState(""),
    [busy, Busy] = useState(false),
    lock = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    alive = useRef(true);
  const fingerprint =
      chargeContext?.fingerprint ||
      prepareQuote(state).quote?.fingerprint ||
      "",
    currentToken = chargeContext?.token || state.checkout.token,
    currentUser = chargeContext?.userId || state.sessionUserId,
    binding = useRef(fingerprint);
  useEffect(() => {
    binding.current = fingerprint;
  }, [fingerprint]);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { holder: "", number: "", expiry: "", cvv: "" },
  });
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const valid =
    approval?.fingerprint === fingerprint &&
    approval?.token === currentToken &&
    approval?.userId === currentUser;
  function simulate() {
    return handleSubmit((v) => {
      if (lock.current) return;
      lock.current = true;
      Busy(true);
      Status("");
      onApproval(null);
      const captured = fingerprint,
        token = currentToken,
        userId = currentUser;
      timer.current = setTimeout(() => {
        lock.current = false;
        if (!alive.current) return;
        Busy(false);
        if (captured !== binding.current) {
          Status("La compra cambió. Revisa el importe y simula otra vez.");
          return;
        }
        if (v.number.endsWith("1") && captured && userId) {
          onApproval({
            reference: "DEMO-" + crypto.randomUUID(),
            brand: "Demo",
            last4: "0001",
            fingerprint: captured,
            token,
            userId,
          });
          Status(
            "✓ Pago simulado aprobado. No se realizó ningún cobro. Puedes revisar el pedido.",
          );
          reset();
        } else
          Status(
            v.number.endsWith("2")
              ? "Tarjeta ficticia rechazada. Tu carrito se conserva. Puedes usar el escenario aprobado."
              : "Error simulado de conexión. No se creó un pedido. Puedes reintentar.",
          );
      }, motionTokens.payment * 1000);
    })();
  }
  return (
    <fieldset className="card-simulation" disabled={busy}>
      <legend>Tarjeta exclusivamente ficticia</legend>
      <p>
        No ingreses datos reales. No se realiza ningún cobro. Titular CLIENTE
        DEMO · vencimiento 12/99 · CVV 123.
      </p>
      <div className="card-fixtures">
        {Object.entries(cardFixtures).map(([id, number]) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            onClick={() => {
              onApproval(null);
              Status("");
              setValue("holder", "CLIENTE DEMO");
              setValue("number", number);
              setValue("expiry", "12/99");
              setValue("cvv", "123");
            }}
          >
            Completar{" "}
            {id === "approved"
              ? "aprobación"
              : id === "declined"
                ? "rechazo"
                : "error"}
          </Button>
        ))}
      </div>
      <p className="hint">
        Solo números de demostración: 0000 0000 0000 0001 (aprueba), 0002
        (rechaza), 0003 (error). Vencimiento de prueba en diciembre de 2099.
      </p>
      {(
        [
          ["holder", "Titular"],
          ["number", "Número de tarjeta ficticio"],
          ["expiry", "Vencimiento MM/AA"],
          ["cvv", "CVV ficticio"],
        ] as const
      ).map(([key, label]) => (
        <div className="field" key={key}>
          <Label htmlFor={"card-" + key}>{label}</Label>
          <Input
            id={"card-" + key}
            type={key === "cvv" ? "password" : "text"}
            autoComplete="off"
            inputMode={key === "holder" ? "text" : "numeric"}
            maxLength={
              key === "number"
                ? 19
                : key === "expiry"
                  ? 5
                  : key === "cvv"
                    ? 3
                    : 40
            }
            {...register(key)}
            onChange={(e) => {
              onApproval(null);
              Status("");
              let v = e.target.value;
              if (key === "number")
                v = v
                  .replace(/\D/g, "")
                  .slice(0, 16)
                  .replace(/(.{4})/g, "$1 ")
                  .trim();
              if (key === "expiry") {
                const n = v.replace(/\D/g, "").slice(0, 4);
                v = n.length > 2 ? n.slice(0, 2) + "/" + n.slice(2) : n;
              }
              setValue(key, v, { shouldDirty: true });
            }}
            aria-invalid={!!errors[key]}
            aria-describedby={
              errors[key] ? "card-" + key + "-error" : undefined
            }
          />
          {errors[key] && (
            <p
              role="alert"
              className="field-error"
              id={"card-" + key + "-error"}
            >
              ⚠ {errors[key]?.message}
            </p>
          )}
        </div>
      ))}
      <p>
        Importe de esta simulación: <strong>{money(totalCents)}</strong>
      </p>
      <Button type="button" aria-busy={busy} onClick={() => void simulate()}>
        {busy ? "Procesando tarjeta…" : "Simular pago con tarjeta"}
      </Button>
      <p role="status">
        {status ||
          (valid
            ? "✓ Aprobación vigente para esta compra."
            : "Necesitas una aprobación para el importe y carrito actuales.")}
      </p>
    </fieldset>
  );
}
