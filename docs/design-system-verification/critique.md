ROUND 1
Seen in one second: Personalización visual de Rosita; estado de publicación y grupos de variables.
Idea (one sentence): La identidad verde/rosa de Rosita se convierte en una propuesta revisable junto a sus componentes reales, dentro del mismo marco administrativo.
Live thing: Cambiar color/radio/fuente modifica la propuesta; comparar y publicar actualiza el tema de otro visitante.
Layout words by section: heading=identidad y revisión / publication=estado y acciones / workspace=grupos, controles, propuesta / comparison=publicada y borrador / route=iframe real.
Scores: design 7.5 · usability 7.5 · creativity 7 · content 8 → overall 7.45
Caps applied: ninguna de contenido ficticio/acción rota. Es una utilidad administrativa existente, no una campaña creativa.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. La primera propuesta y los controles tienen prioridad clara en desktop, pero en móvil la propuesta queda después del grupo largo (editor-390.png). Se agrupan y buscan variables, y la comparación se activa a demanda. La longitud de grupos avanzados sigue siendo una fricción; no se elimina información requerida.
2. Los controles desactivados inicialmente conservaban el relleno primario (primeras capturas del editor). Corregido con fondo/texto semántico muted y opacidad configurable.
3. La vista previa de ruta podía recibir la propuesta antes de arrancar (prueba funcional). Corregido con protocolo ready del iframe, origen/ventana verificados y comprobación real de su propiedad --primary.

ROUND 2
Seen in one second: Un editor de Rosita con publicación explícita y grupos navegables.
Idea (one sentence): Revisar una propuesta antes de cambiar la tienda publicada, usando sus propios componentes y rutas.
Live thing: Propuesta aislada, comparación, publicación persistente y restauración comprobadas en Chrome.
Layout words by section: heading=orientación / publication=control / workspace=edición y prueba / route=contexto comercial.
Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6
Caps applied: ninguna. La navegación vertical en grupos extensos es una limitación declarada, no un error de layout.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. En móvil, el grupo completo precede a la propuesta (mobile-page-01.jpg). Se conserva el orden de lectura y el buscador; no hay overflow y todos los controles siguen accesibles. Puede mejorarse más adelante con selección de un token a la vez.
2. La etiqueta “TU NEGOCIO, EN ORDEN” del sidebar es pequeña y espaciada (desktop-fold.jpg). Se conserva el shell de marca existente; no es parte de un rediseño del editor.
3. El inspector cuenta la fuente de los nombres CSS como tercera tipografía y el logo como cambio de fuente (report.json). Son código real y marca existente, respectivamente; los textos del editor mantienen DM Sans/Manrope.

Dirección: Framed sheet, semilla 1067141904, paleta y fuentes existentes conservadas, sin redraw. Marco administrativo verde grisáceo y hoja de trabajo clara. No se añadieron imágenes externas, recursos generados ni cifras comerciales ficticias. Se abrieron y revisaron las siete capturas finales del inspector a 1440/768/390 y las capturas de comparación responsive.

Inspector final: 0 FAIL, 3 WARN. Excepciones configuradas: covered-text para la cortina de transición existente aria-hidden; button-fx para los controles reales del sistema existente. Las cinco advertencias del lint de la skill corresponden a bordes finos de paneles/controles permitidos en app screens. ESLint del proyecto: sin advertencias ni errores.
