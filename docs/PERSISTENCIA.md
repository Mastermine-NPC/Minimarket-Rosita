# Persistencia · esquema v9 / aplicación 1.0.0

`minimarket-rosita:app` contiene `{version:9,data}`. Context/useReducer mantiene un origen común para catálogo, taxonomía, cuentas, inventario, carrito, checkout, pedidos, caja, turnos y seguimiento. Imágenes subidas siguen en IndexedDB, con sus referencias/metadata existentes; esta migración no borra assets.

## Migración preservadora

`legacy-v8-schema.ts` congela el formato anterior. Las conversiones v1–7 previas se conservan; integración de catálogo v7→8 ocurre antes de v8→9. `initializeOperations` agrega solo campos nuevos, códigos ficticios faltantes y un agente semilla si no existe. Respeta códigos presentes, crea otros únicos, conserva IDs internos/SKU, productos propios, precios/stock, imágenes, categorías, cuentas/sesión, carrito válido, movimientos y pedidos históricos. Lectura v9 valida directamente y no reinyecta semillas ni vuelve a importar existencias. No duplica agentes al recargar.

Los pedidos anteriores permanecen sin coordenadas/modalidad cuando no las tenían. Se interpretan como delivery heredado, pero no se les inventa ruta u origen. El seguimiento explica su ausencia. La revisión de checkout antigua se invalida al migrar para pedir punto confirmado o recojo; conserva campos útiles del borrador. Las nuevas modalidades tienen los mismos cuatro índices de estado, con etiquetas diferentes según delivery/recojo.

`stateSchema` conserva las invariantes anteriores con safeExtend y añade: códigos de barras únicos cuando existen; perfiles; referencias de venta/agente/turno; sumas por línea y total; efectivo/vuelto; una salida por producto/venta; cierres coherentes con fondo + ventas en efectivo, diferencia correcta; un turno abierto por agente; aprobaciones no reutilizadas; progreso 0–1 y velocidades 1/2/4/8.

## Caja e inventario

`cashDrafts[userId]` contiene token, revisión y cantidades; independiente de `cart`. `priceCashDraft` reutiliza `priceCart` y la disponibilidad comercial de categoría/subcategoría. Cantidades enteras positivas, stock y precio vigente se revalidan al confirmar. No se descuenta al añadir o escanear. Revisar/cambiar cantidades o precios invalida la aprobación anterior, incluso al volver al importe original por la revisión del borrador.

`cash/confirm` crea snapshot de venta, líneas, pago, agente/turno, movimientos `sale-out`, decremento y limpieza del borrador en una acción. RequestId/id de venta y operación impiden repetición. `order/confirm` mantiene su transacción anterior con `order-out`. Ambos consultan `inventory` común. Recojo/avance de estado/simulación solo actualizan su estado; nunca crean otra venta o descuento. No se alteran snapshots al editar productos o perfil.

Turno: fondo fijo al abrir, ventas asociadas al actor/turno y cierre inmutable con contado/esperado/diferencia. Esperado = fondo + recibido − vuelto **solo en efectivo de ventas presenciales**. Tarjetas y efectivo previsto de pedidos digitales quedan fuera. Sin botones ficticios de entrada/retiro manual.

## Entrega y rutas

`storeLocation` configura el origen de futuros pedidos. Cada pedido nuevo conserva copia independiente de `delivery.origin`, punto confirmado, dirección/referencia y geometría vial `[longitud,latitud]`, distancia/duración, proveedor, fecha y extremos ajustados a calle. Cambiar origen o perfil no modifica pedidos anteriores. Recojo normaliza el payload: dirección de tienda, envío cero, sin destino/ruta de repartidor.

Ruta solo tras confirmación explícita. Cambiar punto limpia ruta/confirmación; AbortController y generación descartan respuestas tardías. Coordenadas al proveedor, nunca nombre/celular/referencia. Cobertura rectangular y tarifa son ficticias, documentadas en OPERACIONES. Tiles se cargan normalmente, sin descarga masiva ni persistencia propia/offline de mapas. La geometría de demostración se guarda localmente con atribución y proveedor; no se ofrece servicio de navegación real.

`tracking[orderId]`: progreso y velocidad, no bandera de reproducción. Cada montaje inicia pausado. Se guarda cada 5 segundos, al pausar/finalizar, ocultar pestaña o salir; valores idénticos no producen escritura adicional. La posición de cada fotograma vive solo en memoria y se interpola por distancia acumulada de la ruta. Restablecer afecta únicamente progreso visual; no toca pedido o inventario.

## Tarjeta y permisos locales

Un único `CardSimulation` se usa en checkout/caja. Solo en memoria: titular, PAN ficticio completo, vencimiento, CVV y aprobación con huella/token/usuario. Aprobación válida únicamente para esa operación; cambios, sesión distinta o respuesta tardía la invalidan. Persisten solo referencia `DEMO-…`, marca Demo y `last4:0001` en el recibo exitoso. Referencias no reutilizables entre caja y pedidos.

Registro público fuerza customer. Guardas de ruta y reducer requieren perfil activo y rol pertinente. Cajero consulta sus ventas/turno y no administra. Administrador crea/edita/desactiva/restablece agentes (sin promocionar clientes/cajeros a administrador). PBKDF2 local es mecanismo de demostración, no autenticación o seguridad de servidor.

## Recuperación y límites

Versión futura >9 protegida contra sobrescritura incluso tras login temporal. Corrupción conserva raw hasta cambio explícito/reset; arranca memoria inicial y muestra aviso. Almacenamiento bloqueado/cuota: aviso de sesión temporal; no promete persistir. Carrito mayor que stock se ajusta con aviso al leer. Restablecimiento elimina únicamente claves `minimarket-rosita:` y assets propios; no usa clear global.

No coordinación entre pestañas/dispositivos. Compartir navegador comparte datos ficticios. Copia fuente previa `docs/recovery/antes-operaciones-1.0.0.zip`; no exporta el localStorage personal. [Pruebas](VERIFICACION.md), [formato v8 anterior](history/PERSISTENCIA-0.9.0.md).
