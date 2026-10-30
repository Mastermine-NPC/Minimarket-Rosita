# Verificación · Rosita 0.3.0 / Design System 2.1.0

Fecha: 29/10/2026. Se revisaron README, DS, recursos, verificación 0.2.0, rutas/componentes, reducer, catálogo y persistencia; no había AGENTS.md en proyecto/ancestros. Se conservó una copia previa en `docs/recovery/antes-pedidos-0.3.0.zip`. No se reinicializó ni se instalaron/actualizaron dependencias de la aplicación. No se modificó Framer/Figma ni se publicó/desplegó.

## Entorno comprobado

Vite 8.3.5 exige Node ^20.19.0 o >=22.12.0; ESLint 10.13.0 exige ^20.19.0, ^22.13.0 o >=24. La intersección ya está reflejada en package.json. Node 18 del shell es incompatible; las pruebas usan **20.19.4**, fijado por .nvmrc/.node-version. Se ejecuta npm **11.21.1** mediante el runner ya disponible, sin cambiar el gestor global ni el lock. React 19.3.1, TypeScript 6.0.3 y las demás versiones figuran en `order-verification/installed.json`.

Se usa la API vigente build.rolldownOptions.output.codeSplitting de Vite 8 para separar Zod. No se aumentó el límite de advertencias. La compilación final separa un grupo de validación y mantiene páginas lazy.

## Inventario real y acceso

| Vista/plantilla | Ruta | Cómo se accede |
| --- | --- | --- |
| Inicio | `/` | Logotipo e Inicio |
| Catálogo | `/catalogo` | Encabezado y CTA |
| Seis categorías | `/categoria/consumibles`, `/categoria/ferreteria`, `/categoria/tecnologia`, `/categoria/jugueteria`, `/categoria/educacion-oficina`, `/categoria/cuidado-personal` | Inicio, menú, filtros y pie |
| Detalle reutilizable | `/producto/ROS-001`…`/producto/ROS-024` | Imagen/título de producto |
| Carrito | `/carrito` | Encabezado → panel → Ver carrito completo |
| Registro | `/registro` | Regístrate o acceso contextual desde checkout |
| Acceso de demostración | `/login` | Cuenta o gate del checkout/pedido |
| Cuenta del cliente | `/cuenta` | Cuenta del encabezado tras identificarte |
| Checkout | `/checkout` | Continuar con mi pedido |
| Confirmación | `/pedido/:id/confirmacion` | Al crear correctamente un pedido; URL directa propia |
| Historial | `/mis-pedidos` | Pedidos en encabezado, cuenta, pie o confirmación |
| Detalle del pedido | `/pedido/:id` | Ver detalle desde historial |
| Seguimiento manual | `/pedido/:id/seguimiento` | Seguir pedido desde confirmación/historial |
| Sistema de diseño | `/sistema-diseno` | Pie y enlaces internos |
| Comprobación técnica | `/comprobacion` | Pie |
| Estado y reset | `/estado` | Segunda ruta de comprobación |
| Recuperación | Ruta inexistente; ID de pedido/producto/categoría inválido | Mensaje y alternativa de navegación |

No se presenta una cifra artificial de pantallas. Entrega, pago y revisión son pasos internos de `/checkout`. Panel de carrito, menú y filtros móviles son paneles; errores, vacíos, agotado y procesamiento son estados. Las tres resoluciones son variantes responsive. Los 24 productos son datos de una plantilla; las capturas del PDF siguen siendo referencias visuales.

Flujo implementado: catálogo → carrito → registro/login contextual → entrega → pago simulado → revisión → confirmación → historial/detalle → seguimiento manual. Explorar y agregar no requieren acceso. El pedido a domicilio sí exige cliente local activo.

## Comprobaciones y evidencia

Solo son pruebas automatizadas de funcionamiento en Chromium 156.0.8078.4, no investigación de usabilidad. JSON, scripts y capturas en `docs/order-verification`. Las pruebas de precios/stock alterados usan fixtures controladas, no una interfaz administrativa.

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| TypeScript, ESLint sin advertencias, build | Verificado | `check.log` |
| Compra completa sobre dist en localhost:4173 | Verificado a 390 px | `compilado/flujo.json`; incluye acceso, stock y seguimiento |
| Registro válido, obligatorios, contraseñas distintas, mostrar/ocultar y correo normalizado | Verificado en 1440/768/390 | `flujo.json` |
| Duplicado de correo con mayúsculas/espacios; login correcto/incorrecto y salida | Verificado en tres anchos | `flujo.json` |
| Carrito conservado al identificar/cerrar sesión | Verificado | `flujo.json` |
| Entrega: nombre, teléfono peruano, dirección y zona; corrección sin perder datos | Verificado | `flujo.json` |
| Efectivo insuficiente, vuelto, subtotal/envío/total enteros | Verificado | `flujo.json`, `logica.json` |
| Yape y Plin de demostración sin datos financieros reales | Verificado | `recuperacion.json`, `casos-limite.json` |
| Confirmación única ante doble clic/reintento | Verificado | UI en `flujo.json`; reducer puro en `logica.json` |
| Descuento una vez, carrito vacío tras éxito, persistencia de stock/pedido/sesión | Verificado | `flujo.json`, `logica.json` |
| Stock insuficiente; precio/stock cambiados después de revisión | Verificado | `logica.json`; precio y ajuste al recargar también en UI |
| Actualizar revisión explícitamente antes de volver a confirmar | Verificado | `recuperacion.json`, `casos-limite.json` |
| Confirmación, historial, detalle, seguimiento y avance persistente hasta Entregado | Verificado en tres anchos | `flujo.json` |
| Otro cliente sin ver/avanzar pedido ajeno desde interfaz/lógica | Verificado | `flujo.json`, `logica.json` |
| Cierre de sesión durante procesamiento | Verificado | `casos-limite.json`; no crea pedido ni descuenta |
| Checkout vacío, sesión ausente, ID inexistente y retorno externo rechazado | Verificado | `flujo.json`, `casos-limite.json`, `logica.json` |
| v2→v3 conserva carrito y contador; v3 conserva pedido/inventario/sesión | Verificado | `logica.json`, `recuperacion.json` |
| Corrupción, formato futuro protegido y reset solo Rosita | Verificado | `recuperacion.json`, `logica.json` |
| Compra con almacenamiento bloqueado, aviso visible y sesión temporal | Verificado | `recuperacion.json` |
| Catálogo: búsqueda, tildes, filtros, orden, detalle y carrito anteriores | Verificado en tres anchos | `regresion.json` |
| Páginas técnicas, formulario, modal, Escape y retorno del foco | Verificado en tres anchos | `base-tecnica.json` |
| Teclado, primer inválido, pasos, foco visible y movimiento reducido | Verificado en escenarios cubiertos | `flujo.json`, `regresion.json`, `base-tecnica.json` |
| Distribución a diez anchos, imágenes y controles dentro del viewport | Verificado: 110 casos, cero incidencias detectadas | `layout.json` |
| Nombre de 80 caracteres sin espacios en móvil | Verificado | `casos-limite.json` |
| 18 pares de tokens de contraste | Verificado | `contrast.json` |
| Contraste de texto renderizado en 12 casos / 394 muestras | Verificado: cero fallos detectados | `contraste-renderizado.json` |
| Firefox, Safari, teléfonos/tablets físicos y lectores de pantalla | No comprobado | Solo Chromium local automatizado |
| Concurrencia entre pestañas/dispositivos, seguridad de servidor | No comprobado / no implementado | Uso de una sola pestaña |
| Administración, caja, comparación A/B y pagos/autenticación reales | Pendiente / fuera de esta etapa | No hay interfaz o servicio de producción |
| Investigación con personas, satisfacción y conclusiones A/B | No comprobado | No se inventaron participantes ni métricas |

Anchos del barrido: 1440, 1280, 1024, 1023, 900, 801, 800, 768, 600 y 390 px. Se inspeccionaron capturas estables de registro, checkout, confirmación y seguimiento; no se detectaron imágenes deformadas ni solapamientos evidentes en las vistas revisadas. Contraste es una comprobación parcial y no una certificación WCAG completa. Las capturas del flujo pueden mostrar notificaciones reales de la prueba; las `vista-*` usan fixtures estables identificadas.

## Iteración y relación académica

Se preservaron Manrope/DM Sans, paleta, logotipo, imágenes locales y organización comercial de 0.2.0. Acceso comparte plantilla y formulario; checkout separa tres tareas; resumen de pedido reutilizado entre revisión/confirmación/detalle/seguimiento. Se corrigió el foco de error de revalidación, se deduplicaron avisos de almacenamiento, se ajustaron nombres largos y se retiró el borde de control del título enfocado programáticamente. Se centralizó cálculo de importes para no mantener fórmulas independientes en páginas.

Unidad 1: flujo y decisiones actuales documentados; registro de iteración técnica. No se presentan bocetos/storyboards ni pruebas de usuarios históricos que no existieron. Unidad 2: interfaces de alta fidelidad, plantilla compartida, campos y componentes, tipografía y contraste; Gestalt mediante proximidad de campo/error y precio/acción, similitud de tarjetas, región común de resumen/filtros y continuidad entre pasos. Unidad 3: carga de confirmación, feedback al agregar, errores de formulario, actualización de subtotales, estados de seguimiento manual, tokens/curvas, reduced-motion y DS 2.1.0 con reglas. No se atribuyen conclusiones A/B ni usabilidad a pruebas automatizadas.

## Guion breve

1. En catálogo agrega dos sets de destornilladores (S/15.50 cada uno). Carrito S/31.00.
2. Continuar con mi pedido → crear cuenta con correo y contraseña ficticios; el carrito se conserva.
3. Entrega: nombre de prueba, celular de nueve dígitos que comience con 9, dirección ficticia y Zona A de demostración.
4. Pago: efectivo S/50. Revisión: subtotal S/31, envío ficticio S/4, total S/35 y vuelto simulado S/15.
5. Confirmar pedido de demostración. Consultar identificador/fecha/resumen; stock de destornilladores baja de 9 a 7 una sola vez.
6. Seguir pedido → Simular siguiente estado tres veces. Estado final Entregado, identificado como simulación. Recargar y consultar historial.
7. Cerrar sesión y crear otro cliente: historial vacío y pedido previo no visible. Carrito sigue compartido localmente como se documenta.

No es posible demostrar caja o administración todavía.

## Persistencia, límites y recuperación

Política completa en `PERSISTENCIA.md`. v3 agrupa todo en una clave y una escritura; el reducer hace la transacción atómica en memoria. PBKDF2/SHA-256 con salt y contraseña ficticia evita texto plano, pero no proporciona autenticación ni autorización de servidor. La sesión permanece al recargar hasta cerrar/reset; salir limpia el borrador de entrega/pago y conserva carrito. Datos sensibles reales no deben usarse.

Stock/precios de prueba, zonas/tarifas/tiempos ficticios centralizados. Pago sin QR, tarjetas, comprobantes ni servicios. Seguimiento manual sin GPS, mapa o temporizador de entrega. Agregar no reserva stock; consultar/avanzar no vuelve a descontar. Uso en una sola pestaña, sin sincronización transaccional externa. Persistencia bloqueada permite navegación interna en memoria; recargar puede perder todos esos cambios. No se oculta ese límite.

Demostración limpia: `/estado` → Restablecer datos de Rosita → confirmar. Elimina solo el prefijo Rosita, restaura stock y borra cuentas/pedidos locales. Conserva datos ajenos. Antes de editar se guardó `antes-pedidos-0.3.0.zip`; snapshot final `pedidos-0.3.0.zip`, ambos en `docs/recovery`, con SHA256SUMS. Extraer en otra carpeta y usar el lock, nunca sobrescribir una carpeta ajena.

Evidencia previa 0.2.0 en `commerce-verification`, 0.1.0 en `verification`; documentación anterior en `history`. Esos resultados no se presentan como pruebas nuevas.

## Abrir la vista previa interactiva

Desde `/home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO`: `nvm use` y `npm run dev`. Abrir **http://localhost:5173/** o el puerto mostrado por Vite. No abrir index.html como archivo. `/registro` comienza el acceso de prueba; `/sistema-diseno` muestra la biblioteca. Sin publicación/despliegue.
