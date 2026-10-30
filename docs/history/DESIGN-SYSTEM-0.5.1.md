# Rosita Design System 2.3.1

La versión 2.0.0 reemplaza la identidad turquesa de la base 1.x. La aplicación es 0.5.1; la versión del sistema se mantiene separada. Biblioteca interactiva: `/sistema-diseno`, pestañas Fundamentos, Componentes y Reglas de uso.

## Fundamentos y uso

Tokens en `src/styles/tokens.css`: fondo #F7F8F5, superficie blanca, marca/acciones #145A46, texto #17231D, secundario #526159, rosa #F4B8C8 y verde suave #E8F1E9. El rosa acompaña identidad y una promoción; no sustituye el color de error. Error #B42332, éxito #216744, advertencia #875006 y foco #245AC9 tienen funciones independientes.

Texto blanco sobre verde principal: 8.14:1; texto oscuro sobre rosa: 9.68:1. Bordes de campo #718276 contrastan 4.07:1 sobre blanco. El script `npm run check:contrast` comprueba 24 pares, 4.5:1 para texto normal y 3:1 para foco/bordes. Un resultado de tokens no equivale a una auditoría WCAG completa.

Manrope 600–800 para títulos; DM Sans 400–700 para textos, controles y tablas. Dos variables WOFF2 latinas locales, `font-display: swap`, licencias OFL adjuntas. Precios y totales usan cifras tabulares. El título del inicio es expresivo; títulos de catálogo y producto priorizan lectura y tareas.

Espaciado base de 4 px, pasos 8/12/16/24/32/48/64/80; radios 10 px controles, 20 tarjetas, 28 bloques destacados. Sombras discretas; bordes claros delimitan superficies, bordes de campo más fuertes señalan interacción. Controles principales con altura táctil mínima de 44 px.

Movimiento del núcleo: control 150 ms, panel 240 ms, títulos internos 280 ms, búsqueda 200 ms, imagen/promoción hasta 600 ms, curva cubic-bezier(0.2,0,0,1). MotionConfig y CSS respetan movimiento reducido. La promoción mantiene contenido y CTA visibles; anima imágenes, no una sección completa inicialmente transparente.

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

Cliente y administración comparten fundamentos; caja y A/B quedan pendientes. No hay seguridad de servidor ni operaciones comerciales reales.

## Cambios 2.2.0 · administración

AdminLayout es una plantilla separada de tienda, con Sidebar y menú Sheet adaptable. NavLink marca sección activa. Perfil de administrador visible y acciones de tienda/salida reales. El menú oscuro añade tokens admin-sidebar #103E32 y ring-inverse #F4B8C8; su contraste se comprueba con el resto de tokens. Se conservan colores, fuentes locales, radios, espaciado y tiempos de 2.1.0.

AdminTable usa tabla semántica en escritorio y conserva todas las columnas al convertir filas en fichas en paneles de hasta 900 px (container query). Cada campo lleva rótulo visible; no se ocultan precios, estados o acciones en móvil. Pagination limita conjuntos de diez filas. AdminHeading y AdminEmpty comparten jerarquía/alternativas.

ProductEditor compone campos etiquetados, errores asociados, selectores locales y confirmación de cambios sin guardar al cerrar con Escape/X/cancelar; protege también el cierre de pestaña cuando hay cambios. StockAdjustment muestra antes/después/diferencia y error si la acción deja de ser válida. ConfirmAction, compartido por administración y cliente, gestiona foco, confirmación y bloqueo inmediato de operaciones. StatusHistory se usa en ambas experiencias.

Indicadores, barras y alertas se calculan desde el estado; no hay gráficos decorativos con valores inventados. Estados incluyen vacío, desactivado, agotado, stock bajo, validación y rechazo de operación obsoleta. Texto/signos/iconos acompañan el color. Las transiciones son breves; CSS y Motion siguen respetando movimiento reducido.

Las seis ilustraciones SVG nuevas son recursos propios de código y se identifican «Ilustración · sin fotografía»; no reemplazan la necesidad de fotografías reales verificadas. No hay upload ni un componente de imagen remoto. No se fuerza un componente nuevo por cada fila; se extraen tabla, confirmación, editor y ajuste por responsabilidades reutilizables.


## Inicio expresivo · versión 2.3.0

Implementado en `src/features/inicio`, `src/pages/home-page.tsx` y `src/styles/home.css`, cargados por la ruta de inicio diferida. Se reutilizan ProductCard, ProductImage, Button, catálogo, carrito y tokens globales. No se modifican reducer, identificadores, esquema v4 ni reglas de stock/pedidos. Un grid editorial de seis categorías permite acceder sin depender de arrastre.

| Efecto / token | Valor y criterio |
| --- | --- |
| Revelado `--motion-home-reveal` | 650 ms; título por líneas con 90 ms entre ellas; bloques hasta 65 ms escalonados |
| Máscara `--motion-home-mask` | 800 ms; foto principal y medios de categorías; precios sin máscara |
| Marquesina `--motion-marquee` | 26 s, lineal; pausa visible, IntersectionObserver y pestaña oculta detienen la pista |
| Controles de presentación | 160 ms; núcleo comercial conserva 150 ms; paneles 240 ms |
| Curva | cubic-bezier(.2,0,0,1) |
| Parallax / flor | 36 px máximos / −8° a 8°; solo decoraciones en escritorio >=900 px con puntero preciso |
| Magnetismo | ±5 px máximo, solo tinta dentro de dos CTA; caja de enlace inmóvil |
| Resortes | Magnetismo 330/34/0.5; cursor 420/38/0.45 (rigidez/amortiguación/masa) |
| Preparación de foto | Sin espera mínima; finaliza al cargar/fallar o 1800 ms. Permite imagen tardía y no bloquea texto/CTA |

El título tiene una sola versión para tecnologías de asistencia; duplicados visuales de título y marquesina están ocultos. Cursor **suplementario**, pointer-events:none; nunca se oculta el nativo. Se retira en formularios, selección de texto, paneles y uso del teclado. Contraste claro/oscuro; no depende de detectar el color de una fotografía. MotionValues evitan estado React por cada movimiento del puntero.

Carrusel sin autoplay: overflow y scroll-snap nativos, botones 44 px, flechas/Inicio/Fin con foco en región, táctil nativo. Arrastre de ratón activa después de 8 px horizontales y cancela el clic posterior; scroll-snap se suspende durante el gesto. Precios y disponibilidad en superficies blancas estables. El cursor, máscara y movimiento no transportan información de compra exclusiva.

La transición destacada es una curva rosa que crece entre categorías verdes y promoción rosa. No hay texto sobre el área cambiante: blanco/verde, rosa/verde y texto oscuro/rosa mantienen combinaciones estables durante todo el efecto. Foco rosa sobre verde y azul sobre claro. No se interpola el fondo bajo precios.

Móvil: hero vertical, categorías en columna, carrusel con parte de la siguiente tarjeta; sin cursor ni parallax. Movimiento reducido: sin revelados, resortes decorativos o marquesina animada; contenido visible directamente. Sin fijación de secciones, secuencias obligatorias, Lenis, GSAP ni 3D. El navegador mantiene rueda, teclado, táctil, anclas y scroll independiente de Radix. Restauración por clave de ruta en `use-store-scroll`, conservando filtros reemplazados sin salto.

Observadores, temporizadores, listeners y RAF de medición se limpian al desmontar. La marquesina pausa fuera de vista; los efectos de scroll actualizan transformaciones ligadas al desplazamiento, sin bucle continuo propio. Las entradas usan clases añadidas por observador; el contenido base permanece visible si ese efecto no se instala.

**Dependencias nuevas: ninguna.** Motion 14.7.1 existente y CSS resuelven los efectos; carrusel propio sobre scroll nativo. No se actualizó el stack. UI Kit son piezas/variantes; el Design System añade tokens, reglas de uso, accesibilidad y documentación versionada que estas interfaces aplican. Esta etapa incorpora un organismo de presentación y carrusel; no clasifica cada decoración como componente reutilizable.

Ver pruebas y límites en [VERIFICACION.md](VERIFICACION.md), recursos en [RECURSOS.md](RECURSOS.md). DS 2.2 y evidencias previas se conservan en `history` y `admin-verification`.

Presentación 2.3: radios editoriales de 4 px, marco fotográfico 8 px y CTA redondeados; tarjetas de producto conservan su radio y estructura. Se reserva altura de la vista durante la carga diferida para mantener el pie fuera del primer encuadre.

El cursor cambia fondo y texto de forma simultánea, sin interpolación cromática; solo tamaño y posición se animan. `cursor-contraste.json` registra los colores computados en ambas variantes.


## Visor de producto · 2.3.1

`ProductImageZoom` se usa en el detalle; `ProductArtwork` en el módulo existente ProductImage reutiliza el recurso seleccionado sin alterar tarjetas o carruseles. Button, Dialog/Radix, iconos, colores, bordes y foco existentes. Geometría independiente en `zoom-geometry.ts`, estilos limitados en `product-zoom.css`; ninguna dependencia nueva.

- Desktop fino/hover: ampliación 1.5 dentro del marco, origen siguiendo solo la imagen visible. Los márgenes contain no activan zoom. Sale al retirar puntero o foco. Sin estado React por movimiento del puntero.
- Imagen y botón explícito abren el mismo diálogo. Foco inicial en Cerrar, navegación contenida, Escape y restauración al control exacto de origen. Clic exterior no cierra para evitar confundir arrastre con salida.
- Controles de al menos 44 px: Acercar, Alejar, Restablecer y Cerrar. Porcentaje anunciado en output/status. Flechas desplazan; Inicio restablece. Límites calculados desde el tamaño contenido y la escala; se recalculan con ResizeObserver y se limpian al desmontar.
- Normal: 100 % respecto del encuadre contenido, no al tamaño nativo del archivo. Fotos pequeñas: hasta 150 %; tamaño base como máximo 1.25 veces el nativo, por lo que el atlas no supera 1.875 veces su resolución efectiva. SVG ilustrados: hasta 300 %. Deshabilitado explica fotografía pendiente/fallida o escala máxima; error no impide comprar.
- Móvil: un toque abre, controles cambian la escala y un dedo desplaza después de ampliar. `touch-action:pinch-zoom` permite que la pinza siga siendo del navegador. No se intercepta rueda ni Ctrl+zoom, ni se limita el meta viewport. No se implementa una pinza adicional de producto que compita con la nativa.
- El visor no mueve la página con transform. Cursor nativo; área `native-selection` y diálogo fuera del cursor decorativo. Sin inercia, autoplay, cambios automáticos de fotografía o clic para alternar zoom que interfiera con arrastre.
- Movimiento reducido: sin hover automático; acercar/alejar y arrastre manuales instantáneos siguen disponibles. Sin animaciones geométricas en el diálogo; estados de controles conservan el sistema existente.

Estados cubiertos: normal, hover preciso, foco, abierto, escala máxima/mínima, desplazamiento, restablecido, fuente fallida y fotografía pendiente. No se crea una galería ficticia: actualmente cada producto tiene una imagen. El cambio de producto/recurso reinicia el visor. No cambian los tokens cromáticos ni el almacenamiento v4. Ver [ZOOM-IMAGENES.md](ZOOM-IMAGENES.md).
