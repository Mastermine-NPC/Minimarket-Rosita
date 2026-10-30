# Evidencia actual 0.2.0

JSON y capturas proceden de Chromium local sobre Vite; no de sesiones con usuarios. `check.log` contiene tipos, lint, contraste y build. Los scripts .mjs son herramientas de verificación, no dependencias de la aplicación.

Se ejecutaron con Playwright externo preexistente en /tmp/rosita-admin-tests y Chromium en /tmp/rosita-admin-tests/browsers. Para repetir en este entorno desde la raíz:

```bash
PLAYWRIGHT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/index.mjs PLAYWRIGHT_BROWSERS_PATH=/tmp/rosita-admin-tests/browsers node docs/commerce-verification/funciones.mjs
```

Vite debe estar activo en 127.0.0.1:5173. Si se dispone de otro runtime, indicar su módulo en PLAYWRIGHT_MODULE y sus navegadores en PLAYWRIGHT_BROWSERS_PATH. Los scripts crean contextos de prueba independientes y no borran los datos de un perfil personal. La evidencia anterior en docs/verification corresponde a 0.1.0 y conserva rutas y esquema antiguos; no debe interpretarse como una prueba de esta etapa.
