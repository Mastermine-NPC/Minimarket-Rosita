# Home: evolución del sistema acuático

Se mantiene el compositor inicial de los dos vídeos y su frontera orgánica. El mismo shader ahora sirve a los diez vídeos del Home, las imágenes de categorías y productos y los fondos de sus once secciones. No se rasteriza el texto ni los controles: permanecen como HTML nítido, con sus enlaces, estilos y eventos originales.

## Implementación

- `liquid-shaders.ts`: ruido procedural y refracción UV permanente en toda la imagen. El campo acuático depende del tiempo, nunca del cursor. La frontera original conserva sus ondas y mezcla estrecha; luces suaves acompañan las superficies decorativas.
- `liquid-home-engine.ts`: un solo contexto WebGL y un solo RAF, compartidos por todos los planos. El resultado de cada plano se copia a un canvas 2D decorativo. Solo se dibujan planos visibles; se omiten variantes ocultas, escenas completamente cubiertas e imágenes fuera de pantalla. Dos texturas se reutilizan entre planos.
- El mouse aporta una proyección de perspectiva pequeña y parallax. Suavizado de 220 ms, regreso al centro tras 650 ms de inactividad o al salir del Home. No genera perturbaciones ni controla la animación del agua.
- GSAP conserva la secuencia horizontal y su dirección, pero su revelado usa un polígono orgánico de 25 puntos, animado también al detener el scroll a mitad de transición. Los cambios de variante usan el mismo revelado y mantienen ambos nodos de vídeo.
- Los límites verticales comparten la máscara orgánica continua. Las imágenes de producto conservan encuadre contain y las celdas del atlas se extraen sin cambiar los datos de catálogo. La máscara editorial del atlas y las etiquetas permanecen visibles.
- El fondo WebGL editorial anterior cede el renderizado al motor acuático únicamente en Inicio; su cursor conserva el comportamiento previo. En las demás rutas mantiene su implementación.

No se agregan dependencias. No hay cambios de rutas, textos, secciones, lógica comercial ni fuentes de vídeo. El motor no llama a `play`, `pause` ni asigna `currentTime`: conserva la política de reproducción de cada `AmbientVideo`.

## Rendimiento y alternativas

Objetivo de aproximadamente 25 FPS en escritorio y 15 FPS en táctil, con menor refracción en táctil. DPR máximo 1.25 en escritorio y 0.85 en táctil; máximo 2048 píxeles por dimensión. Son límites de actualización, no una garantía de rendimiento en cualquier dispositivo.

Se suspende el RAF con la pestaña oculta y tras pintar el estado estático de movimiento reducido. Al desmontar se liberan texturas, programa, shaders, buffer y contexto, se desconectan observadores y listeners y se retiran los canvases añadidos. Los errores de una imagen recuperan su original sin desactivar los otros planos.

Sin WebGL o al perder el contexto reaparecen los elementos originales y se conservan las máscaras orgánicas. Con movimiento reducido el borde queda estático, no se dibujan los planos animados y se respeta la política existente de póster de `AmbientVideo`. Ahorro de datos y memoria de dispositivo reducida evitan el compositor.

## Validación

`npm run check`: TypeScript, ESLint, contraste y compilación. Persisten las advertencias existentes de tamaño de Three y MapLibre.

`verify.mjs`, Chrome real con SwiftShader:

- Diez nodos de vídeo conservados durante el recorrido; ocho películas de las cinco escenas y los dos vídeos iniciales.
- Cada selector de película, reproducción activa y los cuatro cambios horizontales. La máscara continúa evolucionando sin scroll ni mouse.
- Cuatro secciones sin vídeo: productos, categorías, entrega y cierre. Los buffers de sus fondos cambian sin interacción.
- Perspectiva al mover el cursor y retorno al centro con el cursor quieto. Cero asignaciones a `currentTime`.
- Carrusel de productos operativo, enlaces y salida/regreso a Inicio mediante React Router; contexto anterior liberado y solo un contexto activo al regresar.
- Escritorio 1440×900, tablet táctil 768×1024 y móvil táctil 390×844 sin desbordamiento horizontal.
- Movimiento reducido inicial y cambiado en ejecución, pérdida deliberada de contexto y WebGL desactivado.
- Sin errores JavaScript ni errores WebGL durante el recorrido.

Resultados: [results.json](results.json). Capturas: [frontera inicial](desktop-seam.png), [transición horizontal](horizontal-transition-0.png), [productos](home-featured-section.png), [categorías](home-category-section.png), [móvil](touch-390.png) y [sin WebGL](no-webgl.png).

La entrada táctil se emuló en Chrome; no se midió el rendimiento en un teléfono físico. Esta verificación sustituye a la del compositor inicial de `docs/liquid-video-verification`, cuya captura directa de contexto ya no corresponde a la arquitectura compartida.
