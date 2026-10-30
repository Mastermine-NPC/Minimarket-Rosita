# Evidencia del inicio 0.5.0

`inicio-pruebas.json` y `adicionales.json`: navegador sobre compilación local :4173; movimientos, imágenes, puntero, táctil y navegación. `paneles.json`: rueda independiente. `regression`: tienda/base/cliente y administración, sin reemplazar evidencia histórica de admin-verification. `check.log`: tipos, lint, contraste, build. `entorno.json`: comparación con copia previa. `references`: observaciones externas y capturas, no assets de la tienda.

`layout-shift-diagnostico.txt`: fallo inicial 0.391 atribuido al pie; `layout-shift-final.txt` y muestra adicional: repetición tras reservar espacio, sin eventos en esas sesiones. `video/recorrido.webm`: grabación de interacciones sobre la compilación, no filmación de participantes.

Playwright es herramienta externa. Para repetir, instala Playwright en un entorno de pruebas separado y exporta `PLAYWRIGHT_MODULE` (ruta a index.mjs), `PLAYWRIGHT_EXPECT_MODULE` (ruta a test.mjs para harnesses heredados) y `PLAYWRIGHT_BROWSERS_PATH`. Desde la raíz: `BASE_URL=http://127.0.0.1:4173 node docs/home-verification/inicio.mjs`. Los scripts adicionales/CLS/paneles usan :4173 por defecto; los de regresión admiten BASE_URL. No requiere añadir Playwright al frontend.
