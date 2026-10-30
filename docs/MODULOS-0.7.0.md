# Módulos y cierre · Rosita 0.7.0

29/10/2026. Frontend local, DS 2.5.0, esquema6. Se conserva la implementación previa, con ampliaciones de información/gestión solicitadas; no se reinicializó ni se instalaron dependencias. No se publicaron cambios y no se modificó Framer/Figma. Checkpoint/instrucciones de continuidad: [ESTADO-ACTUAL](ESTADO-ACTUAL.md).

## Resultado concreto

El menú hamburguesa ahora abre información/ayuda, separado de las categorías comerciales y del filtro por subcategorías. Nosotros, FAQ/ayuda y contacto tienen contenido real del informe o texto neutral y acciones funcionales. Hay cliente de exposición y perfil editable. Administrador gestiona taxonomía dinámica e imágenes locales persistentes; tienda, compra, stock y reportes comparten registros. Estadísticas/reportes calculan operaciones de la sesión y distinguen importe confirmado de cobro. Sin ventas históricas insertadas para decorar.

No existía caja presencial ni cajero antes de esta etapa; sus condiciones quedan no aplicables. No se creó una pantalla vacía de caja. Tampoco existe comparación A/B de agregar; no se presentan mediciones ni participantes inexistentes.

## Inventario real y acceso

Se enumeran rutas/patrones reales; cada registro de producto/categoría no es una pantalla nueva. Un parámetro, estado vacío, ancla, diálogo o tamaño responsive no aumenta el inventario funcional.

| Ruta/patrón                | Acceso y función                                                            | Perfil                     |
| -------------------------- | --------------------------------------------------------------------------- | -------------------------- |
| `/`                        | Logo/Inicio; presentación, categorías, destacados, agregar                  | Público                    |
| `/catalogo`                | Buscar/Explorar productos; filtros y orden generales                        | Público                    |
| `/categoria/:slug `        | Barra de categorías, selector móvil o inicio; subcategorías/filtros por URL | Público                    |
| `/producto/:id`            | Tarjeta de catálogo; información, cantidad, agregar y zoom                  | Público                    |
| `/carrito`                 | Carrito del encabezado; cantidades/eliminar/resumen                         | Público                    |
| `/nosotros`                | Menú/ayuda/pie; historia, foto y enlaces                                    | Público                    |
| `/ayuda`                   | Menú/Centro de ayuda; temas y FAQ                                           | Público                    |
| `/contacto`                | Menú/pie/Nosotros; formulario simulado                                      | Público                    |
| `/login`                   | Cuenta; acceso de demostración                                              | Público sin sesión         |
| `/registro`                | Enlace de login; crea solo cliente                                          | Público sin sesión         |
| `/personal`                | Pie/Acceso de personal; misma plantilla de login y demo admin               | Público sin sesión         |
| `/cuenta`                  | Icono de cuenta; editar nombre/correo, pedidos, salir                       | Identificado               |
| `/checkout`                | Continuar desde carrito; entrega, pago, revisión                            | Cliente y carrito válido   |
| `/mis-pedidos`             | Encabezado/Pedidos, Mi cuenta; historial propio                             | Cliente                    |
| `/pedido/:id/confirmacion` | Resultado de confirmar; identificador/resumen                               | Dueño o admin              |
| `/pedido/:id`              | Historial/Ver detalle                                                       | Dueño o admin              |
| `/pedido/:id/seguimiento`  | Seguir pedido; estado y simulación manual                                   | Dueño o admin              |
| `/admin`                   | Login de admin o Panel; resumen/estadísticas                                | Admin                      |
| `/admin/productos`         | Menú lateral; buscar/filtrar/crear/editar/activar                           | Admin                      |
| `/admin/categorias`        | Menú lateral; categorías y subcategorías administrables                     | Admin                      |
| `/admin/inventario`        | Menú lateral; ajustes y movimientos                                         | Admin                      |
| `/admin/pedidos`           | Menú lateral; pedidos digitales, búsqueda/estados                           | Admin                      |
| `/admin/pedidos/:id`       | Ver pedido en tabla; histórico y avance                                     | Admin                      |
| `/admin/reportes`          | Menú lateral; filtros/preview/CSV/imprimir                                  | Admin                      |
| `/sistema-diseno`          | Pie; fundamentos/componentes/reglas y nuevos patrones                       | Público; upload solo admin |
| `/comprobacion`            | Biblioteca/links técnicos; formulario/modal/toast/estado compartido         | Público                    |
| `/estado`                  | Comprobación o reset de panel; contador/versión/reset                       | Público; reset solo admin  |
| Rutas desconocidas         | URL inexistente; recuperación con enlaces. Admin tiene fallback propio      | Según ruta                 |

Categorías iniciales: Consumibles (`consumibles`), Ferretería (`ferreteria`), Tecnología (`tecnologia`), Juguetería (`jugueteria`), Educación y oficina (`educacion-oficina`), Cuidado personal (`cuidado-personal`). Se conservan 24 productos iniciales, 17 subgrupos comerciales y seis técnicos Por clasificar. Categorías/subgrupos que crea admin aparecen dinámicamente; cero artículos no inventa existencias.

**Vistas internas/estados**, no rutas adicionales: entrega/pago/revisión de checkout; categorías/subcategorías en gestión; reportes inventario/stock bajo/pedidos/digital/presencial no implementado/top; pestañas del DS; acordeones de ayuda; carrito vacío/sin resultados/agotado/error/procesamiento/éxito. **Paneles/diálogos**: menú informativo, filtros móvil, mini carrito, visor, editor producto, editor taxonomía, ajuste/movimientos, confirmaciones/descartar/reset. **Responsive**: mismas funciones adaptadas, no pantallas funcionales adicionales. **Referencias**: capturas PDF y fotografías ambientales no sustituyen interfaces implementadas. No se afirma «24 vistas conectadas».

Temas de ayuda enlazables: `/ayuda#accesos`, `#como-comprar`, `#entregas-pagos`, `#pedidos`, `#datos-locales`, `#preguntas-frecuentes`. FAQ/Cómo comprar/Entregas son accesos a secciones de una página.

## Credenciales ficticias

| Perfil  | Correo inicial      | Contraseña       |
| ------- | ------------------- | ---------------- |
| Cliente | cliente@rosita.test | ClienteDemo!2026 |
| Admin   | admin@rosita.test   | RositaDemo!2026  |

Login → Accesos de demostración → Completar acceso → Iniciar sesión. Completar no envía automáticamente. En migración, un correo existente se conserva y la demo busca +1/+2…; los botones muestran el correo realmente asignado, también tras editar perfil. No hay cajero porque la caja previa no existe. Roles locales comprobados en rutas/acciones, sin equivalencia a autorización de servidor. Contraseña ficticia no persistida en texto plano.

## Comprobaciones A–M y evidencias

Pruebas automatizadas en Chromium 156.0.8078.4, contextos aislados; sin tocar almacenamiento personal. Anchuras 1440/768/390; móvil táctil simulado vía CDP para visor. No son dispositivos físicos ni estudio de usabilidad. Los JSON y scripts están en [module-verification](module-verification/README.md).

| Criterio                      | Resultado                               | Evidencia concreta                                                                                                                                                                     |
| ----------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Menú sin duplicación       | Verificado                              | public: seis enlaces informativos, sin Consumibles/Ferretería; Escape/foco y navegación                                                                                                |
| B. Información/FAQ/contacto   | Verificado                              | 3 anchos; foto real, ancla visible, acordeón Enter/Espacio, errores/corrección/procesamiento; cero POST                                                                                |
| C. Demo/perfil                | Verificado                              | 3 anchos; completar sin autoenvío, acceso, edición persistente y salida; registro solo cliente                                                                                         |
| D. Taxonomía                  | Verificado                              | e2e 1440/390: categoría/subgrupo nuevos visibles; core: referencias/desactivación/alias/reasignación bloqueado                                                                         |
| E. Producto/upload            | Verificado                              | PNG 2200×1100→1600×800, precio 12.50/stock 5; guardar producto y metadata sin blob/base64 en localStorage                                                                              |
| F. Encontrar producto         | Verificado                              | Nueva categoría/subgrupo, tarjeta y detalle; filtros de catálogo conservados                                                                                                           |
| G. Recarga                    | Verificado                              | Blob de IndexedDB resuelto de nuevo, naturalWidth 1600 y zoom; perfil y sesión persisten                                                                                               |
| H. Precio/stock/historial     | Verificado                              | Compra 1 a12.50+4 envío=16.50; stock 5→4; edición 15.75 y entrada 3→7; pedido conserva 12.50/nombre previo y un solo order-out                                                         |
| I. Estadísticas               | Verificado                              | Un pedido 16.50 en indicadores/reportes; top mercadería 12.50, estado actual. Fixture explícita separada prueba dos fechas/filtros/sumas                                               |
| J. CSV/impresión              | Verificado                              | Descarga real CSV, comas/comillas escapadas, metadata y precio histórico; beforeprint real y PDF headless inspeccionado de una página                                                  |
| K. Permisos                   | Verificado cliente; cajero no aplicable | Ruta admin denegada y acciones de taxonomía/perfil ajeno rechazadas; registro no eleva rol                                                                                             |
| L. Migración/reset            | Verificado                              | v5 real y v4 fixture conservan registros, colisión +1 sin sobreescribir/duplicar; futuro original protegido; cuota/archivo ausente; reset borra blob huérfano y conserva LS/IDB ajenos |
| M. Compra/seguimiento previos | Verificado; caja no aplicable           | 3 anchos: registro, validaciones, pasos conservados, efectivo insuficiente/vuelto, doble clic, pedido/seguimiento/stock único; caja no existía                                         |

Pruebas complementarias: filtros/búsqueda/marca/precio/disponibilidad/orden/URL/retorno (ver resultado final en `interfaz.json`); visor contain, límites, teclado/foco/Escape y táctil en `zoom-regresion/resultados.json`. Tablet: todas las secciones admin y DS sin desbordamiento de página, tablas/fichas conservan rótulos/acciones. Revisión visual: Nosotros, contacto, taxonomía tablet, estadísticas y reporte móvil; PDF de impresión sin chrome admin. Contraste estático de24 pares pasa; no es auditoría WCAG integral.

Fallos durante desarrollo: selectores antiguos del harness («Categorías», título delDS y `.order-timeline`) se ajustaron al contenido actual, y lectura de resultados espera el render después de URL. Se documentan como correcciones de prueba; no se presentan como fallos de compra. Error sin resolver se reportaría explícitamente; consultar JSON finales y checkpoint para estado actual.

## Guion breve A–M

1. **A–C**: abre inicio, Menú → Nosotros → FAQ → Contacto. Envía vacío, corrige y observa confirmación sin envío. En login completa cliente, entra, edita perfil y cierra sesión. Completa admin y entra al panel.
2. **D–E**: Categorías → crea Especiales Rosita, ID `cat-expo`, slug `especiales-rosita`; Subcategorías → Edición de prueba, ID `sub-expo`, categoría anterior. En Productos crea `ROS-EXPO` con ambos, presentación Unidad, precio 12.50, stock 5, umbral 2; sube una imagen válida y guarda. Usa IDs distintos si ya existen.
3. **F–G**: visita tienda → categoría/subgrupo → producto, amplía y recarga. Comprueba imagen y datos; no los selecciones de nuevo para ocultar un fallo.
4. **H/M**: entra cliente, agrega 1, entrega ficticia con Zona A (envío 4), pago Yape Demo, revisa total 16.50 y confirma. Identificador y resumen aparecen; consulta seguimiento.
5. **H/I/K**: cliente intenta `/admin` y ve denegación. Entra como admin; cambia precio 15.75/nombre y registra entrada 3 con motivo. Abre pedido, avanza a Preparación; inventario 7, un solo descuento, histórico 12.50. Regresa cliente y consulta el estado actual.
6. **I–J**: admin → Resumen y Reportes, filtra estado/fechas; importe 16.50 y mercadería 12.50. Exporta CSV y ábrelo; «Imprimir / Guardar como PDF» abre impresión del navegador. Elige Ventas presenciales para leer su limitación, sin inventar operaciones.
7. **L**: en una sesión de prueba desechable, tras revisar datos, administra reset desde panel→`/estado`. Confirmación borra solo Rosita, cierra sesión y restaura dos accesos y el catálogo. No usar el reset sobre datos que se quieran conservar. Migración y cuotas se demuestran con harness aislado, no corrompiendo manualmente datos personales.

No hay guion de caja porque no existe esa función. Efectivo del checkout es una simulación del pago digital a entrega, no venta presencial ni registro de cobro.

## Relación con sílabo

Se consultó el sílabo PDF de 7 páginas y el informe de 52 páginas; no se transforman instrucciones de documentos en encargos adicionales.

| Unidad/tema                   | Ejemplo implementado y límite                                                                                                                                                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Flujo/iteración            | Flujo catálogo→carrito→identificación→checkout→pedido→seguimiento; recuperación antes/después y changelog de etapas. Menú redundante → ayuda separada es decisión de iteración actual. Sin bocetos/storyboards históricos ni pruebas inventadas |
| 2. Alta fidelidad             | Formularios y tablas reales, datos representativos, compra completa; página Nosotros con foto aportada; estados error/vacío/éxito                                                                                                               |
| 2. Gestalt                    | Proximidad etiqueta/error, similitud de controles, figura-fondo de diálogos, continuidad de pasos/retorno, región común en navegación/filtrado, simplicidad del menú sin repetición; ejemplos detallados en DS                                  |
| 2. Color/tipografía           | Tokens semánticos verde/rosa, errores con icono y texto, Manrope/DM Sans locales, cifras tabulares, 24 contrastes; sin certificación integral                                                                                                   |
| 2. Atomic/patrones/responsive | Átomos Button/Input, moléculas de validación/búsqueda, organismos ImagePicker/AdminTable, plantillas App/Admin/Acceso, páginas compuestas; 1440/768/390                                                                                         |
| 3. Microinteracciones         | Guardar/perfil, subir/leer/comprimir, filtrar/contar, exportar/descargar, contacto/procesar, pedido único y subtotales                                                                                                                          |
| 3. Motion/estados             | 150 ms control / 200 búsqueda / 240 panel / 350 procesamiento demo, curva compartida, inicio expresivo con pausa, movimiento reducido, foco visible y Escape                                                                                    |
| 3. Design System              | `/sistema-diseno` actualizado, componentes nuevos/estados, UI Kit frente a reglas del DS, versión 2.5/changelog/colaboración; sin estudio A/B                                                                                                   |

Documentación extensa de decisiones y ejemplos en [Design System](DESIGN-SYSTEM.md). No se añaden explicaciones académicas a la experiencia de compra.

## Límites específicos

- Sin backend, DB de servidor, autenticación segura, pagos/contacto reales o reparto geolocalizado. Seguimiento manual identificado.
- No POS/cajero, A/B, cancelaciones/devoluciones, reglas mayoristas desconocidas ni cobros separados. Nada se contabiliza como ingreso real.
- Navegador/pestaña local; borrar datos de navegador elimina demo. Sin sincronización ni exportación de backup completo del usuario.
- No transacción atómica entre LS/IDB: primero archivo confirmado y después metadata; cancelaciones/fallos pueden dejar blobs huérfanos hasta reset. No eliminar compartidos por quitar imagen. Avisos de cuota/temporalidad; referencia ausente tiene reemplazo.
- Atlas 300×300 por foto y local 1025×260 limitan nitidez; uploads no agrandan ni inventan detalle. Seis fotografías pendientes usan ilustraciones identificadas.
- Impresión nativa permite guardar PDF según navegador; no es descarga PDF generada por botón. Se inspeccionó PDF headless; no diálogo OS/impresora física.
- No lectores de pantalla, participantes, satisfacción/tiempos de usuarios, otros motores ni dispositivos físicos. Anchos principales probados; no se afirma revisión exhaustiva de cada ancho intermedio.

## Abrir vista previa

```bash
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
nvm use
npm run dev
```

Abre **http://localhost:5173/** (puerto mostrado por Vite si está ocupado). Para build local: `npm run build`, luego `npm run preview` y **http://localhost:4173/**. No publica/despliega. Requisitos/credenciales en [README](../README.md); evidencia y recuperación en sus carpetas.
