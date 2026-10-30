# Rosita Design System 2.6.0

Aplicación 0.9.0 / almacenamiento v8. Biblioteca interactiva `/sistema-diseno`: Fundamentos, Componentes y Reglas de uso. Versiones anteriores y decisiones detalladas de inicio/zoom se conservan en [DS 2.4.0](history/DESIGN-SYSTEM-0.6.0.md), [visor](ZOOM-IMAGENES.md) y [subcategorías](SUBCATEGORIAS.md); sus restricciones de taxonomía fija/imágenes sin upload fueron superadas por 2.5.

## Cambios 2.6.0 · pulido comercial, tarjeta y video

Se conserva Manrope/DM Sans local, verde/rosa y tokens semánticos. `styles/polish.css` concentra ritmo de títulos/filtros/tablas/modales, ancho de lectura, párrafos, footer responsive y estados de inventario; no hay un parche por cada página. Disponible=éxito, bajo=advertencia, agotado=error y desactivado=neutro, con etiqueta explícita y stock/umbral calculados. Dos pares adicionales de contraste verifican rojo sobre superficie de error y texto neutro sobre muted; total 26.

Jerarquía: Agregar/Continuar principal; aumentar/disminuir equivalentes; eliminar/vaciar destructivo con icono o texto; volver/cancelar secundario. Cantidad mínima deshabilita disminuir sin quitar la línea. Error de compra conduce a revisar; no se oculta por una animación.

`AmbientVideo` es una pieza compartida por hero, clip opcional y muestra del DS: poster, estado estático/reproduciendo/pausado/bloqueado/fallido, control visible con nombre accesible, reproducción silenciosa inline, pausa por intersección/visibilitychange y limpieza de observadores. Sin loop porque los montajes no tienen transición continua. Texto/acciones fuera del video mantienen figura-fondo y no dependen del recurso. Movimiento reducido inicia estático; el usuario puede elegir reproducir. El segundo video es ficción y se abre voluntariamente; no se usa como evidencia de entregas reales.

`CardSimulation` compone átomos existentes con validación RHF/Zod y estados de procesamiento/aprobación/rechazo/error. Texto e iconos acompañan color. `motionTokens.payment=.65` y `--motion-payment:650ms` definen la duración de esta simulación; controles 150 ms / paneles 240 ms / búsqueda 200 ms se conservan. No es una animación decorativa. Foco al primer error, formato móvil, CVV oculto y datos exclusivamente ficticios. Un recibo mínimo reutiliza OrderSummary, también en administración.

`/sistema-diseno` → Componentes añade el AmbientVideo real sin autoplay, reglas de compra/destructivos y enlace a escenarios. No duplica el formulario de tarjeta ni una aprobación demostrativa que pudiera confundirse con compra. El UI Kit son piezas/variantes; el DS añade permisos, reglas de datos, accesibilidad y validación de uso, además de versión/documentación.

Gestalt: proximidad campo/error/ayuda, similitud de controles de cantidad, región común por bloque de filtros/tarjeta, figura-fondo de superficies y controles del video, continuidad de revisión/retorno y simplicidad del clip opt-in. Jerarquía complementaria en títulos/precios; Nosotros equilibra foto de proporción real y texto de lectura. No se insertan explicaciones académicas en compra.

Changelog 2.6: pulido de administración/lectura/footer/contacto, inventario semántico, tarjeta efímera ligada a compra y video controlable con fallback. Sin dependencias frontend nuevas. Pruebas/limitaciones y archivos: [PULIDO-0.8.0](PULIDO-0.8.0.md). La versión 2.5 completa se conserva en history/DESIGN-SYSTEM-0.7.0.md. No hay usuarios inventados, estudio A/B ni certificación WCAG integral.

## UI Kit y Design System

El **UI Kit** reúne Button/Input/Label/Card/Dialog/Sheet/Select/Checkbox/Tabs/Table/Badge/Skeleton/Alert/Sonner y sus variantes. El **Design System** añade tokens semánticos, composición, accesibilidad, reglas de datos/errores, ejemplos, documentación y versiones compartidas por diseño y desarrollo. Instalar shadcn no prueba su aplicación: los componentes se personalizan y se usan en catálogo, checkout, formularios y administración reales.

## Fundamentos

| Función                | Token/valor                           | Regla                                         |
| ---------------------- | ------------------------------------- | --------------------------------------------- |
| Marca/acción           | #145A46                               | Botón principal con blanco, navegación activa |
| Fondo/superficie       | #F7F8F5 / #FFFFFF                     | Página y región común de contenido            |
| Texto/secundario       | #17231D / #526159                     | Jerarquía de lectura estable                  |
| Identidad rosa         | #F4B8C8                               | Promoción/detalles; no error                  |
| Superficie verde       | #E8F1E9                               | Contexto, resumen y selección                 |
| Error/éxito/aviso/foco | #B42332 / #216744 / #875006 / #245AC9 | Significados estables con texto/icono         |
| Borde de campo         | #718276                               | Distingue control sobre blanco                |
| Sidebar/foco inverso   | #103E32 / #F4B8C8                     | Administración y contraste sobre oscuro       |

Tokens CSS `src/styles/tokens.css`; curvas/tiempos JS `src/lib/motion.ts`. Contraste comprobado por script de 26 combinaciones: texto normal ≥4.5:1, foco/contornos ≥3:1. Blanco/verde 8.14:1, oscuro/rosa 9.68:1, borde/blanco 4.07:1. Es comprobación de tokens, no certificación WCAG de toda la aplicación.

Manrope 600–800 en títulos, DM Sans 400–700 en texto/controles/tablas. WOFF2 variables latinos locales, OFL y `font-display:swap`. Precios/totales tabulares; sin encabezados gigantes en tareas administrativas. Escala de títulos CSS clamp, texto 1rem y metadatos menores sin sacrificar etiquetas. Espaciado base 4 px (`--space-1…20`), controles radio10, tarjetas20, destacados28, sombras discretas. Jerarquía expresiva en inicio; densidad legible en tablas. No variar botones de forma arbitraria por categoría.

## Biblioteca por responsabilidad (Atomic Design)

| Nivel      | Piezas utilizadas                                                                                                       | Decisión                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Átomos     | Button, Input, Label, Checkbox, Badge, iconos Lucide                                                                    | Mismas proporciones/estados, etiqueta siempre visible              |
| Moléculas  | campo + error, buscador, QuantityControl, precio/promoción, selector categoría/subcategoría                             | Agrupan interacción y orientación; no un componente por cada texto |
| Organismos | ProductCard, Header, CatalogFilters, carrito/resumen, AdminTable, ProductEditor, ImagePicker, HelpLinks, AnalyticsPanel | Responsabilidad concreta, datos compartidos y composición          |
| Plantillas | AppLayout, AdminLayout, plantilla de acceso/checkout                                                                    | Separan compra/gestión y mantienen estructura entre vistas         |
| Páginas    | Nosotros, ayuda, contacto, catálogo, taxonomía, reportes y demás rutas                                                  | Componen contenido y operaciones reales sin duplicar tokens        |

`MediaImage`/`useImageSource` resuelven recursos locales/subidos; ProductImage/ProductArtwork mantienen render y resolución del visor. `analytics.ts` comparte cálculos con reportes; no es un componente visual. No se fuerza la clasificación Atomic a persistencia/reducer.

## Patrones y reglas de uso

- **Navegación**: Menú → información/ayuda, barra principal → categorías, lateral/panel catálogo → subcategorías y filtros. Región, títulos, separador y selección textual evitan redundancia. Móvil/tablet tiene selector de categoría y panel de filtros. URL conserva selección/retorno.
- **Formularios**: Label visible, ayuda próxima, error asociado y `aria-invalid`; primer campo inválido recibe foco. Mensaje de operación al pie si el error afecta el guardado completo. Registro público sin selector de rol. Perfil no modifica contraseña/rol.
- **Taxonomía**: IDs estables y alias de slug; cantidad de productos afectados antes de desactivar. Nada de eliminación/reasignación silenciosa. Categoría inactiva oculta comercialmente y se explica en Productos.
- **Imágenes**: archivo local validado, previsualización, progreso, resultado y error; guardar formulario explícito. Reemplazo/quitar pide confirmación desde sus acciones; conservar archivo compartido. Archivo ausente no rompe layout ni compra. Fotos contain; ambientación cover conserva proporción. No inventar resolución.
- **Tablas/reportes**: caption, encabezados y cifras alineadas/tabulares. AdminTable se convierte en fichas etiquetadas hasta 900 px de contenedor, sin perder columnas. Reportes permiten desplazamiento interno para comparar columnas y tienen impresión propia. No ocultar información crítica.
- **Indicadores**: definir unidad y periodo. Pedidos confirmados ≠ cobros reales. Estados por barras etiquetadas y alternativa en tabla; categorías y evolución se muestran en tablas. Sin datos: explicar cómo generar una operación real del prototipo, no sembrar ventas.
- **Contacto**: envío simulado claramente identificado; no persistir ni hacer POST. No checkbox sin función. La información del negocio procede del informe; no inventar horario/propietario/reseñas.
- **Confirmaciones**: texto e icono además de color. Bloqueo inmediato al confirmar pedido, guardar y exportar; idempotencia en operaciones. Toast complementa, no sustituye error junto al campo.

## Estados e interacción · unidad 3

| Estado                  | Ejemplo real                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Normal/hover/presionado | Botones personalizados y enlaces de menú                                                                         |
| Foco visible            | Anillo azul en claro, rosa sobre verde; acceso por Tab                                                           |
| Deshabilitado           | Límite de stock, no permiso de reset, botón mientras imagen se prepara                                           |
| Procesamiento           | Contacto 350 ms, lectura/compresión/guardado de imagen según trabajo real, CSV bloqueado durante preparación     |
| Error                   | Formato/cuota de imagen, nombre duplicado, subgrupo incompatible, correo inválido, intervalo de fechas invertido |
| Éxito                   | Imagen preparada, estructura/perfil guardado, CSV preparado, confirmación de pedido                              |
| Vacío                   | Sin pedidos, sin coincidencias, categoría nueva sin productos, reporte sin registros                             |

Controles 150 ms, búsqueda200, paneles240, títulos280, imagen300; curva `cubic-bezier(.2, 0, 0,1)`. `motionTokens.processing=.35` / `--motion-processing:350ms` es solo una pausa de demostración en contacto, no una animación que bloquee validación. Las operaciones reales locales de archivos no tienen retraso artificial. Exportación da oportunidad de pintar el estado antes de descargar.

Inicio conserva revelado650/máscara800/marquesina26s pausable y resorte/cursor suplementarios de 2.3. No se anima precio ni se ocultan controles por decoración. Cursor nativo permanece; decorativo se retira en formularios, selección, teclado y paneles. No se añade scroll hijacking, GSAP o Lenis. MotionConfig `reducedMotion="user"`, CSS `prefers-reduced-motion` y condiciones táctiles quitan decoración; navegación/estado no dependen de animación.

Sheet/Dialog Radix: foco contenido, Escape, retorno a control de origen. Menú al navegar enfoca encabezado sin impedir ancla. FAQ usa details/summary nativos con Enter/Espacio. Visor conserva controles accesibles, límites de arrastre, resolución y zoom nativo del navegador.

En `/sistema-diseno` → Componentes, «Patrones de información y gestión · 2.5.0» muestra campo normal/procesando/error/éxito, botón para probar foco, acordeón y el ImagePicker real (solo admin). El ejemplo informa que subir prepara un recurso local; no crea producto por sí mismo. Enlaces abren funciones reales. No se presentan muestras de estados como pruebas con participantes.

## Gestalt y jerarquía · unidad 2

| Principio                | Aplicación comprobable                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| Proximidad               | Etiqueta, ayuda y error del mismo campo; nombre/precio/Agregar en cada tarjeta                  |
| Similitud                | Mismos botones y campos en cliente/admin; semántica de color constante                          |
| Figura-fondo             | Superficies blancas contra fondo claro; diálogo encima de overlay                               |
| Continuidad              | Categoría → subcategoría → producto → retorno con URL; pasos de checkout                        |
| Región común             | Grupos de ayuda, filtros separados, formulario y resumen en sus paneles                         |
| Simplicidad              | Menú sin duplicar categorías; entrega/pago/revisión separados; reportes con filtros pertinentes |
| Jerarquía complementaria | Título/lead/acciones; importe total destacado y céntimos comparables                            |

Estas reglas se documentan aquí; la compra no muestra explicaciones académicas.

## Colaboración y versión

Antes de añadir pieza: revisar `components/ui`, buscar patrón existente y extraer solo si tiene función reutilizable. Usar tokens semánticos, etiquetas españolas y datos por ID; no copiar catálogos entre páginas. Cambiar contratos requiere migración y prueba del formato instalado. Cambiar operación exige verificar stock/historial/reporte. Registrar versión y casos verificados; no inferir accesibilidad por instalar biblioteca. Documentar fuentes/derechos de fotografías nuevas.

Changelog: 2.0 identidad verde/rosa y fuentes locales; 2.1 compra/seguimiento; 2.2 administración; 2.3 inicio/motion; 2.3.1 zoom; 2.4 subcategorías; **2.5 menú informativo, páginas corporativas/ayuda/contacto, perfil/demo cliente, taxonomía dinámica, ImagePicker persistente, estadísticas y reportes con estados e impresión**. No dependencias nuevas. Aplicación 0.7.0/esquema6 separados del número de DS.

No existen pruebas con participantes ni comparación A/B medida. Caja/A-B no implementadas. Chromium automatizado no reemplaza lector de pantalla, dispositivo físico o evaluación humana; ver [resultados](MODULOS-0.7.0.md).

## Aplicación de catálogo 0.9

DS 2.6.0 conserva paleta, fuentes y controles. Tarjetas agregan código comercial/categoría con tipografía secundaria y disponibilidad por umbral real. Eliminar/restaurar reutiliza ConfirmAction, destructivo y estado neutro; se diferencia de desactivar. Metadatos de identidad permanecen separados de IDs técnicos para no alterar historial. Formularios reutilizados validan código único y relación de categoría/subcategoría. No hay un sistema paralelo para las 39 referencias. Ver CATALOGO-0.9.0.md.
