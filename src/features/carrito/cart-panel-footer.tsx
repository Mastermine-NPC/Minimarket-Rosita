import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useRosita } from "@/hooks/use-rosita";
import { formatPEN } from "@/lib/currency";
import { Button } from "@/components/ui/button";

/** A real flex footer: it reserves space rather than covering scrollable products. */
export function CartPanelFooter() {
  const { lines, count, subtotal, error } = useCart();
  const { setCartOpen } = useRosita();
  if (!lines.length) return null;
  return <footer className="cart-panel-footer">
    <div className="cart-panel-amount"><span>Total de productos <small>{count} {count === 1 ? "unidad" : "unidades"} · sin envío</small></span><strong>{error ? "Por revisar" : formatPEN(subtotal)}</strong></div>
    {error ? <Button disabled className="cart-checkout-button">Corrige el carrito para continuar</Button> : <Button asChild className="cart-checkout-button" onClick={() => setCartOpen(false)}><Link to="/checkout">Continuar con mi pedido <ArrowRight aria-hidden="true" /></Link></Button>}
    <Link to="/carrito" className="cart-panel-full-link" onClick={() => setCartOpen(false)}>Ver carrito completo <ArrowRight size={16} aria-hidden="true" /></Link>
  </footer>;
}
