# Catálogo y checkout: controles, mapa nocturno y teléfono internacional

## Cambios y archivos

- `src/pages/catalog-page.tsx`: chips eliminables por filtro, iconos coherentes en ordenamiento y acciones. Se mantiene la URL como único estado comercial de filtros.
- `src/features/catalogo/catalog-filters.tsx`: estados seleccionados, iconos y acción de limpieza desactivada cuando no hay filtros que quitar.
- `src/styles/catalog-controls.css`: controles con radios proporcionados, bordes suaves, foco visible, áreas táctiles de al menos 44 px, selección y estados hover/disabled. Cristal moderado en la barra de controles. No cambia las tarjetas de producto, el layout, el sticky ni el header/footer.
- `src/features/pedidos/delivery-form.tsx`: usa Dark Night y el campo internacional; integra el buscador de destinos existente sin anidar formularios.
- `src/features/entrega/destination-search.tsx`: modo embebido que conserva la búsqueda manual y su cancelación; Enter busca sin enviar el formulario de compra.
- `src/features/pedidos/international-phone.tsx`: selector accesible de país, bandera y prefijo con búsqueda por nombre, ISO o código. Perú/+51 inicialmente, número separado y selector Celular/Fijo/Otro. Diálogo Radix con Escape y retorno del foco.
- `src/lib/phone.ts`: validación compartida con `libphonenumber-js/max` 1.13.15. Sus metadatos completos consideran longitudes, países y tipos. Los tipos ambiguos fijo/móvil se admiten en ambas opciones; Otro permite los restantes tipos válidos.
- `src/lib/checkout-validation.ts`, `src/app/state/reducer.ts`: validación y normalización E.164 antes de avanzar y al confirmar el pedido, reutilizando la transacción existente.
- `src/types/commerce.ts`, `src/lib/operations-schema.ts`: país y tipo opcionales en Delivery; el esquema de persistencia actual reutiliza estos extras. Los registros antiguos no se reescriben ni requieren esos campos.
- `src/styles/checkout-controls.css`: campo y diálogo responsive, controles y marcadores nocturnos limitados al checkout.
- `public/images/flags`: 245 SVG locales de country-flag-icons 1.6.20, con licencia MIT y procedencia. No se necesita CDN para mostrarlas.

No hay campo de teléfono en el modelo actual de usuario: se conserva en el borrador de entrega y en la instantánea del pedido. Los números históricos nacionales siguen siendo legibles; los nuevos números válidos se almacenan con prefijo internacional. Un borrador incompleto puede conservarse mientras se edita, pero no supera la validación del pedido.

## Mapa

Se conserva Leaflet para selección, marcadores y arrastre. Se reutilizan MapLibre GL y su capa compatible con Leaflet, el estilo local [Dark Night](/home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO/public/maps/dark-night.json), teselas vectoriales y fuentes de OpenFreeMap. No se aplican filtros CSS a teselas claras ni se añaden claves. Los créditos de OpenFreeMap, OpenMapTiles y OpenStreetMap siguen visibles. Si el estilo falla, el componente existente conserva el mapa raster de respaldo y los puntos/ruta seleccionados.

La búsqueda usa Photon manualmente, con caché, límite de peticiones y cancelación existentes; las rutas siguen usando OSRM y la alternativa vial verificada Rosita→UTP. La cobertura de demostración de Arequipa no se amplía por el hecho de admitir teléfonos internacionales.

Fuentes oficiales consultadas: [OpenFreeMap y Leaflet](https://openfreemap.org/quick_start/), [atribución de OpenStreetMap](https://www.openstreetmap.org/copyright), [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js), [country-flag-icons](https://github.com/catamphetamine/country-flag-icons). Las licencias del mapa y banderas permanecen en sus carpetas públicas.

## Verificación

- `npm run check`: TypeScript, ESLint, contraste y build. Persisten las advertencias de tamaño de Three y MapLibre.
- `npm run test:international-phone`: móvil peruano, fijo peruano, fijo británico, móvil español, número de EEUU de tipo ambiguo, rechazo de incompletos y tipos incompatibles; normalización del reducer, pedido y recarga; registros históricos intactos y banderas locales disponibles.
- `npm run test:operations` y `npm run test:order-flow`: correctos, incluidas transacciones, inventario, precios, migración histórica, idempotencia y estados del pedido.
- `verify.mjs`: Chrome real, filtros combinados, eliminación individual, limpieza, búsqueda, ordenamiento, subcategorías y panel móvil. Tamaños 1440, 1024, 768, 390 y 320 px, sin desbordamiento horizontal.
- `verify-selector.mjs`: combinación positiva de precio máximo y disponibilidad, orden ascendente, rango mediante Home/End, pegado de un número internacional y conservación de los dígitos al cambiar de país. Se comprueba el diálogo ya terminado de animar, con fondo blanco opaco y foco accesible. Resultados en [selector-results.json](selector-results.json).
- Checkout con mapa vectorial nocturno real, búsqueda real de una universidad en Arequipa, selección de resultado, clic y arrastre del marcador, confirmación de ruta y finalización de compra.
- Se prueban +51 móvil y fijo, +34 móvil y +44 fijo; errores discretos, selección por país/código, Escape/foco, recarga del borrador y persistencia E.164 del pedido confirmado.
- Se fuerza un fallo del estilo nocturno y se comprueba el respaldo conservando destino y teléfono. El precio unitario, el descuento de una sola unidad y el resto del inventario se contrastan al confirmar.

El catálogo actual muestra todos los resultados; no tenía paginación, filtro de precio mínimo ni grupos colapsables. Se conservan ese flujo y el control de precio máximo, sin añadir una segunda lógica. La validación telefónica verifica el plan de numeración, no la titularidad ni que una línea esté activa. Se necesita conexión para geocodificación, rutas y teselas; no se verificó Safari ni un teléfono físico.

Resultados en [results.json](results.json). Capturas: [controles y filtros](catalog-combined.png), [subcategorías](subcategory.png), [mapa nocturno](checkout-night-map.png), [selector de países](phone-country-selector.png), [checkout móvil](checkout-390.png) y [pedido confirmado](confirmed-order.png).
