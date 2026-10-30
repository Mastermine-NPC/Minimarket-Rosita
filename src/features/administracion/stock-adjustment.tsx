import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useOperation } from "@/hooks/use-operation";
import type { Product } from "@/types/catalog";
export function StockAdjustment({
  product,
  trigger,
}: {
  product: Product;
  trigger: ReactNode;
}) {
  const [open, Open] = useState(false),
    [snapshot, Snapshot] = useState(product.stock);
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) Snapshot(product.stock);
        Open(v);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar inventario</DialogTitle>
          <DialogDescription>
            {product.name} · {product.id}. Existencias al abrir: {snapshot}{" "}
            unidades. Cada ajuste requiere un motivo.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <AdjustmentForm
            product={product}
            before={snapshot}
            close={() => Open(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
function AdjustmentForm({
  product,
  before,
  close,
}: {
  product: Product;
  before: number;
  close: () => void;
}) {
  const {
      register,
      handleSubmit,
      control,
      setError,
      formState: { errors },
    } = useForm<{
      kind: "entry" | "manual-out" | "count";
      quantity: string;
      reason: string;
    }>({ defaultValues: { kind: "entry", quantity: "1", reason: "" } }),
    { run, error, pending } = useOperation(
      close,
      "Movimiento de inventario registrado",
    );
  return (
    <form
      className="customer-form"
      noValidate
      onSubmit={handleSubmit((v) => {
        const quantity = /^\d+$/.test(v.quantity) ? Number(v.quantity) : NaN;
        if (
          !Number.isSafeInteger(quantity) ||
          quantity < 0 ||
          quantity > 1000000 ||
          (v.kind !== "count" && quantity === 0)
        ) {
          setError(
            "quantity",
            {
              message:
                "Escribe una cantidad entera válida (0–1 000 000; entradas/salidas mayores que cero).",
            },
            { shouldFocus: true },
          );
          return;
        }
        if (v.reason.trim().length < 5 || v.reason.trim().length > 200) {
          setError(
            "reason",
            { message: "Explica el motivo con 5–200 caracteres." },
            { shouldFocus: true },
          );
          return;
        }
        run((operationId, at) => ({
          type: "admin/stock",
          operationId,
          at,
          id: product.id,
          kind: v.kind,
          quantity,
          reason: v.reason,
          expectedStock: before,
        }));
      })}
    >
      <div className="field">
        <Label htmlFor="stock-kind">Tipo de movimiento</Label>
        <select id="stock-kind" {...register("kind")}>
          <option value="entry">Entrada</option>
          <option value="manual-out">Salida manual</option>
          <option value="count">
            Corrección de conteo · indicar stock final
          </option>
        </select>
      </div>
      <AdjustmentQuantity control={control} before={before} />
      <div className="field">
        <Label htmlFor="stock-quantity">
          Cantidad (o stock final para corrección)
        </Label>
        <Input
          id="stock-quantity"
          inputMode="numeric"
          {...register("quantity")}
          aria-invalid={!!errors.quantity}
          aria-describedby={
            errors.quantity ? "stock-quantity-error" : undefined
          }
        />
        {errors.quantity && (
          <p role="alert" id="stock-quantity-error" className="field-error">
            ⚠ {errors.quantity.message}
          </p>
        )}
      </div>
      <div className="field">
        <Label htmlFor="stock-reason">Motivo obligatorio</Label>
        <Input
          id="stock-reason"
          {...register("reason")}
          aria-invalid={!!errors.reason}
          aria-describedby={errors.reason ? "stock-reason-error" : undefined}
        />
        {errors.reason && (
          <p role="alert" id="stock-reason-error" className="field-error">
            ⚠ {errors.reason.message}
          </p>
        )}
      </div>
      {error && (
        <p className="field-error" role="alert">
          ⚠ {error}
        </p>
      )}
      <div className="admin-form-footer">
        <Button variant="outline" type="button" onClick={close}>
          Cancelar ajuste
        </Button>
        <Button type="submit" disabled={pending}>
          Registrar ajuste
        </Button>
      </div>
    </form>
  );
}
import { useWatch, type Control } from "react-hook-form";
function AdjustmentQuantity({
  control,
  before,
}: {
  control: Control<{
    kind: "entry" | "manual-out" | "count";
    quantity: string;
    reason: string;
  }>;
  before: number;
}) {
  const kind = useWatch({ control, name: "kind" }),
    raw = useWatch({ control, name: "quantity" }),
    n = /^\d+$/.test(raw) ? Number(raw) : NaN,
    after = kind === "count" ? n : before + (kind === "entry" ? n : -n);
  return (
    <p className="admin-adjust-preview" aria-live="polite">
      Antes: {before} · Después: {Number.isFinite(after) ? after : "—"} ·
      Diferencia:{" "}
      {Number.isFinite(after)
        ? (after - before > 0 ? "+" : "") + (after - before)
        : "—"}
      {after < 0 && <strong> · La salida supera el stock disponible.</strong>}
    </p>
  );
}
