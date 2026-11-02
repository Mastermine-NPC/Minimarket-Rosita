# Catálogo fluido

## Causa y corrección

El catálogo heredaba un límite de 1280 px. La columna lateral medía 210 px, con 24 px de padding en el aside y otros 24 px en sus filtros: quedaban solo 114 px útiles. La cuadrícula imponía tres columnas en escritorio y dos en teléfonos/tablets; además, cada segunda tarjeta de un grupo de tres se desplazaba 36 px hacia abajo.

Se conservaron los componentes, datos y controles existentes. Solo se cambió CSS:

- El catálogo aprovecha el viewport con márgenes simétricos fluidos de 16–48 px. Otros contenedores mantienen su ancho anterior.
- Sidebar de 280–320 px y una sola capa de padding: 232–272 px útiles para controles.
- Resultados en el espacio restante, con `auto-fill` y mínimo de tarjeta de 220 px (o el espacio disponible si es menor). Las pistas vacías evitan estirar una tarjeta aislada en búsquedas.
- Separaciones fluidas y filas alineadas, eliminando el desplazamiento basado en grupos de tres.
- Toolbar flexible, controles que pueden reorganizarse y selectores que respetan su contenedor.
- Filtros desplegables por debajo de 1024 px, conservando el breakpoint funcional existente.

La cuadrícula depende del ancho de su contenedor, no de una lista de resoluciones. La aritmética es: ancho de catálogo menos sidebar y separación = ancho de resultados; CSS reparte las pistas que caben en ese espacio.

## Mediciones en Chrome

Se redimensionó la misma ventana entre 23 tamaños, incluidos anchos intermedios y los límites 485/486/487 y 1023/1024 px. No se detectó desbordamiento horizontal.

| Viewport | Columnas antes → después | Tarjeta después | Sidebar después |
| --- | --- | --- | --- |
| 390 px | 2 → 1 | 358 px | Desplegable |
| 600 px | 2 → 2 | 277 px | Desplegable |
| 768 px | 2 → 3 | 236 px | Desplegable |
| 1024 px | 3 → 2 | 334 px | 280 px |
| 1440 px | 3 → 4 | 253 px | 288 px |
| 1920 px | 3 → 6 | 228 px | 320 px |
| 2560 px | 3 → 8 | 243 px | 320 px |
| 3840 px | 3 → 13 | 238 px | 320 px |

En una pantalla de altura suficiente, los filtros completos ocupan unos 689 px sin scrollbar interno. En alturas menores, `overflow-y:auto` permite acceder a todos los controles.

## Comprobaciones

- `npm run check` pasó: TypeScript, ESLint, contraste y build. Sigue el aviso existente sobre el tamaño del chunk 3D.
- `verify.mjs`: redimensionado, columnas, proporciones, ancho útil de filtros, ausencia de overflow y panel de navegación cerrado.
- Se repitió `../sticky-filter-verification/verify.mjs` con el CSS final: inicio, primeros productos, mitad, final y footer; alturas 1000/720/480 px y viewport 1024 × 640. El sidebar respeta la altura medida del header abierto/cerrado, se detiene antes del footer y permite scroll interno sin desplazar la página. También se verificó el drawer móvil.
- `interactions.mjs`: filtros y ordenamiento conservan scroll sin recarga; subcategorías y controles accesibles; drawer operativo a 320 px; búsqueda de Nivea sin estirar su tarjeta. Se comprobó el fondo blanco translúcido, blur y color original del nombre.
- Sin errores JavaScript en las comprobaciones.

## Revisión visual

Se revisaron las capturas de móvil, tablet, laptop, Full HD, QHD y 4K, además del drawer a 320 px, filtros de categoría, búsqueda con un resultado y límite del footer. Las tres correcciones principales son visibles: controles legibles, uso del ancho disponible y filas uniformes. Se conservan las fotografías, tipografías, colores, superficies blancas de cristal y los 75 productos existentes. No se sorteó una nueva dirección visual: esta es una corrección de distribución dentro de la identidad actual.

El inspector general de la guía frontend se ejecutó a 1440/768/390 px y sus capturas también se revisaron. Su informe no es un pase global: marca dos incidencias de la interfaz existente (textos auxiliares de 10 px y detección de «Rosita.» cubierto durante su recorrido automatizado) y cuatro advertencias sobre decisiones visuales anteriores: etiqueta superior, color del footer, hero antes de los productos y tamaño del título. No se alteraron esas decisiones porque esta tarea exige conservar tipografías, colores, header y footer. Las comprobaciones específicas del layout y del límite real del footer sí pasaron.

Resultados, mediciones y capturas: `before/`, `after/`, `sticky/`, `interactions/` e `inspector/`. Los scripts admiten las variables de entorno `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXPECT_MODULE`, `CHROME_PATH` y `VERIFICATION_OUT` para utilizar el runtime disponible.
