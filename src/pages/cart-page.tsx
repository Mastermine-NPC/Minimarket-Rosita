import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { CartContent } from "@/features/carrito/cart-content";
import { useCart } from "@/hooks/use-cart";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
export function CartPage() {
  const { count, clear } = useCart(),
    heading = useHeadingFocus();
  return (
    <div className="container cart-page">
      <nav className="breadcrumbs" aria-label="Ruta actual">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <span>Carrito</span>
      </nav>
      <div className="section-heading">
        <div>
          <span className="eyebrow">CASI EN TUS MANOS</span>
          <h1 ref={heading} tabIndex={-1}>
            Tu carrito.
          </h1>
          <p>Revisa cantidades e importes de tu selección.</p>
        </div>
        {count > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Vaciar carrito</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Vaciar tu carrito?</DialogTitle>
                <DialogDescription>
                  Se quitarán tus productos de la selección. No se modifica el
                  inventario de demostración.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Conservar productos</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={clear}>
                    Sí, vaciar carrito
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="cart-page-content">
        <CartContent />
      </div>
    </div>
  );
}
