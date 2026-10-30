# Evidencia de catálogo 0.9

Contextos aislados Chromium 156.0.8078.4/Playwright externo, datos ficticios. No se accedió al localStorage personal ni a sus archivos subidos. Base de código 63; fixture con un producto propio 64.

| Archivo                    | Cobertura                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| comparacion.json           | 24 anteriores y39 nuevos con valores reales de fuente, conflictos y cuentas por categoría                                                                                      |
| images.json                | 39 rutas anteriores/finales y hashes; 30 movimientos y 9 en sitio, bytes iguales                                                                                               |
| inspeccion-imagenes.png    | Mosaico visual revisado, no recurso de producto                                                                                                                                |
| core.mjs/core.json         | Exactitud/identidad, deduplicación verificada, código conflictivo, inventario, migración v1/v2/v3/v4/v7 y conservación/eliminación recuperable                                 |
| interfaz.mjs/interfaz.json | 39 fotos/nombres/códigos/marcas, filtro combinado y detalle/zoom a 1440/768/390; gestión/recarga/eliminar/restaurar/compra/seguimiento a 1440/390; migración real en navegador |
| fixture-v7.json            | Solo datos de prueba: carrito/pedido histórico de pasta, usuario/sesión, inventario propio y metadata de subida; no incluye blob personal                                      |
| recursos-previos.json      | Seis SVG y atlas anterior responden 200                                                                                                                                        |
| check.log                  | `npm run check`: tipos, ESLint,26 contrastes y compilación                                                                                                                     |

Las capturas corresponden a interfaces ejecutadas; la referencia Powerade 600ml/registro 500 ml se comunica en el detalle. No se reemplazaron vistas por imágenes. Datos temporales de pruebas (producto ROS-TEMP, edición 9.25/stock 15, compra Powerade 7.50) viven en contextos aislados, no en la semilla comercial.

## Reproducir únicamente ante cambio relacionado

Node 20.19.4/npm 11.21.1. `npm run check`; luego `npm run preview -- --host 127.0.0.1` y usar puerto indicado. Esta verificación usa 4174. No recompilar dist con pruebas UI activas.

```bash
export PLAYWRIGHT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/index.mjs
export PLAYWRIGHT_EXPECT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/test.mjs
export PLAYWRIGHT_BROWSERS_PATH=/tmp/rosita-admin-tests/browsers
node docs/catalog-verification/core.mjs
node docs/catalog-verification/interfaz.mjs
```

Herramientas externas no añadidas a dependencias frontend; pueden desaparecer al limpiar /tmp. Core usa ViteSSR y la fixture v4 conservada en subcategory-verification. Interfaz usa preview 4174; revisar su variable base si cambia el puerto. Las baterías aprobadas no necesitan repetirse por documentación. Limitaciones y decisiones en ../CATALOGO-0.9.0.md.
