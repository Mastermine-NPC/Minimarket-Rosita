# Superficie líquida de Inicio

Los fondos de Arequipa y «Un día en Rosita» conservan sus elementos de vídeo, fuentes, encuadre cover y reproducción. `LiquidVideos` dibuja ambos fotogramas con WebGL nativo, sin nuevas dependencias. La frontera combina ondas continuas y perturbaciones del cursor; la refracción radial tiene una envolvente local y la perspectiva utiliza desplazamientos muy pequeños. Los sombreados se componen dentro del shader para evitar franjas rectas sobre el borde orgánico. El texto y los enlaces siguen siendo HTML independiente.

En escritorio se limita a unos 30 fotogramas por segundo; en dispositivos táctiles, unos 20, sin interacción hover. Resolución limitada a DPR 1.5 (1 en táctil) y 2048 píxeles por dimensión. Fuera de pantalla o con la pestaña oculta no se actualizan texturas. Los dos vídeos, una vez cargados, no se pausan por scroll. Los demás vídeos mantienen su política anterior.

Sin WebGL, con pérdida de contexto o errores del vídeo se recuperan los elementos originales y una máscara orgánica animada. Ahorro de datos y dispositivos de memoria reducida evitan el compositor. Con movimiento reducido, el borde es estático y se respeta la política existente de póster del componente de vídeo.

## Verificación

`npm run check`: TypeScript, ESLint, contraste y compilación correctos. Permanecen las advertencias existentes de tamaño de los paquetes de Three y MapLibre.

`verify.mjs`: Chrome real con WebGL por SwiftShader, escritorio 1440×900, tablet táctil 768×1024, móvil táctil 390×844 y movimiento reducido. Comprobados:

- Compositor WebGL activo y frontera revisada visualmente en capturas.
- Ambos vídeos continúan reproduciéndose al mover el cursor y desplazarse.
- Identidad de los nodos y fuentes conservada durante la interacción.
- Sin desbordamiento horizontal; enlace al catálogo operativo en todos los tamaños.
- Cambio de preferencia de movimiento en ejecución deja el borde estático.
- Pérdida deliberada del contexto y navegador con WebGL desactivado recuperan la alternativa.
- Sin errores JavaScript durante las pruebas.

Resultados en [results.json](results.json). Capturas: [escritorio](desktop-seam.png), [móvil](mobile-seam.png), [movimiento reducido](reduced-seam.png) y [sin WebGL](no-webgl.png). La prueba usa emulación táctil; no constituye una medición de rendimiento en un teléfono físico.
