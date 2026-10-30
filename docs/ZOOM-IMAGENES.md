# Zoom de imágenes · Rosita 0.5.1 / DS 2.3.1

Implementación sobre el proyecto existente, sin backend, despliegue ni publicación. No había capturas accesibles en el mensaje: se siguió la descripción escrita y se verificó el resultado propio en navegador; no se afirma una comparación visual con adjuntos no recibidos.

## Antes y después

El detalle usaba ProductImage: fondo de atlas para 18 fotos e img para ilustraciones, sin visor. Ahora usa ProductImageZoom con ProductArtwork en ese mismo módulo; las tarjetas/carrusel conservan su componente y comportamiento anterior. Se reutilizan Button, Dialog/Radix, hooks de puntero/movimiento y tokens del sistema.

Desktop: al pasar por la foto visible se amplía dentro del marco, con origen que sigue el puntero. Geometría contain considera ambos márgenes y el límite por resolución; en el margen vuelve a normal. Al salir restaura. Imagen y botón Ampliar imagen abren el modal.

Modal: acercar/alejar/restablecer/cerrar visibles, salida Escape, foco inicial y devolución al origen. Pan por ratón, un dedo y flechas; límites de tamaño y actualización al cambiar viewport. Inicio restablece. Se bloquea únicamente el cierre por clic exterior para impedir un cierre accidental después del arrastre. No hay zoom por rueda ni alternancia al hacer clic en el lienzo.

Móvil: toque abre, controles amplían la imagen y arrastre desplaza. La pinza **nativa del navegador** queda disponible, incluso después de ampliar; no se sustituye por una pinza adicional de producto. El zoom de los controles afecta solo la imagen. No se limita viewport ni se cambia la página mediante transform. No hay scroll artificial: los paneles conservan scroll nativo independiente.

Sin hover en táctil o movimiento reducido; zoom manual y pan son instantáneos. El diálogo/área usa cursor nativo. Los datos actuales tienen una imagen por producto y ninguna miniatura: cambiar de producto utiliza el recurso correcto y reinicia escala/desplazamiento; no se inventa un carrusel de fotografías.

## Resolución y errores

Atlas 900×1800, cada celda 300×300. No se dispone de originales mayores. No se generan detalles: máximo 150 % y tamaño base limitado a 125 % de la resolución efectiva. Puede persistir suavidad inherente a la fuente. El porcentaje es relativo al encuadre contenido. Las ilustraciones vectoriales identificadas admiten hasta 300 %. La geometría admite proporciones distintas si se incorporan recursos reales posteriores, conservando contain.

Fallo de recurso: aviso, ampliación deshabilitada y compra disponible. Si falla dentro del modal se muestra mensaje, manteniendo Cerrar. No se guarda contenido de imagen en localStorage. No hay nuevas dependencias ni cambios en identificadores, reducer, precio, stock o totales.

## Comprobaciones

Chromium 156.0.8078.4 sobre compilación local :4173. Node 20.19.4, npm 11.21.1. Scripts y capturas: `zoom-verification`. Compilación, TypeScript, ESLint y contraste ejecutados con `npm run check`.

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Hover, coordenadas contain y salida | Verificado | Punto normalizado 0.25/0.75; margen excluido; transform restaura |
| Recorte y proporción | Verificado visualmente | SVG con clipPath y viewBox; revisión de capturas sin celdas vecinas |
| Clic, toque, botón, teclado | Verificado | `resultados.json`; Enter abre, foco inicial en Cerrar |
| Escape / Cerrar y foco exacto | Verificado | Se probó origen imagen y origen botón |
| Acercar, alejar, límites y reset | Verificado | 150 % bitmap, 300 % SVG; output y botones deshabilitados |
| Pan por flechas, ratón y toque | Verificado | Límites calculados; gestos táctiles CDP y reset a 0,0 |
| Arrastre fuera / clic exterior / resize | Verificado | `adicionales.json`; modal permanece abierto y pan se vuelve a limitar |
| Pinza nativa | Verificado en emulación Chromium | Dos contactos CDP; visualViewport.scale aumenta sin cerrar modal. `synthesizePinchGesture` no producía efecto tampoco en página simple; se usaron touchStart/move/end y se conservó el diagnóstico |
| Movimiento reducido | Verificado | Sin hover ni animación modal; controles operativos |
| Fuente fallida | Verificado | Abort de atlas: aviso y ampliación deshabilitada, Agregar disponible |
| Cambio de imagen/producto | Verificado en alcance actual | ROS-001 -> ROS-002 cambia celda; ROS-019 usa SVG correcto y escala propia. Miniaturas: no aplicable, no existen |
| 1440 / 768 / 390 px | Verificado | Controles >=44 px visibles; sin scroll horizontal accidental; capturas revisadas |
| Tienda, detalle, compra y paneles | Verificado | Regresión completa a tres anchos: búsqueda/filtros/orden, categorías, carrito/stock/totales, enlaces, foco/Escape y sistema de diseño |
| Navegadores distintos y móvil físico | No comprobado | No se afirma compatibilidad universal de gestos o lector de pantalla |

La regresión comprueba flujo de tienda relacionado; no se volvió a ejecutar toda administración/checkout, cuyas reglas no se modificaron. Sus verificaciones anteriores se conservan. No se midieron FPS ni se inventaron participantes o pruebas de usabilidad. Los abortos de red de la prueba de error son intencionales; recorridos aprobados sin excepciones JavaScript.

Se corrigieron durante la revisión: fuga de celdas vecinas por letterboxing SVG (clipPath), ampliación base excesiva de fotos pequeñas y notificación de error inconsistente de SVG image (comprobación HTMLImageElement con cleanup). No se dan estos intentos previos por pruebas finales aprobadas.

## Abrir y comprobar

Ejecuta `nvm use` y `npm run dev` desde la raíz; abre **http://localhost:5173/producto/ROS-001**. Pasa el cursor, pulsa Ampliar imagen, prueba controles/flechas y Escape. En móvil toca y arrastra después de acercar. La compilación comprobada está en **http://localhost:4173/producto/ROS-001** mientras el servidor de preview esté abierto; `npm run preview` la inicia tras build, sin publicar.

Copias: `recovery/antes-zoom-0.5.1.zip` conserva código/assets/config previos y `recovery/zoom-0.5.1.zip` el resultado; snapshots completos anteriores siguen disponibles. SHA256SUMS comprueba integridad. No contienen los datos de localStorage del navegador.
