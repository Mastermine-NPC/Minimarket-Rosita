# Estados, demostración y notificaciones de pedidos

## Flujo existente reutilizado

El proyecto ya tenía cuatro estados numéricos, transiciones de una sola etapa, identificadores de operación, historial `statusHistory` y confirmación administrativa:

| Código | Delivery | Recojo |
| --- | --- | --- |
| 0 | Pedido recibido | Pedido recibido |
| 1 | En preparación | En preparación |
| 2 | En camino | Listo para recoger |
| 3 | Entregado | Recogido |

Se conservó este modelo. «Confirmado» forma parte de la confirmación de compra existente y «Listo para despacho» no era un estado independiente. No se añadieron esos ejemplos como estados nuevos: cambiar los códigos habría reinterpretado pedidos guardados y reportes. No hay migración de datos ni un segundo catálogo de estados.

## Estado guardado y demostración

El timeline principal siempre representa `order.status` y los eventos guardados. Diferencia completados, actual y pendientes; muestra fecha y hora solo cuando existe un evento. Los pedidos antiguos sin fecha no reciben fechas inventadas. Se reutiliza también en el detalle administrativo.

En «Estado del pedido», el cliente consulta el historial y puede reproducir el recorrido visual cuando el delivery está En camino. Los controles de avance del cliente se retiraron. `advanceOrder` rechaza clientes, cajeros y administradores inactivos; únicamente un administrador activo puede registrar la siguiente etapa, con la confirmación existente. Se conservan el control de estado esperado y la deduplicación por identificador de operación. La entrega necesita su propia transición administrativa explícita.

«Probar demostración» usa los mismos nombres y etapas en memoria del componente: recibido, preparación y salida se muestran como una secuencia de ejemplo. Después permite iniciar, pausar, reanudar y reiniciar el recorrido de 10 segundos. Al terminar solo se anuncia recorrido completado. El botón «Simular entrega de ejemplo» permite probar el último aviso, claramente marcado como demostración. Ninguna de estas acciones despacha cambios comerciales ni escribe eventos en el pedido.

Los avisos de ejemplo se identifican como «Demostración» y no se agregan al historial persistente ni generan avisos del navegador. Reiniciar el recorrido no vuelve a emitir las transiciones ya mostradas de esa demostración. Reiniciar la demostración completa crea una sesión de ejemplo nueva.

El vehículo y su capa se actualizan por separado del fondo y de la ruta: una transición no desmonta el mapa ni vuelve a encuadrarlo. Se conserva Dark Night, el destino y la geometría vial. Un pedido con entrega registrada muestra el final del recorrido al recargar, sin generar otra notificación de entrega.

## Notificaciones

Se reutiliza Sonner para los toasts. Cada transición registrada tiene un aviso con nombre del estado, mensaje y enlace al pedido. La fuente persistente es el propio `statusHistory`, evitando duplicar eventos o crear otro almacén de estados.

El centro «Notificaciones de tus pedidos» está en seguimiento y en Mis pedidos. Solo incluye pedidos del cliente activo; permite leer un aviso o marcarlos todos como leídos. En `localStorage` se guardan únicamente preferencias, identificadores vistos/leídos y la opción del navegador. El historial comercial permanece en su modelo original.

Los identificadores persistidos impiden repetir avisos al recargar o navegar. Web Locks coordina la reclamación de eventos entre pestañas compatibles; los toasts conservan un identificador estable y los avisos del navegador una etiqueta estable.

Los avisos del navegador están desactivados inicialmente. Solo el botón Habilitar solicita permiso cuando hace falta. Denegación o API no disponible mantienen los avisos locales y el historial. Funcionan mientras la página esté abierta; no se agregó un servicio push, correo, SMS ni mensajería externa. Los avisos de demostración nunca usan esta API.

Referencias de plataforma: [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API), [Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API) y [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).

## Sincronización y límites de la arquitectura

No había backend, WebSockets, SSE ni suscripciones de servidor. Se añadió escucha de `storage` para los pedidos ya conocidos en otras pestañas del mismo origen y navegador. Se valida la estructura del estado y solo se aceptan extensiones de historial hacia delante, con una etapa por evento y autor administrador conocido. Se rechazan cambios de importes, dirección u otros campos inmutables, historial reescrito, saltos y retrocesos.

Una actualización recibida conserva la sesión de la pestaña y no se vuelve a escribir como eco. Las revisiones de cambios locales permiten guardar una acción local aunque una actualización externa llegue en el mismo lote de React. La sesión se conserva por pestaña con `sessionStorage`, manteniendo la compatibilidad con la sesión anterior: iniciar sesión como personal en una pestaña no transforma la cuenta del cliente de otra al recargar.

**Este proyecto sigue siendo una aplicación local de demostración.** Las comprobaciones de rol en el reducer protegen su flujo normal, pero no sustituyen autorización en servidor ni protegen datos frente a quien manipule su propio almacenamiento o JavaScript. Para gestionar pedidos comerciales reales entre dispositivos hace falta un backend autenticado como autoridad de estados. No se presenta el canal local como un servicio de tiempo real remoto.

## Pruebas

- `npm run check`: TypeScript, ESLint, contraste y compilación aprobados. Continúa el aviso de chunks grandes de los renderizadores 3D y vectorial.
- `npm run test:order-flow`: transacción de pedido existente, permisos, administrador activo/inactivo, transiciones secuenciales, operación duplicada y obsoleta, entrega explícita, notificaciones por propietario, historial único y sincronización validada. Snapshot, inventario y movimientos conservados.
- `npm run test:operations`: regresiones existentes de caja, pedidos, inventario, migraciones, rutas y snapshots aprobadas. El caso que antes avanzaba como cliente ahora se realiza como administrador, conforme al nuevo requisito.
- Chrome con un administrador y dos pestañas de cliente, usando un pedido delivery creado mediante el checkout existente y una ruta real Rosita–UTP.
- Demostración completa con cuatro avisos de ejemplo únicos, pausa, reanudación y reinicio: el pedido permanece recibido y su historial conserva únicamente el evento original.
- Transiciones administrativas preparación y En camino reflejadas en ambas pestañas sin desmontar el mapa.
- Recorrido visual desde En camino medido en el navegador: unos **10,015 s** frente al plazo interno de 10 000 ms; el último frame depende del refresco. Al terminar, el pedido sigue En camino.
- Entrega confirmada desde administración: un solo toast de cliente y una sola llamada al constructor de notificación del navegador entre ambas pestañas. El constructor se instrumenta en el navegador aislado para registrar la llamada sin mostrar avisos reales del sistema operativo.
- Cuatro eventos persistidos, fechas del timeline, lectura de avisos y sesión de cliente conservados al recargar; no se reproducen avisos antiguos.
- Ninguna solicitud automática de permisos. Estados concedido con opción explícita, denegado y no disponible comprobados.
- Capturas de 1440, 768, 390 y 320 px. Sin overflow horizontal; el control de permisos se ajusta al ancho de su panel.
- Dirección, pago, importes, líneas, inventario y movimientos idénticos antes/después del recorrido; sin errores JavaScript.

`logic.json`, los logs y `screenshots/results.json` contienen los resultados. `verify.mjs` acepta `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXPECT_MODULE`, `CHROME_PATH` y `VERIFICATION_OUT`.

## Revisión visual

Se mantuvieron la tipografía, colores y mapa nocturno. El timeline guardado y la secuencia local aparecen en áreas distintas; los toasts de ejemplo llevan su prefijo y el centro persistente explica su alcance. Se revisaron estados recibido, En camino, entregado, demo finalizada y los tamaños responsive. Se corrigió el ajuste del botón de permisos en paneles estrechos.

Las capturas de página completa pueden capturar un frame intermedio de WebGL al alterar temporalmente la altura del viewport (`dvh`). Las capturas de viewport `demo-map-viewport.png` e `in-transit.png` muestran el mapa alineado durante el uso normal; no se alteró el mapa para acomodar el capturador.
