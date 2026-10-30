# Estado actual · cierre 0.7.0 · 29/10/2026

Proyecto: `/home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO`. Aplicación 0.7.0 / DS 2.5.0 / almacenamiento6. Cambios conservados; no se publicó, desplegó ni modificó Framer/Figma. El checkpoint solicitado **antes de continuar** se conserva en [history/ESTADO-CHECKPOINT-0.7.0.md](history/ESTADO-CHECKPOINT-0.7.0.md). Después se cerraron solo comprobaciones pendientes y documentación; no se amplió el alcance.

## Implementación conservada

Menú informativo separado de categorías/subcategorías; Nosotros/ayuda/FAQ/contacto simulado; accesos ficticios y perfil editable; taxonomía administrable con IDs/alias, relación/orden/activación; imágenes desde archivos con IndexedDB, compresión y referencias estables; productos/inventario/pedidos compartidos y snapshots históricos; estadísticas calculadas y reportes con filtros/CSV/impresión; DS 2.5 con estados/patrones reales y movimiento reducido. No nuevas dependencias.

Cliente: `cliente@rosita.test / ClienteDemo!2026`. Admin: `admin@rosita.test / RositaDemo!2026`. Ante colisión de correos migrados, usar «Completar acceso» en login para obtener el correo realmente asignado. Los perfiles locales no son seguridad de servidor.

## Pruebas aprobadas

Evidencia en `docs/module-verification`:

- `core.json`: semilla/verificador, taxonomía/alias/desactivación/permisos, migraciones v4/v5→6 con conservación y colisión de correo, corrupción/futuro/bloqueo/cuota/reset; cálculos de fechas/estado/top/totales/CSV.
- `publico.json`: menú sin duplicación, FAQ/anclas/teclado/Escape/foco, Nosotros/contacto sin POST, acceso/perfil, permisos y movimiento reducido a 1440/768/390.
- `e2e.json`: ciclo categoría/subgrupo→producto/upload→tienda/detalle/recarga→compra→stock/historial→estadísticas/CSV/impresión→seguimiento a 1440/390.
- `regresion-cliente/flujo.json`: registro y compra previos, validaciones, efectivo insuficiente/vuelto, campos al regresar, pedido único ante doble clic, seguimiento/stock una vez y salida/aislamiento a 1440/768/390.
- `interfaz.json`: filtros combinados, disponibilidad, orden, URL y regreso desde detalle a 1440/768/390. Última ejecución retomó con `RESUME_PENDING=1` sin repetir el tramo desktop aprobado.
- `zoom-regresion/resultados.json`: contain/hover, teclado/foco/Escape, límites, cambio de producto, movimiento reducido y táctil; 3 anchos.
- `almacenamiento.json`: formato/tamaño/lectura/cuota IDB, fuente ausente, reset real borra blob huérfano propio y conserva LS/IDB ajenos; panel/DS tablet, futuro protegido, cuota LS permite memoria con aviso.
- `check.log`: tipos, ESLint sin advertencias, 24 contrastes y build aprobados. Primer intento de lint detectó escapes redundantes del harness, corregidos sin cambiar lógica; registro original conservado en `check-primer-intento.log`.

Sin errores JS en los recorridos finales. Se inspeccionaron visualmente composiciones de información/contacto, taxonomía tablet, estadísticas/reporte móvil y PDF de impresión de una página. No se repitieron flujos aprobados al cerrar documentación.

## Pendientes y errores conocidos

**Ninguna comprobación del cierre actual pendiente. No hay fallo de aplicación confirmado sin resolver.** No ejecutar otra batería por rutina. Cualquier cambio posterior necesita únicamente controles relacionados.

Limitaciones expresas: caja/cajero y A/B no existían y no se implementaron; sin backend, cobros/contacto reales o seguimiento en vivo. Una pestaña/navegador. LS/IDB sin transacción atómica: archivos compartidos/cancelados/huérfanos se conservan hasta reset; error de cuota da sesión temporal. Fotos originales de baja resolución y seis ilustraciones identificadas. No pruebas humanas, lector de pantalla, otros motores o dispositivos físicos; anchos principales probados, no revisión exhaustiva de cada intermedio. Impresión invocada y PDF headless inspeccionado; no diálogo OS ni impresora real.

## Documentación final y recuperación

[Inventario, comprobaciones A–M, guion y sílabo](MODULOS-0.7.0.md), [verificación](VERIFICACION.md), [DS](DESIGN-SYSTEM.md), [persistencia](PERSISTENCIA.md), [recursos](RECURSOS.md), [evidencia reproducible](module-verification/README.md). Copia previa: `docs/recovery/antes-modulos-0.7.0.zip`; copia final: `docs/recovery/modulos-0.7.0.zip`. Integridad y uso: `docs/recovery/RECUPERAR.md` y SHA256SUMS. No contienen datos personales del navegador.

## Retomar si se interrumpe

1. Leer este archivo y el informe final. **No reinicializar ni repetir pruebas aprobadas.** No queda desarrollo autorizado pendiente de esta etapa; esperar siguiente instrucción.
2. Para abrir y revisar, usar Node 20.19.4/npm 11.21.1. Servidores locales al cierre: desarrollo 127.0.0.1:5173 y preview 127.0.0.1:4173. Comprobar si siguen activos antes de levantar otro.
3. Si no están activos:

```bash
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
nvm use
npm run dev
```

Abrir **http://localhost:5173/** o puerto mostrado. Build local existente: `npm run preview` → **http://localhost:4173/**. No publica.

Si el shell no carga nvm: `export PATH=/home/hisok/.nvm/versions/node/v20.19.4/bin:$PATH`; npm instalado de la sesión puede ejecutarse mediante `node /home/hisok/.npm/_npx/676e59db29371ba5/node_modules/npm/bin/npm-cli.js <comando>`.

Solo si cambia código relacionado: `npm run typecheck`, `npm run lint`, `npm run check:contrast`, `npm run build` según cambio; no reconstruir dist con pruebas UI activas. Harness y variables Playwright externas descritos en `module-verification/README.md` (dependen de `/tmp/rosita-admin-tests`, no de package.json). Nada necesita instalarse para abrir la aplicación ya configurada.

Este directorio no es repositorio Git. Está fuera del cwd de la conversación (`truthlens-extension`): las herramientas de escritura requieren escalación justificada ya autorizada; no tocar el proyecto vecino. Recuperar ZIP siempre en carpeta separada, sin sobrescribir trabajo posterior. Conservar datos locales al inspeccionar versiones históricas; formatos futuros están protegidos.
