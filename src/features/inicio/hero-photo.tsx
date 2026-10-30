import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ProductImage } from "@/features/catalogo/product-image";
import type { Product } from "@/types/catalog";
import { homeMotion } from "./home-motion";
let preparedOnce = false;
export function HeroPhoto({ products }: { products: Product[] }) {
  const reduced = useMotionPreference(),
    fine = useMediaQuery("(min-width: 900px) and (pointer: fine)"),
    ref = useRef<HTMLDivElement>(null),
    image = useRef<HTMLImageElement>(null),
    [state, State] = useState<"loading" | "ready" | "failed" | "timeout">(() =>
      reduced || preparedOnce ? "ready" : "loading",
    ),
    { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start start", "end start"],
    }),
    y = useTransform(scrollYProgress, [0, 1], [0, homeMotion.parallax]),
    rotation = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  useEffect(() => {
    const img = image.current;
    if (!img) return;
    let active = true;
    const settle = (next: typeof state) => {
      if (!active) return;
      clearTimeout(timer);
      preparedOnce = true;
      State(next);
    };
    const loaded = () => settle(img.naturalWidth > 0 ? "ready" : "failed"),
      failed = () => settle("failed");
    img.addEventListener("load", loaded);
    img.addEventListener("error", failed);
    const timer = setTimeout(
      () => settle("timeout"),
      homeMotion.criticalTimeout,
    );
    if (img.complete) queueMicrotask(loaded);
    return () => {
      active = false;
      clearTimeout(timer);
      img.removeEventListener("load", loaded);
      img.removeEventListener("error", failed);
    };
  }, []);
  const decor = products
    .filter((p) => p.active !== false && p.stock > 0)
    .slice(0, 2);
  return (
    <div className="home-hero-visual" ref={ref} data-photo-state={state}>
      <motion.div
        className="home-photo-move"
        style={{ y: !reduced && fine ? y : 0 }}
      >
        <figure className="home-shop-window">
          <div className="home-shop-image">
            <img
              ref={image}
              src="/images/home/rosita-1025.webp"
              srcSet="/images/home/rosita-640.webp 640w, /images/home/rosita-1025.webp 1025w"
              sizes="(max-width: 800px) 92vw, 52vw"
              width={1025}
              height={260}
              fetchPriority="high"
              decoding="async"
              alt="Interior real de Minimarket Rosita, con sus estantes y productos"
              className={state === "ready" ? "home-critical-ready" : ""}
            />
            {state !== "ready" && (
              <div className="home-photo-fallback">
                <span>Rosita.</span>
                <small>
                  {state === "loading"
                    ? "Tu tienda de siempre."
                    : "La foto no está disponible. La tienda sigue abierta para explorar."}
                </small>
              </div>
            )}
          </div>
          <figcaption>
            <span>DE AQUÍ, PARA TU DÍA.</span>
            <strong>Tu minimarket de siempre.</strong>
          </figcaption>
        </figure>
      </motion.div>
      {!reduced && state === "loading" && (
        <div className="home-brand-loader" role="status">
          <span aria-hidden="true" />
          Rosita · preparando la fotografía…
        </div>
      )}
      <motion.div
        className="home-flower"
        aria-hidden="true"
        style={{ rotate: !reduced && fine ? rotation : 0 }}
      >
        <svg viewBox="0 0 240 240">
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse
              key={i}
              cx="120"
              cy="62"
              rx="31"
              ry="60"
              transform={`rotate(${i * 45} 120 120)`}
            />
          ))}
          <circle cx="120" cy="120" r="31" />
        </svg>
      </motion.div>
      <div className="home-float home-float-one" aria-hidden="true">
        {decor[0] && <ProductImage product={decor[0]} />}
        <span>Para tu día.</span>
      </div>
      <div className="home-float home-float-two" aria-hidden="true">
        {decor[1] && <ProductImage product={decor[1]} />}
        <span>Y tus pausas.</span>
      </div>
      <span className="home-photo-note">Fotografía del negocio Rosita.</span>
    </div>
  );
}
