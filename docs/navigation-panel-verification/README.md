# Navegación bajo demanda

El panel comienza cerrado. Solo la entrada del mouse en el indicador superior visible lo abre; el movimiento dentro del resto del header, el foco y el scroll no lo abren. El botón conserva la activación por teclado y el toque alterna apertura/cierre.

Al salir hay un margen de 650 ms para atravesar el indicador y el panel. Los temporizadores y listeners se limpian al cambiar sus dependencias y al desmontar. Los controles con foco y los diálogos abiertos conservan la interacción accesible.

Los enlaces internos cierran el panel antes de navegar, incluidos los enlaces del menú desplegable y los de la misma ruta. Atrás/Adelante también lo cierran. El estado está asociado a la navegación real del router, incluso mientras la transición cinematográfica mantiene visible la página anterior. Si el cursor permanece en la franja durante una navegación, debe salir y volver a entrar para abrirlo de nuevo.

No se cambiaron los estilos, contenido ni colores del panel.

## Validación

`npm run check`: TypeScript, ESLint, contraste y compilación.

`verify.mjs`: Chrome con animaciones activas, escritorio de 1440 × 1000 y pantalla táctil de 390 × 1000. Comprueba entrada inicial, recarga, activación, paso hacia el panel, cierre al salir y alternancia táctil. Recorre repetidamente todas las categorías, Inicio y Nosotros; comprueba cierre al pulsar y después de renderizar la ruta. También verifica que el foco y el scroll no abran el panel y que recargar con el cursor sobre la franja lo deje cerrado. En escritorio comprueba Atrás y Escape.

Los resultados y capturas se encuentran en `screenshots/`. La categoría de alimentos existente en el proyecto se llama «Consumibles» (`/categoria/consumibles`).

Para ejecutar en otro entorno, configurar `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXPECT_MODULE` y `CHROME_PATH` si Playwright/Chrome no están en las rutas predeterminadas; `BASE_URL` y `VERIFICATION_OUT` son opcionales.
