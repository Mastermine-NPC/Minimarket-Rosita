import { AmbientVideo } from "@/features/inicio/ambient-video";
import { MediaImage } from "@/components/image-picker";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useCatalog } from "@/hooks/use-catalog";

import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { ProductImage } from "@/features/catalogo/product-image";
import { Button } from "@/components/ui/button";
import { HeroPhoto } from "@/features/inicio/hero-photo";
import { MagneticLink } from "@/features/inicio/magnetic-link";
import { PresentationCursor } from "@/features/inicio/presentation-cursor";
import { BrandMarquee } from "@/features/inicio/brand-marquee";
import { ProductCarousel } from "@/features/inicio/product-carousel";
import { ColorBridge } from "@/features/inicio/color-bridge";
import { useHomeReveals } from "@/features/inicio/use-home-reveals";
import "@/styles/home.css";
const categoryArt: Record<string, { photo: string; line: string }> = {
  consumibles: { photo: "", line: "Para tus pausas de cada día." },
  ferreteria: { photo: "tools", line: "Ideas que toman forma." },
  tecnologia: { photo: "technology", line: "Pequeñas conexiones." },
  jugueteria: { photo: "play", line: "Un rato para imaginar." },
  "educacion-oficina": {
    photo: "school",
    line: "Que no se te escape una idea.",
  },
  "cuidado-personal": { photo: "care", line: "Un momento para ti." },
};
export function HomePage() {
  const { activeCategories: categories, categoryPath } = useTaxonomy();
  const products = useCatalog(),
    root = useRef<HTMLDivElement>(null),
    heading = useHeadingFocus(),
    active = products.filter((p) => p.active !== false),
    featured = [...active]
      .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
      .slice(0, 8);
  useHomeReveals(root);
  useEffect(() => {
    const header = document.querySelector(".store-header"),
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
      <PresentationCursor />
      <section
        className="home-hero"
        data-cursor-theme="dark"
        aria-labelledby="home-title"
      >
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <span className="home-kicker">
              <i />
              MINIMARKET ROSITA · DE AQUÍ, PARA TI
            </span>
            <h1 ref={heading} tabIndex={-1} id="home-title">
              <span className="sr-only">Tu día. Tu Rosita.</span>
              <span className="home-title-line" aria-hidden="true">
                <span>Tu día.</span>
              </span>
              <span
                className="home-title-line home-title-rose"
                aria-hidden="true"
              >
                <span>
                  Tu <em>Rosita.</em>
                </span>
              </span>
            </h1>
            <p>
              Lo de todos los días.
              <br />Y eso que hace tus planes un poquito mejores.
            </p>
            <div className="home-hero-actions">
              <MagneticLink to="/catalogo">
                Explorar productos <ArrowUpRight size={18} aria-hidden="true" />
              </MagneticLink>
              <MagneticLink to="#categorias" secondary>
                Ver categorías <ArrowDown size={18} aria-hidden="true" />
              </MagneticLink>
            </div>
            <div className="home-hero-footnote">
              <ShoppingBag size={16} aria-hidden="true" />
              <span>Tu tienda cercana. Compras de demostración.</span>
            </div>
          </div>
          <HeroPhoto products={active} />
        </div>
        <div className="home-scroll-cue">
          <span>UN POCO MÁS ABAJO, MUCHO POR ELEGIR</span>
          <ArrowDown size={16} aria-hidden="true" />
        </div>
      </section>
      <BrandMarquee />
      <section
        className="home-featured-section"
        aria-labelledby="featured-heading"
      >
        <div className="home-section-heading" data-home-reveal>
          <div>
            <span className="eyebrow">01 / SELECCIÓN ROSITA</span>
            <h2 id="featured-heading">
              Pequeñas cosas.
              <br />
              <em>Buenos planes.</em>
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
            <span className="eyebrow">02 / UN POCO DE TODO</span>
            <h2 id="categorias" tabIndex={-1}>
              Muchas maneras de
              <br />
              <em>hacer tu día.</em>
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
            const art = categoryArt[category.id] || {
              photo: "",
              line: category.description,
            };
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
                  } as React.CSSProperties
                }
              >
                <div className="home-category-media">
                  {category.imageKey !== "none" ? (
                    <MediaImage
                      imageKey={category.imageKey}
                      alt={category.name}
                    />
                  ) : art.photo ? (
                    <img
                      src={"/images/home/" + art.photo + "-480.webp"}
                      srcSet={
                        "/images/home/" +
                        art.photo +
                        "-480.webp 480w, /images/home/" +
                        art.photo +
                        "-960.webp 960w"
                      }
                      sizes="(max-width:600px) 92vw, (max-width:1000px) 44vw, 30vw"
                      width={480}
                      height={538}
                      loading="lazy"
                      decoding="async"
                      alt=""
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                        event.currentTarget.parentElement?.classList.add(
                          "home-image-unavailable",
                        );
                      }}
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
                  <span className="home-category-number" aria-hidden="true">
                    0{i + 1}
                  </span>
                </div>
                <div className="home-category-caption">
                  <div>
                    <h3>{category.name}</h3>
                    <p>{art.line}</p>
                  </div>
                  <span className="home-category-arrow">
                    <ArrowUpRight size={22} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        <p className="home-category-note">
          Fotografías de ambientación. Consulta los artículos disponibles en
          cada categoría.
        </p>
      </section>
      <section
        className="home-delivery container"
        aria-labelledby="delivery-title"
      >
        <div>
          <span className="eyebrow">TU PEDIDO, PASO A PASO</span>
          <h2 id="delivery-title">Todo claro, hasta la entrega.</h2>
          <p>
            Elige tu zona de prueba, revisa el envío y consulta el estado de tu
            pedido. Es una simulación; no se realiza un reparto real.
          </p>
          <Button asChild>
            <Link to="/ayuda#entregas-pagos">Conocer entregas y pagos</Link>
          </Button>
        </div>
        <details className="delivery-reference">
          <summary>Ver clip de referencia · ficción</summary>
          <p>
            Escena de comedia aportada como referencia: un personaje maltrata un
            paquete. No muestra al personal ni el servicio de Rosita. Video sin
            audio; la información de entrega está en el texto.
          </p>
          <AmbientVideo
            src="/images/video/web/video-entrega-Delivery.mp4"
            poster="/images/video/web/video-entrega-Delivery-poster.jpg"
            label="clip de referencia de ficción"
            automatic={false}
          />
        </details>
      </section>
      <ColorBridge />
      <section
        className="home-promo home-editorial-promo"
        aria-label="Promoción de demostración"
      >
        <div data-home-reveal>
          <span className="eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            PRECIOS ESPECIALES DE DEMOSTRACIÓN
          </span>
          <h2>
            Una pausa
            <br />
            <em>que provoca.</em>
          </h2>
          <p>Encuentra tus snacks, bebidas y pequeños favoritos.</p>
          <Link
            className="home-editorial-link"
            to="/catalogo?ofertas=1"
            data-cursor="Ver"
          >
            Ver precios especiales <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div
          className="home-promo-composition"
          aria-hidden="true"
          data-home-reveal
        >
          {active
            .filter((p) => p.category === "consumibles")
            .slice(0, 2)
            .map((p) => (
              <div key={p.id}>
                <ProductImage product={p} />
              </div>
            ))}
          <span>
            Haz una
            <br />
            pausa.
          </span>
        </div>
      </section>
      <section className="home-last-word">
        <span className="eyebrow">MINIMARKET ROSITA</span>
        <h2 data-home-reveal>
          Lo esencial,
          <br />
          <em>más cerca.</em>
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
