# Persistencia · esquema v6 / aplicación 0.7.0

## Fuente compartida e invariantes

Una envoltura `{version:6,data}` en `minimarket-rosita:app` concentra catálogo, categorías/subcategorías, metadata de imágenes, precios/stock por ID, cuentas, sesión, carrito, borrador, pedidos, movimientos y operaciones procesadas. No existe otro catálogo administrativo. Importe en céntimos enteros; `currentProducts` proyecta el producto comercial desde inventario y taxonomía activa.

Context/useReducer aplica transiciones coherentes. Productos nuevos validan ID estable, nombre/marca/presentación, precio positivo, stock/umbral enteros y pareja de categoría/subcategoría. Editar ignora stock inicial inyectado: los ajustes posteriores pasan por Inventario. Entrada/salida/conteo exigen motivo y comprueban stock esperado; nunca negativo. Una operación procesada no se repite.

Confirmar compra revalida identidad de cliente, cantidades, estado comercial heredado, stock, precio, entrega, pago y huella revisada. Pedido + movimientos + descuento + vaciado de carrito/borrador se crean juntos. El requestId impide duplicados. Agregar no reserva. Avanzar Recibido → Preparación → Camino → Entregado registra actor/fecha/origen y no descuenta nuevamente. Cliente solo consulta/avanza manualmente sus pedidos; administrador supervisa todos. No hay cancelación ni devolución.

Los pedidos guardan copias históricas de producto/precio/presentación, cantidades, entrega/pago y datos del cliente disponibles al confirmar. Editar producto, perfil o taxonomía no los reescribe. Pedidos antiguos sin auditoría se identifican `legacyHistory`; no se reconstruyen operaciones desconocidas.

## Taxonomía administrable

ID interno inmutable; slug editable con alias del anterior, orden numérico (empates por nombre), descripción y activo. Nombres únicos dentro del ámbito; identificadores/slugs/alias no colisionan con otros registros del tipo. Categoría/subcategoría compatibles se verifican en UI y operación. No hay eliminación física. La desactivación conserva referencias y oculta comercialmente sus productos, incluso si el producto tiene su interruptor activo. El carrito explica el problema y bloquea confirmación. Reasignar un subgrupo con productos se rechaza: deben editarse explícitamente los productos antes. Tablas muestran afectados.

Seis categorías y 17 subgrupos comerciales iniciales más seis técnicos Por clasificar. Los nuevos grupos activos pueden aparecer con cero resultados, sin inventar productos; un vacío ofrece volver al catálogo. Categorías nuevas alimentan inicio, navegación, catálogo y formularios. URL resuelve ID/slug/alias; selección de subgrupo se normaliza a ID. Búsqueda, precio, marca, disponibilidad, orden y subgrupo se combinan y el detalle conserva retorno.

## Migraciones

v5 es el esquema realmente instalado al comenzar esta etapa, congelado en `legacy-v5-schema.ts`. v5→v6 conserva productos propios, subcategoría, precios, stock, carrito válido, cuentas/verificadores, sesión, borrador, pedidos, movimientos e historial; incorpora taxonomía inicial, `media:{}` y cliente de exposición sin sobrescribir cuentas. v4 conserva la clasificación conservadora anterior antes de llegar a v6; v1–3 mantienen conversiones previas. No se inventan fechas, movimientos o ventas. Se mantiene la reparación anterior de carrito que excede stock; se informa al usuario.

Cuenta demo de cliente: `cliente@rosita.test / ClienteDemo!2026`; administrador: `admin@rosita.test / RositaDemo!2026`. Ante colisión se preserva la cuenta anterior y se busca correo/ID libre. El marcador de cuenta demo evita duplicarla en recargas y después de editar perfil. Registro fuerza cliente y `demoAccess:false`; no permite elevación de rol. Perfil solo edita el propio nombre/correo normalizados y únicos. Verificador PBKDF2 SHA-256/210000 iteraciones, salt único, contraseñas ficticias conocidas. No es autenticación segura ni autorización de servidor.

Zod valida estructura y referencias al leer y antes de guardar. Corrupción inicia memoria temporal y conserva el raw hasta una modificación explícita/reset. Formato superior a v6 queda protegido incluso al iniciar sesión. Lectura bloqueada/escritura fallida informan temporalidad; `setItem` fallido no destruye la versión anterior. No hay coordinación entre pestañas: usar una pestaña.

## Imágenes: coordinación localStorage / IndexedDB

Base exclusiva `minimarket-rosita-assets`, versión 1, almacén `images`, clave UUID. Blob + dimensiones/tamaño/MIME/fecha viven en IndexedDB. localStorage solo lleva metadata validada y `imageKey:"upload:<uuid>"`; nunca archivos grandes, base64 ni URLs blob permanentes. Recursos locales anteriores siguen con claves conocidas.

1. Se acepta JPG/PNG/WebP hasta 8 MB; lectura real verifica decodificación y máximo 40 megapíxeles.
2. Canvas mantiene proporción y reduce el lado mayor hasta 1600 px sin agrandar. WebP calidad .82 (PNG si el navegador no admite esa salida). Máximo preparado 1.25 MB.
3. Primero se guarda el archivo y se espera **`transaction.complete`**, no solamente éxito del request. Error de cuota/lectura/permisos no registra metadata ni reemplaza selección anterior.
4. Solo entonces se registra metadata y se selecciona el recurso. Guardar formulario asocia al producto/categoría; subir por sí solo no guarda sus campos.
5. El hook resuelve archivo, crea URL blob temporal y la revoca al cambiar/desmontar. Archivo ausente muestra reemplazo y desactiva ampliación, conservando compra/texto.

No existe transacción atómica entre ambas APIs. Si el componente se cierra después de guardar el blob, puede quedar un archivo huérfano. Cancelar formulario o quitar/reemplazar una imagen conserva el archivo, porque puede estar compartido. Si falla localStorage, el cambio permanece en memoria con aviso; el archivo puede quedar sin referencia persistida. No se eliminan recursos compartidos automáticamente ni se afirma sincronización. El reset explícito limpia estos recursos propios; el límite es 1000 metadata de imágenes por demostración. Sin exportación/importación de backup del navegador: la copia de código no incluye datos locales de una sesión personal.

## Restablecimiento

Solo administrador en UI y acción. Primero elimina claves cuyo prefijo es `minimarket-rosita:` (nunca `localStorage.clear()`); si eso falla no toca los blobs referenciados. Si funciona, vacía únicamente `images` de la base Rosita, conserva bases ajenas, restaura semillas y cierra sesión. Si falla vaciar imágenes se avisa que quedan archivos y se puede reintentar. No se borran recursos en `public`.

Recuperación de formato corrupto/futuro: usar acceso administrativo temporal y navegación interna hasta `/estado`, confirmar sin recargar en medio. Formatos futuros no se escriben hasta reset autorizado. En bloqueo permanente se restablece memoria y se informa que no puede guardarse.

Pruebas: `module-verification/core.json`, `almacenamiento.json`, `e2e.json`. Pedidos/datos de pruebas se generaron en contextos de navegador aislados; no se añadieron al catálogo de arranque ni al almacenamiento personal del usuario.

## Límites

Solo navegador/pestaña local, datos ficticios. Sin servidor, concurrencia distribuida, respaldo remoto, pagos, contacto real ni GPS. No había caja, cajero o ventas presenciales: no se creó colección ni historial ficticio. Los reportes digitales son importes confirmados, no acreditación de cobro real o ingreso.
