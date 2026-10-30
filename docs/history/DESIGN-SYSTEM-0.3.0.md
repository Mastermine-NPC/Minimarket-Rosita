# Rosita Design System 2.1.0

La versión 2.0.0 reemplaza la identidad turquesa de la base 1.x. La aplicación es 0.3.0; la versión del sistema se mantiene separada. Biblioteca interactiva: `/sistema-diseno`, pestañas Fundamentos, Componentes y Reglas de uso.

## Fundamentos y uso

Tokens en `src/styles/tokens.css`: fondo #F7F8F5, superficie blanca, marca/acciones #145A46, texto #17231D, secundario #526159, rosa #F4B8C8 y verde suave #E8F1E9. El rosa acompaña identidad y una promoción; no sustituye el color de error. Error #B42332, éxito #216744, advertencia #875006 y foco #245AC9 tienen funciones independientes.

Texto blanco sobre verde principal: 8.14:1; texto oscuro sobre rosa: 9.68:1. Bordes de campo #718276 contrastan 4.07:1 sobre blanco. El script `npm run check:contrast` comprueba 18 pares, 4.5:1 para texto normal y 3:1 para foco/bordes. Un resultado de tokens no equivale a una auditoría WCAG completa.

Manrope 600–800 para títulos; DM Sans 400–700 para textos, controles y tablas. Dos variables WOFF2 latinas locales, `font-display: swap`, licencias OFL adjuntas. Precios y totales usan cifras tabulares. El título del inicio es expresivo; títulos de catálogo y producto priorizan lectura y tareas.

Espaciado base de 4 px, pasos 8/12/16/24/32/48/64/80; radios 10 px controles, 20 tarjetas, 28 bloques destacados. Sombras discretas; bordes claros delimitan superficies, bordes de campo más fuertes señalan interacción. Controles principales con altura táctil mínima de 44 px.

Movimiento: control 150 ms, panel 240 ms, título 280 ms, búsqueda 200 ms, imagen/promoción hasta 600 ms, curva cubic-bezier(0.2,0,0,1). MotionConfig y CSS respetan movimiento reducido. La promoción mantiene contenido y CTA visibles; anima imágenes, no una sección completa inicialmente transparente.

## Componentes que se usan

- Átomos: Button, Input, Label, Badge e iconos Lucide; estados hover, pressed, foco, disabled y carga cuando procede.
- Moléculas: QuantitySelector con límites, ProductPrice con precio de prueba anterior, StoreSearch y campos RHF/Zod con error textual asociado.
- Organismos: ProductCard, CatalogFilters, StoreHeader, StoreFooter y CartContent. El contenido del carrito se comparte entre Sheet y página.
- Plantilla: AppLayout comparte estructura, mensajes de persistencia y panel de carrito.
- Páginas: inicio, catálogo/categorías, detalle y carrito componen datos sin duplicar lógica comercial.

Dialog y Sheet usan Radix para foco, Escape y retorno al control de origen. Tabs/Table documentan el sistema. Alertas, Skeleton y estados vacíos tienen muestras; no se añaden cargas ficticias a productos locales. Las seis categorías reutilizan controles y estructura con acentos suaves, sin seis temas independientes.

Un **UI Kit** reúne piezas visuales. Este **Design System** añade a esas piezas tokens, comportamiento, accesibilidad, reglas de contenido/datos, composición, versión y documentación. Atomic Design ayuda a decidir qué compartir; no obliga a extraer cada contenedor.

## Composición y Gestalt

Proximidad: presentación/precio/acción juntos y error junto al campo. Similitud: misma tarjeta en las seis categorías. Región común: filtros, tarjeta y resumen delimitan tareas. Figura-fondo: blanco sobre fondo cálido y contraste en acciones. Continuidad: URL conserva filtros/búsqueda al volver del detalle. Simplicidad: un catálogo y un carrito canónicos. Jerarquía complementaria: fotografía/título en inicio y precio/acción en compra.

## Iteración y límites

Se partió de la base técnica recuperable y de pantallas actuales del capítulo 5; se reorganizó el inicio para mostrar categorías y productos antes de la promoción secundaria. Se corrigió un hueco de animación y se ajustaron nombres/presentaciones a fotografías existentes. No se presentan bocetos, pruebas con participantes ni decisiones actuales como evidencia histórica.

## Cambios 2.1.0 · acceso y pedidos

Se conservan paleta, tipografía, fuentes y fundamentos 2.0.0. Se añaden PasswordField (molécula con mostrar/ocultar, aria-pressed y campo etiquetado), CustomerGate (organismo de acceso contextual), plantilla compartida AuthPage/AuthForm y componentes DeliveryForm, PaymentForm, OrderSummary y ReviewStep. CheckoutPage compone tres pasos; OrderPage reutiliza datos para detalle, confirmación y seguimiento. No se crean variantes por cada producto o estado responsive.

Los formularios muestran errores junto al campo con aria-describedby y foco en el primer inválido. El resumen de error de revalidación recibe foco y role alert. El indicador de pasos usa aria-current; el título del nuevo paso recibe foco programático sin borde de control. Los controles conservan foco visible por teclado. El control de mostrar/ocultar contraseña no envía el formulario. Los textos identifican datos y pagos ficticios.

Transiciones de pasos: 150 ms y 6 px, desactivadas con movimiento reducido. Carga visual: token --motion-loading 800 ms para giro del indicador, también desactivado con movimiento reducido. Al confirmar, procesamiento breve de demostración (350 ms), botón deshabilitado y guardia inmediata de doble envío. La transacción del reducer vuelve a comprobar idempotencia; una animación no es la protección de datos.

OrderSummary se reutiliza en revisión, confirmación, detalle y seguimiento. PriceCart/deliveryAmounts centralizan líneas e importes; los componentes presentan datos, no descuentan stock. Las confirmaciones son textuales, con iconos y etiquetas además de color.

Se preserva la separación de patrones: cliente implementado en 0.3.0; administración, caja y A/B quedan pendientes. No hay seguridad de servidor ni operaciones comerciales reales.
