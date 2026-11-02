> Registro histórico de la primera implementación. La corrección global vigente y sus pruebas están en [global-cinema-verification](../global-cinema-verification/README.md). El verificador de este directorio corresponde al diseño anterior con controles de video.

# Home cinematográfica · Minimarket Rosita

Implementación directa sobre React/Vite, Motion y los tokens de marca existentes. Sin dependencias nuevas. Las rutas se resuelven con `categoryPath` y las categorías activas del estado; las tarjetas y el carrusel reutilizan el catálogo real.

## Auditoría y dirección

La Home anterior tenía un hero en dos columnas con video de compra enmarcado como fotografía, productos flotantes, marquee, selección de productos, categorías, entrega simulada y cierre promocional. Motion ya estaba instalado; no había GSAP ni archivos `.riv`. Se conservaron navegación, carrito, checkout, autenticación, inventario, administración y estado compartido.

Material propio del encargo: nombre Rosita, marca verde y rosa, Manrope y DM Sans, Misti, Arequipa, catálogo en soles, Coca-Cola e Inka Kola, Oreo y Lay’s, útiles Faber-Castell y Artesco, cuidado personal y ferretería. La simulación comercial permanece identificada en la interfaz.

Dirección sorteada: **The pinned poster**, seed **615746338**, sin nuevos sorteos. Idea: los planes de un día en Rosita se convierten en capítulos audiovisuales que nacen de la vista de Arequipa. Interacción principal: elegir un clip, explorar su categoría y agregar productos reales al carrito.

Adaptaciones al encargo: hero de video a pantalla completa en lugar de la ventana pequeña propuesta por el sorteo; overlays multicapa solicitados; alternancia de capítulos con texto sticky breve, sin secuestrar el scroll ni imponer una secuencia horizontal. Navegación de capítulos estática y envuelta en móvil. Se conserva el Design System de los controles comerciales.

Argumento y prueba por sección:

- Cercanía: vista local de Arequipa y el Misti, acción directa al catálogo.
- Cada plan tiene una selección: cinco capítulos con videos aportados y acceso a su categoría activa.
- Se puede comprar desde la Home: carrusel de productos con precios y acciones existentes.
- Toda la tienda está disponible: categorías activas con imágenes reales del catálogo.
- La entrega es transparente: texto y ayuda existentes de la simulación.
- Cierre de marca: Rosita y acceso al catálogo.

Referencias consultadas: [Unseen Projects](https://unseen.co/projects/) y [Rive](https://rive.app/). No se copiaron sus recursos. Rive se evaluó y se descartó para este alcance: no hay un recurso `.riv` en el proyecto y Motion/CSS resuelven las interacciones implementadas.

## Movimiento y medios

- Reveal de líneas del hero con máscara y secuencia de acciones.
- Escala y parallax ligados al scroll mediante Motion values, sin render de React por cada frame.
- Encadenado de título, descripción, acción y apertura de ventana multimedia.
- Texto sticky corto en escritorio, flujo normal en móvil y con movimiento reducido.
- Botones magnéticos existentes, feedback de tarjetas y cambio de clip explícito.
- Máximo un video reproduciéndose: cada inicio pausa los demás videos ambientales.
- Videos sin audio, loop solo en las secuencias decorativas; el clip de entrega sigue siendo manual y sin loop.
- Sin `src` de video hasta alcanzar el 45 % de visibilidad o solicitar reproducción. Después de cargar se retiene la fuente para evitar descargas repetidas.
- Pausa fuera de pantalla y al ocultarse el documento. Pausa manual persistente durante la estancia del componente.
- Poster estático con movimiento reducido, Save-Data, conexión 2G o memoria indicada de 2 GB o menos. Reproducción manual disponible.
- Fallback de poster, mensaje de estado y controles ante error o autoplay bloqueado.

Los nueve originales seleccionados suman **119,49 MB**; sus copias web suman **13,53 MB**, una reducción de **88,7 %**. H.264, yuv420p, ancho 1280, 24 fps, CRF 28, sin audio, máximo 14 segundos, faststart. Los originales del usuario se conservan.

`public/images/video/cinematic/` contiene los clips y posters derivados. Hero: `Arequipa-backgraound`. Capítulos: `coca-cola`, `inka-cola`, `oreo`, `lays`, `nivea`, `faber-castell`, `artesco`, `tornillos` (sufijo `-video-cinematografic`). Posters de producto elegidos de sus propios fotogramas; sin fotos generadas ni medios externos. Autoría/licencia de origen: no incluida en los archivos aportados; no se atribuyen como producciones propias de Rosita. Las fotografías de producto del catálogo conservan su tratamiento y procedencia existentes.

## Validación

`npm run check` y `npm run build`: TypeScript, ESLint, contraste de tokens y build de Vite. La configuración ESLint excluye `.agents/` y `.taste-skill/`, herramientas locales ajenas al código de la aplicación.

Pruebas de navegador en el build de producción: `verify.mjs`, Playwright externo y Chrome. No se agrega Playwright como dependencia de la aplicación. Para repetir, configurar `PLAYWRIGHT_MODULE`, `CHROME_PATH`, `BASE_URL` y opcionalmente `VERIFICATION_OUT`.

Pruebas a 1440, 768 y 390 px: cinco capítulos, fuentes diferidas, un video activo como máximo, selección Inka Kola, navegación por anclas, pausa por teclado, rutas de catálogo y detalle, agregar al carrito y ausencia de desbordamiento y errores JS. Adicionalmente: movimiento reducido, Save-Data y error de video.

Inspección de estilo: lint de las fuentes nuevas sin fallos. Inspector de Chrome a tres tamaños: 0 fallos con excepciones explícitas para las convenciones heredadas del Design System (líneas, cajas, texto pequeño y metadatos de producto), el scrim solicitado y la oclusión natural por la cabecera sticky existente. No se modificó la cabecera global para satisfacer reglas editoriales. Dos advertencias conservadas: variedad de tamaños del Design System y desplazamiento horizontal del carrusel accesible, que cuenta con botones, teclado y gestos.

## Revisión visual

ROUND 1
Seen in one second: Rosita sobre Arequipa, con acceso directo a productos.
Idea (one sentence): Un día en Rosita se cuenta en cinco capítulos de producto desde una apertura local.
Live thing: selección de clips y compra mediante tarjetas existentes.
Layout words by section: hero=película panorámica / intro=declaración y contexto / capítulos=montaje alternado / destacados=carrusel comercial / categorías=colecciones / entrega=información / cierre=marca.
Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6 (autoevaluación).
Caps applied: idea cotidiana compartida parcialmente con otros comercios; creatividad limitada a 7.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. `ideas-1440.png`: poster inicial dominado por una mano; se eligió un fotograma con ilustración.
2. `cuidado-1440.png`: poster inicial fragmentado; se eligió el fotograma de producto.
3. Inspector móvil: navegación de capítulos cortada al borde; se cambió a enlaces que envuelven en varias líneas.

ROUND 2
Seen in one second: ciudad, marca y acción comercial claras.
Idea (one sentence): la vista de Arequipa abre una selección audiovisual de planes cotidianos en Rosita.
Live thing: clips seleccionables, catálogo y carrito.
Layout words by section: apertura panorámica / introducción rosa / cinco capítulos alternados / catálogo real / cierre comercial.
Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6 (autoevaluación).
Caps applied: creatividad 7 por un concepto cotidiano parcialmente transferible.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Las convenciones compactas de cabecera y tarjetas (`desktop-fold.jpg`, catálogo) siguen teniendo tamaños pequeños; se conserva el DS según el alcance solicitado.
2. Los videos de origen tienen tratamientos visuales distintos (`desktop-page-01.jpg`); se unificaron encuadres y ventanas, conservando el contenido aportado.
3. La Home es más larga por los cinco capítulos (`mobile-page-01.jpg`); se mantienen accesos directos, sin scroll obligatorio ni pinning prolongado.

La compra y entrega siguen siendo una demostración, como indica el proyecto. No se añadieron promesas de reparto o stock ajenas al estado del catálogo.

ROUND 3
Seen in one second: Rosita y Arequipa conservan la apertura cinematográfica.
Idea (one sentence): la ciudad introduce los capítulos cotidianos de la tienda.
Live thing: selección de clips, categorías y carrito.
Layout words by section: ciudad / declaración / capítulos / compra / categorías / entrega / cierre.
Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6 (autoevaluación).
Caps applied: creatividad 7 por concepto parcialmente transferible.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. En el montaje de scroll `desktop-page-01.jpg`, la capa con parallax del hero sobresalía hacia la introducción: se añadió `overflow: clip` al hero para contenerla.
2. Se verificaron y regeneraron los posters definitivos de oficina, cuidado y ferretería, a partir de sus fotogramas seleccionados.
3. Permanecen las dos advertencias justificadas del Design System y del carrusel accesible. Sin nuevas carencias de contenido.
