import { useEffect } from "react";
import { useLocation } from "react-router";
import { useCatalog } from "@/hooks/use-catalog";
import { useTaxonomy } from "@/hooks/use-taxonomy";

const pages: Record<string, [string, string]> = {
  "/": ["Tu minimarket, más cerca", "Descubre productos para tu día en Minimarket Rosita. Prototipo local sin cobros ni entregas reales."],
  "/catalogo": ["Catálogo", "Explora productos, categorías y precios de demostración de Minimarket Rosita."],
  "/carrito": ["Tu carrito", "Revisa cantidades e importes de tu selección de demostración."],
  "/checkout": ["Finalizar pedido de prueba", "Revisa la entrega y el pago simulado de tu pedido."],
  "/nosotros": ["Nosotros", "Conoce Minimarket Rosita y su prototipo de tienda local."],
  "/ayuda": ["Centro de ayuda", "Resuelve tus dudas sobre pedidos, entregas y pagos de demostración."],
  "/contacto": ["Contacto", "Consulta los datos de contacto de Minimarket Rosita."],
  "/login": ["Iniciar sesión", "Accede a tu cuenta local de demostración."],
  "/registro": ["Crear cuenta", "Crea una cuenta local para probar el recorrido de compra."],
  "/personal": ["Acceso de personal", "Acceso local de demostración para administración y caja."],
  "/cuenta": ["Mi cuenta", "Gestiona tu perfil local de demostración."],
  "/mis-pedidos": ["Mis pedidos", "Consulta tus pedidos de demostración y su seguimiento."],
  "/caja": ["Caja", "Punto de venta de demostración de Minimarket Rosita."],
  "/sistema-diseno": ["Sistema de diseño", "Componentes y reglas visuales del prototipo Rosita."],
  "/comprobacion": ["Comprobación técnica", "Comprobaciones locales del prototipo Rosita."],
  "/estado": ["Estado del prototipo", "Estado y persistencia local de la aplicación."],
};

/** Update existing head entries rather than stacking metadata after each navigation. */
export function PageMetadata() {
  const { pathname, search } = useLocation();
  const products = useCatalog();
  const { categories } = useTaxonomy();
  const slug = pathname.split("/")[2];
  const product = pathname.startsWith("/producto/") ? products.find(p => p.id === slug || p.code === slug) : undefined;
  const category = pathname.startsWith("/categoria/") ? categories.find(c => c.id === slug || c.slug === slug || c.aliases.includes(slug)) : undefined;
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  const order = /^\/pedido\/[^/]+(?:\/(?:confirmacion|seguimiento))?$/.test(pathname);
  const query = pathname === "/catalogo" ? new URLSearchParams(search).get("q") : null;
  const heading = product?.name || category?.name || (admin ? `Administración${slug ? " · " + slug : ""}` : order ? (pathname.endsWith("/seguimiento") ? "Seguimiento de pedido" : pathname.endsWith("/confirmacion") ? "Confirmación de pedido" : "Detalle de pedido") : query ? `Buscar: ${query}` : pages[pathname]?.[0] || "Página no encontrada");
  const description = product?.description || category?.description || pages[pathname]?.[1] || "Minimarket Rosita. Aplicación de demostración con datos locales.";
  const indexable = pathname === "/" || pathname === "/catalogo" || ["/nosotros", "/ayuda", "/contacto"].includes(pathname) || !!(product && product.active !== false) || !!category?.active;
  const image = product?.imageSrc;
  const brand = product?.brand;
  useEffect(() => {
    const title = `${heading} | Minimarket Rosita`;
    document.title = title;
    const meta = (attribute: "name" | "property", key: string, content: string) => {
      let node = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!node) { node = document.createElement("meta"); node.setAttribute(attribute, key); document.head.append(node); }
      node.content = content;
    };
    const canonical = new URL(pathname, location.origin).href;
    meta("name", "description", description);
    meta("name", "robots", indexable ? "index,follow" : "noindex,follow");
    meta("property", "og:title", title);
    meta("property", "og:description", description);
    meta("property", "og:type", "website");
    meta("property", "og:url", canonical);
    meta("property", "og:image", new URL(image || "/images/rosita-logo.png", location.origin).href);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.append(link); }
    link.href = canonical;
    document.getElementById("rosita-product-schema")?.remove();
    if (brand && indexable) {
      const script = document.createElement("script");
      script.id = "rosita-product-schema"; script.type = "application/ld+json";
      // Prices and stock are demonstration data; do not advertise them as commercial offers.
      script.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: heading, description, brand: { "@type": "Brand", name: brand }, ...(image ? { image: new URL(image, location.origin).href } : {}) });
      document.head.append(script);
    }
  }, [heading, description, pathname, indexable, image, brand]);
  return null;
}
