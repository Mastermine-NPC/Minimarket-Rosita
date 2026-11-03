import { productModelFor } from "@/features/product-3d/product-models";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { Link, useLocation } from "react-router";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./product-image";
import { ProductPrice } from "./product-price";
import { QuantitySelector } from "./quantity-selector";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/types/catalog";
import "@/styles/product-marketplace.css";
export function ProductCard({
  product,
  returnTo,
}: {
  product: Product;
  returnTo?: string;
}) {
  const { categoryById } = useTaxonomy();
  const location = useLocation(),
    { cart, add, set } = useCart(),
    quantity = cart[product.id] || 0,
    back = returnTo || location.pathname + location.search;
  const target =
      "/producto/" + (product.publicId || product.id) + "?volver=" + encodeURIComponent(back),
    full = quantity >= product.stock;
  return (
    <article className="product-card marketplace-product-card" data-product-id={product.id}>
      <Link
        to={target}
        className="product-photo-link"
        aria-label={"Ver " + product.name}
      >
        <ProductImage product={product} />
        {productModelFor(product)?.modelUrl && <span className="product-3d-badge">Explorar en 3D ↗</span>}
        {product.demoCommercialData && <span className="product-render-label">Render 3D</span>}
        {product.previousPrice && (
          <span className="product-tag">Precio especial</span>
        )}
      </Link>
      <div className="product-card-body">
        <h3>
          <Link to={target}>{product.name}</Link>
        </h3>
        <span className="product-brand">{product.brand} · {categoryById(product.category)?.name}</span>
        <p className="product-presentation">{product.presentation}</p>
        <div className="marketplace-price-row">
          <ProductPrice price={product.price} previous={product.previousPrice} />
          {product.previousPrice && product.previousPrice > product.price && <span className="marketplace-discount">
            {Math.round((1 - product.price / product.previousPrice) * 100)}% menos
          </span>}
        </div>
        <p className={"stock-label " + (!product.stock ? "stock-empty" : "")}>
          <span aria-hidden="true">{product.stock ? "●" : "—"}</span>{" "}
          {product.stock
            ? product.stock <= (product.lowStockThreshold ?? 5)
              ? `Solo ${product.stock} disponibles`
              : "Disponible"
            : "Agotado"}
        </p>
        {product.demoCommercialData && <p className="demo-product-notice">Precio y stock de demostración</p>}
        <Button
          className="product-add"
          disabled={product.active === false || !product.stock || full}
          title={
            !product.stock
              ? "Producto agotado"
              : full
                ? "Todo el stock disponible ya está en tu carrito"
                : undefined
          }
          onClick={() => add(product)}
          aria-label={"Agregar al carrito: " + product.name}
        >
          <Plus className="product-add-icon" aria-hidden="true" />
          {product.active === false
            ? "Desactivado"
            : !product.stock
              ? "Sin stock"
              : full
                ? "Stock completo"
                : "Agregar al carrito"}
        </Button>
        {quantity > 0 && (
          <div className="card-cart-feedback">
            <span className="in-cart">
              <Check size={14} aria-hidden="true" /> {quantity} en tu carrito
            </span>
            {product.stock > 0 && product.active !== false ? (
              <QuantitySelector
                value={quantity}
                max={product.stock}
                name={product.name}
                onChange={(n) => set(product.id, n)}
              />
            ) : (
              <Link to="/carrito">Revisar este producto en el carrito</Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
