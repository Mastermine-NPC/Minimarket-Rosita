# Categorías: pergamino de cristal líquido

El enlace de cada categoría conserva las clases, imágenes, textos, iconos y destino originales. Se añaden únicamente una superficie decorativa y su contorno SVG. Las seis categorías comparten la misma geometría, con curvas Bézier suaves y asimetrías deliberadas en los laterales y las esquinas; no se genera una forma aleatoria por fotograma.

## Tres planos visuales

1. **Contorno.** Un trazado vectorial irregular dibuja el perímetro, con un segundo trazo translúcido que aporta espesor. Una luz recorre muy lentamente el borde en 42–49 segundos. La silueta permanece estable durante la inclinación.
2. **Cristal.** La superficie usa una máscara SVG `objectBoundingBox`, transparencia en la paleta verde original y desenfoque de fondo real de 16 px, reducido a 8 px en móvil. Reflejos suaves y una sombra discreta acompañan la forma. Sin soporte de desenfoque se conserva una superficie translúcida de sustitución.
3. **Contenido.** Imagen, título, descripción e icono conservan sus diferentes planos de profundidad. La tarjeta completa no lleva `clip-path`, filtros ni opacidad: recortar o desenfocar el padre aplanaría las capas. Solo se recortan el material, el reflejo y la superficie visual de las imágenes.

Se reutilizan el tilt interpolado y el ticker de GSAP existentes. El reflejo sigue las coordenadas actuales del mouse y se recorta con la misma silueta. No se añaden canvases, contextos WebGL, librerías ni listeners. El material permanece estático con movimiento reducido y conserva la respuesta táctil existente.

Los cambios CSS están limitados a `.home-experience .home-category-card` y sus elementos. No se modifican header, footer, fondos globales, tarjetas de productos, datos de categorías ni navegación. Se conserva la cuadrícula responsive; el espacio interior permite que el contorno quede visible alrededor del contenido.

## Validación

- `npm run check`: TypeScript, ESLint, contraste general y compilación. Permanecen las advertencias previas de tamaño de Three y MapLibre.
- `verify.mjs`: recorre las seis tarjetas en escritorio 1440×1000, tablet con mouse 768×1024, tablet táctil 768×1024 y móvil táctil 390×844.
- Comprueba el desenfoque computado de 16/8 px, las máscaras y sus identificadores únicos, trazados Bézier válidos, conservación de `preserve-3d` y ausencia de recorte del padre.
- Conserva las pruebas de tilt en ambos sentidos, cuatro profundidades diferentes, reflejo, retorno neutral, foco, Enter y navegación táctil.
- Verifica dimensiones y estilos estables durante la interacción, mismo contenido y enlaces, ausencia de canvases añadidos y de desbordamiento horizontal.
- Se verifica que el SVG decorativo siga visible en móvil: una regla antigua ocultaba los SVG directos de las categorías. El nuevo contorno declara su propia visibilidad, sin cambiar esa regla para otros componentes.
- Con movimiento reducido, la luz del perímetro y la inclinación quedan desactivadas.

El brillo máximo del reflejo se limita a 16/255 de blanco para proteger las descripciones. Un cálculo conservador con el verde de marca, el máximo de luz del fondo acuático, la máxima opacidad del cristal y el reflejo superpuestos da una relación de contraste aproximada de 4.52:1 para el texto secundario. Es un cálculo de capas, no una medición de cada píxel de la captura.

La captura [before.png](before.png) corresponde a la última verificación del diseño anterior. Resultados en [results.json](results.json). Capturas finales: [escritorio](1440-jugueteria.png), [tablet](768-jugueteria.png), [móvil](touch-390-jugueteria.png) y [movimiento reducido](reduced.png). Las pruebas táctiles usan emulación de Chrome; no se midió rendimiento en un teléfono físico ni se verificó Safari.
