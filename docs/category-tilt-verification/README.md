# Interacción 3D de las categorías de Inicio

Las clases `.category-card`, `.home-category-card`, `.home-category-jugueteria` y `.home-revealed` pertenecen al mismo enlace generado por el mapa de categorías de `HomePage`. No se añaden tarjetas, wrappers ni canvases. Se conservan contenido, imágenes, enlaces, dimensiones, tipografía, paleta y borde base.

## Implementación

`use-category-tilt.ts` delega los eventos de puntero en el Home y utiliza un único callback del ticker de GSAP. Las coordenadas se normalizan dentro de la tarjeta y se interpolan con una constante de 100 ms. El callback se retira cuando todos los valores se estabilizan y al desmontar el componente.

La inclinación alcanza aproximadamente ±3.2° en Y y ±2.4° en X. Las propiedades individuales `rotate` y `translate` se componen con el `transform` de la animación `.home-revealed`, sin sobrescribirla. El grid aporta perspectiva y la tarjeta conserva el espacio 3D de sus capas.

- Imagen: profundidad de hasta 14 px, parallax propio y acercamiento leve.
- Título: profundidad de 10 px.
- Descripción: profundidad de 5 px.
- Icono: profundidad de 18 px y desplazamiento independiente.
- Luz: pseudoelemento con gradiente radial blanco translúcido y borde luminoso muy tenue, sin eventos de puntero ni cambios a los colores base.

La profundidad de la imagen se integra con los canvases acuáticos ya existentes. El seguimiento global del agua sigue funcionando; la tarjeta compone su propia orientación local para evitar inclinar dos veces su imagen.

Al salir, desplazar la página o perder el foco de la ventana, las capas vuelven al estado neutral. En táctil se utiliza una elevación/realce breve durante la presión y se restablece al soltar o cancelar, sin rotación. Las preferencias de movimiento reducido desactivan el nuevo efecto. Se conservan los enlaces nativos y sus indicadores de foco.

## Verificación

`npm run check`: TypeScript, ESLint, contraste y compilación correctos. Permanecen las advertencias previas de tamaño de los paquetes de Three y MapLibre.

`verify.mjs` recorre cada una de las seis tarjetas reales en:

- Escritorio 1440×1000 y tablet con mouse 768×1024: inclinación en ambos sentidos, iluminación que sigue al cursor, cuatro profundidades distintas y retorno neutral.
- Tablet táctil 768×1024 y móvil táctil 390×844: respuesta a presión/cancelación simuladas, retorno neutral y navegación con toque nativo emulado.
- Movimiento reducido: sin inclinación ni desplazamiento añadidos.

Se comparan antes/después los textos, enlace, ancho, alto, fuente, color, fondo y borde base. Se comprueba que no aparecen canvases adicionales ni desbordamiento horizontal, que el foco y Enter navegan y que los efectos se limpian después de la transición de ruta existente. No se modifican filtros ni datos de categorías.

Resultados en [results.json](results.json). Capturas: [escritorio](1440-jugueteria.png), [tablet](768-jugueteria.png), [móvil táctil](touch-390-jugueteria.png) y [movimiento reducido](reduced.png). La entrada táctil se emula en Chrome; no se mide rendimiento en un dispositivo físico.
