# Desvanecimiento vertical del hero compartido

## Implementación

`PublicScene` ya separaba película, sombra y contenido. Enmascarar solo `.cinema-scene-shade` haría desaparecer la sombra, pero dejaría el video visible y el corte inferior intacto. Ahora `.public-scene-visual` agrupa cámara y sombra, con una máscara alfa común. `.public-scene-copy` permanece fuera del grupo: títulos, descripción y botón conservan su opacidad y sus interacciones.

La máscara usa `mask-image` y `-webkit-mask-image`, `mask-mode: alpha`, tamaño completo y sin repetición. La superficie permanece opaca hasta el 40%; su alfa disminuye gradualmente en los puntos 55/68/80/90% y llega a cero al 100%. El tramo final se ajustó para conservar contraste cerca del texto y lograr continuidad con el contenido. El gradiente es una máscara de transparencia, no un fondo de color ni una superposición blanca.

La base del hero se vuelve transparente cuando el navegador admite máscaras. Así se revela el fondo real de la página y no una franja oscura del contenedor. En navegadores sin soporte se conserva la presentación anterior. La máscara está fuera de la cámara animada: no se mueve ni deja un borde expuesto al hacer parallax.

Se aplica una sola vez en el componente compartido: catálogo y seis categorías que ya tienen hero, además de Nosotros, Contacto y Ayuda. No se crean heroes nuevos en rutas que no los tenían. Las escenas de Home utilizan otra composición y mantienen su sombra original. Login no usa este hero y tampoco cambia.

## Archivos

- `src/features/cinema/public-scene.tsx`: agrupación de las dos capas visuales, sin cambios de textos, controles ni fuentes audiovisuales.
- `src/styles/cinema-global.css`: wrapper visual y máscara mediante detección de soporte; no cambian alturas, padding ni breakpoints.
- `scripts/verify-hero-fade-browser.mjs`: verificación de navegador y composición alfa real.

Sin nuevas dependencias, timers, canvas o listeners de aplicación. No se modificaron tarjetas, filtros, GLB, navegación ni lógica comercial. Los cambios pendientes de las tareas anteriores se conservaron.

## Verificación

- `npm run check`: TypeScript, ESLint, contraste y build de producción, sin errores. Permanecen las advertencias de tamaño de los chunks existentes.
- ESLint del script nuevo: aprobado.
- Chrome sobre build: catálogo, Comestibles, Ferretería y Cuidado Personal en 1440, 768 y 390 px. Sin overflow horizontal.
- Resto de categorías con hero y Nosotros/Contacto/Ayuda: máscara compartida comprobada.
- Transparencia, prefijo WebKit y modo alpha comprobados. Texto y botón con `mask-image: none` y opacidad 1.
- Borde inferior del catálogo comparado con el primer píxel de la sección siguiente: diferencia máxima permitida de cuatro niveles por canal; comprobación aprobada.
- Prueba técnica temporal con fuente negra sobre fondo blanco: valores muestreados crecen monótonamente desde negro en la parte superior hasta casi blanco al 99%, demostrando composición alfa real. Esa sustitución **solo vive durante la prueba**, se retira inmediatamente y no pertenece al código del producto ni a las capturas de referencia.
- Botón Seguir explorando, scroll y agregar un producto al carrito: aprobados en el contexto de prueba.
- Video real reproduciéndose, máscara estacionaria al hacer parallax y Home/login sin cambios de máscara: aprobados.
- Cero excepciones de página en el recorrido.

No se repitió toda la suite de datos porque no se modificó lógica. Las pruebas se enfocaron en composición, interacción y el build. Emulación Chrome de viewport; no se afirma validación en dispositivos físicos ni en todos los motores de navegador.

## Revisión visual

Se abrió la captura del usuario desde su ruta Windows y se capturó el antes propio. Se revisaron las imágenes finales de catálogo en escritorio, tablet y móvil, y Ferretería en escritorio. Se conservan encuadre superior, jerarquía, colores y tipografía; el cambio está concentrado en la transición inferior. El botón permanece sólido y clicable. No se añadió un panel oscuro independiente ni se degradó el texto.

Al ser un ajuste de una sección existente, se conserva su dirección visual; no se hizo un nuevo sorteo de diseño. La comprobación visual se centró en el hero real y sus píxeles, sin intentar rediseñar tarjetas ni corregir preferencias de estilo global ajenas a la tarea. La parte inferior revela blanco en catálogo porque ese ya es el fondo de la página; en las otras vistas revela su propio fondo existente.

## Evidencia

- [Antes](before.png) y [después en escritorio](catalogo-1440.png).
- [Tablet](catalogo-768.png), [móvil](catalogo-390.png).
- [Comestibles](consumibles-1440.png), [Ferretería](ferreteria-1440.png), [Cuidado Personal móvil](cuidado-personal-390.png).
- [Video en reproducción](catalog-live-video.png), [parallax durante scroll](catalog-scrolled.png).
- [Resultados y muestra alfa](results.json), [log de navegador](browser.txt), [check](check.txt).

El script acepta los mismos parámetros de Playwright/Chrome del entorno: `BASE_URL`, `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXPECT_MODULE`, `CHROME_PATH`, `VERIFICATION_OUT`. No se instaló Playwright como dependencia del proyecto.
