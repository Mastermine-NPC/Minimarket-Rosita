import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check, PackageCheck, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useRosita } from "@/hooks/use-rosita";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { ProductImage } from "@/features/catalogo/product-image";
import { QuantitySelector } from "@/features/catalogo/quantity-selector";
import { formatPEN } from "@/lib/currency";
import { stockLabel } from "@/lib/stock-label";
import { ClearCartButton } from "./clear-cart-button";
import { CartEmptyArt } from "./cart-empty-art";
import "@/styles/cart-experience.css";

export function CartContent({ panel = false }: { panel?: boolean }) {
  const { lines, count, subtotal, set, remove, error, cart } = useCart();
  const { setCartOpen } = useRosita();
  const { categoryById, categoryPath } = useTaxonomy();
  const reduced = useMotionPreference();
  const summary = useRef<HTMLElement>(null);
  const summaryId = useId();
  const emptyHeading = useRef<HTMLHeadingElement>(null);
  const itemsHeading = useRef<HTMLHeadingElement>(null);
  const previousLines = useRef(lines.length);
  useEffect(() => {
    if (lines.length < previousLines.current) (lines.length ? itemsHeading.current : emptyHeading.current)?.focus({ preventScroll: true });
    previousLines.current = lines.length;
  }, [lines.length]);
  const [notice, setNotice] = useState("");
  const hasSelection = Object.keys(cart).length > 0;
  const problem = hasSelection ? error : "";
  const close = () => setCartOpen(false);
  if (!lines.length) return <div className={`cart-experience is-empty${panel ? " is-panel" : ""}`}>
    <section className="cart-empty cart-empty-state" aria-label="Carrito vacío">
      <CartEmptyArt />
      <div className="cart-empty-copy"><h2 ref={emptyHeading} tabIndex={-1}>{problem ? "Revisemos tu selección." : "Tu carrito está vacío."}</h2><p>{problem || "Elige lo que necesitas para tu día. Aquí podrás revisar tus productos y preparar tu próximo pedido."}</p>
        {problem && <ClearCartButton />}
        <Button asChild onClick={close}><Link to="/catalogo">Explorar productos <ArrowRight aria-hidden="true" /></Link></Button>
        {!panel && <Link to="/ayuda#entregas-pagos" className="cart-empty-help">Conocer entregas y pagos <ArrowUpRight size={16} aria-hidden="true" /></Link>}
      </div>
    </section>
  </div>;
  return <div className={`cart-experience${panel ? " is-panel" : ""}`}>
    {problem && <p role="alert" className="field-error cart-warning"><Info size={18} aria-hidden="true" />{problem}</p>}
    <section className="cart-items-panel" aria-label="Productos seleccionados">
      <header className="cart-items-heading"><div><h2 ref={itemsHeading} tabIndex={-1}>Tu selección</h2><p>{lines.length} {lines.length === 1 ? "producto" : "productos"} · {count} {count === 1 ? "unidad" : "unidades"}</p></div>
        {panel ? <ClearCartButton compact /> : <button className="cart-summary-shortcut" aria-controls={summaryId} onClick={() => { summary.current?.focus({ preventScroll: true }); summary.current?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" }); }}>Ver resumen <ArrowRight size={16} aria-hidden="true" /></button>}
      </header>
      <p className="cart-update-status" role="status" aria-live="polite">{notice}</p>
      <div className="cart-lines" role="list">
        <AnimatePresence initial={!reduced}>
          {lines.map(({ product, quantity, lineTotal }) => {
            const category = categoryById(product.category);
            const target = "/producto/" + (product.publicId || product.id);
            const unavailable = product.active === false || product.stock === 0;
            return <motion.article className="cart-line cart-item-row" role="listitem" data-product-id={product.id} key={product.id} layout={reduced ? false : "position"} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, x: 12, pointerEvents: "none" }} transition={{ duration: reduced ? 0 : .18 }}>
              <Link className="cart-line-photo" to={target} onClick={close} aria-label={"Ver " + product.name}><ProductImage product={product} /></Link>
              <div className="cart-line-info">
                <div className="cart-product-meta">{category ? <Link to={categoryPath(category)} onClick={close}>{category.name}</Link> : <span>{product.category}</span>}<span>{product.brand}</span></div>
                <Link to={target} onClick={close} className="cart-product-name">{product.name}</Link>
                <p className="cart-product-presentation">{product.presentation}</p>
                {product.imageIsIllustration && <p className="cart-image-note">Ilustración · sin fotografía</p>}
                <p className="cart-unit-price"><strong>{formatPEN(product.price)}</strong> por unidad</p>
                <p className={`cart-availability${unavailable || quantity > product.stock ? " has-problem" : ""}`}>{unavailable || quantity > product.stock ? <Info size={13} aria-hidden="true" /> : <Check size={13} aria-hidden="true" />}{product.active === false ? "Producto desactivado" : `${stockLabel(product.stock, product.lowStockThreshold ?? 5)} · ${product.stock} en stock`}</p>
                {product.active === false ? <p className="cart-line-warning">Elimina este producto para continuar.</p> : quantity > product.stock && <p className="cart-line-warning">La disponibilidad cambió. {product.stock ? "Ajusta la cantidad al stock actual." : "Elimina este producto para continuar."}</p>}
                <div className="cart-line-controls">
                  {!unavailable ? <QuantitySelector value={quantity} max={product.stock} name={product.name} onChange={n => { set(product.id, n); setNotice(`Cantidad actualizada: ${Math.min(n, product.stock)} ${Math.min(n, product.stock) === 1 ? "unidad" : "unidades"} de ${product.name}.`); }} /> : <span>Cantidad: {quantity}</span>}
                  {quantity > product.stock && !unavailable && <button className="cart-repair-quantity" onClick={() => { set(product.id, product.stock); setNotice(`Cantidad ajustada al stock de ${product.name}.`); }}>Ajustar a {product.stock}</button>}
                </div>
              </div>
              <div className="cart-line-end"><span className="cart-line-subtotal-label">Subtotal</span><strong key={lineTotal} className="cart-line-amount" aria-label={"Subtotal de " + product.name}>{formatPEN(lineTotal)}</strong>
                <Button variant="ghost" className="cart-remove-action" aria-label={"Eliminar " + product.name} onClick={() => { remove(product.id); setNotice(`${product.name} eliminado de tu selección.`); }}><Trash2 size={16} aria-hidden="true" /><span>Quitar</span></Button>
              </div>
            </motion.article>;
          })}
        </AnimatePresence>
      </div>
      <div className="cart-stock-note"><PackageCheck size={20} aria-hidden="true" /><p>La disponibilidad se vuelve a comprobar al confirmar el pedido. Agregar productos al carrito no reserva ni descuenta stock.</p></div>
    </section>
    <section className="cart-summary cart-order-summary" aria-label="Resumen del carrito" ref={summary} id={summaryId} tabIndex={-1} data-lenis-prevent>
      <h2>Resumen de tu compra</h2><p className="cart-summary-count">{lines.length} {lines.length === 1 ? "producto" : "productos"} · {count} {count === 1 ? "unidad" : "unidades"}</p>
      <dl className="cart-breakdown"><div><dt>Subtotal de productos</dt><dd>{problem ? "Por revisar" : formatPEN(subtotal)}</dd></div><div><dt>Envío</dt><dd>Se define en checkout</dd></div></dl>
      <div className="cart-total" aria-live="polite" aria-atomic="true"><span>Total de productos</span><strong key={subtotal} className="cart-total-number">{problem ? "Por revisar" : formatPEN(subtotal)}</strong></div>
      <p className="cart-shipping-note">El total final se calcula al elegir la entrega. Aquí no se añade ningún cargo de envío.</p>
      {!panel && (problem ? <Button disabled className="full-width cart-checkout-button">Corrige el carrito para continuar</Button> : <Button asChild className="full-width cart-checkout-button" onClick={close}><Link to="/checkout">Continuar con mi pedido <ArrowRight aria-hidden="true" /></Link></Button>)}
      <Link to="/catalogo" className="cart-continue-link" onClick={close}>Seguir comprando <ArrowUpRight size={16} aria-hidden="true" /></Link>
      <p className="cart-local-note"><Check size={16} aria-hidden="true" />Identifícate antes de confirmar tu entrega. Pago y envío de demostración, sin operaciones reales.</p>
    </section>
  </div>;
}
