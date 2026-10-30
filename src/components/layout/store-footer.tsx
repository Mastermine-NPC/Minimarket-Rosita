import { useTaxonomy } from "@/hooks/use-taxonomy";
import { Link } from "react-router";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";

export function StoreFooter() {
  const { activeCategories: categories, categoryPath } = useTaxonomy();
  return (
    <footer className="store-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <strong>
            Rosita<span>.</span>
          </strong>
          <p>
            Lo cotidiano también
            <br />
            puede sentirse especial.
          </p>
          <span>Tu minimarket peruano.</span>
        </div>
        <div>
          <h2>Encuentra lo tuyo</h2>
          <nav aria-label="Categorías al pie">
            {categories.map((c) => (
              <Link key={c.id} to={categoryPath(c)}>
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2>Rosita y ayuda</h2>
          <nav aria-label="Información Rosita">
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/ayuda">Centro de ayuda</Link>
            <Link to="/ayuda#preguntas-frecuentes">Preguntas frecuentes</Link>
            <Link to="/ayuda#entregas-pagos">Entregas y pagos</Link>
            <Link to="/contacto">Contacto</Link>
            <Link to="/mis-pedidos">Mis pedidos</Link>
          </nav>
        </div>
        <div>
          <h2>Estamos cerca</h2>
          <p>
            <MapPin size={17} aria-hidden="true" />
            UPIS Mercado Mayorista
            <br />
            Zn. B, Mz. D, Lt. 6
          </p>
          <p>
            <Phone size={17} aria-hidden="true" />
            +51 938 572 212
          </p>
          <span className="footer-contact-note">
            Datos del material de Rosita.
          </span>
        </div>
        <div className="footer-note">
          <span className="footer-pink-dot" aria-hidden="true" />
          <h2>
            Una tienda de verdad.
            <br />
            Un prototipo por ahora.
          </h2>
          <p>
            Precios y stock de prueba. Sin cobros ni entregas reales. Acceso,
            pedidos y administración son simulados.
          </p>
          <Link to="/catalogo">
            Seguir explorando <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Minimarket Rosita · Prototipo académico</span>
        <nav aria-label="Recursos internos">
          <Link to="/personal">Acceso de personal</Link>
          <Link to="/sistema-diseno">Sistema de diseño</Link>
          <Link to="/comprobacion">Comprobación técnica</Link>
        </nav>
      </div>
    </footer>
  );
}
