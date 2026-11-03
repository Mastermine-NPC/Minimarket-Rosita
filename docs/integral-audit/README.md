# Auditoría integral de Minimarket Rosita

Fecha: 3 de noviembre de 2026 (America/Bogota). Trabajo local, sin commits, push ni despliegue. Se conservaron los cambios previos del usuario. Los accesos, pedidos, registros y ventas de QA pertenecen a un perfil de Chrome separado y a fixtures; no se modificó el almacenamiento del navegador del usuario.

## 1. Estado inicial

- SPA React 19.3.1, TypeScript 6, Vite 8.3.5 y React Router. Context/useReducer con esquemas Zod. No existe backend, base de datos de servidor ni API propia.
- Persistencia v9 en localStorage; sesión por pestaña en sessionStorage e imágenes subidas en IndexedDB. Validaciones y permisos locales de prototipo.
- Tailwind 4, componentes Radix/shadcn, CSS global y capas específicas. Manrope y DM Sans locales; identidad verde/rosa conservada.
- Animación con GSAP, ScrollTrigger, Motion y Lenis. Compositor WebGL de inicio; Three.js/R3F/Drei diferidos para fichas 3D. Leaflet/MapLibre y proveedores externos para mapas.
- Catálogo compartido de 79 productos; 7 categorías y 39 subcategorías; 14 referencias con visor 3D. 17 archivos GLB válidos, incluidos conjuntos fuente.
- 33 patrones de ruta, incluidos comodines público/administrativo. Inventario completo en [ROUTES.md](ROUTES.md).
- La línea base superó tipos, ESLint, contrastes y build. Dos pruebas históricas fallaban por esperar 75 productos. La prueba vial externa no pudo resolver DNS en el entorno restringido.

## 2. Inventario de problemas y correcciones

| ID / gravedad | Ubicación y ruta | Causa y evidencia | Solución / estado |
|---|---|---|---|
| A01 · P1 | Fichas 3D, ProductPresentation, layout público | CLS superior a 1 en las cinco familias medidas. Skeleton de ruta bajo, footer visible que luego se desplaza, márgenes que colapsan y foto provisional sustituida por visor. | Altura mínima de contenido/espera, flow-root sin ocultar desbordamientos, espacio reservado para visor y controles, estado de preparación en lugar de foto transitoria. Comparación numérica abajo. |
| A02 · P1 | /admin/ubicacion, formulario de origen | A 320 px el documento llegaba a 336 px. Botón largo sin salto de línea imponía tamaño mínimo al grid. | Botones permiten envolver texto, hijos con min-width:0 y coordenadas con corte de texto. Reprueba sin scroll horizontal. |
| A03 · P2 | /sistema-diseno, TabsList | Ancho 339 px en viewport 320 por pestañas en una sola línea. | Pestañas adaptables con flex-wrap y altura automática; contenidos conservados. |
| A04 · P2 | Todas las rutas, head | Mismo title en los 40 casos iniciales; sin canonical, robots dinámico ni Open Graph por página. Descripción inicial decía seis categorías. | Metadatos por ruta, producto, categoría y búsqueda; actualización de nodos únicos; noindex en zonas privadas/técnicas/errores. JSON-LD de producto sin ofertas, precios o reseñas inventadas. robots.txt. |
| A05 · P2 | Inicio, liquid-home-engine | texImage2D subía imágenes y pósteres estáticos en cada frame. La muestra de dos segundos registró 88 subidas. | Texturas estáticas reutilizadas por recurso/dimensiones, liberadas al desmontar. Videos conservan actualización por frame y el efecto de agua permanece. |
| A06 · P2 | Model, product-model-canvas | El desmontaje durante el resize asíncrono de bitmaps podía liberar la escena mientras seguía procesándose o liberarla dos veces. | Propiedad única del recurso; limpieza diferida hasta concluir la carga y liberación única. Revisado por código y navegación repetida; no se afirma un perfil completo de memoria GPU. |
| A07 · P2 | RenderBudget 3D | El RAF seguía programándose en pestaña oculta aunque omitía invalidate. | visibilitychange cancela y reanuda el bucle; se mantiene suspensión por visibilidad y movimiento reducido. |
| A08 · P2 | useCatalog y useTaxonomy | Cambios de carrito/sesión volvían a calcular catálogo y ordenar taxonomía por depender de todo state. | Memoización limitada a productos, inventario, categorías y subcategorías. Sin caché de precios/stock obsoletos. |
| A09 · P2 | ProductImage y tarjetas con atlas | Imágenes sin dimensiones intrínsecas; atlas cuadrado forzado a altura rectangular por CSS compartido. | Dimensiones explícitas y decoding async en miniaturas; relación 1:1 para atlas. Reprueba geométrica sin imágenes estiradas en la ruta controlada. |
| A10 · P2 | verify-model-catalog, verify-normal-catalog | Recuento histórico 75 incompatible con las cuatro altas de Halloween. | Expectativas de catálogo actual y migración compatibles; se conservaron pruebas de IDs, colisiones, stock e historial. |
| A11 · P2 | Suite de operaciones | Prueba de lógica dependía de red y transmitía coordenadas por defecto. | npm test usa respuesta vial sintética identificada --offline, solo dentro del test. test:routing:live preserva la comprobación real separada. No cambió el servicio de rutas de la aplicación. Las cargas SSR de tests desactivan también el WebSocket innecesario de Vite (ws:false). |

No se identificaron P0 durante las comprobaciones realizadas. Esta afirmación no equivale a una certificación de seguridad ni de aptitud para comercio real.

## 3. Cambios realizados

Cambios de esta auditoría, separados de los ajustes visuales previos de esta conversación:

- index.html
- package.json
- README.md
- public/robots.txt
- src/app/router.tsx
- src/components/layout/page-metadata.tsx
- src/hooks/use-catalog.ts
- src/hooks/use-taxonomy.ts
- src/features/catalogo/product-image.tsx
- src/features/inicio/liquid-home-engine.ts
- src/features/product-3d/product-model-canvas.tsx
- src/features/product-3d/product-presentation.tsx
- src/pages/admin/store-location-page.tsx
- src/pages/system-page.tsx
- src/styles/cinema-global.css
- src/styles/modules.css
- src/styles/operations.css
- src/styles/product-3d.css
- src/styles/product-detail-marketplace.css
- src/styles/product-marketplace.css
- scripts/verify-operations.mjs
- scripts/verify-order-flow.mjs
- scripts/verify-international-phone.mjs
- scripts/verify-halloween.mjs
- scripts/verify-model-catalog.mjs
- scripts/verify-normal-catalog.mjs
- scripts/verify-operations-edges.mjs
- scripts/generate-sitemap.mjs
- scripts/audit-server.mjs
- scripts/audit-browser-common.ps1
- scripts/audit-browser.ps1
- scripts/audit-functional.ps1
- scripts/audit-dynamic.ps1
- scripts/audit-performance.ps1
- scripts/audit-recheck.ps1
- scripts/verify-audit-evidence.mjs
- scripts/audit-report.mjs

También se generaron este informe, inventario de rutas, capturas, resultados JSON y logs bajo docs/integral-audit. Algunas pruebas existentes regeneran sus resultados en docs/operations-verification, docs/normal-catalog-verification y docs/models-integration-verification. No se agregaron, eliminaron ni actualizaron dependencias. No se reemplazaron modelos, animaciones, rutas o el catálogo por alternativas ficticias.

## 4. Testing y verificación

### Cobertura de navegador

- 40 casos base × 9 tamaños = 360 muestras de ruta/viewport, con sesiones guest/customer/admin/cashier de prueba.
- 125 URLs dinámicas × 2 tamaños = 250 muestras adicionales; todos los productos/categorías/subcategorías semilla se abrieron.
- Tamaños: 320×568, 375×667, 390×844, 430×932, 768×1024, 1024×768, 1280×720, 1440×900, 1920×1080.
- Resultado final: sin scroll horizontal accidental en las muestras verificadas; sin imágenes rotas ni excepciones Runtime.exceptionThrown en las 40 rutas base. Las tablas conservan desplazamiento horizontal interno cuando corresponde.
- Se verificaron visualmente capturas representativas de tienda, fichas, administración y móvil; se guardaron capturas a 375 y 1440 para cada caso base. No se afirma inspección manual de cada píxel ni prueba en hardware móvil real.
- La heurística de botones sin texto detectó los checkboxes envueltos en label; Chrome Accessibility confirmó los nombres “Solo disponibles” y “Ofertas de prueba”. No eran controles sin nombre.
- Una compilación coincidió con la visita histórica a cereales y produjo un HTTP 500 del servidor de QA al faltar temporalmente dist/index.html. Se conserva ese registro y la repetición independiente en nueve tamaños con HTTP 200. No se cuenta el intento fallido como aprobado.

### Interacciones reales en la sesión aislada

- search-brand-sort
- empty-search
- promotions-after-two-rows
- add-product-and-persist
- cart-reload
- customer-login-ui
- account
- customer-cannot-admin
- checkout-initial
- checkout-delivery-validation
- checkout-confirmed-exactly-once
- admin-login-ui
- halloween-admin
- admin-edit-dialog-mobile
- admin-save-price
- cash-screen
- cash-halloween-sale
- mobile-menu
- escape-menu
- registration-ui

Resultados destacados: búsqueda Coca-Cola devuelve dos referencias ordenadas; banners después de dos filas reales; carrito conserva dos unidades sin descontar inventario; cliente no accede a administración; checkout de recojo crea un pedido y un solo movimiento; registro crea únicamente customer; editor a 320 px dentro de la pantalla; venta de calabaza crea recibo y descuenta 18→17; Escape cierra navegación.

### Comandos y evidencias

- npm test: operaciones y límites (modalidad vial offline), integración y migraciones de catálogo, Halloween, pedidos y teléfonos. Aprobado.
- npm run check: TypeScript, ESLint, 26 contrastes del sistema y build. Aprobado. Los 26 contrastes no sustituyen una auditoría automática de contraste de cada estado de cada componente.
- node scripts/verify-audit-evidence.mjs: aserciones sobre resultados reales del navegador.
- Generador de sitemap validado con origen localhost y 91 URLs. El XML de validación no se publicó.
- Escaneo de referencias literales de imágenes/fuentes/modelos: sin archivos locales faltantes. 17 GLB con cabecera/versión/longitud JSON válidas; las 14 referencias de visor llegaron a ready.
- Escaneo de patrones comunes de claves privadas/tokens en código y public: sin coincidencias. No se asegura ausencia de cualquier posible secreto fuera de esos patrones.

Evidencias: [rutas finales](final-routes/routes.json), [dinámicas](after-dynamic/routes.json), [interacciones](final-functional/checks.json), [repetición/AX](final-recheck/checks.json), [pruebas](final-tests.log), [build](cls-build.log), [dependencias](dependency-audit.json), [GLB](media-inventory.json).

## 5. Rendimiento

Comparación de laboratorio local: Chrome headless en Windows, WebGL SwiftShader por software, viewport 1440×900, sin throttling y caché de red desactivada; una muestra por caso. La compilación “antes” para esta comparación ya incluía los primeros cambios de responsive/metadatos y precedía a la caché de texturas y a la estabilización completa de carga. No es una medición de campo ni un benchmark estadístico.

| Ruta | LCP ms antes / después | CLS antes / después | loadEventEnd ms antes / después | Bytes transferidos después |
|---|---:|---:|---:|---:|
| /catalogo | 328 / 216 | 0.008 / 0.000 | 180.800 / 96.600 | 4262646 |
| / | 628 / 628 | 0.000 / 0.000 | 75.200 / 66.500 | 5585378 |
| /producto/ROS-064 | 964 / 996 | 1.085 / 0.000 | 251.100 / 253.100 | 8017906 |
| /producto/ROS-065 | 812 / 1008 | 1.086 / 0.000 | 93.500 / 262.000 | 12275465 |
| /producto/ROS-066 | 900 / 884 | 1.109 / 0.000 | 178.900 / 159.700 | 4971861 |
| /producto/ROS-002 | 876 / 848 | 1.086 / 0.000 | 172.600 / 129.500 | 5105008 |
| /producto/ROS-022 | 824 / 828 | 1.116 / 0.000 | 107.500 / 98.000 | 3049286 |

loadEventEnd es el evento de carga de documento, no el tiempo de disponibilidad del visor ni el de completar una compra. LCP no mejoró uniformemente; no se atribuyen mejoras de velocidad a variaciones de una sola muestra. INP no se midió de forma representativa; no se inventa un valor.

En inicio, las subidas estáticas a GPU tras estabilizar la sección de productos fueron 88→0 en dos segundos. Se mantienen animación del agua, movimiento de bordes y video. La caché retiene texturas de esas imágenes mientras el inicio está montado y las libera al salir.

Los bundles grandes de mapas y visor siguen diferidos. El chunk inicial estaba en aproximadamente 662,37 kB minificados y no se redujo: los metadatos y las correcciones añaden código. Los logs conservan el tamaño real de cada build; no se presenta separar archivos como una reducción de transferencia.

| Chunk | Antes (minificado y gzip del build) | Después (minificado y gzip del build) |
|---|---|---|
| index | 662.37 kB │ gzip: 201.63 kB | 666.15 kB │ gzip: 202.84 kB |
| product-model-canvas | 1,051.50 kB │ gzip: 284.80 kB | 1,051.70 kB │ gzip: 284.87 kB |
| night-basemap | 1,062.67 kB │ gzip: 288.74 kB | 1,062.67 kB │ gzip: 288.74 kB |

## 6. Seguridad, pendientes y límites

1. **Proveedor vial en vivo: verificado tras autorización explícita del usuario.** El intento inicial falló por DNS y la revisión automática bloqueó la transmisión sin aprobación específica. Tras recibirla, se ejecutó npm run test:routing:live con acceso de red y terminó con código 0. La prueba del segundo destino exige una respuesta del proveedor con geometría válida y sin fallback; también pasaron cobertura, cancelación y validación de datos. Evidencia: [live-routing.log](live-routing.log) y docs/operations-verification/extra.json (routingMode: live-provider). Esto verifica la consulta en ese momento, no garantiza disponibilidad futura ni certifica reparto comercial.
2. **Prototipo local:** autenticación, permisos, stock y ventas son locales. No existe seguridad de servidor, transacción de base de datos ni garantía de consistencia entre dispositivos/pestañas. Para uso comercial real hace falta un backend; añadirlo excedería esta auditoría y no se fingió su existencia.
3. **Dependencias:** npm audit reportó 17 avisos (15 moderados, 2 bajos; ninguno alto/crítico). El cruce con package-lock sitúa todos en tooling de desarrollo, no en paquetes de producción. Los orígenes incluyen [minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249) y [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4). No se aplicaron downgrades mayores o overrides incompatibles sugeridos automáticamente. Requiere una actualización probada del tooling cuando sus dependencias lo permitan.
4. **SEO de despliegue:** títulos/canonical/OG son client-side. Algunos bots de previews no ejecutan JavaScript; resolverlo exige prerender/SSR o generación de HTML de despliegue. Sitemap listo mediante SITE_URL, pendiente de confirmar origen público. El catálogo editado en localStorage no puede publicarse automáticamente en un sitemap del servidor.
5. **Multimedia:** public conserva aproximadamente 391 MiB, muchos correspondientes a originales y conjuntos fuente. Hay un original de video de unos 101 MiB. Las páginas usan principalmente variantes web/cinematic; no se borraron originales del usuario. Quedan por evaluar compresión/exportación adicional de video y GLB con comparación visual y dispositivos reales. No se introdujeron Draco/Meshopt sin verificar compatibilidad.
6. **CSS/código histórico:** persisten capas de estilos solapadas y el componente CategoryCarousel, ya sin importación en el inicio. Se identificaron como mantenimiento P3; no se eliminó código reutilizable ni se emprendió una reescritura masiva.
7. **QA pendiente fuera del entorno:** lectores físicos, pagos reales, emails/SMS, servidor productivo, lectores de pantalla y perfiles completos de memoria/GPU en hardware real no se probaron. No existen cobros reales que certificar. La herramienta de Computer Use no pudo inicializar por el mapeo de cwd WSL; se usó Chrome CDP en un perfil separado para los recorridos.

### Repetir sin tocar datos del usuario

Construir primero, luego mantener dist estable durante las visitas: npm run build; node scripts/audit-server.mjs. El servidor de QA escucha en 5197 y entrega únicamente fixtures de demostración. Cerrar ese servidor al terminar. Los guiones PowerShell usan un perfil Chrome separado; las rutas del repo se pueden ajustar con -Repo. No deben ejecutarse dos guiones de navegador a la vez porque comparten la pestaña aislada.

No se realizaron commits, pushes, despliegues ni cambios en servicios externos.
