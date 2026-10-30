# Evidencia de zoom 0.5.1

`resultados.json`: visor en Chromium compilado :4173; `adicionales.json`: ratón, resize, fuente fallida y pinza nativa. `regression/regresion.json`: tienda a tres anchos. Capturas visor-* revisadas visualmente. `check.log`: tipos, lint, contraste, build. `entorno.json`: comparación con versión previa. `pinza-diagnostico.txt`: control de la simulación, no fallo pendiente de la aplicación.

Playwright externo, sin añadir dependencia al frontend. Para repetir desde raíz, configura PLAYWRIGHT_MODULE hacia index.mjs y PLAYWRIGHT_BROWSERS_PATH en su instalación; `BASE_URL=http://127.0.0.1:4173 node docs/zoom-verification/visor.mjs`. `adicionales.mjs` usa :4173. `tienda.mjs` admite BASE_URL. Debe estar abierta la vista previa compilada.
