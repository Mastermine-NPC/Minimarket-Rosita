# Persistencia · esquema v7 / aplicación 0.8.0

## Estado compartido y migración

`minimarket-rosita:app` contiene `{version:7,data}`. Context/useReducer comparte productos, taxonomía, precios/stock, usuarios/sesión, carrito, borrador, pedidos, movimientos y metadata. IndexedDB conserva archivos, no registros de tarjeta. Identificadores estables; precios en céntimos enteros; las colecciones no se duplican por vista. Semillas se usan al iniciar/reset, no para reemplazar datos existentes al navegar.

El esquema realmente instalado antes de esta etapa era v6, congelado en `legacy-v6-schema.ts`. v6→v7 valida ese formato y conserva registros, relaciones, productos propios, imágenes/referencias, cuentas, sesión, stock, precios, carrito válido, pedidos y snapshots; permite `card-demo` y recibo ficticio mínimo. No necesita cambiar datos históricos ni incorporar nuevas ventas/cuentas. v1–5 conservan conversiones anteriores hasta formato actual. Se mantienen refinamientos de órdenes/movimientos y referencias mediante safeExtend; no se sustituyen por validación superficial.

Formato futuro (>7) protegido ante escritura, incluso con login temporal. Corrupción recupera memoria inicial y conserva raw hasta modificación explícita/reset. Bloqueo/cuota informa sesión temporal; escritura fallida no destruye el registro anterior. Recargar puede perder cambios no guardados. La reparación previa de carrito fuera de stock sigue informándose. Usar una pestaña; sin coordinación entre pestañas/dispositivos.

## Carrito, revisión e inventario

`priceCart` centraliza referencias/productos, activación comercial heredada de categoría/subgrupo, stock entero, cantidades enteras positivas, precio positivo finito representable en céntimos y sumas seguras. Reducer usa esas reglas para cada línea que añade/actualiza; rechaza NaN/Infinity/fracciones/negativos y referencias inexistentes. No impide reparar una línea por un problema en otra. Cantidad mínima1; eliminar es una acción separada. Agregar no reserva stock.

Toda modificación efectiva del carrito invalida `checkout.quote` y muestra orientación si hay checkout iniciado; volver a la cantidad anterior no recupera la revisión. `prepareQuote` incluye líneas, precios, stock, envío, entrega y método en su huella. Confirmar vuelve a calcular y exige coincidencia con revisión, cliente y token; precio/stock/disponibilidad cambiados necesitan nueva revisión.

Una transición crea pedido + salidas + descuento y limpia carrito/borrador. RequestId impide duplicados por doble clic/reintento. Cambiar estado de entrega no vuelve a descontar. Ajustes de inventario con motivo, stock esperado y operaciones únicas conservan las reglas anteriores. Pedidos mantienen snapshots independientes; editar nombre/precio/perfil/taxonomía no los reescribe. No se inventan movimientos de épocas previas ni cobros reales.

## Tarjeta exclusivamente ficticia

Solo se aceptan los tres números documentados en [PULIDO-0.8.0](PULIDO-0.8.0.md), titular CLIENTE DEMO, 12/99 y CVV 123. No hay SDK/pasarela, QR real, POST financiero, analítica de campos ni autenticación bancaria. Efectivo/Yape/Plin siguen funcionando.

- Titular/número/vencimiento/CVV viven en el formulario RHF, en memoria del componente. No entran al reducer, localStorage, IndexedDB, URL, consola o pedido. No se capturan en screenshots/trazas/HAR de pruebas.
- CVV oculto; número/vencimiento formateados; datos ajenos al conjunto ficticio rechazados. Errores junto al campo y foco inicial. Estado procesando bloquea controles y usa token 650 ms.
- Resultado determinista: termina 0001 aprueba, 0002 rechaza, 0003 simula error; solo después de validar el conjunto exacto. Rechazo/error conservan carrito y no crean pedido ni descuentan.
- Al aprobar se limpian campos y se crea `CardApproval` únicamente en estado local del checkout: referencia UUID ficticia, marca Demo, last4, huella, token y cliente. No se persiste la aprobación. Editar campos/método, cambiar compra/entrega/precio/stock, salir de checkout o recargar exige otra simulación.
- Una confirmación con tarjeta exige aprobación que coincida con la huella/cliente/token y que no se haya usado en otro pedido. Revisión inválida o ausente impide confirmar. Volver atrás conserva entrega/pago como borrador; no recupera datos de tarjeta.
- Los temporizadores se cancelan al desmontar/cambiar de sesión; una respuesta tardía no aprueba otro formulario. La confirmación revalida el estado en el reducer. Los bloqueos inmediatos y requestId impiden pedidos/descuentos duplicados.
- El pedido guarda solo `cardReceipt:{reference,brand:"Demo",last4:"0001"}`. Ni huella de aprobación, número completo, vencimiento, CVV o titular de tarjeta. El nombre del destinatario/cliente pertenece al pedido normal, no a datos financieros.

Esto es una simulación local: quien controla el navegador puede editar estado/código. Los perfiles cliente/admin y los verificadores PBKDF2 ficticios no proporcionan seguridad de servidor. Registro público fuerza cliente. Editar perfil no cambia rol/verificador ni snapshots.

## Taxonomía e imágenes conservadas

ID inmutable, slug con alias anterior, orden y activación; categorías nuevas alimentan comercio/formularios. No hay eliminación silenciosa. Desactivar oculta nuevas compras conservando registros; reasignar subgrupo con productos se bloquea hasta edición explícita. URL mantiene filtros/subgrupo/retorno.

Base exclusiva `minimarket-rosita-assets` v1, store `images`, UUID como clave. localStorage guarda metadata y `upload:<uuid>`, no archivos/base64/URLs blob permanentes. Se valida JPG/PNG/WebP ≤8MB y 40 megapíxeles, se prepara sin agrandar hasta 1600 px/1.25MB. Primero blob, esperando transaction.complete; después metadata/asociación al guardar formulario. Hooks crean/revocan URLs temporales. Fuente ausente muestra reemplazo y limita zoom sin impedir leer/comprar.

No hay transacción atómica LS/IDB: cancelar/reemplazar/quitar o fallar escritura puede dejar archivo huérfano. No se borra archivo compartido por quitar una selección; reset limpia recursos propios. Error de cuota conserva selección anterior e informa temporalidad. Los videos web son recursos estáticos locales, no se guardan en estado/IndexedDB.

## Reset y recuperación

Solo admin. Borra claves `minimarket-rosita:`; si falla no borra archivos referenciados. Si funciona, vacía solo `images` de la base propia, restaura semillas y cierra sesión. Conserva claves/bases ajenas y archivos de `public`. Si IDB falla se avisa que quedaron recursos para reintentar. Nunca localStorage.clear().

Formato futuro/corrupto: acceso demo administrativo temporal → navegación interna a `/estado` → confirmar reset, sin recargar en medio. ZIP recupera código/recursos, no datos personales del navegador. No hay backup remoto, backend, pagos/reparto reales o POS. Reglas anteriores y detalles de inventario/auditoría: [documento v6](history/PERSISTENCIA-0.7.0.md).
