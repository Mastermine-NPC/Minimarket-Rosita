import { Link } from "react-router";
import { ArrowUpRight, Heart, ShoppingBag, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { Button } from "@/components/ui/button";
export function AboutPage() {
  const heading = useHeadingFocus(),
    reduced = useMotionPreference();
  return (
    <div className="container info-page">
      <section className="about-intro">
        <div>
          <span className="eyebrow">CONOCE ROSITA</span>
          <h1 ref={heading} tabIndex={-1}>
            Lo cotidiano,
            <br />
            <em>más cerca de ti.</em>
          </h1>
          <p>
            Un minimarket peruano para encontrar productos de uso diario,
            artículos para casa y pequeños planes.
          </p>
          <Button asChild>
            <Link to="/catalogo">
              Explorar catálogo <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <motion.figure
          initial={false}
          whileInView={reduced ? {} : { y: [12, 0] }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <img
            src="/images/negocio-rosita.jpg"
            width={1024}
            height={598}
            alt="Interior real de Minimarket Rosita, con estantes y productos"
          />
          <figcaption>
            Fotografía del negocio facilitada en el material de Rosita.
          </figcaption>
        </motion.figure>
      </section>
      <section className="info-story">
        <span className="eyebrow">NUESTRA HISTORIA</span>
        <h2>Una tienda con identidad propia.</h2>
        <p>
          Los datos del negocio compartidos para este proyecto registran el
          inicio de actividad el 8 de julio de 2011. La propuesta digital de
          Rosita busca conectar la consulta de productos, la compra y la gestión
          del minimarket en una experiencia clara.
        </p>
        <p>
          Conservamos su nombre, logotipo y fotografía real. La oferta reúne
          productos de consumo, ferretería, tecnología, juguetería, educación y
          oficina, y cuidado personal; el catálogo refleja los registros
          disponibles.
        </p>
      </section>
      <div className="info-values">
        {[
          [
            Heart,
            "Cercanía",
            "Queremos que encuentres lo que necesitas con una navegación sencilla.",
          ],
          [
            ShoppingBag,
            "Claridad",
            "Presentación, precio y disponibilidad juntos para decidir mejor.",
          ],
          [
            MapPin,
            "Identidad local",
            "La esencia del minimarket peruano acompaña esta propuesta digital.",
          ],
        ].map(([Icon, title, text]) => (
          <article key={String(title)}>
            <Icon aria-hidden="true" />
            <h2>{String(title)}</h2>
            <p>{String(text)}</p>
          </article>
        ))}
      </div>
      <section className="info-callout">
        <h2>Tu siguiente compra empieza por explorar.</h2>
        <p>
          Este sitio es un prototipo académico. Los pedidos, pagos y entregas
          son simulados.
        </p>
        <div className="customer-actions">
          <Button asChild>
            <Link to="/catalogo">Ver productos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contacto">Contactar</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
