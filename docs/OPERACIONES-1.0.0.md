# Entrega, recojo y caja · Rosita 1.0.0

Implementación frontend local, datos ficticios. No backend, GPS, pago real, SUNAT, publicación ni cambios en Framer/Figma.

## Coordenadas y procedencia

| Punto                     | Latitud, longitud                       | Procedencia / precisión                                                                                                                            |
| ------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rosita                    | −16.33112128439101, −71.58692292883559  | Coordenadas exactas facilitadas por el usuario en este chat el 30/10/2026. Dirección: UPIS Mercado Mayorista, Zona B, Manzana D, Lote 6, Arequipa. |
| Pin del campus UTP        | −16.408885688601682, −71.54053906675192 | Iframe del campus Arequipa en [Cómo llegar UTP](https://www.utp.edu.pe/como-llegar), Av. Tacna y Arica 160.                                        |
| Llegada vial sugerida UTP | −16.408537, −71.540952                  | Ajuste OSRM contrastado sobre Avenida Tacna y Arica; aproximadamente 58.6 m del pin oficial. No acredita puerta peatonal.                          |

El [enlace corto facilitado](https://maps.app.goo.gl/TkYdw1jLVTjW6BgL8) se resolvió al lugar «U.P.I.S. Trabajadores Mercado Mayorista», Cerro Colorado, pero no expuso un pin verificable del local. No se usó el centro de su viewport ni una geocodificación genérica. Prevalece la confirmación del usuario. Administración→Origen de tienda permite ajustar por mapa/coordenadas con confirmación; afecta solo pedidos posteriores.

El acceso vial de UTP se contrastó con [datos oficiales OSM del sector](https://api.openstreetmap.org/api/0.6/map?bbox=-71.542,-16.4105,-71.539,-16.4075). El pin de campus sin orientación de llegada ajustaba inicialmente a Angamos. Se solicitó llegada por Tacna y Arica usando rumbo 45±30°. No se certificó una puerta física; el mapa indica llegada vial, no acceso interno del campus.

## Biblioteca, proveedor y condiciones

- [Leaflet 1.9.4](https://leafletjs.com/reference.html) muestra mapa, marcadores y geometría. No calcula rutas.
- Teselas estándar [OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/): atribución visible, carga normal del navegador con caché y Referer, sin descargas masivas, prefetch ni paquetes offline. No se alteraron sus cabeceras.
- Servicio vial [OSRM/FOSSGIS](https://routing.openstreetmap.de/about.html), endpoint público `https://routing.openstreetmap.de/routed-car/route/v1/driving/`, según [API OSRM v1](https://project-osrm.org/docs/v5.24.0/api/). Perfil de automóvil; no se afirma optimización de moto. Solo al confirmar punto, separación mínima de 1.1 s entre solicitudes de la sesión, timeout 12 s, cancelación y descarte de respuestas anteriores. Sin clave ni contratación. Servicio público sin SLA, puede fallar; el proveedor registra consultas. Atribución OSM y enlace Corregir mapa visibles.

La ruta Rosita→UTP consultada el 30/10/2026 contiene **358 coordenadas**, **11 486.9 m**, **1225.4 s** (~20 min de conducción orientativa sin tráfico). Inicio ajustado a calle: lng −71.586809, lat −16.3312, a unos 15 m del origen del usuario. Archivo `src/data/verified-route.json`: geometría y procedencia, no captura estática. Orden lon/lat en servicio y GeoJSON, lat/lng en Leaflet.

Fallback solo si origen y destino están a menos de 5 m de los puntos iniciales Rosita/UTP. Para otro destino o un origen reconfigurado, la caída del servicio impide confirmar delivery y ofrece reintento/recojo. Nunca se dibuja una recta como ruta vial. Las teselas pueden fallar independientemente; los datos textuales y controles siguen disponibles.

Área ficticia: lat −16.52…−16.25, lng −71.72…−71.43. Tarifa de demostración por distancia vial: ≤7 km S/ 4, >7 km S/ 6.50. No cobertura/tarifa del negocio. Las estimaciones comerciales ficticias de preparación/entrega de las zonas anteriores permanecen separadas de los ~20 min viales; no representan tráfico ni reparto en vivo.

## Recorrido del cliente

1. Explora sin acceso obligatorio; agrega productos al carrito. En checkout identifícate como cliente de prueba.
2. Entrega→Delivery: nombre/celular ficticios, «Elegir UTP Tacna y Arica», dirección/referencia y **Confirmar punto y calcular ruta**. Alternativa: clic/arrastre o latitud/longitud + Seleccionar coordenadas y confirmar. Elegir punto no envía una petición en cada movimiento.
3. Revisa coordenadas, recorrido, distancia, duración y tarifa. Paga con efectivo suficiente o los escenarios de tarjeta/Yape/Plin simulados. Revisa y confirma una vez.
4. Seguir pedido: Recibido→En preparación→En camino. Inicia simulación, pausa/reanuda, cambia 1/2/4/8×. A 1× se comprimen los 358 puntos en 120 s, interpolados por distancia; no es duración real. Progreso recorrido/pendiente y orientación del icono se derivan de los tramos.
5. Recarga: progreso guardado, reproducción pausada. Llegada visual no entrega: el control autorizado de siguiente estado confirma Entregado sin otro descuento.

Etiqueta visible: **“Recorrido simulado sobre mapa real. No es ubicación GPS en vivo”**. Movimiento reducido: avances manuales de 10% y animación automática deshabilitada. No se solicita geolocalización.

Recojo: elige Recojo en tienda; nombre/celular, mismo Rosita en mapa, envío cero, sin dirección domiciliaria ni ruta de repartidor. Estados Recibido→En preparación→Listo para recoger→Recogido. Se puede avanzar desde cliente/administración; recoger no crea venta presencial ni consume stock de nuevo.

## Caja y personal

En `/personal`, acceso caja@rosita.test / **CajaDemo!2026**. En `/caja`:

1. Turno y cierre→fondo inicial S/ 100→Abrir turno.
2. Nueva venta→busca Coca-Cola o escribe **0000000000017** en campo de escaneo y Enter. Dos unidades acumulan una línea, S/ 7. El selector Simular lectura prueba el mismo flujo sin escáner. Código desconocido orienta a búsqueda manual.
3. Ajusta cantidad con botones o campo; se rechazan cero, fracciones, negativos y exceso. No hay creación libre de artículo/precio desde caja. Catálogo/inventario son de administración.
4. Efectivo S/ 1: error útil, sin venta. Efectivo S/ 10: vuelto S/ 3. Cobrar venta simulada→identificador, agente, turno, snapshot y recibo **“Demostración — sin validez tributaria”**. Nueva venta vuelve al lector. Una operación descuenta una vez.
5. Otra venta con tarjeta: Completar rechazo/error no registra venta ni salida; Completar aprobación→Simular pago→Cobrar. Cambiar cantidad/importe exige nueva aprobación. Se reutiliza `CardSimulation`, no otro formulario.
6. Turno: efectivo esperado S/ 107 para el ejemplo de efectivo; tarjetas por separado. Contado S/ 106.50→diferencia −S/ 0.50. Confirma cierre; el registro queda inmutable. Historial filtra fechas, pago y, para admin, agente; detalle e impresión.

Otros códigos de demostración: Lay’s 0000000000024, Doritos 0000000000031, set destornilladores 0000000000048. Conservan ceros como texto y checksum EAN-13 de demostración, sin asignación GS1 ni vinculación a envases reales.

Los iconos de tienda, destino y repartidor son SVG locales para evitar glifos faltantes; la flecha de rumbo gira sin rotar el dibujo del repartidor.

Cámara opcional: [BarcodeDetector](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector) tiene compatibilidad limitada; [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) requiere contexto seguro/localhost y permiso explícito. Selector de cámara tras permiso, formatos soportados, bloqueo de repetición mientras el mismo código siga en cuadro y parada al cerrar/navegar. Sin dependencia nueva ni promesa de compatibilidad universal. No se probaron cámara, lector USB/Bluetooth o impresora físicos.

## Navegación y permisos

| Acceso                                  | Tipo                                                         | Perfil / función                                                                               |
| --------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `/checkout` → Entrega / Pago / Revisión | Ruta con tres pasos internos, no tres rutas                  | Cliente; delivery/recojo son modalidades del mismo formulario                                  |
| `/pedido/:id/confirmacion`              | Página                                                       | Cliente propietario, snapshot coherente                                                        |
| `/pedido/:id/seguimiento`               | Página                                                       | Cliente propietario, estados y mapa/simulación; versiones responsive no son vistas adicionales |
| `/admin/pedidos` y `/admin/pedidos/:id` | Páginas existentes actualizadas                              | Admin, etiquetas de delivery/recojo y avance centralizado                                      |
| `/caja`                                 | Página nueva con Venta / Turno y cierre / Historial internos | Cajero activo: sus operaciones. Admin: consulta global de ventas; turno propio para operar     |
| `/admin/agentes`                        | Página nueva                                                 | Admin: crea, edita, activa/desactiva y restablece acceso ficticio de caja                      |
| `/admin/ubicacion`                      | Página nueva                                                 | Admin: pin y coordenadas del origen futuro                                                     |
| `/admin/reportes` y `/admin`            | Páginas existentes actualizadas                              | Admin: canales, pagos, agentes, turnos, inventario y estadísticas                              |
| `/login`, `/personal`, `/cuenta`        | Páginas existentes actualizadas                              | Completar acceso de caja, redirección y vínculo a su módulo                                    |

Modal de cámara/recibo/confirmación, errores, vacío, carga y pausa son **estados**, no páginas adicionales. No se afirma “24 vistas conectadas”. Las rutas restantes del catálogo/negocio/DS conservan el inventario y evidencia de etapas anteriores; no se atribuye aquí una nueva prueba integral de todas ellas.

Guardas de ruta y acciones del reducer distinguen cliente/caja/admin activos; registro público siempre cliente. Admin no modifica el rol de cliente/admin desde agentes. No permite desactivar agente con turno abierto. Credenciales de nuevos agentes/restablecimientos: AgenteDemo!2026, salvo semilla CajaDemo!2026. Todo local: no seguridad de servidor.

## Reportes y consistencia

`operationRows` centraliza filtros por fecha Perú, canal, agente, turno y pago. `operationsReport` genera las mismas filas/totales para vista, CSV e impresión: caja, fecha/canal, agentes, medios, productos, movimientos y cierres. Los reportes digitales siguen mostrando importes confirmados **no cobrados**. El efectivo digital no entra al turno; recoger no se suma como venta y un movimiento no se suma como ingreso. No se inventaron ventas previas para poblar tablas. Filtros de estado se aplican a pedidos; al combinarlos con caja no hay registros de pedido equivalentes.

## Límites y evidencia

[Verificación](VERIFICACION.md) y `operations-verification/*.json` distinguen servicio real, fallos/respuestas simuladas y hardware no probado. Una sesión/pestaña; no sincronización de dispositivos. Sin afirmación de puerta peatonal verificada, tráfico en vivo, seguridad de servidor, ingresos, licencia de imágenes aportadas o prueba con usuarios. Los 63 productos y sus imágenes se conservaron. No mayoristas/descuentos nuevos sin regla explícita.
