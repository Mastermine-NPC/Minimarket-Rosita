# Dark Night — mapa de seguimiento

## Inspección inicial

| Elemento | Implementación encontrada |
| --- | --- |
| Librería | Leaflet 1.9.4 |
| Fondo | Teselas PNG raster de `tile.openstreetmap.org` |
| Capas | Fondo raster, ruta y progreso SVG de Leaflet, marcadores `DivIcon` |
| Rutas | OSRM / FOSSGIS, geometría guardada o calculada por el servicio existente |
| Geocodificación | Photon, configurado en `public/map-services.json` |
| Simulación | Reloj de 10 000 ms, movimiento directo del marcador de Leaflet |

No se sustituyó Leaflet. Ahora únicamente el fondo del seguimiento se dibuja con MapLibre GL JS 6.16.0 y su adaptador Leaflet 0.1.4. Leaflet conserva el encuadre, zoom, clic, arrastre, rutas, marcadores y vehículo. El checkout continúa usando el mapa raster original y no carga el renderizador vectorial.

## Tema vectorial propio

`public/maps/dark-night.json` contiene un estilo local con capas independientes, sin reutilizar una imagen oscurecida ni aplicar filtros CSS:

- Fondo marino `#0b1422`.
- Calles principales gris azulado; calles secundarias más oscuras y vías de servicio discretas.
- Edificios poco contrastados con contorno tenue, visibles al acercarse.
- Parques y zonas naturales verdes desaturados.
- Agua azul profundo, límites y ferrocarriles sutiles.
- Etiquetas gris claro con halo marino; fuentes Noto Sans del proveedor.

Las teselas son vectoriales, con esquema OpenMapTiles, servidas por `https://tiles.openfreemap.org/planet`. Las fuentes usan `https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf`. El estilo no necesita sprites, claves API ni secretos. El endpoint del estilo se puede cambiar en `public/map-services.json` mediante `trackingStyleUrl`.

La ruta completa es cian `#37d3dc`, de 6 px, con contorno marino para seguir siendo visible sobre el respaldo claro. El tramo recorrido usa `#66f0e5`. La tienda es menta, el destino rosa desaturado y el vehículo claro con borde turquesa. Zoom, tooltips y barra de progreso comparten la paleta. Las superficies del resto del módulo mantienen sus colores anteriores.

## Fuentes, permisos y licencias

Se consultaron las fuentes oficiales:

- [OpenFreeMap: características y uso comercial](https://openfreemap.org/): instancia pública sin registro ni API keys, uso comercial permitido.
- [Integración oficial con Leaflet y configuración del worker en Vite](https://openfreemap.org/quick_start/).
- [Adaptador MapLibre GL Leaflet](https://github.com/maplibre/maplibre-gl-leaflet), licencia ISC.
- [Copyright y licencia de datos OpenStreetMap](https://www.openstreetmap.org/copyright), ODbL.

La atribución visible del fondo vectorial incluye OpenFreeMap, OpenMapTiles y OpenStreetMap. Al activar el respaldo se conserva el crédito de OpenStreetMap. No se ocultan los créditos en móviles. Las licencias BSD-3-Clause e ISC se distribuyen también en `public/maps/THIRD-PARTY-NOTICES.txt`.

Se fijó `@mapbox/jsonlint-lines-primitives` a 2.0.2 mediante `overrides` para mantener la compatibilidad con Node 20 del proyecto; su actualización 2.0.3 exige Node 22. `npm audit --omit=dev` no reportó vulnerabilidades de producción.

## Respaldo y ciclo de vida

El renderizador se carga en un chunk independiente solo al abrir el mapa nocturno. El worker se sirve desde los assets del proyecto. Si no hay WebGL2, falla el módulo, la configuración no llega a tiempo, falla una fuente vectorial o se pierde el contexto GL, el fondo cambia automáticamente a las teselas raster originales de OpenStreetMap. Se informa con un mensaje breve; el respaldo conserva sus colores reales, sin filtros que imiten un tema vectorial.

Solo se sustituye la capa de fondo: no se desmonta el mapa Leaflet, no se reinicia la animación, no se recalcula la ruta ni se cambia el destino. Los eventos, temporizadores, worker y capa vectorial se liberan al desmontar. Hay límites de espera de arranque y carga para evitar un fondo vacío indefinido.

## Verificación final

- `npm run check` aprobado: TypeScript, ESLint, contraste y build.
- Estilo validado con el validador oficial de MapLibre: sin errores.
- Chrome real, viewport de 1920, 1440, 1024, 768, 390 y 320 px. Sin overflow; atribuciones legibles y visibles.
- Teselas y fuentes reales de OpenFreeMap recibidas. Fondo exclusivamente vectorial mientras está activo Dark Night; sin teselas raster ni filtros en el canvas.
- Zoom detallado revisado visualmente: edificios, calles y etiquetas estilizados por separado.
- Clic y arrastre sobre el mapa vectorial verificados: el canvas no intercepta las interacciones de Leaflet.
- Inicio, pausa, reanudación y reinicio aprobados. Recorrido completo medido desde el clic: **10 010,6 ms**, dentro del refresco de un frame respecto al plazo interno de 10 000 ms. El vehículo coincide con el marcador de llegada al completar.
- Pérdida de WebGL durante la reproducción: respaldo cargado, mismo nodo de mapa y progreso conservado.
- Dominio del proveedor bloqueado al abrir la ruta: respaldo OpenStreetMap cargado con atribución.
- Chrome iniciado sin WebGL: respaldo funcional en móvil.
- Salida de seguimiento hacia catálogo sin errores de desmontaje.
- Comparación de pedidos, inventario y movimientos antes/después: idénticos. El mapa del checkout y los datos guardados del destino no cambian. Sin errores JavaScript.

La validación utiliza un pedido delivery creado por el checkout existente en un navegador aislado, sin fabricar registros para el enlace de otro navegador. No se modificaron los servicios de rutas/geocodificación ni el reloj de simulación.

## Revisión visual

Se mantuvo la composición del módulo y se aplicó la dirección Dark Night solicitada, sin sortear un rediseño general. Se revisaron los seis anchos, el zoom de detalle, la animación, el estado completado y los respaldos. Se reforzó el brillo de la ruta completa tras la primera revisión para separarla mejor de las calles; la progresión se distingue con un cian más claro. Las atribuciones se envuelven en pantallas pequeñas en vez de recortarse.

Resultados y capturas: `screenshots/`. `verify.mjs` admite las variables `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXPECT_MODULE`, `CHROME_PATH` y `VERIFICATION_OUT`.
