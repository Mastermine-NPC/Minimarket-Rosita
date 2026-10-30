# Persistencia, acceso y transacción · esquema v3

## Una fuente de estado

Context/useReducer conserva catálogo identificado por ROS-001…ROS-024 y sus seis categorías. `inventory` guarda stock y precio en céntimos por ID; `useCatalog` aplica esos valores a las vistas existentes. `priceCart` centraliza líneas/subtotal/contador y `deliveryAmounts` centraliza envío/total. Agregar no reserva ni descuenta.

`minimarket-rosita:app` contiene una envoltura `{version:3,data}` con contador técnico, carrito, cuentas locales, sesión, inventario, pedidos, borrador de checkout y mensajes de proceso. Zod valida formas, límites, referencias, identificadores únicos e importes coherentes. Los mensajes se limpian cuando corresponde; no se guardan contraseñas ni datos del formulario técnico de comprobación.

## Confirmación atómica local

1. El checkout recibe un requestId aleatorio único para la operación y guarda el borrador entre pasos/recargas.
2. Al preparar revisión se crea una huella del carrito, inventario, entrega, pago, tarifa y resumen.
3. Confirmar recibe ID/fecha generados fuera del reducer. La función pura comprueba sesión local, requestId, estado de revisión, datos, precios, stock, efectivo y huella vigente.
4. Un cambio invalida el resumen y exige «Actualizar revisión». Stock insuficiente conserva pedido sin crear y stock sin descontar; permite corregir carrito. No se acepta una confirmación obsoleta.
5. Una sola transición copia los productos/precios/presentaciones/cantidades, entrega, tarifa, estimación y pago al pedido; descuenta unidades, agrega pedido y vacía carrito/borrador.
6. El mismo requestId o ID ya creado no vuelve a ejecutar la operación. UI bloquea de inmediato y muestra procesamiento, pero el reducer es la segunda protección.
7. El proveedor escribe todo el estado en un único setItem: no existen escrituras independientes de pedidos y stock. Si falla, el estado sigue coherente en memoria y se advierte que podría perderse al recargar.

Importes: enteros seguros en céntimos, sin sumar precios decimales de componentes. Los valores de formulario en soles se convierten mediante cadena decimal de hasta dos posiciones. Las vistas formatean con es-PE/PEN. Los pedidos conservan su snapshot aunque cambien precios posteriores. Avanzar seguimiento solo modifica status, nunca inventario.

## Acceso simulado y privacidad

Correo trim + minúsculas; se comprueba duplicación. Web Crypto PBKDF2/SHA-256, salt aleatorio de 16 bytes, 210000 iteraciones y verificador de 256 bits. Solo se guardan salt/verificador/iteraciones. Se solicita una contraseña ficticia de 6–128 caracteres; no hay cuentas predefinidas ni recuperación por correo, servidor o servicios externos.

La cuenta y sesión persisten en este navegador hasta salida/reset. Salir conserva carrito y pedidos e inventario, pero limpia datos de entrega/pago de la sesión de compra. Historial, detalle y seguimiento filtran por cliente activo y la lógica impide avanzar pedidos ajenos. Esto es separación de interfaz: el propietario del navegador puede editar datos; no hay autorización segura ni cifrado de direcciones. Usar exclusivamente datos de prueba.

Los parámetros de retorno admiten únicamente cuenta, carrito, checkout, historial y rutas internas de pedido permitidas. No se ejecutan URLs arbitrarias ni rutas administrativas.

## Migración y recuperación

v1 conserva contador técnico y crea carrito vacío. v2 conserva carrito y contador; inicializa inventario con catálogo actual y colecciones nuevas vacías. v3 valida todo; repara cantidades/IDs de carrito incompatibles con stock y avisa, sin inventar órdenes faltantes. Los registros corruptos recuperan un estado vacío y conservan el contenido original hasta una modificación explícita o reset. Formatos futuros desconocidos se abren en una sesión temporal sin sobrescribirlos.

Al bloquearse lectura o fallar escritura aparece una advertencia persistente; la navegación interna permite continuar temporalmente. Una recarga/documento nuevo puede perder esos datos. Reset usa solo el prefijo `minimarket-rosita:`; las claves de otros sitios/aplicaciones se conservan. Si el almacenamiento sigue bloqueado solo se reinicia la memoria local.

Demostración limpia: `/estado` → Restablecer datos de Rosita → confirmar. Borra cuentas locales, sesión, carrito, pedidos y cambios de stock; carga existencias iniciales. Para recuperar código, extraer un ZIP de docs/recovery en otra carpeta y reinstalar según package-lock.json. Nunca extraer sobre trabajo ajeno sin revisarlo.

## Límites

Uso en una sola pestaña. No hay coordinación transaccional entre pestañas, pestañas ya abiertas, dispositivos o usuarios reales; no equivale a una base de datos. Pago ficticio: efectivo, Yape o Plin, sin QR, tarjetas, enlaces ni transferencias. Zonas A/B, tarifas S/4 y S/6.50 y tiempos son pruebas. Estimación textual no es promesa comercial. Seguimiento manual sin mapa/GPS/temporizador de reparto; no implica entrega real. Administración, caja y A/B son etapas posteriores.
