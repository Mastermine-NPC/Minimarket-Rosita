# Persistencia y reglas · esquema v5 / aplicación 0.6.0

## Catálogo único y perfiles

`state.products` contiene metadatos por ID estable; `inventory` mantiene precio en céntimos y existencias por ese mismo ID. `data/catalog.ts` es únicamente la semilla inicial. Crear/editar productos se refleja en tienda, filtros, detalle y carrito mediante useCatalog. No se guarda un catálogo separado para administración. Los pedidos mantienen snapshots independientes de nombre, presentación, precio, cantidades, entrega, tarifa y método aplicados al confirmar.

DemoUser.role distingue customer/admin. La cuenta de administración inicial guarda salt/verificador PBKDF2 SHA-256 con 210000 iteraciones. La contraseña ficticia conocida se publica para demostrar el acceso; no se persiste en texto plano. Registro público fuerza customer aunque se inyecte otro perfil. Identificador y correo duplicados se rechazan; el correo se normaliza. Login administra la sesión local; administrador redirige al panel. Rutas y cada operación de modificación comprueban el perfil activo. No hay seguridad de servidor.

Cuenta inicial: admin@rosita.test / RositaDemo!2026. Ante colisión con un cliente anterior se busca correo e ID libres sin sobrescribirlo; la entrada personal muestra la cuenta inicial correcta. Recargar no vuelve a añadirla.

## Operaciones de producto

Identificadores de 3–40 caracteres, letras mayúsculas/números/guiones, únicos y no editables. Se validan las seis categorías, textos, presentación, precio positivo hasta S/1 000 000, imagen de la lista local, umbral entero 0–1 000 000 y stock inicial entero 0–1 000 000. Nombre+marca+presentación duplicados (sin distinguir mayúsculas) se rechazan. Precio se convierte de cadena de soles a céntimos enteros.

Un producto nuevo puede iniciar stock: si es positivo crea una entrada actual con origen administrador. Los productos iniciales no producen movimientos históricos ficticios. Editar un producto existente ignora cualquier stock inicial inyectado; solo Inventario cambia sus existencias. Desactivar mantiene el registro y snapshots históricos, lo excluye de nuevas compras y conserva sus líneas de carrito para mostrar el problema y permitir eliminarlas. No se confirma un carrito con productos desactivados. Activar vuelve a ofrecerlo con precio/stock actuales. No hay borrado físico ni descuentos automáticos nuevos; se conservan únicamente las promociones de prueba previas. No existía regla mayorista y no se añade.

## Inventario y movimientos

Entrada suma una cantidad positiva; salida manual resta una cantidad positiva; corrección de conteo indica stock final y calcula diferencia. No se aceptan fracciones, negativos, cantidades fuera de rango, stock final negativo ni conteos sin diferencia. Motivo obligatorio de 5–200 caracteres. El ajuste comprueba el stock que vio el formulario; si cambió pide abrirlo de nuevo.

Cada movimiento registra ID, operación, producto y nombre al operar, tipo, motivo, diferencia, stock anterior/posterior, fecha, actor y pedido relacionado cuando corresponde. Una operación UUID ya procesada no se vuelve a aplicar. El stock y su movimiento se actualizan juntos en el reducer.

Confirmar una compra revalida cliente, productos activos, precios, stock, entrega, pago y huella de revisión. Si cambió algo debe actualizarse/revisarse de nuevo. Una sola transición crea el pedido, salidas por línea, descuento de stock y vaciado del carrito/borrador. El requestId evita duplicados por reintento; UI añade bloqueo inmediato. Importes enteros seguros en céntimos; priceCart/deliveryAmounts son comunes a carrito y checkout. Agregar no reserva ni descuenta. Los ajustes manuales no reescriben cantidades compradas.

## Pedidos y transiciones

Pedido recibido → En preparación → En camino → Entregado. Solo se avanza una etapa y el estado esperado debe coincidir con el actual. Una operación repetida o una transición desde un estado ya cambiado no vuelve a ejecutarse. Cada transición guarda fecha, actor, origen y estados anterior/posterior. No altera stock, contenido del pedido o dirección. No hay cancelaciones, devoluciones o reposición automática.

Administrador puede consultar y avanzar todos los pedidos; cliente solo consulta los propios. El control manual de simulación del cliente se conserva para sus propios pedidos, claramente identificado, con la misma confirmación y lógica que el administrador. No habilita gestión de pedidos ajenos. Esto no representa un reparto real. El cambio se ve al cerrar sesión y entrar con el otro perfil, en la misma pestaña.

Pedidos anteriores a v4: se conservan datos originales y estado, con statusHistory vacío y legacyHistory true. No se reconstruyen fechas ni movimientos pasados. Los primeros eventos nuevos registran el estado realmente migrado como origen. Datos de cliente de un pedido antiguo se consultan desde su cuenta local y se identifican como tales; no se inventa un snapshot histórico que no existía.

## Persistencia coherente y migración

Una envoltura `{version:5,data}` en `minimarket-rosita:app` agrupa productos, inventario, usuarios/sesión, carrito, borrador, pedidos, movimientos, fecha de inicio de registro y operaciones ya aplicadas. Se valida con Zod: IDs únicos, perfiles, referencias, cantidades, importes, relaciones de movimientos y secuencia de estados. Una escritura setItem persiste todo tras cada transición; no hay escrituras separadas que vacíen el carrito antes de crear la orden o pierdan un movimiento.

v1/v2 siguen migrándose conservando sus datos existentes. v3 conserva clientes y verificadores, sesión cliente válida, carrito, inventario, pedidos, borrador y contador; añade catálogo inicial de metadatos y administrador único. Nuevos campos de auditoría empiezan vacíos y recordingSince se fija al migrar. En v4 esa fecha permanece al recargar. No se atribuyen operaciones anteriores al registro.

Corrupción recupera una sesión inicial y conserva el contenido original hasta una modificación explícita/reset. Formatos futuros se abren temporalmente sin sobrescribirse, incluso al ingresar. Al bloquearse lectura o fallar escritura se muestra aviso persistente y se continúa en memoria; setItem fallido conserva el registro anterior del navegador. Navegar internamente mantiene la sesión temporal; recargar puede perderla. No se implementa carga local de imágenes: solo claves de recursos existentes, sin base64 o blob URLs persistentes.

## Restablecimiento exclusivo

El reset global requiere administrador tanto antes de tocar localStorage como en el reducer. Elimina exclusivamente claves con prefijo minimarket-rosita:, restaura semilla, stock y cuenta inicial y limpia sesión, clientes de prueba, carritos, pedidos, movimientos y operaciones. Nunca usa localStorage.clear(). Si localStorage sigue bloqueado solo se limpia memoria y se avisa.

Proceso normal: /personal → ingresar → Restablecer demostración → confirmar. Para datos corruptos/futuros se usa el administrador temporal de recuperación y navegación interna desde el panel a /estado; no recargar entre ingreso y reset. Si el correo inicial colisionaba con uno de los clientes, usar el mostrado en la entrada personal; el reset restaura el correo predeterminado.

## Límites

Una pestaña/navegador, sin sincronización ni coordinación transaccional entre pestañas o dispositivos. Quien controla el navegador puede editar su contenido; los perfiles simulan restricciones, no autorización de servidor. Datos exclusivamente ficticios. Pagos, tarifas, cobertura y tiempos son de prueba; seguimiento sin GPS/reparto real. Caja y A/B son etapas posteriores.


## Subcategorías · migración v4 → v5

Cada CatalogRecord añade `subcategory`, un identificador de `data/subcategories.ts` compatible con su category. La semilla tiene asignación explícita para los 24 artículos. Los productos previos se clasifican solo con reglas conservadoras sobre su nombre actual y categoría; un nombre desconocido usa `<categoria>-por-clasificar`, no el ID/imagen de un producto semilla ni una clasificación aleatoria. Los grupos pendientes se identifican en administración y solo aparecen en tienda si tienen productos activos.

El validador v4 está congelado en `legacy-v4-schema.ts`; v5 utiliza safeExtend para conservar sus invariantes y añadir la pareja de clasificación. La migración enriquece solo products; no cambia nombres, precios, stock, carrito válido, clientes, sesión, pedidos/snapshots, movimientos u operaciones procesadas. No modifica createdAt/updatedAt para simular ediciones históricas. Persistir/recargar después usa versión 5. Se mantiene la reparación preexistente de cantidades del carrito fuera del stock disponible; no se añadió una regla de compra distinta.

Versiones 1–3 conservan sus conversiones previas y terminan con catálogo v5 válido. Una versión futura se mantiene protegida frente a escritura; errores de almacenamiento conservan el tratamiento de sesión temporal. Restablecer sigue limitado al espacio de Rosita; no se usa localStorage.clear().

En formularios, cambiar categoría borra subcategoría; campo obligatorio con opciones dependientes. Tanto formulario como operación administrativa comprueban compatibilidad para evitar saltarse la validación visual. Una clasificación nueva no actualiza los snapshots de pedidos. El modelo actual no tiene una colección separada de ventas presenciales: se conservaron pedidos y movimientos existentes, sin inventar datos de caja.

Pruebas de migración con datos reales de demostración y un pedido generado: [SUBCATEGORIAS.md](SUBCATEGORIAS.md). Versión anterior del documento conservada en history/PERSISTENCIA-0.5.1.md.
