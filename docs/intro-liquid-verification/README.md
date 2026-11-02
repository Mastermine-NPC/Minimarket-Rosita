# Ajuste del póster y texto introductorio

El compositor de los dos fondos iniciales selecciona ahora el `<img>` existente de cada vídeo mientras no haya pintado un fotograma. El póster introductorio recibe el mismo shader, tiempo, refracción y encuadre que el vídeo. Cuando este está listo se cambia únicamente la textura de entrada en el siguiente dibujo. No se agregan canvases, contextos ni shaders, y no se modifica la reproducción.

El título «Lo cotidiano. Extraordinario.» y su columna de texto comparten la perspectiva del motor mediante propiedades CSS individuales `rotate` y `translate`. Estas se componen con la animación de entrada existente, sin reemplazar su `transform`. Inclinación máxima aproximada de 0.25°, desplazamientos de hasta 2 px y 1.5 px, y menor parallax en la columna del párrafo. El regreso al centro conserva el suavizado y la espera del motor actual. El agua continúa moviéndose independientemente del mouse.

No se cambian textos, tipografías, colores, tamaños, distribución, rutas, fuentes de vídeo ni transiciones. El texto sigue siendo HTML, sin filtros ni desplazamiento UV de las letras. La perspectiva se aplica solo con mouse y sin preferencia de movimiento reducido.

## Comprobación

- `npm run check`: TypeScript, ESLint, contraste y compilación correctos. Solo permanecen las advertencias anteriores de tamaño de paquetes.
- `verify.mjs`: Chrome con todos los MP4 retenidos para comprobar la carga inicial. Se verifica que el shader recibe el póster y continúa animándose antes de que haya datos del vídeo.
- Tras liberar las solicitudes se comprueba que recibe el vídeo, mantiene el mismo canvas y contexto y no vuelve al modo alternativo ni oculta el canvas durante el cambio.
- Un solo contexto WebGL, cero asignaciones a `currentTime`, reproducción posterior activa.
- El texto conserva exactamente contenido, fuente, tamaño y color. En la prueba el desplazamiento observado del título fue inferior a 1 px y vuelve a su posición neutral con el cursor quieto.
- Regresión global: los diez vídeos, cinco escenas, cuatro transiciones horizontales, secciones sin vídeo y carrusel siguen funcionando ([registro](regression.txt)).
- Movimiento reducido desactiva la perspectiva. Móvil táctil 390×844 con vídeo fallido mantiene el póster acuático, sin desbordamiento horizontal.

Resultados detallados en [results.json](results.json). Capturas: [póster durante la carga](poster-loading.png), [perspectiva del texto](poster-perspective.png), [vídeo reproduciéndose](video-playing.png) y [póster en móvil](mobile-poster.png).

La prueba usa Chrome y entrada táctil emulada; no constituye una medición en un teléfono físico.
