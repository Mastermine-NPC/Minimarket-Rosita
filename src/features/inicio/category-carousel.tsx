import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { ProductImage } from "@/features/catalogo/product-image";
import { MediaImage } from "@/components/image-picker";
import type { Product } from "@/types/catalog";
export function CategoryCarousel({ name, to, imageKey, products }: { name: string; to: string; imageKey: string; products: Product[] }) {
  const [index, setIndex] = useState(0), [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const slides = imageKey !== "none" ? [imageKey] : products;
  const current = slides[index % Math.max(1, slides.length)];
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { rootMargin: "150px" });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  function move(direction: number) { setIndex(value => (value + direction + slides.length) % slides.length); }
  return <div className="home-category-media category-carousel" ref={root} role="group" aria-roledescription="carrusel" aria-label={`Imágenes de ${name}`}>
    <Link className="category-carousel-image" to={to} tabIndex={-1} aria-hidden="true">{visible && (typeof current === "string" ? <MediaImage imageKey={current} alt="" /> : current ? <ProductImage product={current} /> : <span>{name}</span>)}</Link>
    {slides.length > 1 && <div className="category-carousel-controls"><button type="button" aria-label={`Imagen anterior de ${name}`} onClick={() => move(-1)}><ChevronLeft size={18} aria-hidden="true" /></button><span aria-live="polite" aria-atomic="true">{index + 1} / {slides.length}</span><button type="button" aria-label={`Imagen siguiente de ${name}`} onClick={() => move(1)}><ChevronRight size={18} aria-hidden="true" /></button></div>}
  </div>;
}
