# Rosita — rediseño editorial global

La tienda utiliza papel verde pálido, rosa y tinta botánica, objetos amplios y títulos editoriales. Se conservan Manrope/DM Sans y todos los datos comerciales. Referencia de movimiento y composición: https://unseen.co/. No se copia su marca ni sus recursos.

## Cambios visibles

- Navegación flotante desplegable: activador de 44 px, proximidad superior, hover, toque, teclado, Escape, ocultación diferida y scroll direccional. El panel se transforma y queda `inert` al cerrarse; nunca desplaza el contenido. Búsqueda enfocada, menú y carrito bloquean la ocultación.
- Fondo GLSL WebGL independiente de Three.js, a 20 fps y resolución limitada. Responde al puntero y al scroll; pausa con documento oculto, limpieza al desmontar y fondo CSS cuando no hay WebGL o se reduce movimiento.
- Catálogo con tarjetas de objetos, alternancia de superficies y composición escalonada; filtros en papel sólido, distintivos para descubrir productos 3D.
- Detalles con escenario amplio y columna comercial lateral; carrito, checkout, autenticación, cuenta y pedidos comparten nuevas superficies, tipografía y controles.
- Administración con marco claro, hoja de trabajo, métricas sin ornamentos, tablas y estados reales. Nueva consulta de clientes (`/admin/clientes`), búsqueda por nombre/correo y cantidad real de pedidos. No muestra verificadores ni credenciales almacenadas. Está dentro del mismo control de roles de AdminLayout.
- Se reutilizan GSAP/ScrollTrigger, Lenis y las transiciones previas. No se añadieron dependencias.

## Recursos 3D integrados

| Producto | Archivo local | Procedencia y licencia | Adaptación |
| --- | --- | --- | --- |
| ROS-002, Lay’s clásica | `/models/lays/classic.glb` | NKaap, https://sketchfab.com/3d-models/lays-bags-10-different-flavours-gameready-3b3a1f7654a5447eb25c9845152cfc89 — CC BY 4.0 https://creativecommons.org/licenses/by/4.0/ | Se aisló exclusivamente Classic de la colección suministrada por el usuario. Geometría, UV y mapas PBR originales conservados. Se eliminaron los nueve sabores y recursos no utilizados: 15.02 MB → 2.18 MB. |
| ROS-022, pelota infantil genérica | `/models/ball/beach-ball.glb` | the_ normalgamer, https://poly.pizza/m/4IwPTeOmq6c — CC BY 3.0 https://creativecommons.org/licenses/by/3.0/ | GLB original de pelota recreativa sin marca. Materiales PBR de color originales; el autor no aporta mapas de textura. 19.4 KB. |

Los créditos también aparecen en cada ficha. Ambos archivos contienen mallas reales. Cámara, orientación, iluminación, fondo y escala independientes en `product-models.ts`. Carga diferida y controles táctiles, arrastre, teclado, zoom y restablecimiento. Se conserva la alternativa del catálogo cuando falla el visor. El motor Three.js solo se descarga al aproximarse a un visor con GLB.

## Recursos pendientes, sin sustituciones

- ROS-001: se mantiene la fotografía y `modelUrl: null`; no se encontró un GLB verificable y descargable de la botella Coca-Cola **600 ml**. Las tres latas locales siguen excluidas.
- Sunsilk local no es el shampoo Sedal del catálogo. Nivea aftershave no es Protex ni ningún producto actual. No se alteraron productos ni marcas para utilizar esos archivos.
- Ferretería, tecnología y cuidado personal: quedan pendientes modelos de los artículos y presentaciones exactas. Se consultaron Sketchfab (cinta métrica: https://sketchfab.com/3d-models/tape-measure-lowpoly-39fc86a30e4745d080bbf69bcdc00cb2), CGTrader (cables USB-C) y Poly Pizza. Las coincidencias encontradas no verificaban presentación, exigían sesión/compra o no ofrecían descarga apropiada. No se adquirieron recursos comerciales ni se extrajeron archivos privados de visores.

## Validación

`npm run check` (TypeScript, ESLint, contraste y compilación). Chrome/Playwright en 1440, 768 y 390 px: inicio, catálogo, categoría, Lay’s, pelota, Coca-Cola, carrito, login y administración. Pruebas de header y compra completa en scripts de esta carpeta. Las capturas y resultados se copian aquí tras la revisión. Aviso de compilación: chunk diferido del motor 3D de aproximadamente 1.05 MB sin comprimir, no solicitado por catálogo ni Coca-Cola.

Diseño administrativo: dirección «Framed sheet», seed 310875998, conservando tipografía y paleta. Datos: usuarios, productos, existencias y pedidos existentes del estado local; los totales se calculan desde sus filas. Su pregunta principal sigue siendo qué pedidos y existencias requieren atención. El elemento propio de Rosita es la relación directa entre fotografía del producto, existencias y pedido.

## Revisión visual y límites del inspector

Se revisaron capturas de escritorio, tablet y móvil y se corrigieron dos problemas concretos: título del producto bajo el visor en móvil y scroll heredado al entrar a administración. El título ahora aparece entre 211 y 264 px desde el borde superior. Se verificaron scroll ascendente/descendente del header y búsqueda de clientes a las tres anchuras.

El inspector de páginas pasa con excepciones explícitas para metadatos transaccionales compactos (`body-size`, `small-text`), las tres fotografías de productos relacionados disponibles (`few-pictures`), bordes de controles, indicadores de categoría y la distorsión cromática solicitada (`gradient`). No se añaden fotos ni vídeo ajenos para satisfacer una cuota: el producto 3D es la imagen principal. Persisten advertencias de diversidad tipográfica heredada, composición asimétrica y la marca fija del activador sobre imágenes durante scroll; esta última es el comportamiento solicitado. Los datos secundarios mantienen contraste AA; la descripción comercial usa 16 px y tinta más oscura. La ausencia de vídeo en la ficha evita competir con el modelo interactivo.

Las capturas de revisión del checkout pueden mostrar una transición del header en curso durante un scroll automatizado; las pruebas específicas esperan el fin de la animación y comprueban su estado final. Los scripts de compra originales están en `docs/global-cinema-verification/purchase.mjs` y se ejecutaron contra el puerto 4190.

Administración pasó también el inspector en modo app tras reducir el título, retirar el banner genérico y simplificar las etiquetas. Quedan advertencias de alineación y tamaños en tablas analíticas heredadas; no afectan a cálculos ni a los permisos. Evaluación visual propia: diseño 7/10, usabilidad 8/10, creatividad 7/10, contenido 8/10. La mejora más clara es la jerarquía objeto/información comercial y el título móvil antes del visor. El límite visual principal sigue siendo la calidad desigual de las fotos originales y la ausencia de GLB exactos para más categorías.

La pelota ROS-022 no dispone todavía de fotografía comercial: si falla su GLB se muestra el aviso original de imagen pendiente del catálogo. No se generó ni se atribuyó una fotografía inexistente. Coca-Cola y Lay’s conservan sus fotografías originales como alternativa.

Última comprobación del carrito no vacío: 1440/768/390 px, importe S/ 15.50 del producto seleccionado, botón de checkout con colores computados `#183d30` sobre `#f4b8c8`, navegación a checkout y menú con las seis categorías. Resultado: `cart-results.log`. El menú lateral mantiene categorías y ubicación accesibles cuando la fila de categorías del header se oculta en móvil.
