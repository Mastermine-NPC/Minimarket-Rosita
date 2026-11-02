# Corrección global · Rosita

Se reemplazó la composición anterior de video en dos columnas por fondos audiovisuales completos, una secuencia fijada y movimiento compartido por las rutas públicas. Se mantienen React, Vite, Motion, Design System y la lógica comercial existente.

## Background 2 comprobado

Archivo real: `public/images/video/Arequipa-backgraound-02.mp4`. La inspección de fotogramas confirma la Plaza de Armas de Arequipa después de una introducción negra con la firma del video. Se conserva el original; la copia web empieza en el segundo 5 y dura 22 segundos: H.264, 1280 de ancho, 24 fps, sin audio, CRF 28 y faststart. El hero usa `/images/video/cinematic/Arequipa-backgraound-02.mp4` y su poster extraído del mismo recurso. Ver `background-2-sheet.jpg`.

## Lo implementado

- Cinco escenas de Home con video absoluto a tamaño completo, `object-fit: cover` y texto superpuesto. Sin ventanas, tarjetas multimedia ni captions que encapsulen el video.
- GSAP + ScrollTrigger: escenario fijado en escritorio, máscaras `clip-path`, entrada y salida horizontal, escala, perspectiva `rotationY`, texto por palabras y secuencia ligada al progreso del scroll. El escenario se libera al terminar. Navegación directa a cada escena.
- En móvil, tablet y movimiento reducido: escenas en flujo normal, sin fijación que bloquee la navegación. El contenido sigue siendo accesible.
- Lenis en escritorio sincronizado con ScrollTrigger por el ticker de GSAP; se destruye al cambiar de ruta, tamaño o preferencia de movimiento. Respeta scroll nativo, formularios, diálogos, mapas y carrusel. El scroll táctil conserva el comportamiento nativo.
- Transición global de rutas: salida de la tipografía; cierre de máscara; cambio de ruta bajo la máscara; apertura al estar listo el contenido. Se incluyen Atrás/Adelante. Query params y hashes en la misma página no reinician formularios ni reproducen la transición completa. La cabecera pública mantiene continuidad.
- Catálogo, seis categorías, Nosotros, Contacto y Ayuda tienen aperturas audiovisuales con tipografía por palabras y cámara ligada al scroll. El contenido comercial y los formularios se leen en sus superficies existentes.
- Detalle de producto, carrito, cuenta, checkout, pedidos, confirmación, seguimiento, acceso y registro reciben movimiento compartido. Los títulos comerciales que cambian por búsqueda o estado permanecen bajo control de React; la animación no modifica sus textos ni nombres accesibles.
- Acceso y registro integran video en el fondo de su zona editorial, separado de los campos.
- Foco de encabezados con `preventScroll`, conservando el foco accesible sin saltar por encima de los nuevos banners.
- Administración y caja conservan su interfaz de trabajo y no reciben fondos de video ni la secuencia de scroll de Home.

Se eliminaron todos los controles visuales de reproducción y pausa del componente ambiental. No hay botones «Pausar video», tampoco controles nativos. Se mantiene autoplay silencioso, loop, fuente diferida por visibilidad, pausa fuera de pantalla/documento, máximo un video ambiental reproduciéndose y posters ante error, autoplay bloqueado, Save-Data, 2G, recursos limitados o movimiento reducido.

GSAP 3.15.0 y Lenis 1.3.27 son las dos dependencias añadidas, con responsabilidades distintas. Motion sigue resolviendo las interacciones existentes. No se añadió Three.js ni Howler: esta secuencia usa perspectiva CSS y videos silenciosos, sin una escena WebGL o audio que justifique esos motores. No hay archivos `.riv`; no se añadieron reproductores vacíos ni un runtime Rive sin un recurso adecuado.

## Material y referencia

Se volvió a observar [Unseen Projects](https://unseen.co/projects/) en Chrome, antes y después de scroll. La referencia usa composición espacial, superficies con perspectiva y continuidad de movimiento; aquí se adaptan esas técnicas al catálogo de Rosita, sin copiar su identidad ni contenido. También se consultaron [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) y la [integración oficial de Lenis](https://github.com/darkroomengineering/lenis).

Todos los medios visibles provienen del proyecto. Se usan Background 2, introducción de compra, Coca-Cola, Inka Kola, Oreo, Lay’s, Nivea, Faber-Castell, Artesco, ferretería y accesorios. Se prepararon copias web adicionales de `oreo-coca-cola-video-cinematografic` y `audio-watch-bag-video-cinematografic`. No se sustituyeron las fotos reales de productos. Los clips aportados no incluyen metadatos completos de autoría/licencia; se conserva su contenido y no se atribuyen como producciones propias de Rosita.

Dirección mantenida: The pinned poster, seed 615746338, ahora aplicada como escenario completo. No hubo nuevos sorteos. Idea: los planes cotidianos de Rosita se convierten en una secuencia audiovisual que se recorre desde Arequipa hasta el catálogo. Interacción principal: recorrer escenas, elegir una selección y completar una compra de demostración.

## Validación

- `npm run check`: TypeScript, ESLint, contraste de tokens y build de producción.
- `npm run build`: ejecutado por el script `check` y nuevamente en la verificación final.
- `verify.mjs`: 24 rutas públicas a 1440, 768 y 390 px; sin desbordamiento ni controles visuales de video; Background 2 presente; máximo un video activo; pinning solo en escritorio; transición y Atrás; movimiento reducido sin fuentes automáticas ni escenas inaccesibles.
- `purchase.mjs`: producto, carrito, registro, recojo, efectivo, revisión, confirmación, seguimiento, recarga y validación del contacto a los tres tamaños. Sin errores JavaScript.
- Prueba adicional: rueda real recorriendo las cinco escenas y liberación al terminar; búsqueda de Coca después de navegar al catálogo. Capturas y grabación del movimiento en navegador.

Para repetir los verificadores, usar Playwright externo con `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXPECT_MODULE`, `CHROME_PATH`, `BASE_URL` y `VERIFICATION_OUT`. No se añadió Playwright a la aplicación. Las pruebas antiguas de `docs/home-verification/regression-customer.mjs` esperan una versión anterior de entrega y una cuenta que ahora ya existe en la semilla; no son la evidencia de esta corrección.

El inspector editorial conserva excepciones explícitas para las convenciones heredadas del Design System (bordes, tamaños compactos y metadatos), el contraste sobre video y la oclusión normal por la cabecera sticky. Las advertencias de tipografía y carrusel corresponden a componentes comerciales conservados; texto sobre video y fijación son parte del encargo explícito.

## Revisión visual

ROUND 1
Seen in one second: ciudad y productos como escenarios completos, con acciones comerciales legibles.
Idea (one sentence): Rosita convierte planes cotidianos en escenas audiovisuales conectadas por el scroll.
Live thing: escenas navegables, selector de marca y compra real del prototipo.
Layout words by section: hero=ciudad / intro=compra / historia=escenario audiovisual / catálogo=interfaz comercial / acceso=editorial y formulario / checkout=superficie de trabajo.
Scores: design 8 · usability 8 · creativity 7.5 · content 8 → overall 7.9 (autoevaluación, no evaluación externa).
Caps applied: no se pretende reproducir la distorsión WebGL específica de Unseen; se adapta la profundidad mediante perspectiva y máscara.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Algunas aperturas aparecían adelantadas por el foco del h1 (`_contacto-390.png`): se conserva el foco y se evita el salto automático.
2. El muestreo que combina scroll nativo y rueda detectó desincronización de Lenis (`desktop-page-01.jpg`): se sincroniza su posición antes de aceptar un nuevo delta de rueda.
3. Las alturas de cabecera cambian según dispositivo y sesión (`_login-768.png`): se mide la cabecera real con ResizeObserver para dimensionar el escenario.

ROUND 2
Seen in one second: video como escena completa y texto editorial superpuesto.
Idea (one sentence): una cámara recorre las selecciones de Rosita y entrega el relevo al catálogo.
Live thing: scroll con rueda, navegación directa entre escenas, selección de clips, búsqueda y compra.
Layout words by section: ciudad / compra / cinco fondos enlazados / catálogo y formularios legibles.
Scores: design 8 · usability 8 · creativity 7.5 · content 8 → overall 7.9 (autoevaluación).
Caps applied: no se declara una reproducción exacta del WebGL de Unseen.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Una captura temprana del cierre desde una escena fijada mostró vacío al transformar su ancestro: la salida ahora anima la tipografía y la máscara, conservando el escenario estable. Ver `screenshots/transition-fixed-1440.png` y equivalentes tablet/móvil.
2. Al pausarse un video de salida podía reaparecer su poster inicial: se conserva el último fotograma pintado durante la pausa, con poster si falla la fuente.
3. La variedad de tratamientos de los clips aportados sigue siendo perceptible: se conservan los originales y se unifican encuadre, contraste, tipografía y continuidad de movimiento.

La verificación de posiciones confirmó la liberación del escenario después de la quinta escena. Las capturas con rueda real se guardan en `screenshots/motion-*.png`; `recorrido.mp4` reúne fotogramas capturados de esa ejecución, como vista previa del movimiento. La advertencia editorial sobre texto fijado sobre imágenes es parte del requisito explícito de texto superpuesto. Los muestreos de texto del inspector no distinguen todas las capas enmascaradas; la prueba directa de rueda confirmó las cinco escenas y su liberación.

Resultado final: `npm run check`, `npm run build`, 72 comprobaciones de rutas, compra completa en tres tamaños y comprobación específica de salida del escenario fijado terminaron correctamente. Se conservaron las limitaciones de la demostración comercial: no hay cobros ni reparto real. Las pruebas finales se ejecutaron con el build estable, después de completar la compilación.
