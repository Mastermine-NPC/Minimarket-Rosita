import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/currency";
import { orderDate } from "@/lib/order-date";
import type { Sale } from "@/types/operations";
export function SaleReceipt({
  sale,
  onClose,
}: {
  sale: Sale | undefined;
  onClose: () => void;
}) {
  useEffect(() => {
    const clean = () => document.body.classList.remove("printing-sale");
    window.addEventListener("afterprint", clean);
    return () => {
      clean();
      window.removeEventListener("afterprint", clean);
    };
  }, []);
  return (
    <Dialog
      open={!!sale}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sale-receipt">
        <DialogHeader>
          <DialogTitle>Minimarket Rosita · venta de prueba</DialogTitle>
          <DialogDescription>
            Demostración — sin validez tributaria
          </DialogDescription>
        </DialogHeader>
        {sale && (
          <>
            <p>
              <strong>{sale.id}</strong>
              <br />
              {orderDate(sale.createdAt)}
              <br />
              Agente: {sale.agentName}
              <br />
              Turno: {sale.shiftId}
            </p>
            <ul className="review-lines">
              {sale.lines.map((l) => (
                <li key={l.productId}>
                  <div>
                    <strong>{l.name}</strong>
                    <small>
                      {l.quantity} × {money(l.unitPriceCents)} ·{" "}
                      {l.presentation}
                    </small>
                  </div>
                  <strong>{money(l.lineTotalCents)}</strong>
                </li>
              ))}
            </ul>
            <div className="cash-total">
              <span>Total</span>
              <strong>{money(sale.totalCents)}</strong>
            </div>
            <p>
              {sale.payment === "cash"
                ? "Efectivo simulado"
                : "Tarjeta simulada · Demo · 0001"}
            </p>
            {sale.payment === "cash" ? (
              <p>
                Recibido: {money(sale.cashTenderCents!)} · Vuelto:{" "}
                {money(sale.changeCents)}
              </p>
            ) : (
              <p>Referencia: {sale.cardReceipt?.reference}</p>
            )}
            <div className="customer-actions">
              <Button
                variant="outline"
                onClick={() => {
                  document.body.classList.add("printing-sale");
                  window.print();
                }}
              >
                Imprimir comprobante de demostración
              </Button>
              <Button onClick={onClose}>Nueva venta</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
