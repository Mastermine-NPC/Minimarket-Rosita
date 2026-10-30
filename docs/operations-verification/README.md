# Evidencia · operaciones 1.0.0 · 30/10/2026

Contextos aislados de Chromium 156.0.8078.4, datos ficticios. No se leyó el almacenamiento personal. [Matriz de resultados](../VERIFICACION.md) y [guiones/procedencia](../OPERACIONES-1.0.0.md).

- `logic.json`: esquema, dinero, duplicados, stock único, turno, migración y ruta real Rosita→UTP.
- `extra.json`: permisos/agentes, fixture histórica v7, producto/precio/stock cambiados, segundo destino real y reset exclusivo.
- `targeted.json`: cambios finales de cierre, progreso sin escrituras redundantes, código duplicado y mensaje de ruta en español.
- `ui.json`: recorridos de compra, delivery/recojo/caja, agentes, CSV y adaptación. Las capturas de seguimiento válidas del propietario son `tracking-real-*` y las finales `mapa-svg-*`.
- `browser-extra.json`: mapa/teclado/arrastre, movimiento reducido, rutas fallidas y respuestas tardías simuladas, teselas fallidas y PDF.
- `final-ui.json`: llegada no entrega, foco de caja/cierre, permiso de cámara denegado simulado, origen/snapshots, cambio de modalidad/aprobación y filtros de reporte sobre build estable.
- `visual-final.json`: SVG en 1440/768/390, rumbo por tramo, toque móvil emulado, vídeo/detector sintéticos con deduplicación y liberación de tracks.
- `report-final.json`, `labels-final.json`: filtros y CSV coherentes, rango inválido, etiquetas españolas en build final.
- `reporte-canales.csv`, `comprobante-demo.pdf`: exportaciones de demostración. Capturas son evidencia, no reemplazan vistas.

Servicio real: OSRM/FOSSGIS consultado para UTP y otro destino. Fallos de red/teselas, respuesta tardía y cámara son escenarios interceptados/sintéticos identificados en los JSON; no hardware físico. No participantes ni métricas de usuarios.

Los guiones base de lógica se conservaron en `scripts/verify-operations.mjs` y `scripts/verify-operations-edges.mjs`. Ejecutados originalmente desde /tmp con el mismo contenido funcional; tras ajustes se ejecutaron solo comprobaciones dirigidas relacionadas. Para repetir deliberadamente: `npm run test:operations` desde la raíz, Node 20.19.4 y red disponible para el segundo destino. Nunca escribe el localStorage personal; genera sus fixtures y resultados. No se repitió la batería completa sin motivo al cerrar.

Vista previa de la compilación: http://127.0.0.1:4176. Evidencia anterior de catálogo/video/zoom permanece en sus carpetas y no se atribuye a una nueva prueba integral de esas funciones. Capturas intermedias de incidencias del guion se guardaron en recovery/operaciones-intermedios, excluidas de Git.
