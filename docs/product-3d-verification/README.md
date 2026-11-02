# Coca-Cola 600 ml · presentación y visor preparado

La ficha `/producto/ROS-001` muestra **solo la fotografía existente de la botella**, como indicó el usuario después de inspeccionar el recurso disponible. El visor no se activa ni descarga Three.js o GLB mientras `cocaColaBottle.modelUrl` sea `null`.

## Recurso inspeccionado y decisión

`public/images/video/archivos-glb/coca_cola_cans.glb` es un modelo auténtico de **tres latas**, no de una botella de 600 ml. Tiene 12.950.508 bytes, tres mallas y seis texturas PNG de 2048 × 2048. Sus metadatos declaran:

- Título: Coca cola cans.
- Autor: [Safat_Rules](https://sketchfab.com/Safat_Rules).
- Fuente: [Sketchfab](https://sketchfab.com/3d-models/coca-cola-cans-fe5ba57722a74dba8d19f513e4672e1c).
- Licencia declarada: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

El usuario eligió expresamente «Solo foto de la botella y visor preparado hasta disponer de su GLB». Las latas se utilizaron exclusivamente en un banco de prueba técnico fuera de las rutas y del build de la tienda; nunca se presentan como el artículo vendido. No se inventó una ruta de botella ni se simuló un producto 3D con una imagen.

## Archivos y responsabilidades

- `src/pages/product-page.tsx`: integra la presentación únicamente para ROS-001. Los demás productos conservan su visor de fotos.
- `src/features/product-3d/product-models.ts`: configuración de Coca-Cola con `modelUrl: null` y aviso fotográfico explícito.
- `types.ts`: parámetros de cámara, materiales, luces, fondo, shader, controles, animación y créditos.
- `product-presentation.tsx`: carga diferida del motor, observación de visibilidad, foto alternativa, límite de errores, estado de carga y reintento.
- `product-model-canvas.tsx`: Three.js / React Three Fiber / Drei, GLTFLoader, OrbitControls, cámara en perspectiva, estudio procedural, sombras y controles accesibles.
- `shader-backdrop.tsx`: GLSL con desplazamiento de coordenadas y ondas radiales amortiguadas alrededor del producto; tiempo y cursor son uniforms. No distorsiona los textos ni la sección comercial.
- `model-resources.ts`: normalización de escala y centro, conservación de UVs y mapas PBR, overrides opcionales, reducción de bitmaps grandes en dispositivos pequeños y liberación de geometrías, materiales, texturas e ImageBitmaps.
- `src/styles/product-3d.css`: composición responsive, foto, controles del visor y cursor indicativo limitado al área WebGL.

Dependencias añadidas: `three`, `@react-three/fiber`, `@react-three/drei` y `@types/three` para desarrollo. Se conservan GSAP, ScrollTrigger, Lenis y Motion existentes. El motor se importa con `React.lazy`; el chunk WebGL es grande (aprox. 1 MB minificado), pero no se solicita en la ficha mientras no haya un modelo configurado. No se agregaron motores de scroll adicionales.

## Funciones implementadas en el motor

- GLB real con geometría, materiales y texturas originales, normalización de dimensiones y cámara configurable.
- Iluminación de estudio con Lightformer/Environment procedural; no descarga un HDR remoto.
- Rotación azimutal libre y polar limitada, zoom con distancias mínima/máxima, arrastre, controles táctiles y restablecimiento.
- Botones de giro, inclinación y zoom; teclado con flechas, +, − e Inicio; foco visible y ayuda textual.
- Entrada de cámara y modelo con GSAP. La interacción cancela la entrada para evitar competir con el usuario.
- Parallax de la escena y fondo GLSL. La columna de compra no se mueve con el cursor.
- Cursor indicativo solo con mouse; conserva el cursor nativo y se oculta con tacto o movimiento reducido.
- Render por demanda, invalidación limitada a 30 fps para el fondo animado, DPR máximo 1.5 y pausa de render animado fuera del área activa o con documento oculto.
- Movimiento reducido elimina la entrada, el parallax y el tiempo del shader, conservando los controles manuales.
- Fallo de GLB o WebGL recupera la foto sin afectar precio, cantidad o carrito. Reintento de carga cuando falla el recurso.
- Limpieza de listeners, tweens, peticiones, geometrías, mapas y contexto mediante los ciclos de vida del motor.

## Datos comerciales

La ficha usa `useCatalog`, `useTaxonomy` y `useCart` existentes. La semilla real de ROS-001 declara precio S/ 3.50, presentación Botella · 600 ml y stock 24; estos valores no se duplicaron como datos comerciales en el visor. Se conserva `remaining = stock - cart[id]` y el selector existente. Agregar al carrito no descuenta inventario; la lógica actual lo descuenta al confirmar el pedido.

## Validación

`npm run check` (TypeScript, ESLint, contraste y build) y `npm run build`.

El banco de prueba `fixture.html` usa el modelo de latas con su atribución, separado del producto. No se importa desde la aplicación ni aparece como ruta comercial. Para compilarlo y servirlo aisladamente:

```sh
npm exec vite -- build --config docs/product-3d-verification/vite.fixture.config.ts
npm exec vite -- preview --config docs/product-3d-verification/vite.fixture.config.ts --host 127.0.0.1 --port 4181
```

`verify.mjs` admite `BASE_URL`, `FIXTURE_URL`, `PLAYWRIGHT_MODULE`, `CHROME_PATH` y `VERIFICATION_OUT`. Usa Playwright externo, sin añadirlo a la aplicación. Comprueba la ficha a 1440, 768 y 390 px, ausencia de Canvas y solicitudes GLB, precio del catálogo, límite de 24, persistencia del carrito, render real, controles, teclado, movimiento reducido, fallo de modelo, reintento y ausencia de WebGL. La prueba de WebGL en Chrome headless utiliza SwiftShader; no equivale a una medición de rendimiento en todos los teléfonos.

Referencias técnicas: [render por demanda de R3F](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [controles de Drei](https://drei.docs.pmnd.rs/controls/introduction) y [Three.js](https://threejs.org/docs/).

## Pendiente para activar la botella

Falta un GLB correcto de la botella Coca-Cola de 600 ml. Cuando exista, debe inspeccionarse su geometría, orientación, UVs, etiqueta, materiales PET/transmisión y licencia; después se configura su ruta real en `cocaColaBottle.modelUrl` y se ajustan cámara y materiales con el recurso auténtico. No se afirma que la botella 3D, su transparencia o sus reflejos estén validados sin ese archivo.

La ficha actual tiene fotografía y compra funcionales. Los efectos WebGL y los controles tridimensionales están implementados y comprobados únicamente en el banco técnico, pendientes de activación con el modelo adecuado.

Revisión visual final: se comprobó la ficha en los tres tamaños y la prueba técnica con distintas orientaciones. Se aislaron todos los selectores nuevos con el prefijo `product-3d-` para conservar el diseño de las tarjetas relacionadas. El fondo del shader se dibuja en coordenadas de pantalla y permanece visible al orbitar la cámara. Ver `screenshots/` y `results.json`. Las siete comprobaciones del verificador terminaron sin errores JavaScript ni errores de compilación de shaders en las escenas válidas.
