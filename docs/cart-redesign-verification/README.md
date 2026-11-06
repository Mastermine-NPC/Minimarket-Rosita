# Carrito Rosita — página y panel lateral

## Resultado

Se rediseñaron `/carrito` y el panel lateral que reutiliza `CartContent`. La nueva composición organiza productos y resumen en dos columnas de escritorio, con filas adaptadas a tablet/móvil. El resumen se sitúa después de los productos en pantallas pequeñas y tiene acceso directo desde «Ver resumen». El panel lateral tiene lista desplazable y un pie de acciones que **reserva su espacio** mediante flex: el importe y checkout permanecen accesibles sin tapar los productos.

Cada fila presenta imagen contenida y consistente, categoría enlazada, marca, nombre completo enlazado al detalle, presentación, precio unitario, disponibilidad y stock reales, cantidad, subtotal y eliminación. Las ilustraciones existentes mantienen su indicación junto al producto para que la etiqueta no cubra la imagen pequeña. Las fotografías pendientes conservan su fallback.

Se incorporaron progreso de compra, mensajes de actualización, entrada/eliminación de filas con Motion, actualización breve de importes mediante opacity y foco de retorno al listado o estado vacío tras eliminar. No hay cargas artificiales ni temporizadores para modificar cantidades. `prefers-reduced-motion` elimina los desplazamientos y transiciones.

El estado vacío contiene una ilustración SVG nativa en verde/rosa, texto explicativo, acceso al catálogo y enlace a información de entregas en la vista completa. No necesita recursos remotos ni canvas.

## Lógica conservada

Sin cambios en `useCart`, `priceCart`, el reducer, `QuantitySelector`, almacenamiento, esquemas, autenticación, checkout, métodos de pago ni endpoints. Todos los importes vienen del mismo cálculo existente en céntimos y del formato monetario compartido.

- Incremento/decremento: mismos límites mínimo 1 y máximo de stock, con botones disabled.
- Eliminación: usa `useCart.remove`, con su toast existente y mensaje local.
- Vaciar: usa `useCart.clear`, con confirmación/cancelación Radix en página y panel; no modifica inventario ni pedidos.
- Persistencia: se conserva la implementación local existente y la recuperación al recargar.
- Stock cambiado durante la sesión: se bloquea la continuación y se ofrece «Ajustar a…» cuando hay stock válido. Usa el mismo `cart/set` existente.
- Stock cambiado al recargar: sigue funcionando la reparación automática **ya existente** de `readRositaState`; no se reemplazó por la nueva UI.
- Producto desactivado/agotado: disponibilidad explícita, sin controles que puedan aumentarlo y con opción de quitarlo.
- Selección inválida: el resumen indica «Por revisar» y bloquea checkout en lugar de mostrar un total utilizable.

La selección de entrega y su tarifa pertenecen al checkout. El carrito muestra subtotal y total de productos e informa que el envío se define al continuar. No se inventaron descuentos, impuestos, promociones ni un total final con transporte. Tampoco se añadieron recomendaciones de complementariedad sin una relación explícita entre productos.

Los productos y sus imágenes son los registros actuales del catálogo. La prueba usa Coca-Cola en lata y Jabón Protex avena, además de ocho productos seleccionados mediante las tarjetas existentes para el recorrido largo. No se precargaron productos ni carritos nuevos en el código comercial.

## Archivos

Modificados:

- `src/pages/cart-page.tsx`: cabecera, acciones, conteo y progreso.
- `src/features/carrito/cart-content.tsx`: filas, información, mensajes, resumen y estado vacío compartidos.
- `src/features/carrito/cart-sheet.tsx`: descripción del panel y pie de acciones separado del scroll.

Creados:

- `src/features/carrito/clear-cart-button.tsx`: confirmación compartida para vaciar.
- `src/features/carrito/cart-empty-art.tsx`: ilustración SVG local original.
- `src/features/carrito/cart-panel-footer.tsx`: importe y acciones del panel, leyendo el mismo hook del carrito.
- `src/styles/cart-experience.css`: estilos limitados a las nuevas clases del carrito.
- `scripts/verify-cart-redesign.mjs`: recorrido de navegador.
- Esta carpeta: documentación y evidencia.

No se añadieron dependencias. Se reutilizaron Motion, Lucide, Radix y los componentes de botón, imagen y cantidad existentes. No se rediseñaron catálogo, tarjetas comerciales, modelos 3D, navegación, login ni checkout. Se conservaron los cambios pendientes de las tareas anteriores.

## Validación

- `npm run check`: TypeScript, ESLint, contraste y build de producción aprobados. Se mantienen advertencias de tamaño de chunks existentes de Three/MapLibre.
- `npm test`: operaciones, catálogo, Halloween, flujo de estados de pedidos, teléfono internacional y métricas de UI Lab aprobados. Se restauraron los informes ajenos que escribe esa suite para mantener el alcance del cambio.
- Chrome/Playwright: página y panel en 1440×1000, 1024×768, 768×1024, 390×844 y 320×740; sin overflow horizontal.
- Suma independiente en el test de precios unitarios × cantidades: subtotales por línea y total de productos consistentes. Ejemplo técnico: dos latas de S/ 4.50 y un jabón de S/ 2.50 = S/ 11.50 en página, panel y checkout.
- Añadir, incrementar, decrementar, mínimo 1, máximo real de stock y botones disabled: aprobados.
- Persistencia tras recarga, quitar individualmente, vaciar/cancelar/confirmar, confirmación dentro del panel y estado vacío en ambas vistas: aprobados.
- Acceso al detalle y paso a checkout con identificación de cliente y retorno a checkout: aprobados, con el mismo subtotal.
- Carrito largo con ocho productos, resumen sticky, altura de pantalla de 500 px, botón accesible mediante scroll interno y detención antes del footer: aprobados.
- Conflicto de stock durante la sesión: se inició sesión con el administrador existente y se registró una corrección real desde el módulo de inventario en el perfil técnico; navegación SPA de vuelta a la tienda, panel bloqueado, carrito bloqueado y ajuste a la cantidad disponible aprobados. Corregir el carrito no volvió a modificar inventario, movimientos ni pedidos.
- Reparación automática al recargar y producto desactivado: aprobados con snapshots técnicos en el mismo perfil efímero.
- Cero excepciones de página en el recorrido.

Las pruebas de inventario y cuentas se ejecutan en un contexto de Chrome aislado. No afectan la sesión ni el almacenamiento del navegador del usuario. Las reducciones de stock del escenario administrativo son acciones deliberadas de la prueba, no cambios efectuados por el carrito.

El script admite `BASE_URL`, `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXPECT_MODULE`, `CHROME_PATH`, `VERIFICATION_OUT`. En este entorno se utilizó Chrome Windows y el Playwright del runtime de Codex; no se instaló Playwright en el proyecto.

## Revisión visual y límites

Se abrieron las dos referencias del usuario y se capturó un antes propio de página/panel. Se revisaron las imágenes de escritorio, tablet y móvil, incluido 320 px. La dirección de la skill fue **Framed sheet**, semilla **1600464199**, manteniendo paleta y fuentes; se adapta a la composición de compra con el marco comercial existente.

Se corrigieron dos puntos durante la revisión: checkout del panel quedaba bajo el pliegue al ampliar la información, por lo que pasó al pie con espacio reservado; los metadatos móviles se ampliaron a 13 px para mejorar lectura. La ilustración del vacío es original y esquemática; no se presenta como fotografía de productos.

El inspector real de `/carrito` finalizó con **0 FAIL, 2 WARN**. Las advertencias se refieren al título de 62 px en escritorio (hereda el lenguaje comercial y baja a 38/40 px) y al tono crema de superficies compartidas existentes. El lint de los siete archivos del carrito terminó con **0 FAIL, 0 WARN**.

El inspector utiliza dos productos reales cargados en un perfil técnico mediante el estado existente. Solo se adaptó su preparación local; no se alteraron sus mediciones. Se justificaron las excepciones `covered-text` (texto aria-hidden de la cortina compartida, ya recortado intencionadamente) y `button-fx` (indicador del header existente). No se cambiaron esos componentes para cumplir preferencias de la skill.

Autoevaluación visual interna: diseño 7.7, usabilidad 8, creatividad 6.7, contenido 8; ponderación 40/30/20/10 ≈ **7.6/10**. No es un estudio de participantes ni una evaluación externa. La verificación responsive corresponde a emulación de Chrome, no a todos los dispositivos físicos. El carrito conserva la naturaleza local y simulada del prototipo.

## Evidencia

- Antes: [página](before/page.png), [panel](before/panel.png).
- Página: [escritorio](page-1440.png), [tablet](page-768.png), [móvil](page-390.png), [320 px](page-320.png).
- Panel: [escritorio](panel-1440.png), [móvil](panel-390.png), [320 px](panel-320.png).
- Vacío: [página](empty-1440.png), [móvil](empty-390.png), [panel móvil](empty-panel-390.png).
- [Lista larga y sticky](sticky-long-cart.png), [viewport de poca altura](short-viewport.png).
- [Resultados del navegador](results.json), [log](browser.txt), [check](check.txt), [regresiones](regression.txt).
- [Informe visual](inspection/report.json), [log del inspector](inspection.txt), [lint visual](taste-lint.txt).
