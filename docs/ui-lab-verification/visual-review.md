# Revisión visual

Dirección: **Framed sheet**, semilla **1988285890**, sin redraw. Marco verde grisáceo tomado de Rosita, hoja blanca, DM Sans y Manrope existentes. El contenido principal responde a «¿cómo se comporta este componente y cómo puedo evaluarlo?». La interacción central es cambiar propiedades y ejecutar escenarios A/B, no una decoración animada.

Revisión realizada sobre capturas de la compilación de producción y las seis capturas del inspector de la copia estática del render. No es una prueba con participantes ni una evaluación externa.

## Pasadas y cambios

- Lectura inicial: nombre y función presentes, componentes buscables a un clic, título claro.
- Masas y bordes: sidebar de 232 px, área de trabajo y propiedades; mismos márgenes y superficies planas. Datos y muestras llevan el color.
- Identidad: marco verde grisáceo y verde/rosa de Rosita, icono de flor y tipografías existentes. Lenguaje de despensa y precios en soles en el escenario.
- Espacio: preview suficientemente amplio, controles agrupados, fichas después del escenario. La grilla de tokens llena su espacio con datos reales de referencia, no estadísticas inventadas.
- Tipografía: etiquetas y valores aumentados a 13 px en la revisión. Cinco tamaños visibles principales en el inspector final. Monospace solo en valores técnicos y código.
- Color e imágenes: tonos de marca y estados, sin fotografía externa. La ilustración de bolsa es un icono Lucide declarado, no una foto. El visor usa el GLB Nivea existente.
- Variedad: tokens en grilla, explorador con propiedades, A/B en dos columnas, evaluación con formulario/escenario y tabla; no se usa una plantilla de tarjetas para todas las vistas.
- Móvil: navegación plegable, propiedades debajo, preview limitado al ancho disponible; corrección del recorte observado al mantener el preset móvil desde tablet. 320, 390 y 768 revisados.
- Sustancia: fichas, ejemplos y controles funcionales; métricas vacías honestas; escenarios permiten completar las tareas sin pagos.
- Colisiones: sin overflow de documento en las cuatro anchuras probadas. Código y tablas tienen desplazamiento interno cuando hace falta. El gráfico diferencia A gris y B verde después de la revisión.
- Trabajo pendiente real: las hipótesis A/B requieren investigación humana; las fichas extensas generan bastante scroll móvil. No se atribuye novedad de diseño extraordinaria a un patrón de laboratorio conocido.

## Inspección

Inspector final: **0 FAIL, 1 WARN**, a 1440, 768 y 390 px. La advertencia es contar monospace como tercera familia: corresponde exclusivamente a valores técnicos y ejemplos, junto a las dos fuentes de marca. Se conserva por legibilidad del código, no como tercera tipografía de interfaz.

Lint de la skill en modo app: **0 FAIL, 6 WARN**. Cinco coincidencias de `shadow` son nombres de tokens/propiedades y sus demostraciones explícitamente solicitadas. La restante señala guiones de ausencia en métricas sin registros; se conservan para no confundir datos faltantes con ceros. No se añaden sombras decorativas al marco del laboratorio.

El inspector no atraviesa Shadow DOM. Se inspeccionó una copia del HTML renderizado con los mismos estilos y fuentes; se indica esta limitación en README. El recorrido funcional, foco, datos, aislamiento y responsive se comprobaron en la URL real con Playwright, no en la copia.

## Valoración interna

Diseño 7.5 / usabilidad 8 / creatividad 6.5 / contenido 8. Ponderación 40/30/20/10: **7.5/10**. Autoevaluación cualitativa, sin pretensión de jurado externo ni resultado de usabilidad. El principal límite visual es la longitud de las fichas en móvil; el principal límite de investigación es la ausencia deliberada de resultados humanos hasta realizar el estudio.
