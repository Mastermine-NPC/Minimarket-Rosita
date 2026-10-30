# Evidencias de administración 0.4.0

Chromium local automatizado; no participantes humanos ni conclusiones de usabilidad/A-B. Scripts y JSON conservados junto a capturas reales con perfiles ficticios.

- flujo.json: ciclo cliente → administrador → cliente y formularios/stock/productos a 1440/768/390.
- logica.json: permisos, validación, snapshots, idempotencia, movimientos, transiciones y migración.
- recuperacion.json: v3→v4, corrupción, futuro protegido, reset por perfil y almacenamiento bloqueado.
- layout.json: 73 comprobaciones de ruta/ancho; layout-mobile-final.json: 15 comprobaciones adicionales tras ajustar filtros a 390/450.
- contraste-renderizado.json: texto realmente renderizado de navegación, tablas, estados y formulario inválido. No certifica toda WCAG.
- regresion-cliente/flujo.json: compra y acceso previos; regresion.json: búsqueda/filtros/carrito; base-tecnica.json: páginas técnicas.
- check.log, contrast.json, installed.json y entorno.json: controles de código, tokens y entorno; no se instalaron nuevas dependencias.

Los fixtures de layout no son operaciones comerciales ni evidencia histórica. El registro migrado no fabrica movimientos/transiciones anteriores. Las capturas vista-* usan estado estable; las del flujo pueden incluir notificaciones.

Repetir desde la raíz, con Vite en 127.0.0.1:5173 y el runtime externo ya disponible:

```bash
PLAYWRIGHT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/index.mjs PLAYWRIGHT_EXPECT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/test.mjs PLAYWRIGHT_BROWSERS_PATH=/tmp/rosita-admin-tests/browsers node docs/admin-verification/flow.mjs
```

No se añade Playwright al frontend. Cada script usa perfiles independientes; no modifica el perfil personal. Para otro runtime, adaptar las variables a sus módulos/navegadores. Lógica y fixtures usan imports Vite /src; el recorrido UI también se puede ejecutar contra dist en un puerto local distinto. Evidencias anteriores se conservan en sus carpetas y no se presentan como pruebas actuales.

Adicionales: cuota.json verifica fallo de escritura sin alterar el registro previo; revalidacion-ui.json prueba una edición administrativa entre revisión y confirmación; compilado/flujo.json repite el ciclo completo contra dist en localhost:4173 a 390 px.
