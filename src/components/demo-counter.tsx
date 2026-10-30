import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoProduct } from "@/data/demo";
import { useRosita } from "@/hooks/use-rosita";
import { formatPEN } from "@/lib/currency";
export function DemoCounter() {
  const { state, dispatch } = useRosita();
  return (
    <div className="demo-counter">
      <p className="eyebrow">Un estado, dos rutas</p>
      <h3>{demoProduct.name}</h3>
      <p className="muted">
        {demoProduct.presentation} · {formatPEN(demoProduct.price)} por unidad
      </p>
      <div
        className="quantity-control"
        role="group"
        aria-label="Cantidad de prueba"
      >
        <Button
          variant="outline"
          size="icon"
          disabled={state.demoQuantity === 0}
          onClick={() => dispatch({ type: "demo/decrement" })}
          aria-label="Disminuir cantidad"
        >
          <Minus aria-hidden="true" />
        </Button>
        <output aria-live="polite" aria-atomic="true">
          {state.demoQuantity}
        </output>
        <Button
          variant="outline"
          size="icon"
          disabled={state.demoQuantity === demoProduct.stock}
          onClick={() => dispatch({ type: "demo/increment" })}
          aria-label="Aumentar cantidad"
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
      <p className="demo-total" aria-live="polite" aria-atomic="true">
        Subtotal de prueba{" "}
        <strong>{formatPEN(state.demoQuantity * demoProduct.price)}</strong>
      </p>
      <p className="hint">
        Límite: {demoProduct.stock} unidades. Se conserva al navegar y recargar.
        Todavía no es el carrito de compra.
      </p>
    </div>
  );
}
