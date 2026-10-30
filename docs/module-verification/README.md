# Evidencia de módulos 0.7.0

29/10/2026. Chromium 156.0.8078.4 mediante Playwright externo en `/tmp/rosita-admin-tests`, sin añadirlo a dependencias de Rosita. Todos los datos de operaciones se generaron en contextos aislados; no son ventas o participantes reales.

| Script             | Resultado/evidencia                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| core.mjs           | core.json/core.log: migraciones v4/v5→6, colisión de cuenta, permisos/referencias/desactivación, errores almacenamiento y cálculos/CSV                                                |
| publico.mjs        | publico.json/public.log: menú/FAQ/contacto/perfil y teclado a 1440/768/390                                                                                                            |
| e2e.mjs            | e2e.json/e2e.log: cadena admin→upload→compra→stock→histórico→reportes→seguimiento a 1440/390                                                                                          |
| almacenamiento.mjs | almacenamiento.json/storage.log: errores formato/tamaño/lectura/cuota, fuente ausente, reset exclusivo con blob huérfano y recursos ajenos, tablet/DS, futuro y cuota de localStorage |
| cliente.mjs        | regresion-cliente/flujo.json y cliente.log: compra previa completa, acceso/salida/validaciones/cash-demo/doble clic/seguimiento a 3 anchos                                            |
| filtros.mjs        | interfaz.json/filtros.log: búsqueda/subcategoría/marca/precio/disponibilidad/orden/URL/retorno a 3 anchos                                                                             |
| zoom.mjs           | zoom-regresion/resultados.json y zoom.log: contain/teclado/foco/Escape/táctil/límites/movimiento reducido                                                                             |

Las capturas muestran composiciones reales. `producto-imagen-*` usa una imagen geométrica generada expresamente para probar subida/compresión. `reporte-top-*.csv` es una descarga real con comillas/comas y precio histórico; `reporte-*.pdf` es impresión headless inspeccionada. No son documentos de operaciones del negocio real. `tablet-*` y `sistema-componentes-768.png` prueban las vistas nuevas a 768 px.

## Reproducir solo si se cambia código relacionado

```bash
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
nvm use
npm run check
npm run preview -- --host 127.0.0.1
```

En otra terminal, con las herramientas externas disponibles:

```bash
export PLAYWRIGHT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/index.mjs
export PLAYWRIGHT_EXPECT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/test.mjs
export PLAYWRIGHT_BROWSERS_PATH=/tmp/rosita-admin-tests/browsers
export BASE_URL=http://127.0.0.1:4173
node docs/module-verification/core.mjs
```

Los scripts de navegador se ejecutan individualmente con `node docs/module-verification/<script>.mjs`; no reconstruir dist mientras corren. `filtros.mjs` admite `RESUME_PENDING=1` para omitir el primer tramo desktop ya aprobado; la última ejecución usó ese modo después de sustituir un selector del antiguo menú Categorías. Por defecto ejecuta el recorrido completo. La evidencia pública prueba el nuevo Menú separado.

Si `/tmp` se elimina, esas herramientas externas deben prepararse otra vez; no se promete que estén incluidas en package.json. Los scripts se formatearon y revisaron con ESLint. La evidencia histórica previa permanece sin cambios en sus carpetas.

Límites: Chromium y tamaños simulados; no usuarios, A/B, lector de pantalla, dispositivo físico, impresora o diálogo OS. Ventas presenciales/cajero no implementados y no atribuidos como fallos de una caja existente.
