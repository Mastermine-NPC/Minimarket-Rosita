import { AmbientVideo } from "./ambient-video";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ProductImage } from "@/features/catalogo/product-image";
import type { Product } from "@/types/catalog";
import { homeMotion } from "./home-motion";
export function HeroPhoto({ products }: { products: Product[] }) {
  const reduced = useMotionPreference(),
    fine = useMediaQuery("(min-width: 900px) and (pointer: fine)"),
    ref = useRef<HTMLDivElement>(null),
    { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start start", "end start"],
    }),
    y = useTransform(scrollYProgress, [0, 1], [0, homeMotion.parallax]),
    rotation = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const decor = products
    .filter((p) => p.active !== false && p.stock > 0)
    .slice(0, 2);
  return (
    <div className="home-hero-visual" ref={ref} data-photo-state="ready">
      <motion.div
        className="home-photo-move"
        style={{ y: !reduced && fine ? y : 0 }}
      >
        <figure className="home-shop-window">
          <div className="home-shop-image">
            <AmbientVideo
              src="/images/video/web/video-intro.mp4"
              poster="/images/video/web/video-intro-poster.jpg"
              label="ambientación de compra"
            />
          </div>
          <figcaption>
            <span>DE AQUÍ, PARA TU DÍA.</span>
            <strong>Tu minimarket de siempre.</strong>
          </figcaption>
        </figure>
      </motion.div>
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
      <span className="home-photo-note">
        Video de ambientación · no muestra el local Rosita.
      </span>
    </div>
  );
}
