# Evidencia de 0.3.0

Pruebas automatizadas de funcionamiento en Chromium 156 local; no investigación con usuarios ni resultados A/B. Se usó Playwright externo preexistente; no se añadió a las dependencias del frontend.

- flujo.json: compra completa a 1440/768/390 px.
- logica.json: transacción pura, idempotencia, stock/precio y migración.
- recuperacion.json: recuperación en UI, precio cambiado y compra temporal sin almacenamiento.
- casos-limite.json: salida durante procesamiento, Plin, nombre largo y stock reducido.
- regresion.json: catálogo y carrito anteriores, teclado/modales y reduced-motion.
- base-tecnica.json: páginas técnicas conservadas.
- layout.json: 110 casos de distribución a diez anchos.
- contraste-renderizado.json: 394 muestras de texto en 12 combinaciones de ruta/ancho, incluidas validaciones; no certifica todo WCAG.
- compilado/flujo.json: recorrido UI completo contra dist en localhost:4173 a 390 px.
- contrast.json, check.log: pares semánticos, tipos, ESLint y compilación.
- vistas PNG: capturas estables con datos ficticios. Los IDs de layout son fixtures controlados, no pedidos comerciales.

Repetir desde la raíz con Vite activo en 127.0.0.1:5173:

```bash
PLAYWRIGHT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/index.mjs PLAYWRIGHT_EXPECT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/test.mjs PLAYWRIGHT_BROWSERS_PATH=/tmp/rosita-admin-tests/browsers node docs/order-verification/flow.mjs
```

Los mismos módulos/variables sirven a los otros .mjs. Las pruebas usan perfiles/contextos independientes. Las fixtures se guardan en esos contextos de prueba; no se modifica el perfil personal. Para otro entorno hay que indicar su runtime y navegadores. Los scripts de lógica usan imports Vite /src y no funcionan directamente contra dist; el recorrido UI también se comprueba contra la compilación local.
