import { CategoryLiquidSurface } from "@/features/inicio/category-liquid-surface";
import { useCategoryTilt } from "@/features/inicio/use-category-tilt";
import { useLiquidHome } from "@/features/inicio/use-liquid-home";
import { LiquidVideos } from "@/features/inicio/liquid-videos";
import { AmbientVideo } from "@/features/inicio/ambient-video";
import { MediaImage } from "@/components/image-picker";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { useCatalog } from "@/hooks/use-catalog";

import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { ProductImage } from "@/features/catalogo/product-image";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { CinematicStory } from "@/features/inicio/cinematic-story";

import { MagneticLink } from "@/features/inicio/magnetic-link";


import { ProductCarousel } from "@/features/inicio/product-carousel";

import { useHomeReveals } from "@/features/inicio/use-home-reveals";
import "@/styles/home.css";
export function HomePage() {
  const { activeCategories: categories, categoryPath } = useTaxonomy();
  const products = useCatalog(),
    root = useRef<HTMLDivElement>(null),
    heading = useHeadingFocus(),
    active = products.filter((p) => p.active !== false),
    featured = [...active]
      .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
      .slice(0, 8);
  const hero = useRef<HTMLElement>(null);
  const reduced = useMotionPreference();
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.16]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  useHomeReveals(root);
  useLiquidHome(root);
  useCategoryTilt(root, categories.map(category => category.id).join(","));
  useEffect(() => {
    const header = document.querySelector(".navigation-discover"),
      html = document.documentElement,
      previous = html.style.scrollPaddingTop;
    if (!header) return;
    const update = () => {
      const offset = Math.ceil(header.getBoundingClientRect().height) + 20;
      html.style.scrollPaddingTop = offset + "px";
      root.current?.style.setProperty("--home-nav-offset", offset + "px");
    };
    const observer = new ResizeObserver(update);
    observer.observe(header);
    update();
    return () => {
      observer.disconnect();
      html.style.scrollPaddingTop = previous;
    };
  }, []);
  return (
    <div className="home-experience" ref={root}>
      <LiquidVideos>
      <section ref={hero} className="home-hero cinema-hero" data-cursor-theme="dark" aria-labelledby="home-title">
        <motion.div className="cinema-hero-media" style={reduced ? undefined : { scale: heroScale, y: heroY }}>
          <AmbientVideo src="/images/video/cinematic/Arequipa-backgraound-02.mp4" poster="/images/video/cinematic/Arequipa-backgraound-02.jpg" label="Background 2 · Plaza de Armas de Arequipa" loop priority keepPlaying />
        </motion.div>
        <div className="cinema-hero-scrim" />
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <h1 ref={heading} tabIndex={-1} id="home-title">
              <span className="home-title-line"><span>Tu día.</span></span>
              <span className="home-title-line"><span>Tu Rosita.</span></span>
            </h1>
            <p>Tu minimarket, de aquí y para ti.<br />Todo lo que acompaña tus pequeños grandes planes.</p>
            <div className="home-hero-actions">
              <MagneticLink to="/catalogo">Explorar productos <ArrowUpRight size={20} aria-hidden="true" /></MagneticLink>
              <MagneticLink to="#momentos" secondary>Descubrir Rosita <ArrowDown size={20} aria-hidden="true" /></MagneticLink>
            </div>
          </div>
          <div className="cinema-place"><span>Arequipa, Perú</span><span>Cerca de lo que importa.</span></div>
        </div>
        <a href="#momentos" className="home-scroll-cue"><span>Hay un Rosita para cada momento</span><ArrowDown size={20} aria-hidden="true" /></a>
      </section>
      <section className="cinema-intro" id="momentos" aria-labelledby="momentos-title">
        <AmbientVideo src="/images/video/web/video-intro.mp4" poster="/images/video/web/video-intro-poster.jpg" label="Un día en Rosita" loop keepPlaying />
        <h2 id="momentos-title" data-home-reveal>Lo cotidiano.<br />Extraordinario.</h2>
        <div data-home-reveal><p>Un antojo, una idea, un nuevo proyecto. En Minimarket Rosita, los pequeños planes tienen mucho por descubrir.</p><a className="home-editorial-link" href="#bebidas">Encuentra tu momento <ArrowDown size={20} aria-hidden="true" /></a></div>
      </section>
      </LiquidVideos>
      <CinematicStory />
      <section
        className="home-featured-section"
        aria-labelledby="featured-heading"
      >
        <div className="home-section-heading" data-home-reveal>
          <div>

            <h2 id="featured-heading">
              Tus próximos favoritos.
            </h2>
          </div>
          <div>
            <p>
              Productos para resolver tu día.
              <br />
              Precios claros y todo a tu ritmo.
            </p>
            <Link
              className="home-editorial-link"
              to="/catalogo"
              data-cursor="Explorar"
            >
              Todo el catálogo <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
        {featured.length ? (
          <ProductCarousel products={featured} />
        ) : (
          <div className="customer-empty">
            <h3>Pronto habrá más por elegir.</h3>
            <Button asChild>
              <Link to="/catalogo">Explorar el catálogo</Link>
            </Button>
          </div>
        )}
      </section>
      <section
        className="home-category-section"
        data-cursor-theme="dark"
        aria-labelledby="categorias"
      >
        <div className="home-section-heading" data-home-reveal>
          <div>

            <h2 id="categorias" tabIndex={-1}>
              Todo tu Rosita.
            </h2>
          </div>
          <p>
            Para casa, para estudiar,
            <br />
            para jugar y para ti.
          </p>
        </div>
        <div className="home-category-grid">
          {categories.map((category, i) => {
            return (
              <Link
                className={
                  "category-card home-category-card home-category-" +
                  category.id
                }
                key={category.id}
                to={categoryPath(category)}
                data-home-reveal
                data-cursor="Ver"
                style={
                  {
                    "--home-stagger": `${(i % 3) * 65}ms`,
                    "--category-glass-clip": `url(#home-category-glass-${category.id})`,
                  } as React.CSSProperties
                }
              >
                <CategoryLiquidSurface id={`home-category-glass-${category.id}`} />
                <div className="home-category-media">
                  {category.imageKey !== "none" ? (
                    <MediaImage
                      imageKey={category.imageKey}
                      alt={category.name}
                    />
                  ) : (
                    <div className="home-category-products" aria-hidden="true">
                      {active
                        .filter((p) => p.category === category.id)
                        .slice(0, 3)
                        .map((p) => (
                          <ProductImage key={p.id} product={p} />
                        ))}
                    </div>
                  )}
                </div>
                <div className="home-category-caption">
                  <div>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                  <span className="home-category-arrow">
                    <ArrowUpRight size={22} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <section
        className="home-delivery container"
        aria-labelledby="delivery-title"
      >
        <div>

          <h2 id="delivery-title">Tu pedido, paso a paso.</h2>
          <p>
            Elige tu zona de prueba, revisa el envío y consulta el estado de tu
            pedido. Es una simulación; no se realiza un reparto real.
          </p>
          <Button asChild>
            <Link to="/ayuda#entregas-pagos">Conocer entregas y pagos</Link>
          </Button>
        </div>
      </section>
      <section className="home-last-word">

        <h2 data-home-reveal>
          Rosita, más cerca.
        </h2>
        <p>
          La cercanía de tu minimarket peruano.
          <br />
          {categories.length} categorías para acompañar tus planes.
        </p>
        <Link
          className="home-editorial-link"
          to="/catalogo"
          data-cursor="Explorar"
        >
          Sigue explorando <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
