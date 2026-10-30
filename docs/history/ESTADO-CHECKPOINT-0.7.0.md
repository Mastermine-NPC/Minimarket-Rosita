# Checkpoint · Minimarket Rosita · 29/10/2026

Proyecto: `/home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO`. App0.7.0 / DS2.5.0 / almacenamiento6. **Conservar cambios; no reinicializar, desplegar ni modificar Framer/Figma.** Petición más reciente: terminar solo comprobaciones pendientes y documentación; no ampliar alcance ni repetir pruebas aprobadas sin modificación relacionada.

## Implementado

- Menú hamburguesa informativo con seis enlaces, grupos/iconos; categorías comerciales conservadas fuera del panel y selector móvil/tablet.
- Nosotros con foto real y datos documentados; ayuda/FAQ por anclas/acordeones; contacto validado con confirmación simulada sin envío.
- Cliente y administrador de exposición, completar credenciales sin autoenvío, perfil editable; registro fuerza cliente; permisos en rutas/acciones.
- Taxonomía dinámica administrable: crear/editar/ordenar/activar, IDs estables, alias de slug, relación dependiente, conteo de productos y sin borrado de referencias.
- Imágenes JPG/PNG/WebP desde computadora, compresión hasta1600px/1.25MB, metadata en estado y blobs en IndexedDB; error/preview/reemplazo/quitar, fuente ausente y reset exclusivo.
- Inventario/pedidos compartidos, snapshots históricos y descuento único conservados.
- Estadísticas calculadas, fechas/estados/top/categorías/evolución e importes por canal; reportes con filtros/CSV escapado/impresión propia.
- DS interactivo2.5 con ejemplos nuevos, tokens/estados y movimiento reducido.
- Migración v5 real→6 y versiones anteriores conservadas. Sin nuevas dependencias.

Caja/cajero y A/B no existían antes: siguen sin implementar; cláusulas de caja condicionales. No hay backend/autenticación de servidor/pago/contacto real ni seguimiento en vivo. Uso de una pestaña.

## Pruebas aprobadas (no repetir sin cambios relacionados)

- `npm run check`: tipos, ESLint,24 contrastes y build aprobados antes de cambios documentales y texto de reset; hay que ejecutar cierre final una vez después de copiar/formatear los harness de evidencia. Última compilación posterior al texto de reset aprobada (`/tmp/rosita-final/build.log`).
- `core.mjs/core.json`: semilla/verificador, taxonomía/alias/desactivación/permisos, migración v4 y v5 con colisión de correo, corrupción/futuro/bloqueo/cuota/reset de utilidades; cálculos de dos fechas, estado/top/totales/CSV/fórmulas.
- `publico.json`: menú/FAQ/anclas/teclado/Escape/foco, Nosotros/contacto sin POST, demo/perfil/permiso y movimiento reducido a1440/768/390.
- `e2e.json`: a1440/390 crear categoría/sub/producto, subir2200×1100→1600×800, guardar→tienda→detalle/zoom→recarga, comprar16.50, editar precio/nombre/stock, histórico intacto, stock una vez, reportes/CSV real/impresión y seguimiento actualizado. Sin erroresJS.
- `regresion-cliente/flujo.json`: registro/validaciones/retorno/carrito, entrega/pago efectivo insuficiente/vuelto, pasos sin pérdida, doble clic, pedidos/seguimiento, acceso/salida/aislamiento, teclado y reducedmotion a1440/768/390. Sin erroresJS.
- `zoom-regresion/resultados.json`: hover contain, teclado/foco/Escape, límites, ilustraciones, reducedmotion, móvil táctil; sin erroresJS.
- Almacenamiento UI: formatos/tamaño/corrupción/cuotaIDB, fuente ausente, reset con LS/IDB ajenos conservados, tablet/admin/DS, formato futuro y falloLS ya aprobados. Se añadió una aserción específica pendiente de consumir para comprobar limpieza de blob propio huérfano (el reset anterior tenía almacén propio vacío).
- Inspección visual realizada: Nosotros/contacto, categorías tablet, estadísticas móvil y reportes móvil; PDF real de prueba de una página inspeccionado, contiene filtros/totales/histórico y no el chrome administrativo.

## Comprobaciones en curso / pendientes exactas

1. Actualización posterior al checkpoint: el harness previo intentó abrir el antiguo botón Categorías. Se adaptó únicamente el harness a la barra/selector actual y se reanudó con `RESUME_PENDING=1`, omitiendo casos desktop ya aprobados (sesión18458). Consumir `/tmp/rosita-final/filtros.log` y `docs/module-verification/interfaz.json`: regresión filtros combinados/URL/retorno a1440/768/390. Primera ejecución leyó DOM anterior inmediatamente al cambiar URL (2 en vez de1); se cambió **solo harness** para esperar render. No asumir fallo de app hasta resultado. Proceso exec session80115 si sigue vivo.
2. **APROBADA** limpieza de blob huérfano propio y conservación de datos ajenos; `almacenamiento.json` tiene errors[]. No repetir. Registro: `/tmp/rosita-final/storage.log`. Referencia anterior: consumir `/tmp/rosita-final/storage.log` y `almacenamiento.json`: script externo corregido con aserción blob huérfano→reset→count0, sesión53635 si sigue viva. Fallos anteriores eran selector de título del DS equivocado; corregido. No repetir si ya terminó y errors[].
3. Copiar harness públicos/e2e/almacenamiento desde `/tmp/rosita-final` a `docs/module-verification`, formatear, incluir logs finales. No sobrescribir evidencias históricas. Limpiar solo capturas de fallos de esta etapa si ya resueltos.
4. Terminar `docs/MODULOS-0.7.0.md`: inventario real/rutas, tablaA–M con resultados y caja no aplicable, credenciales, guion, sílabo, límites. Actualizar VERIFICACION y README de evidencia; README/PERSISTENCIA/RECURSOS/DS ya actualizados pero revisar coherencia final.
5. Ejecutar una vez `npm run check` tras todos los scripts/documentación (ESLint incluye harness), corregir errores si hay; no volver a correr flujos aprobados sin cambiar código relacionado.
6. Crear copia final `docs/recovery/modulos-0.7.0.zip` y hashes, actualizar recuperación. Antes de trabajo ya existe `antes-modulos-0.7.0.zip`; preservar todos los zips previos.
7. Actualizar este checkpoint con cierre, resultados y comandos precisos. Entrega final con enlace local y documentación; no declarar caja/A-B implementadas ni pruebas humanas.

## Errores conocidos y límites de prueba

No hay fallo de aplicación confirmado pendiente; solo falta consumir dos ejecuciones y cierre estático. Lecturas tempranas de DOM/selector de títulos en harness fueron corregidas sin cambiar funciones. Formato futuro protegido; cuota informa sesión temporal. Sin transacción atómica LS/IDB: archivos cancelados/huérfanos se conservan hasta reset; fuentes ausentes tienen reemplazo. Sin pruebas humanas/A-B, lector de pantalla, dispositivos físicos u otros motores. Impresión comprobada por beforeprint y PDF headless; no se manejó diálogo de impresora de sistema.

## Retomar

```bash
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
export PATH=/home/hisok/.nvm/versions/node/v20.19.4/bin:$PATH
node /home/hisok/.npm/_npx/676e59db29371ba5/node_modules/npm/bin/npm-cli.js run check
```

Vite dev existente127.0.0.1:5173; preview compilada existente127.0.0.1:4173. Comprobar antes de levantar otra. Si no están: `npm run dev` o `npm run preview -- --host 127.0.0.1` después de build. No reconstruir dist mientras una prueba use4173.

Scripts de navegador dependen de herramientas externas ya disponibles, no se instalan en app:

```bash
export PLAYWRIGHT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/index.mjs
export PLAYWRIGHT_EXPECT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/test.mjs
export PLAYWRIGHT_BROWSERS_PATH=/tmp/rosita-admin-tests/browsers
export BASE_URL=http://127.0.0.1:4173
```

Solo si la comprobación pendiente no terminó: `node docs/module-verification/filtros.mjs` o script `/tmp/rosita-final/storage-ui.mjs`. Core usa `node docs/module-verification/core.mjs` con ViteSSR, sin servidor UI. Archivos adjuntos y PDF permanecen en rutas originales del usuario. Este proyecto está fuera del cwd autorizado: herramientas de escritura necesitan escalación con justificación; autorización ya dada por el usuario. No tocar `truthlens-extension`. No es repositorioGit; recuperación por zip.
