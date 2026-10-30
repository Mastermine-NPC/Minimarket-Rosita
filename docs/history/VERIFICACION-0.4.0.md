# Verificación · aplicación 0.4.0 / Design System 2.2.0 / esquema v4

Fecha: 29/10/2026. Trabajo sobre el proyecto existente, leyendo instrucciones y documentación vigente, tipos, reducer, catálogo, reglas de compra, sesión y esquema. No se encontraron AGENTS.md en proyecto/ancestros. Antes de editar se guardó `docs/recovery/antes-admin-0.4.0.zip`. No se reinicializó ni se añadieron/actualizaron dependencias; lock y gestor conservados. No se modificó Framer/Figma, publicó ni desplegó.

## Entorno

Node 20.19.4 y npm 11.21.1 ya disponibles; `.nvmrc`/`.node-version` y requisito ^20.19.0 || ^22.13.0 || >=24.0.0 conservados. Node 18 del shell no es compatible. React 19.3.1, Vite 8.3.5, TypeScript 6.0.3 y demás versiones registradas en `admin-verification/installed.json`. `entorno.json` compara dependencias y lock con la copia previa: solo cambió la versión raíz de la aplicación. La división del bundle de validación de Vite 8 se conserva.

## Perfiles e inventario de rutas

| Vista/ruta | Acceso | Perfil y función |
| --- | --- | --- |
| `/personal` | Pie: Acceso de personal | Login compartido, credenciales ficticias y perfil administrativo |
| `/admin` | Ingreso de administrador o Resumen | Seis indicadores calculados, pedidos recientes, alertas y barras de estado |
| `/admin/productos` | Menú Productos | Búsqueda, categoría/estado, orden, páginas de diez, crear/editar/activar/desactivar |
| `/admin/inventario` | Menú, alerta o stock de producto | Búsqueda/categoría/agotados/bajo, umbral, ajustes y movimientos |
| `/admin/pedidos` | Menú Pedidos | Búsqueda por ID/cliente, estado/fechas, orden y paginación |
| `/admin/pedidos/:id` | Ver pedido o movimiento relacionado | Snapshot, cliente, entrega/pago, historia y avance confirmado |
| `/admin/*` desconocida | URL directa | Estado de sección inexistente con menú de recuperación |
| `/` y `/catalogo` | Inicio, logotipo y catálogo | Tienda conservada, productos activos del mismo estado |
| `/categoria/:slug` | Inicio, menú y pie | consumibles, ferreteria, tecnologia, jugueteria, educacion-oficina, cuidado-personal |
| `/producto/:id` | Foto/título del producto | Detalle reutilizable, IDs iniciales y creados; desactivados fuera de nueva compra |
| `/carrito` | Encabezado → panel → Ver carrito completo | Datos compartidos, errores por desactivación/stock, cantidades y eliminación |
| `/registro`, `/login`, `/cuenta` | Cuenta o checkout | Registro solo cliente, acceso local y salida; administrador vuelve a su panel |
| `/checkout` | Continuar con mi pedido | Entrega, pago y revisión; confirmación exige cliente de demostración |
| `/pedido/:id/confirmacion` | Compra correcta | ID, fecha, snapshot, total y entrega ficticia |
| `/mis-pedidos`, `/pedido/:id` | Encabezado/cuenta/historial | Cliente solo consulta sus pedidos; administrador usa su panel |
| `/pedido/:id/seguimiento` | Confirmación/historial | Estado y registro compartidos; simulación manual del cliente con confirmación |
| `/sistema-diseno` | Pie | Biblioteca 2.2.0 con patrones administrativos |
| `/comprobacion`, `/estado` | Pie y segunda ruta técnica | Base técnica conservada; reset global ahora requiere administrador |

No se atribuye una cifra artificial de pantallas. Los productos son registros de una plantilla; crear/editar/ajustar son paneles de diálogo; entrega/pago/revisión son pasos internos. Vacíos, errores, desactivados, agotados y estados de entrega son estados; escritorio/tablet/móvil son variantes responsive. Las capturas del informe son referencias y no vistas ejecutables.

El administrador se identifica en /personal con **admin@rosita.test / RositaDemo!2026**. Si un cliente migrado ya tenía ese correo se conserva y el inicial usa admin+1@rosita.test o siguiente libre, mostrado en la entrada. Sin sesión o como cliente, rutas y acciones administrativas se bloquean. Registro público fuerza customer incluso si se inyecta role admin en una acción. Restricciones locales de demostración, no seguridad de servidor.

## Pruebas ejecutadas

Chromium 156.0.8078.4 local automatizado. Scripts, JSON y capturas en `docs/admin-verification`; perfiles y fixtures son ficticios. No representan participantes ni investigación de usabilidad.

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Tipos, ESLint sin advertencias y compilación | Verificado | `check.log` |
| Ciclo cliente/panel/productos/inventario sobre dist local | Verificado a 390 px | `compilado/flujo.json` |
| Acceso administrativo, salida, redirección y sesión al recargar | Verificado en 1440/768/390 | `flujo.json` |
| Anónimo/cliente bloqueados en rutas administrativas | Verificado en tres anchos | `flujo.json` |
| Cliente no crea/desactiva productos, ajusta stock ni usa reset desde lógica | Verificado | `logica.json` |
| Registro público no se asigna administrador, incluso con perfil inyectado | Verificado | `logica.json`, `flujo.json` |
| Crear/editar/activar/desactivar y recursos locales | Verificado en tres anchos | `flujo.json` |
| Obligatorios, identificador duplicado, precio negativo, fracción y motivo vacío | Verificado | UI y `logica.json` |
| Stock de producto existente no cambia desde edición comercial | Verificado | UI deshabilitada y acción con stock inyectado en `logica.json` |
| Precio/nombre editados reflejados en tienda/detalle | Verificado | `flujo.json` |
| Edición administrativa después de revisión invalida checkout y exige actualizar | Verificado | `revalidacion-ui.json`, `logica.json` |
| Producto desactivado en carrito permanece visible y bloquea nueva compra | Verificado en tres anchos | `flujo.json`; quote bloqueada en `logica.json` |
| Entrada, salida inválida y conteo con motivo y movimiento | Verificado | UI y `logica.json` |
| Salida manual válida; cantidades enteras y prevención de negativos | Verificado | `logica.json` |
| Confirmar compra genera un único descuento y movimiento | Verificado en tres anchos | `flujo.json` y `logica.json` |
| Doble clic/reintento de producto, stock, pedido o transición | Verificado en casos cubiertos | `flujo.json`, `logica.json` |
| Pedido aparece en panel y avance se refleja al entrar como cliente | Verificado en tres anchos | `flujo.json` |
| Cliente y administrador usan el mismo avance, sin nuevo descuento | Verificado | UI y reducer en `logica.json` |
| Snapshot del pedido intacto tras cambiar nombre/precio | Verificado | `flujo.json`, `logica.json` |
| v3→v4 conserva cliente/sesión/carrito/contador/stock/pedidos | Verificado | `recuperacion.json`, `logica.json` |
| Migración no fabrica movimientos o fechas anteriores; no duplica administrador | Verificado | `recuperacion.json` |
| Corrupción y formato futuro protegido, incluso al ingresar | Verificado | `recuperacion.json` |
| Reset administrativo conserva claves ajenas y restaura datos | Verificado | UI y `logica.json` |
| Almacenamiento bloqueado: CRUD/tienda temporal con aviso | Verificado | `recuperacion.json` |
| Fallo de cuota conserva registro anterior y advierte sesión temporal | Verificado | `cuota.json` |
| Indicadores desde productos/inventario/pedidos del estado | Verificado | Números tras compra en UI y `dashboardMetrics` en `logica.json` |
| Catálogo, búsqueda, filtros, orden, detalle y carrito previos | Verificado en tres anchos | `regresion.json` |
| Acceso/registro, entrega, pagos simulados, confirmación, historial y seguimiento previos | Verificado en tres anchos | `regresion-cliente/flujo.json` |
| Formulario técnico, modal, foco, contador y persistencia | Verificado en tres anchos | `base-tecnica.json` |
| Rutas directas, pedido/sección inexistente y alternativa de navegación | Verificado | `flujo.json`, `layout.json` |
| Teclado, Escape, foco al cerrar y advertencia de cambios sin guardar | Verificado | `flujo.json`, incluidas cancelar/continuar/descartar |
| Movimiento reducido y menú adaptable | Verificado | `flujo.json`, regresiones |
| Distribución, imágenes y controles dentro del viewport | Verificado | `layout.json`: 73 casos; `layout-mobile-final.json`: 15 adicionales |
| Contraste de 20 pares semánticos | Verificado | `contrast.json` |
| Contraste DOM de navegación/tablas/estados/formulario inválido | Verificado: 18 casos, 1019 muestras, sin fallos detectados | `contraste-renderizado.json` |
| Firefox, Safari, dispositivos físicos y lectores de pantalla | No comprobado | Solo Chromium automatizado |
| Seguridad de servidor y sincronización entre pestañas/dispositivos | No implementado | Fuera del alcance, uso de una pestaña |
| Caja, A/B, cancelación/devolución/reposición automática | Pendiente / fuera de esta etapa | No existen menús ficticios para estas funciones |
| Investigación con personas o conclusiones de usabilidad | No comprobado | No se inventaron participantes, tiempos o satisfacción |

Anchos del barrido: 1440, 1280, 1024, 1023, 900, 801, 800, 768, 600 y 390 px, más revisión focalizada a 450/390. Se inspeccionaron visualmente capturas de resumen en escritorio e inventario/pedidos/formulario en móvil/tablet. No se detectaron solapamientos evidentes ni imágenes deformadas. Las tablas se convierten en fichas con todas sus columnas cuando el panel mide hasta 900 px. Se apilaron filtros estrechos para no recortar categorías. Las imágenes estables vista-* son fixtures de prueba; los screenshots de flujo pueden incluir notificaciones. Contraste no equivale a una auditoría o certificación WCAG completa.

## Decisiones y correcciones

Se conservó la tienda y se creó una plantilla administrativa aparte con cuatro secciones reales. El verde oscuro del lateral, rosa de la selección y superficies claras utilizan los tokens existentes; se añadió foco inverso contrastado. Tablas semánticas y fichas adaptables comparten contenido, sin ocultar precio, acción o estado. Formularios de producto separan información comercial de stock; el editor advierte antes de descartar. Se retiró el menú móvil duplicado en escritorio y se mantuvo el perfil visible en pantallas pequeñas.

El reset global se reservó a administrador en UI, proveedor y reducer para impedir un atajo de cliente sobre inventario/pedidos. Se compartió ConfirmAction entre las transiciones del cliente y panel. Carritos con desactivados conservan sus líneas y ofrecen corrección; cantidades que ya no se pueden editar ofrecen ir al carrito en lugar de controles sin respuesta.

Unidad 1: flujo e iteración actuales documentados; no son evidencia histórica de bocetos o pruebas previas. Unidad 2: alta fidelidad, tipografía/contraste, componentes y Gestalt (proximidad en formulario/error y precio/acción, similitud de controles, región común de paneles y continuidad de datos). Unidad 3: estados, confirmación de acciones, avisos, foco, movimiento reducido, tokens y DS versionado 2.2.0. A/B y pruebas con personas siguen pendientes.

## Reglas y datos

`state.products` e `inventory` son comunes a tienda y panel. ID estable; categorías restringidas a las seis existentes. Solo el producto nuevo recibe stock inicial; editar uno existente no modifica existencias. Entrada/salida/conteo generan diferencia y motivo, sin negativos. La confirmación de pedido genera salidas y descuento una vez, junto con snapshot y vaciado de carrito. Cambiar estado no modifica stock. Los estados solo avanzan secuencialmente y cada evento guarda fecha/origen. No se reconstruye historia previa a v4.

Dashboard: activos; agotados activos con cero; bajo activos entre 1 y umbral; recibidos todos los confirmados; pendientes estado distinto de Entregado; importe todos los totales con envío. No es dinero cobrado. Diferencia semilla y productos creados, y aclara el inicio del registro de movimientos. Pedidos de 0.3.0 se incluyen sin modificar sus datos.

No había regla mayorista: no se añade ni se inventan descuentos nuevos. Las promociones de prueba previas se conservan. No hay subida de archivos; selector de recursos locales conocidos. Seis fotografías reales siguen pendientes, sustituidas por SVG genéricos identificados como ilustraciones; procedencia en RECURSOS.md. No se presentan como fotos exactas de marcas.

## Guion de demostración

1. Para cifras iniciales reproducibles, entrar como administrador y restablecer demostración; volver a crear/identificar cliente.
2. Cliente: dos sets de destornilladores a S/15.50, Zona A ficticia S/4, total S/35; confirmar. Stock 9→7 y una salida por pedido.
3. Salir como cliente, entrar en /personal con admin@rosita.test / RositaDemo!2026. Pedidos → Ver pedido → avanzar a En preparación → confirmar.
4. Salir del panel e ingresar como el cliente. Seguimiento muestra En preparación y origen administrativo. Avance manual del cliente usa las mismas reglas.
5. Volver como administrador. Productos → editar precio a S/16.75. Inventario → entrada de cinco unidades con motivo. Stock 7→12.
6. Ver tienda: precio S/16.75, stock 12. Pedido anterior conserva S/15.50 por unidad y total S/35. Consultar su movimiento y transiciones.

No hay operaciones reales. La sesión se cambia cerrando e identificándose con el otro perfil en la misma pestaña; no existe un selector público para concederse administración.

## Recuperación y límites

Política completa en PERSISTENCIA.md. Una escritura versionada reúne datos relacionados. Roles, validaciones e idempotencia simulan restricciones frontend, no autorización de servidor. Estado en memoria sigue coherente si falla almacenamiento; se advierte que puede perderse al recargar. No se añade coordinación entre pestañas o dispositivos.

Reset: administrador → Restablecer demostración → confirmar en /estado. Solo prefijo Rosita; restaura semillas/stock/cuenta inicial y limpia sesión/clientes/pedidos/movimientos. En corrupción/futuro, ingresar con el administrador temporal y navegar internamente hasta reset; el formato futuro no se sobrescribe hasta ese acto explícito.

Copia previa `docs/recovery/antes-admin-0.4.0.zip`; final `docs/recovery/admin-0.4.0.zip`, con SHA256SUMS. Extraer en otra carpeta y reinstalar por lock, sin sobrescribir trabajo ajeno. Documentos anteriores en history y evidencias anteriores en sus carpetas; no se atribuyen a esta etapa.

## Abrir la vista interactiva

Desde `/home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO`: `nvm use` y `npm run dev`. Abrir **http://localhost:5173/**; panel mediante **http://localhost:5173/personal**. Si hay una sesión cliente activa, cerrarla primero. Usar el puerto mostrado por Vite si cambia. No abrir index.html como archivo. Sin publicar, desplegar o modificar Framer/Figma.
