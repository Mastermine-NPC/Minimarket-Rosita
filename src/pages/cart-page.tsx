import { Link } from "react-router";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { CartContent } from "@/features/carrito/cart-content";
import { ClearCartButton } from "@/features/carrito/clear-cart-button";
import { useCart } from "@/hooks/use-cart";
import { useHeadingFocus } from "@/hooks/use-heading-focus";

export function CartPage() {
  const { count, cart } = useCart();
  const heading = useHeadingFocus();
  return <div className="container cart-page cart-redesign">
    <nav className="breadcrumbs" aria-label="Ruta actual"><Link to="/">Inicio</Link><span>/</span><span>Carrito</span></nav>
    <header className="cart-page-heading">
      <div><h1 ref={heading} tabIndex={-1}>Tu carrito.</h1><p>Todo lo que elegiste, listo para revisar.</p></div>
      <div className="cart-page-actions"><Link to="/catalogo" className="cart-back-catalog"><ArrowLeft size={18} aria-hidden="true" />Seguir comprando</Link>{Object.keys(cart).length > 0 && <ClearCartButton />}</div>
    </header>
    <div className="cart-journey"><ol aria-label="Progreso de compra"><li aria-current="step"><ShoppingBag size={17} aria-hidden="true" />Carrito</li><li>Entrega</li><li>Pago</li><li>Revisión</li></ol><span>{count} {count === 1 ? "unidad seleccionada" : "unidades seleccionadas"}</span></div>
    <div className="cart-page-content"><CartContent /></div>
  </div>;
}
