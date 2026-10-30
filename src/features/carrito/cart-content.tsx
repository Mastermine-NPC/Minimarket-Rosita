import { Link } from "react-router";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useRosita } from "@/hooks/use-rosita";
import { ProductImage } from "@/features/catalogo/product-image";
import { QuantitySelector } from "@/features/catalogo/quantity-selector";
import { formatPEN } from "@/lib/currency";
export function CartContent({ panel = false }: { panel?: boolean }) {
  const { lines, count, subtotal, set, remove, error } = useCart(),
    { setCartOpen } = useRosita();
  if (!lines.length)
    return (
      <div className="cart-empty">
        <span className="empty-icon">
          <ShoppingBag size={36} aria-hidden="true" />
        </span>
        <h2>Tu carrito espera algo bueno.</h2>
        <p>Explora las categorías y encuentra lo que necesitas.</p>
        <Button asChild onClick={() => setCartOpen(false)}>
          <Link to="/catalogo">
            Explorar productos <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  return (
    <>
      {error && (
        <p role="alert" className="field-error cart-warning">
          ⚠ {error}
        </p>
      )}
      <div className="cart-lines">
        {lines.map(({ product, quantity, lineTotal }) => (
          <article className="cart-line" key={product.id}>
            <Link
              className="cart-line-photo"
              to={"/producto/" + product.id}
              onClick={() => setCartOpen(false)}
              aria-label={"Ver " + product.name}
            >
              <ProductImage product={product} />
            </Link>
            <div className="cart-line-info">
              <Link
                to={"/producto/" + product.id}
                onClick={() => setCartOpen(false)}
              >
                {product.name}
              </Link>
              <p>{product.presentation}</p>
              {product.active === false && (
                <p className="field-error">
                  Producto desactivado · elimínalo para continuar.
                </p>
              )}
              {quantity > product.stock && (
                <p className="field-error">
                  Stock disponible: {product.stock}. Corrige la cantidad o
                  elimina el producto.
                </p>
              )}
              <p>
                {formatPEN(product.price)} c/u · Stock: {product.stock}
              </p>
              {product.active !== false && product.stock > 0 ? (
                <QuantitySelector
                  value={quantity}
                  max={product.stock}
                  name={product.name}
                  onChange={(n) => set(product.id, n)}
                />
              ) : (
                <p>Cantidad en carrito: {quantity}</p>
              )}
            </div>
            <div className="cart-line-end">
              <strong aria-label={"Subtotal de " + product.name}>
                {formatPEN(lineTotal)}
              </strong>
              <Button
                variant="destructive"
                size="icon"
                aria-label={"Eliminar " + product.name}
                onClick={() => remove(product.id)}
              >
                <Trash2 size={17} aria-hidden="true" />
              </Button>
            </div>
          </article>
        ))}
      </div>
      <section className="cart-summary" aria-label="Resumen del carrito">
        <div className="subtotal-row" aria-live="polite" aria-atomic="true">
          <span>
            Subtotal · {count} {count === 1 ? "unidad" : "unidades"}
          </span>
          <strong>{formatPEN(subtotal)}</strong>
        </div>
        <p>Agregar al carrito no reserva ni descuenta stock.</p>
        {error ? (
          <Button disabled className="full-width">
            Corrige el carrito para continuar
          </Button>
        ) : (
          <Button
            asChild
            className="full-width"
            onClick={() => setCartOpen(false)}
          >
            <Link to="/checkout">
              Continuar con mi pedido <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        )}
        <p className="pending-note">
          Identifícate antes de confirmar una entrega. Pago y envío de
          demostración, sin operaciones reales.
        </p>
        {panel && (
          <Button
            asChild
            variant="outline"
            className="full-width"
            onClick={() => setCartOpen(false)}
          >
            <Link to="/carrito">
              Ver carrito completo <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        )}
      </section>
    </>
  );
}
