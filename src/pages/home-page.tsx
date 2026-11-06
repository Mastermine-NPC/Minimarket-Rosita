import { useLiquidHome } from "@/features/inicio/use-liquid-home";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { useRef } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { useCatalog } from "@/hooks/use-catalog";

import { Button } from "@/components/ui/button";
import { CinematicStory } from "@/features/inicio/cinematic-story";


import { ProductCarousel } from "@/features/inicio/product-carousel";

import { useHomeReveals } from "@/features/inicio/use-home-reveals";
import "@/styles/home.css";
export function HomePage() {
  const { activeCategories: categories } = useTaxonomy();
  const products = useCatalog(),
    root = useRef<HTMLDivElement>(null),
    active = products.filter((p) => p.active !== false),
    featured = [...active]
      .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
      .slice(0, 8);
  useHomeReveals(root);
  useLiquidHome(root);
  return (
    <div className="home-experience" ref={root}>
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
