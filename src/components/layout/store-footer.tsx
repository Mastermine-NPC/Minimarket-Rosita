import { useTaxonomy } from "@/hooks/use-taxonomy";
import { Link } from "react-router";
import { Banknote, CreditCard, MessageCircle, Smartphone } from "lucide-react";
import "@/styles/footer-compact.css";

function Instagram() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
}
function Facebook() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 22v-9h3l.5-4H14V7c0-1 .3-1.5 1.7-1.5H18V2.2A27 27 0 0 0 15 2c-3 0-5 1.8-5 5v2H7v4h3v9z" /></svg>;
}

export function StoreFooter() {
  const { activeCategories, categoryPath } = useTaxonomy();
  const halloween = activeCategories.find(category => category.name.toLocaleLowerCase("es") === "halloween");
  return <footer className="store-footer compact-store-footer">
    <div className="compact-footer-main">
      <Link className="compact-footer-brand" to="/" aria-label="Rosita, inicio">Rosita.</Link>
      <nav className="compact-footer-links" aria-label="Enlaces al pie">
        <Link to="/catalogo">Catálogo</Link>
        {halloween && <Link to={categoryPath(halloween)}>Halloween</Link>}
        <Link to="/ayuda">Ayuda</Link>
        <Link to="/contacto">Contacto</Link>
        <Link to="/personal">Personal</Link>
      </nav>
      <div className="compact-footer-socials" role="group" aria-label="Redes sociales">
        <a href="https://wa.me/51938572212" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de Rosita (abre otra pestaña)" title="WhatsApp"><MessageCircle aria-hidden="true" /></a>
        <span className="social-coming-soon" role="img" aria-label="Instagram, próximamente" title="Instagram · próximamente"><Instagram aria-hidden="true" /></span>
        <span className="social-coming-soon" role="img" aria-label="Facebook, próximamente" title="Facebook · próximamente"><Facebook aria-hidden="true" /></span>
      </div>
      <div className="compact-footer-payments" role="group" aria-label="Métodos de pago de demostración">
        <span><Banknote aria-hidden="true" /> Efectivo</span>
        <span><CreditCard aria-hidden="true" /> Tarjeta</span>
        <span><Smartphone aria-hidden="true" /> Yape</span>
        <span><Smartphone aria-hidden="true" /> Plin</span>
      </div>
    </div>
    <div className="compact-footer-bottom">
      <span>Minimarket Rosita · Prototipo académico</span>
      <span>Precios y stock de prueba. Sin cobros ni entregas reales.</span>
    </div>
  </footer>;
}
