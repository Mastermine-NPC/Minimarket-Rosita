# Recursos añadidos · operaciones 1.0.0

Leaflet 1.9.4 y tipos 1.9.21, sin nueva biblioteca de estado, cámara o rutas. Teselas estándar OpenStreetMap cargadas bajo demanda con atribución; no se descargó un paquete de mapas. Geometría vial verificada OSRM/FOSSGIS de 358 puntos en `src/data/verified-route.json`; procedencia y límites en [Operaciones](OPERACIONES-1.0.0.md). El origen exacto procede del usuario; la UTP del sitio oficial, con llegada vial diferenciada de puerta peatonal. No hay clave secreta ni servicio de pago. Iconos de mapa son SVG locales, independientes de las fuentes de emoji; logo, fuentes, fotos y videos existentes intactos.

Códigos de barras generados son identificadores ficticios de prueba con ceros iniciales, no una copia de códigos comerciales reales. Capturas/PDF en operations-verification son evidencia de navegador con datos ficticios; no sustituyen interfaces. No se añadieron imágenes de producto ni se reescribieron sus recursos en esta etapa.

Lo que sigue documenta recursos previos y se conserva por trazabilidad.

# Recursos de catálogo 0.9

39 fotografías aportadas en public/images/productos, identificadas por inspección visual y contenido, sin descargar ni crear fotos nuevas.30 movidas desde carpetas antiguas a tecnologia/educacion/ferreteria/jugueteria/cuidado-personal; 9 de consumibles ya correctas se dejaron intactas. Cambios de nombre necesarios usan ROS; no se sobrescribió ningún destino. Hashes SHA256 antes/después iguales. [Mapa de 39 archivos](catalog-verification/images.json) y mosaico de inspección en esa carpeta.

HDMI se vincula a ROS-043 aunque el nombre original decía 042; mouse Logitech a ROS-062 aunque decía 043. UNO es ROS-044. Powerade foto 600 ml vs registro 500 ml, Meli 135 g vs 100 g y modelo Barbie no verificable se explican en detalle. Marcas Mikas/Kingstone se guardan tal como se solicitaron, sin corregir silenciosamente a la grafía visible en las fotos. Se preservaron formatos, dimensiones y calidad; no se reoptimizaron ni reemplazaron recursos del usuario.

18 fotos del atlas anterior y seis ilustraciones previas siguen identificadas y funcionando. Recursos de inicio/video, tipografías/licencias y logotipo no se alteraron. El mosaico es material de auditoría, no una imagen que sustituya una vista o recurso nuevo de producto. No se afirma licencia/autoría externa no proporcionada. No hubo imágenes sin identificar.

[Comparación e integración](CATALOGO-0.9.0.md). Todo el registro siguiente corresponde a etapas anteriores y se conserva por trazabilidad; prevalece esta actualización para el catálogo.

# Recursos · actualización 0.8.0

Los dos MP4 fueron agregados por el usuario; se inspeccionaron metadatos y mosaicos de fotogramas distribuidos por su duración, no solo sus nombres. Se preservaron originales, fotografías/logos modificados previamente y archivos ajenos a este alcance. El JPEG actual del negocio mide **1024×598**; se corrigieron sus atributos de proporción sin cambiar su contenido. Las dimensiones históricas1025×260 de documentos anteriores corresponden al recurso previo.

## Videos locales

| Recurso original           | Inspección                                                                                                                    | Uso elegido                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| video-intro.mp4            | 23.80s,1280×720 horizontal,H.264 Main,25fps, sin audio; persona elige productos en supermercado                               | Ambientación de hero en marco 16:9 al lado del texto; no afirma que sea el local Rosita                           |
| video-entrega-Delivery.mp4 | 127.59s,1280×720 horizontal,H.264 Main,23.98fps,AAC 48 kHz 5.1; escena de comedia con maltrato de paquete, créditos y diálogo | Referencia de ficción opcional en sección secundaria de entrega; no autoplay ni presentación como servicio Rosita |

Derivados ejecutados mediante **imageio-ffmpeg 0.7.0/FFmpeg 7.0.2** en `/tmp`, sin dependencia frontend: H.264/yuv420p, 960×540, audio retirado, faststart, CRF29/30. No se agrandó ni generó contenido. PostersJPEG de los fotogramas1s/18s. El clip secundario se usa como material visual suplementario sin audio y con descripción textual de su naturaleza; ninguna información necesaria depende de él. No loop.

| Archivo    | Original (bytes) | Web (bytes) | Reducción |
| ---------- | ---------------- | ----------- | --------- |
| Intro      | 7163048          | 1476521     | 79.4%     |
| Referencia | 19423533         | 8233666     | 57.6%     |

Medición reproducible en [video-inspection.json](../docs/video-inspection.json). Archivos web/posters en `public/images/video/web`; originales intactos en su carpeta superior. `:Zone.Identifier` es metadata Windows: ignorada en Git y nunca referenciada/reproducida por la aplicación. No se afirma medición de CoreWebVitals ni bytes de transferencia exactos en todas las redes; se midieron tamaños y se verificó ausencia de solicitud del segundo MP4 antes de acción voluntaria.

Documentación técnica consultada: [MDN video](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video) y [guía autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay). Se usan poster/preload=none/muted/playsInline y manejo de rechazo de play(); no se asume que autoplay esté permitido. Compatibilidad decodificada en Chromium; Safari/Firefox y dispositivos físicos no probados.

Se conservan fuentes locales/OFL, atlas e ilustraciones existentes y atribuciones de ambientación previas. No se descargaron imágenes nuevas ni se inventaron datos del negocio. El contenido documental verificado en la etapa anterior se reutiliza; no se afirma nueva lectura de PDF en este pulido. No se atribuye autor/licencia comercial de los MP4 sin información del usuario. Datos/recibos de tarjeta son exclusivamente ficticios; no se recopila información financiera real.

## Registro histórico de recursos hasta 0.7.0

Las restricciones/dimensiones siguientes describen sus etapas; prevalece la actualización anterior para archivos actuales y video.

# Recursos y referencias · actualización 0.7.0

## Recursos utilizados en esta etapa

Se releyeron los tres PDF disponibles del usuario: informe (52 páginas), sílabo (7) y avance3 (4). Se extrajo texto para localizar datos y se inspeccionó visualmente la captura de Contacto de la página PDF44 del informe; el Anexo A en página52 registra inicio de actividad **08/07/2011**, usado como único hito fechado de Nosotros. Dirección: **UPIS Mercado Mayorista, Zn. B, Mz. D, Lt. 6**; teléfono **+51 938 572 212**. No se verificó externamente información comercial actual ni se inventaron propietario, horario, premios o testimonios. Las indicaciones de los PDF son contexto académico; el alcance lo define la petición del usuario.

Foto real preexistente `public/images/negocio-rosita.jpg` (1025×260), logo y atlas conservados. No se incorporaron fotografías externas nuevas. La foto limita nitidez de encuadres grandes; 18 fotos de producto tienen 300×300 píxeles efectivos; seis artículos siguen con SVG genéricos identificados. Fuentes WOFF2/OFL locales sin cambios. Las cinco fotografías ambientales previas de Pexels siguen identificadas como ambientación, no instalaciones o existencias Rosita.

El administrador puede aportar JPG/PNG/WebP locales mediante ImagePicker. Los archivos permanecen solo en su IndexedDB; no se envían a un servidor. El administrador debe disponer de derechos para los archivos que elija. Las imágenes geométricas con texto ROSITA DEMO generadas por los scripts son **fixtures de prueba**, no fotos del negocio/productos ni recursos del catálogo inicial. No se descargaron imágenes para llenar nuevas categorías.

Sin bibliotecas, servicios o fuentes nuevos. Documentación técnica oficial consultada para conservar refinamientos Zod y esperar la confirmación completa de IndexedDB:

- [Zod safeExtend](https://zod.dev/api?id=safeextend).
- [IndexedDB: complete de la transacción](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction/complete_event).
- [Uso de IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB).

Herramientas de prueba Playwright/Chromium y extracción PDF viven en `/tmp`, fuera de dependencias frontend. No se modificó ni publicó Framer/Figma. Las referencias comerciales/creativas siguientes pertenecen a etapas anteriores; no se afirma una nueva inspección de esos sitios.

## Registro histórico de recursos (hasta 0.6.0)

Las menciones siguientes a selector exclusivamente local/sin upload describen esas versiones previas y están superadas por el ImagePicker de 0.7.0. Se conservan para atribuciones y trazabilidad.

# Recursos y referencias · 0.4.0

## Rosita

Se leyó directamente el PDF del usuario `INFORME_2_HERRAMIENTAS_PROTOTIPADO (1).docx.pdf` (52 páginas). Capítulo 5 en páginas PDF 32–50: acceso, registro, inicio, nosotros, categorías, seis catálogos, carrito, contacto, seguimiento y administración. Se inspeccionaron visualmente las capturas de inicio/categorías/catálogo y referencias del material. Se conserva negocio, logotipo y seis categorías; no se afirma implementar las 19 pantallas en esta etapa.

`public/images/rosita-logo.png`, `negocio-rosita.jpg` y `productos-rosita-atlas.jpg` reutilizan recursos del prototipo previo disponible en la sesión. La foto del local y el atlas son recursos aportados/preexistentes, no fotografías nuevas. El atlas representa 18 productos; se recorta por CSS manteniendo formato cuadrado. Los seis productos restantes utilizan desde 0.4.0 ilustraciones genéricas identificadas; sus fotografías reales siguen pendientes. La atribución a este material no implica derechos de redistribución comercial.

Dirección y teléfono del pie provienen del informe; no se inventaron redes sociales, reseñas, reputación ni garantías. Nombres, presentaciones, precios y stock se identifican como datos de prueba.

## Tipografía

Dos fuentes variables latinas desde Google Fonts oficial: Manrope 600–800 y DM Sans 400–700. Archivos WOFF2 locales y licencias SIL Open Font License en `public/fonts`. `SOURCES.json` conserva URL exacta de cada recurso y licencia; no hay peticiones de fuentes externas en ejecución. Tamaño conjunto aproximado: 61 KB.

## Referencias comerciales y creativas

- Mercado Libre Perú: https://www.mercadolibre.com.pe/ devolvió 403 tanto al acceso web como al navegador local. No se afirma haber inspeccionado visualmente su sitio actual. Se siguieron los criterios expresos del usuario: búsqueda protagonista, categorías/filtros y comparación de precios, sin copiar marca, amarillo ni servicios.
- Daniel Spatzek: https://www.danielspatzek.com/home/ accesible; se inspeccionó en navegador. Se adaptó el uso de tipografía expresiva, fotografía y movimiento breve a un comercio con controles permanentes; no se copió su composición ni introducción.
- Framer demo-log no se modificó ni publicó. Esta etapa trabaja exclusivamente en el repositorio local.

Se leyó el sílabo HERRAMIENTASDEPROTOTIPADO_undefined.pdf (siete páginas; unidades en páginas 1–2 y cronograma 4–6). La evidencia del sílabo no se reinterpreta como autorización para crear autenticación real, pagos reales o backend. La relación académica se limita a los ejemplos realmente implementados, documentados en DESIGN-SYSTEM.md y VERIFICACION.md.

## Referencias técnicas consultadas en 0.3.0

No se añadieron fotos, fuentes, servicios ni bibliotecas. Las zonas/tarifas/tiempos de `src/data/delivery.ts` son inventados exclusivamente para demostración y no describen cobertura real.

- React useReducer: https://react.dev/reference/react/useReducer — reducer puro; fecha/UUID llegan en la acción, sin efectos dentro de la transacción.
- Web Crypto PBKDF2: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits y https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey — verificador local de contraseña ficticia. No se interpreta como seguridad de producción.
- Vite 8 build: https://vite.dev/config/build-options.html y Rolldown https://rolldown.rs/reference/OutputOptions.codeSplitting — grupo separado para Zod, evitando incrementar el límite de advertencia artificialmente. La separación se comprueba también en build local.
- Compatibilidad Node verificada directamente en package.json de Vite 8.3.5, ESLint 10.13.0, plugin React 6.1.2, typescript-eslint 8.72.1 y shadcn 4.23.0 instalados. No se mezclan instrucciones de Vite/Rollup antiguos.

## Recursos 0.4.0

Se incorporaron seis SVG originales en public/images/illustrations: cookies, measure, cable, ball, notebook y paste. Dibujados como código para este proyecto, sin fotografías, marcas gráficas ni archivos externos; no tienen dependencias o licencias de terceros. Se permite reutilizarlos con el código del prototipo. El README de esa carpeta explica su procedencia. Son representaciones genéricas identificadas: no describen el envase exacto de marcas comerciales.

No se obtuvieron fotografías nuevas con presentación/licencia verificadas. Se mantienen las 18 fotos anteriores y las seis fotografías pendientes se representan con ilustraciones cuidadas, sin afirmar que sean fotos. El selector administrativo solo permite recursos locales conocidos o el marcador de fotografía pendiente. No hay subida de archivos, enlaces remotos, blob URLs ni imágenes base64 en localStorage.

No se añadieron fuentes o bibliotecas. Manrope/DM Sans y sus licencias locales permanecen. Framer/Figma no se modificaron; trabajo exclusivo en código local. Los datos de prueba de administración y credenciales ficticias no representan personal o métricas reales.

## Inicio 0.5.0 · recursos nuevos

Se descargaron cinco fotografías ambientales de Pexels. [Pexels License](https://www.pexels.com/license/) permite uso y modificación en sitios web, sin implicar aval del autor o de personas/marcas. Se guardan derivadas WebP locales a 480×538 y 960×1075 (recorte sin deformación), calidad 82. `public/images/home/SOURCES.json` registra URL de página, descarga, autor, licencia y archivos. Son **ambientación de categorías**, no productos ofertados ni instalaciones de Rosita. No se importaron personas, vehículos, vídeos o identidad de las referencias.

| Categoría           | Autor           | Página de origen                                                                                                            |
| ------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Ferretería          | Maria Mileta    | [Close-up of Tools](https://www.pexels.com/photo/close-up-of-tools-5357150/)                                                |
| Tecnología          | Noemí Jiménez   | [Office Desk with Headphones and Keyboard](https://www.pexels.com/photo/office-desk-with-headphones-and-keyboard-30345430/) |
| Juguetería          | Tara Winstead   | [Colorful Wooden Blocks](https://www.pexels.com/photo/colorful-wooden-blocks-on-a-wooden-surface-6693303/)                  |
| Educación y oficina | olia danilevich | [Back to School Flatlay](https://www.pexels.com/photo/back-to-school-flatlay-5088008/)                                      |
| Cuidado personal    | mearlywan       | [Bottles with Cosmetic Products](https://www.pexels.com/photo/bottles-with-cosmetic-products-15569180/)                     |

Consumibles, destacados y promoción usan productos del catálogo. No se consiguió fotografía exacta/licenciada para los seis artículos pendientes: se conservan ilustraciones identificadas; no se reemplazan por otros artículos. La foto real del negocio mantiene la procedencia aportada por el usuario: derivadas WebP a 640 y 1025 px, calidad 88, misma proporción. La fuente original 1025×260 limita la nitidez del encuadre grande; no se inventa resolución adicional. Imágenes ambientales diferidas, srcset/sizes y dimensiones declaradas; solo foto principal con prioridad alta. Total de imágenes nuevas usadas, aproximadamente 600 KB en disco para ambas variantes; cada dispositivo solicita la variante correspondiente.

### Referencias inspeccionadas y propuestas

- [Les Animals / équipe](https://lesanimals.digital/equipe/): abierto en Chromium a 1440 px; se observaron tipografía grande, capas de transición y contenido transformado tras rueda. Cookie overlay presente. El cursor computado fue `auto`; **no se verificó un cursor personalizado ajeno**. El cursor de Rosita y magnetismo son propuesta propia basada en el requisito.
- [Lightship](https://www.lightshiprv.com/): abierto en Chromium; gran superficie visual/vídeo, título grande y navegación superpuesta. Se adapta jerarquía y profundidad a una fotografía de Rosita y controles comerciales. No se afirma haber auditado todas sus secuencias o rendimiento.
- Mercado Libre: referencia de organización comercial solicitada; su restricción 403 de la etapa previa continúa documentada. No se atribuyen observaciones visuales nuevas.

Capturas y auditoría de referencias en `home-verification/references`. No son recursos de la aplicación.

Documentación oficial consultada: [Motion useScroll](https://motion.dev/docs/react-use-scroll), [useSpring](https://motion.dev/docs/react-use-spring), [useAnimate](https://motion.dev/docs/react-use-animate). Se conserva Motion existente, sin añadir GSAP/Lenis/Embla. Para optimizar recursos se usó Pillow 13.0.0 en `/tmp`, exclusivamente herramienta de preparación, sin dependencia de la aplicación ni peticiones externas durante su uso.

## Visor de producto 0.5.1

Sin fotos, recursos externos o dependencias nuevas. Atlas original local 900×1800: 3 columnas y 6 filas, 300×300 píxeles efectivos por artículo. ViewBox **y clipPath** aíslan la celda; conserva la máscara de esquina existente, sin mostrar productos vecinos. No se obtuvo una versión fotográfica de mayor resolución. El tamaño base de fotos se limita a 1.25× su resolución; zoom manual máximo 1.5× de esa disposición. Ampliar no recupera información ni aplica IA. Seis SVG siguen siendo ilustraciones identificadas, no fotografías.

Se verificaron dimensiones y errores con HTMLImageElement además del render; callbacks/listeners se liberan al desmontar. No se descargan imágenes ni se crean data URLs de producto en localStorage. Las imágenes pequeñas se avisan en detalle/visor.

Documentación oficial consultada: [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) para foco y cierre; [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) y [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures) para interacción y cancelación. Radix instalado mantiene allowPinchZoom:true. No se aplicó touch-action:none al documento ni user-scalable=no.
