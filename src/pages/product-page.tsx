import { ProductPresentation } from "@/features/product-3d/product-presentation";
import { productModelFor } from "@/features/product-3d/product-models";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { useCatalog } from "@/hooks/use-catalog";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Package, Check, ArrowRight } from "lucide-react";

import { ProductImageZoom } from "@/features/catalogo/product-image-zoom";
import { ProductPrice } from "@/features/catalogo/product-price";
import { ProductCard } from "@/features/catalogo/product-card";
import { QuantitySelector } from "@/features/catalogo/quantity-selector";
import { safeReturnPath } from "@/features/catalogo/catalog-logic";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { formatPEN } from "@/lib/currency";
export function ProductPage() {
  const { id } = useParams();
  return <ProductDetail key={id} id={id || ""} />;
}
function ProductDetail({ id: routeId }: { id: string }) {
  const { categoryById, categoryPath } = useTaxonomy();
  const products = useCatalog();
  const product = products.find((p) => p.id === routeId) || products.find((p) => p.code === routeId),
    [params] = useSearchParams(),
    back = safeReturnPath(params.get("volver")),
    [n, N] = useState(1),
    { cart, add, open } = useCart(),
    heading = useHeadingFocus();
  if (!product || product.active === false)
    return (
      <div className="container empty-page">
        <Package aria-hidden="true" />
        <h1 ref={heading} tabIndex={-1}>
          No encontramos este producto
        </h1>
        <p>El código no está en el catálogo actual de Rosita.</p>
        <Button asChild>
          <Link to="/catalogo">Volver al catálogo</Link>
        </Button>
      </div>
    );
  const id = product.id;
  const modelConfig = productModelFor(product);
  const category = categoryById(product.category)!,
    remaining = Math.max(0, product.stock - (cart[id] || 0)),
    quantity = Math.min(n, remaining),
    related = products
      .filter(
        (p) =>
          p.active !== false && p.category === product.category && p.id !== id,
      )
      .slice(0, 4);
  return (
    <div className={"container product-page" + (modelConfig ? " product-page--immersive" : "")}>
      <Link className="back-link" to={back}>
        <ArrowLeft size={17} aria-hidden="true" />
        Volver al catálogo
      </Link>
      <section className="product-detail">
        <div className="detail-info detail-heading">
          <Link className="eyebrow" to={categoryPath(category)}>
            {category.name}
          </Link>
          {product.archived && (
            <p role="status" className="field-error">
              Producto retirado del catálogo. Los pedidos anteriores se
              conservan.
            </p>
          )}
          {product.imageNote && (
            <p className="hint" role="note">
              {product.imageNote}
            </p>
          )}
          <span className="detail-code">{product.code || product.id}</span>
          <h1 ref={heading} tabIndex={-1}>
            {product.name}
          </h1>
          <p className="detail-presentation">
            {product.presentation} · {product.brand}
          </p>
        </div>

        {modelConfig ? <ProductPresentation config={modelConfig} brand={product.brand} presentation={product.presentation} fallback={<ProductImageZoom product={product} />} /> : (
        <div className={"detail-photo tone-" + category.tone}>
          <ProductImageZoom
            key={product.imageSrc || String(product.imageIndex)}
            product={product}
          />
        </div>
        )}
        <div className="detail-info detail-commerce">
          <ProductPrice
            price={product.price}
            previous={product.previousPrice}
          />
          <p className="stock-label">
            {product.stock
              ? "● " + product.stock + " unidades disponibles"
              : "— Producto agotado"}
          </p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-quantity">
            <span>Cantidad que deseas agregar</span>
            <QuantitySelector
              value={quantity}
              max={remaining}
              min={0}
              name={product.name}
              onChange={N}
            />
            <span className="detail-amount">
              Importe: <strong>{formatPEN(quantity * product.price)}</strong>
            </span>
          </div>
          <Button
            className="detail-add"
            disabled={!quantity}
            title={
              !quantity
                ? remaining === 0
                  ? "No hay más stock disponible"
                  : "Selecciona al menos una unidad"
                : undefined
            }
            onClick={() => add(product, quantity)}
          >
            {!product.stock
              ? "Producto agotado"
              : !remaining
                ? "Todo el stock en tu carrito"
                : "Agregar al carrito"}
            <ArrowRight aria-hidden="true" />
          </Button>
          {!!cart[id] && (
            <p className="detail-added" role="status">
              <Check size={16} aria-hidden="true" />
              {cart[id]} en tu carrito{" "}
              <Button variant="link" onClick={open}>
                Ver carrito
              </Button>
            </p>
          )}
          <p className="hint">
            Agregar no descuenta inventario. El stock se actualiza al confirmar
            un pedido de demostración.
          </p>
        </div>
      </section>
      <section className="detail-information">
        <h2>Los detalles importan.</h2>
        <dl>
          {[
            ["Presentación", product.presentation],
            ["Marca", product.brand],
            ["Categoría", category.name],
            ["Precio por presentación", formatPEN(product.price)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="related-section">
        <div className="section-heading">
          <h2>También en {category.name.toLocaleLowerCase("es")}</h2>
          <Link className="text-link" to={categoryPath(category)}>
            Ver categoría <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="product-grid home-products">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} returnTo={back} />
          ))}
        </div>
      </section>
    </div>
  );
}
