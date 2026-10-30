import { ModulePatterns } from "@/features/sistema/module-patterns";
import { useCatalog } from "@/hooks/use-catalog";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  LoaderCircle,
  Palette,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ValidationForm } from "@/features/comprobacion/validation-form";
import { ProductCard } from "@/features/catalogo/product-card";

import { useHeadingFocus } from "@/hooks/use-heading-focus";
const swatches = [
  ["Marca / acción", "#145A46"],
  ["Fondo", "#F7F8F5"],
  ["Superficie", "#FFFFFF"],
  ["Texto principal", "#17231D"],
  ["Texto secundario", "#526159"],
  ["Identidad rosa", "#F4B8C8"],
  ["Verde suave", "#E8F1E9"],
  ["Foco", "#245AC9"],
  ["Error", "#B42332"],
  ["Éxito", "#216744"],
  ["Advertencia", "#875006"],
];
export function SystemPage() {
  const products = useCatalog();
  const heading = useHeadingFocus(),
    [loading, Loading] = useState(false),
    [success, Success] = useState(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <div className="container system-page">
      <div className="system-header">
        <span className="eyebrow">
          <Palette size={15} aria-hidden="true" /> ROSITA / DESIGN SYSTEM 2.7.0
        </span>
        <h1 ref={heading} tabIndex={-1}>
          Una identidad.
          <br />
          Muchas formas de acompañarte.
        </h1>
        <p>
          Biblioteca interna del prototipo. Estos son los mismos tokens y
          componentes que usa la tienda, no imágenes de una propuesta.
        </p>
        <Badge variant="secondary">Aplicación 1.0.0 · Frontend local</Badge>
      </div>
      <Tabs defaultValue="fundamentos">
        <TabsList>
          <TabsTrigger value="fundamentos">Fundamentos</TabsTrigger>
          <TabsTrigger value="componentes">Componentes</TabsTrigger>
          <TabsTrigger value="reglas">Reglas de uso</TabsTrigger>
        </TabsList>
        <TabsContent value="fundamentos">
          <section className="system-section">
            <h2>Colores con una función clara.</h2>
            <p>
              Verde profundo para acciones e identidad; rosa para momentos de
              marca y promociones puntuales. Error, éxito, advertencia y foco
              tienen tokens independientes y mensajes escritos.
            </p>
            <div className="swatch-grid">
              {swatches.map(([name, color]) => (
                <div className="color-swatch" key={name}>
                  <span style={{ background: color }} />
                  <strong>{name}</strong>
                  <code>{color}</code>
                </div>
              ))}
            </div>
          </section>
          <section className="system-section">
            <h2>Una voz expresiva. Una lectura cómoda.</h2>
            <h3 style={{ fontSize: 36, fontWeight: 800 }}>
              Manrope, para lo que importa.
            </h3>
            <p>
              DM Sans, para acompañar cada tarea. Cuerpo de 16 px, navegación y
              formularios de 14 px. Precios y tablas usan cifras tabulares para
              comparar importes.
            </p>
            <p>
              Escala: 11 / 12 / 14 / 16 / 20 / 24 / 32 / 40 / 52 / 64 px según
              contexto y ancho. Manrope 600–800 y DM Sans 400–700 en dos WOFF2
              variables Latin locales, con licencias OFL y font-display: swap.
            </p>
          </section>
          <section className="system-section">
            <h2>Espacio, forma y movimiento.</h2>
            <p>
              Espaciado 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 px. Controles
              con radio 10 px, tarjetas 20 px y promociones 28 px. Sombras
              discretas; foco de 3 px y controles esenciales de 44–48 px.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Función</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Regla</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["Controles", "150 ms", "Fondo, borde y respuesta breve."],
                  ["Paneles", "240 ms", "Entrada/salida de carrito y filtros."],
                  [
                    "Título de inicio",
                    "650 ms + 90 ms",
                    "Revelado por líneas; una sola lectura accesible.",
                  ],
                  [
                    "Fotografía principal",
                    "800 ms",
                    "Máscara al cargar; no bloquea los controles.",
                  ],
                  [
                    "Marquesina",
                    "26 s",
                    "Pausable; detenida fuera de pantalla y en segundo plano.",
                  ],
                  [
                    "Parallax / magnetismo",
                    "36 px / 5 px máx.",
                    "Solo puntero preciso; control real inmóvil.",
                  ],
                  [
                    "Curva",
                    "cubic-bezier(.2,0,0,1)",
                    "Desaceleración consistente.",
                  ],
                  [
                    "Movimiento reducido",
                    "0 ms",
                    "Sin desplazamiento, zoom ni entradas animadas.",
                  ],
                ].map((row) => (
                  <TableRow key={row[0]}>
                    {row.map((cell, i) => (
                      <TableCell key={i}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </TabsContent>
        <TabsContent value="componentes">
          <ModulePatterns />
          <section className="customer-panel">
            <h3>Entrega, seguimiento y caja · 2.7</h3>
            <p>
              RouteMap separa mapa y servicio vial. DeliveryTracking separa
              animación y estado de entrega. Caja comparte Button, Input, Dialog
              y CardSimulation con checkout; sus importes usan el inventario
              común.
            </p>
            <p>
              La ruta se calcula tras confirmar un punto. Procesamiento bloquea
              duplicados; error y éxito tienen texto, no solo color. Movimiento
              reducido utiliza avances manuales del repartidor.
            </p>
            <Link className="text-link" to="/caja">
              Abrir plantilla de caja (requiere personal)
            </Link>
          </section>
          <section className="system-section">
            <h2>Navegación comercial · 2.4.0.</h2>
            <p>
              El menú principal conserva seis categorías. Dentro de cada
              categoría, la barra lateral y el panel móvil muestran sus
              subcategorías reales, la selección activa y cantidades con los
              demás filtros. Precio, marca y disponibilidad forman un bloque
              separado.
            </p>
            <p>
              La selección vive en la URL, se combina con búsqueda/orden y
              vuelve desde el detalle. Todos los productos de la categoría o
              Quitar selección eliminan solo la subcategoría. El catálogo
              general invita a elegir categoría sin duplicar el menú.
            </p>
            <p>
              Administración exige una subcategoría compatible. Esquema local
              v5: migración conserva datos e historial y marca Por clasificar
              cuando no puede inferir un tipo con certeza. No se añaden
              artículos ni stock para llenar grupos.
            </p>
            <Button asChild variant="outline">
              <Link to="/categoria/consumibles?subcategoria=snacks">
                Probar subcategorías
              </Link>
            </Button>
          </section>
          <section className="system-section">
            <h2>Visor de producto · 2.3.1.</h2>
            <p>
              Zoom acotado al marco del detalle, modal con controles de 44 px,
              arrastre y flechas. Escape devuelve el foco al origen. El hover
              excluye los márgenes de contain y se desactiva con movimiento
              reducido; el zoom manual sigue disponible sin animación.
            </p>
            <p>
              Fotos del atlas: 300 × 300 px por artículo, máximo 150 % en el
              visor y límite de tamaño base para evitar ampliación excesiva.
              Ilustraciones SVG: hasta 300 %, identificadas como ilustración. La
              pinza nativa permanece disponible; no hay galería de varias
              fotografías en los datos actuales.
            </p>
            <Button asChild variant="outline">
              <Link to="/producto/ROS-001">Probar Ampliar imagen</Link>
            </Button>
          </section>
          <section className="system-section">
            <h2>Presentación del inicio · 2.3.0.</h2>
            <p>
              Hero fotográfico real, título por líneas, cursor suplementario con
              contraste, dos CTA magnéticos y categorías editoriales. Los
              controles no cambian de posición. El cursor nativo permanece
              disponible.
            </p>
            <p>
              Carrusel nativo con flechas, teclado, deslizamiento y sin avance
              automático. Reutiliza ProductCard y los mismos precios,
              existencias y carrito. Las fotos de categorías son ambientación,
              no artículos en venta.
            </p>
            <p>
              Motion existente y CSS; sin dependencias nuevas. En móvil:
              composición vertical, scroll táctil nativo, sin cursor ni
              parallax. Con movimiento reducido: título, fotografía y marquesina
              estáticos. El cargador observa únicamente la foto principal,
              termina al cargar, fallar o después de 1800 ms y no bloquea la
              compra.
            </p>
            <Button asChild variant="outline">
              <Link to="/">Ver el inicio interactivo</Link>
            </Button>
          </section>
          <section className="system-section">
            <h2>Acciones y estados.</h2>
            <p>
              La acción principal es verde; secundaria con borde; destructiva
              con texto explícito. No depender solo del color. Hover, presionado
              y foco mantienen la forma del control.
            </p>
            <div className="system-buttons">
              <Button
                onClick={() =>
                  toast.info("Muestra: acción principal", {
                    description:
                      "Este control demuestra su estado visual; no modifica datos.",
                  })
                }
              >
                Acción principal
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.info("Muestra: secundaria", {
                    description:
                      "Este control demuestra su estado visual; no modifica datos.",
                  })
                }
              >
                Secundaria
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  toast.info("Muestra: discreta", {
                    description:
                      "Este control demuestra su estado visual; no modifica datos.",
                  })
                }
              >
                Discreta
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  toast.info("Muestra: eliminar", {
                    description:
                      "Este control demuestra su estado visual; no modifica datos.",
                  })
                }
              >
                Eliminar
              </Button>
              <Button disabled title="Muestra de estado deshabilitado">
                No disponible
              </Button>
              <Button
                disabled={loading}
                aria-busy={loading}
                onClick={() => {
                  Loading(true);
                  Success(false);
                  timer.current = setTimeout(() => {
                    Loading(false);
                    Success(true);
                  }, 350);
                }}
              >
                {loading ? (
                  <>
                    <LoaderCircle aria-hidden="true" />
                    Procesando…
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 aria-hidden="true" />
                    Confirmado
                  </>
                ) : (
                  "Probar carga simulada"
                )}
              </Button>
            </div>
            {success && (
              <Alert className="success-alert" role="status">
                <CheckCircle2 aria-hidden="true" />
                <AlertTitle>Simulación completada</AlertTitle>
                <AlertDescription>
                  No se procesó una compra real.
                </AlertDescription>
              </Alert>
            )}
            <Alert>
              <AlertTriangle aria-hidden="true" />
              <AlertTitle>
                Un mensaje útil explica el siguiente paso.
              </AlertTitle>
              <AlertDescription>
                Si no hay coincidencias, se ofrece limpiar la búsqueda y los
                filtros.
              </AlertDescription>
            </Alert>
          </section>
          <section className="system-section">
            <h2>Patrones que sí trabajan.</h2>
            <div className="system-examples">
              <div>
                <h3>Campo, validación y confirmación</h3>
                <ValidationForm />
              </div>
              <div>
                <h3>Tarjeta comercial</h3>
                <p className="hint">
                  Agregar modifica el carrito del prototipo, igual que en el
                  catálogo.
                </p>
                <div className="system-card-example">
                  <ProductCard product={products[0]} returnTo="/catalogo" />
                </div>
              </div>
            </div>
          </section>
          <section className="system-section">
            <h2>Etiquetas, carga y navegación.</h2>
            <div className="system-buttons">
              <Badge>Selección Rosita</Badge>
              <Badge variant="secondary">Disponible</Badge>
              <Badge variant="outline">Información</Badge>
            </div>
            <p>
              El esqueleto aparece solo cuando se está cargando una ruta. No
              sustituye resultados reales.
            </p>
            <Skeleton className="h-12 w-full" />
            <div className="system-buttons">
              <Button asChild variant="outline">
                <Link to="/catalogo">
                  Probar filtros <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/carrito">
                  Probar carrito <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </section>
        </TabsContent>
        <TabsContent value="reglas">
          <section className="system-section">
            <h2>UI Kit y Design System.</h2>
            <p>
              El UI Kit reúne piezas visuales. El Design System añade tokens,
              estados, criterios de composición, accesibilidad, reglas de datos
              y documentación de uso. Aquí se personaliza realmente la fuente
              shadcn y se comparte entre páginas.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Componentes utilizados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["Átomos", "Button, Input, Label, Badge e iconos Lucide."],
                  [
                    "Moléculas",
                    "QuantitySelector, ProductPrice, StoreSearch y campos con validación.",
                  ],
                  [
                    "Organismos",
                    "ProductCard, CatalogFilters, StoreHeader, StoreFooter y CartContent.",
                  ],
                  [
                    "Plantilla",
                    "AppLayout organiza la tienda; los paneles comparten sus piezas.",
                  ],
                  [
                    "Páginas",
                    "Home, Catalog, Product, Cart y esta biblioteca componen datos y tareas.",
                  ],
                ].map(([name, description]) => (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
          <section className="system-section">
            <h2>Principios aplicados.</h2>
            <p>
              <strong>Proximidad:</strong> nombre, presentación, precio y
              agregar juntos; error junto al campo. <strong>Similitud:</strong>{" "}
              misma tarjeta en las seis categorías.{" "}
              <strong>Figura-fondo y región común:</strong> tarjetas blancas
              sobre fondo cálido; filtros y resumen separados.{" "}
              <strong>Continuidad:</strong> búsqueda y filtros conservados al
              regresar del detalle. <strong>Simplicidad:</strong> un solo origen
              de datos y un carrito, sin wrappers innecesarios.
            </p>
            <p>
              <strong>Jerarquía:</strong> fotografía y título en el inicio;
              precio y acción en la compra. Los controles no cambian de lugar al
              pasar el cursor. No se oculta contenido tras una introducción
              obligatoria ni se altera el scroll natural.
            </p>
          </section>
          <section className="system-section">
            <h2>Patrones administrativos 2.2.0.</h2>
            <p>
              AdminLayout separa navegación, perfil y tareas. AdminTable
              conserva todas las columnas y reorganiza filas cuando el panel es
              estrecho. ProductEditor valida datos y advierte cambios sin
              guardar; StockAdjustment muestra antes, después y diferencia.
              ConfirmAction comparte confirmación, foco e idempotencia entre
              administración y simulación del cliente. Dashboard usa datos
              calculados, sin cifras decorativas.
            </p>
            <Button asChild variant="outline">
              <Link to="/personal">Ver acceso de personal</Link>
            </Button>
          </section>
          <section className="system-section">
            <h2>Accesibilidad y límites.</h2>
            <p>
              Patrones 2.1.0: misma plantilla para login/registro, control de
              contraseña accesible, errores junto al campo, indicador de tres
              pasos con foco en su título y confirmación protegida durante
              procesamiento. El seguimiento usa etiquetas y un control manual
              identificado.
            </p>
            <div className="customer-actions">
              <Button asChild variant="outline">
                <Link to="/login">Ver acceso</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/checkout">Ver checkout</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/mis-pedidos">Ver pedidos</Link>
              </Button>
            </div>
            <p>
              Foco visible, etiquetas, navegación con teclado y cierre con
              Escape. Radix gestiona foco modal y devolución al origen. Las
              transiciones respetan movimiento reducido, incluido el cambio de
              preferencia durante la sesión. La comprobación de contraste se
              ejecuta con npm run check:contrast.
            </p>
            <p>
              Datos ficticios, persistencia local versionada y seis fotos de
              producto pendientes identificadas. Acceso, checkout y seguimiento
              son simulaciones locales. Administración comparte catálogo,
              inventario y pedidos. Caja y pruebas A/B quedan para otra etapa.
              No se inventan reseñas, garantías o ventas históricas.
            </p>
            <p>
              Identidad base 2.0.0: verde/rosa, Manrope/DM Sans locales,
              componentes comerciales, categorías, filtros URL y carrito. La
              versión 2.1.0 añadió plantilla de acceso, pasos de checkout,
              resumen de pedido y seguimiento manual. La versión 2.2.0 incorpora
              administración compartida y registros auditados. La versión 2.3.0
              añade presentación fotográfica, movimiento accesible y carrusel
              comercial al inicio. La base técnica permanece en /comprobacion y
              /estado.
            </p>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
