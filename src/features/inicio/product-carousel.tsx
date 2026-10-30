import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/catalogo/product-card";
import type { Product } from "@/types/catalog";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { useLocation } from "react-router";
const positions = new Map<string, number>();
export function ProductCarousel({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null),
    location = useLocation(),
    reduced = useMotionPreference(),
    [bounds, Bounds] = useState({ previous: false, next: false }),
    drag = useRef<{
      id: number;
      x: number;
      y: number;
      scroll: number;
      active: boolean;
    } | null>(null),
    suppress = useRef(0);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.scrollLeft = positions.get(location.key) || 0;
    let frame = 0;
    const update = () => {
      positions.set(location.key, root.scrollLeft);
      Bounds((old) => {
        const next = {
          previous: root.scrollLeft > 2,
          next: root.scrollLeft + root.clientWidth < root.scrollWidth - 3,
        };
        return old.previous === next.previous && old.next === next.next
          ? old
          : next;
      });
    };
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(scroll);
    resize.observe(root);
    root.addEventListener("scroll", scroll, { passive: true });
    scroll();
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x,
        dy = e.clientY - d.y;
      if (!d.active && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        d.active = true;
        root.setPointerCapture(e.pointerId);
        root.classList.add("is-dragging");
      }
      if (d.active) {
        if (e.cancelable) e.preventDefault();
        root.scrollLeft = d.scroll - dx;
      }
    };
    const end = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      if (d.active) {
        suppress.current = performance.now() + 350;
        if (root.hasPointerCapture(e.pointerId))
          root.releasePointerCapture(e.pointerId);
      }
      root.classList.remove("is-dragging");
      drag.current = null;
      scroll();
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      root.removeEventListener("scroll", scroll);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      root.classList.remove("is-dragging");
      if (positions.size > 50) positions.delete(positions.keys().next().value!);
    };
  }, [location.key, products.length]);
  function move(direction: number) {
    const root = ref.current;
    if (!root) return;
    const first = root.querySelector<HTMLElement>(".home-product-slide");
    root.scrollBy({
      left: direction * ((first?.offsetWidth || 300) + 20),
      behavior: reduced ? "instant" : "smooth",
    });
  }
  return (
    <div className="home-product-carousel">
      <div className="home-carousel-toolbar">
        <span>{products.length} productos · elige a tu ritmo</span>
        <div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Productos anteriores"
            disabled={!bounds.previous}
            onClick={() => move(-1)}
            title={!bounds.previous ? "Estás al inicio" : "Ver anteriores"}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Productos siguientes"
            disabled={!bounds.next}
            onClick={() => move(1)}
            title={!bounds.next ? "Estás al final" : "Ver siguientes"}
          >
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
      <p id="home-carousel-help" className="sr-only">
        Carrusel sin avance automático. Usa flechas izquierda y derecha, Inicio
        y Fin cuando el carrusel tenga foco. También puedes deslizar o usar sus
        botones.
      </p>
      <div
        ref={ref}
        className="home-products home-carousel-viewport"
        role="region"
        aria-label="Productos destacados"
        aria-roledescription="carrusel"
        aria-describedby="home-carousel-help"
        tabIndex={0}
        onDragStart={(event) => event.preventDefault()}
        onPointerDown={(e) => {
          if (
            e.pointerType !== "mouse" ||
            e.button !== 0 ||
            (e.target as Element).closest(
              ".product-price,.product-presentation,.product-brand,input,select,textarea",
            )
          )
            return;
          drag.current = {
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            scroll: e.currentTarget.scrollLeft,
            active: false,
          };
        }}
        onClickCapture={(e) => {
          if (performance.now() < suppress.current) {
            e.preventDefault();
            e.stopPropagation();
            suppress.current = 0;
          }
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            move(e.key === "ArrowRight" ? 1 : -1);
          }
          if (e.key === "Home" || e.key === "End") {
            e.preventDefault();
            e.currentTarget.scrollTo({
              left: e.key === "Home" ? 0 : e.currentTarget.scrollWidth,
              behavior: reduced ? "instant" : "smooth",
            });
          }
        }}
      >
        {products.map((product, i) => (
          <div
            className="home-product-slide"
            key={product.id}
            data-home-reveal
            style={
              {
                "--home-stagger": `${Math.min(i, 4) * 65}ms`,
              } as React.CSSProperties
            }
          >
            <ProductCard product={product} returnTo="/catalogo" />
          </div>
        ))}
      </div>
      <span className="home-carousel-hint">
        Desliza, compara y agrega. Sin prisa.
      </span>
    </div>
  );
}
