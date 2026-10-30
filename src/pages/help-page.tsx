import { Link } from "react-router";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { Button } from "@/components/ui/button";
const topics = [
  {
    id: "accesos",
    title: "Registro y accesos de prueba",
    items: [
      [
        "¿Necesito una cuenta para explorar?",
        "No. Puedes buscar, filtrar, consultar productos y llenar el carrito sin identificarte. Para confirmar un pedido a domicilio debes iniciar una sesión de cliente de demostración.",
      ],
      [
        "¿Cómo pruebo los perfiles?",
        "En el login, Accesos de demostración completa las credenciales de cliente o administrador. Debes pulsar Iniciar sesión. El registro público crea solo clientes; estos controles locales no proporcionan seguridad de servidor.",
      ],
    ],
  },
  {
    id: "como-comprar",
    title: "Cómo comprar",
    items: [
      [
        "¿Cómo encuentro un artículo?",
        "Usa el buscador o una categoría del catálogo. Dentro de una categoría puedes elegir una subcategoría y combinar marca, precio, disponibilidad y orden. La selección queda en la URL al volver del detalle.",
      ],
      [
        "¿Cómo funciona el carrito?",
        "Agregar conserva el carrito al navegar y no reserva stock. Puedes ajustar cantidades o quitar líneas. El checkout revalida existencias y precios antes de confirmar.",
      ],
      [
        "¿Qué pasos tiene la compra?",
        "Carrito → acceso de cliente → datos de entrega → pago simulado → revisión → confirmación. Puedes regresar sin perder el borrador. El total con envío se muestra antes de confirmar.",
      ],
    ],
  },
  {
    id: "entregas-pagos",
    title: "Entregas y pagos de demostración",
    items: [
      [
        "¿Se cobra dinero real?",
        "No. Yape, Plin y efectivo contra entrega son opciones simuladas. No se piden datos financieros reales. El efectivo permite comprobar importe suficiente y vuelto; no es una venta de caja presencial.",
      ],
      [
        "¿Las entregas y el mapa son reales?",
        "No. Zonas A/B, tarifas y tiempos son datos de prueba. El seguimiento muestra estados guardados, no un repartidor o mapa en vivo.",
      ],
    ],
  },
  {
    id: "pedidos",
    title: "Pedidos y seguimiento",
    items: [
      [
        "¿Dónde consulto mi compra?",
        "En Mis pedidos o Mi cuenta. El pedido confirmado guarda nombre, presentación, precio, cantidades y total de ese momento. Cambiar el catálogo después no reescribe tu compra.",
      ],
      [
        "¿Cómo avanza el pedido?",
        "Administración puede avanzar una etapa con confirmación. El control manual del cliente está identificado como simulación. Cambiar estado no vuelve a descontar stock.",
      ],
    ],
  },
  {
    id: "datos-locales",
    title: "Datos locales y caja",
    items: [
      [
        "¿Dónde se guardan mis datos e imágenes?",
        "En este navegador: registros en localStorage e imágenes subidas en IndexedDB. No hay servidor ni sincronización entre dispositivos o pestañas. Borrar datos del sitio puede eliminar la demostración.",
      ],
      [
        "¿Cómo restablezco Rosita?",
        "Solo el administrador puede entrar a Restablecer demostración y confirmar. Se limpian datos e imágenes propios de Rosita; otras aplicaciones no se borran.",
      ],
      [
        "¿La caja está implementada?",
        "No hay módulo de venta presencial en esta versión. La tienda digital registra pedidos de demostración. Los reportes separan este canal y no inventan ventas de caja. No se ofrece una cuenta de cajero sin una función real.",
      ],
    ],
  },
];
export function HelpPage() {
  const heading = useHeadingFocus();
  return (
    <div className="container info-page">
      <header className="info-heading">
        <span className="eyebrow">ROSITA TE ACOMPAÑA</span>
        <h1 ref={heading} tabIndex={-1}>
          Centro de ayuda
        </h1>
        <p>
          Orientación para explorar y probar la tienda. Todo el recorrido
          comercial es de demostración.
        </p>
      </header>
      <nav className="help-topic-nav" aria-label="Temas de ayuda">
        {topics.map((t) => (
          <Link key={t.id} to={"#" + t.id}>
            {t.title}
          </Link>
        ))}
        <Link to="#preguntas-frecuentes">Preguntas frecuentes</Link>
      </nav>
      <section id="preguntas-frecuentes" tabIndex={-1}>
        <h2>Preguntas frecuentes</h2>
        <p>
          Abre cada pregunta con clic, Enter o espacio. No necesitas abrirlas
          todas para continuar.
        </p>
      </section>
      {topics.map((t) => (
        <section className="help-topic" id={t.id} tabIndex={-1} key={t.id}>
          <h2>{t.title}</h2>
          {t.items.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      ))}
      <section className="info-callout">
        <h2>¿Seguimos?</h2>
        <div className="customer-actions">
          <Button asChild>
            <Link to="/catalogo">Ir al catálogo</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contacto">Formulario de contacto</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
