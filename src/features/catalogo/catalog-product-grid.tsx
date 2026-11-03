import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Product } from "@/types/catalog";
import { ProductCard } from "./product-card";
import "@/styles/catalog-promotions.css";

const promotions = [
  { src: "/images/jfif/carrusel1.jfif.jpeg", width: 1826, height: 560, alt: "Halloween se vive en Rosita. Ver catálogo de Halloween.", href: "/categoria/halloween" },
  { src: "/images/jfif/carrusel2.jfif.jpeg", width: 1860, height: 560, alt: "¿Dulce o truco? Con Rosita. Descubre nuestros productos de Halloween.", href: "/categoria/halloween" },
  { src: "/images/jfif/carrusel3.jfif.jpeg", width: 1827, height: 560, alt: "Visita nuestro minimarket y descubre nuestros productos. Consulta cómo encontrarnos.", href: "/contacto" },
];

export function CatalogProductGrid({ products }: { products: Product[] }) {
  const grid = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);
  useEffect(() => {
    const node = grid.current;
    if (!node) return;
    // Read the actual auto-fill tracks: sidebar and filters also affect row capacity.
    const observer = new ResizeObserver(() => {
      const tracks = getComputedStyle(node).gridTemplateColumns;
      const count = tracks === "none" ? 1 : tracks.split(/\s+/).filter(Boolean).length;
      setColumns(Math.max(1, count));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const interval = columns * 2;
  return <div ref={grid} className="product-grid catalog-products">
    {products.map((product, index) => {
      const promotion = (index + 1) % interval === 0 ? promotions[(index + 1) / interval - 1] : undefined;
      return <Fragment key={product.id}>
        <ProductCard product={product} />
        {promotion && <Link className="catalog-promotion" to={promotion.href}>
          <img src={promotion.src} width={promotion.width} height={promotion.height} alt={promotion.alt} loading="lazy" decoding="async" />
        </Link>}
      </Fragment>;
    })}
  </div>;
}
