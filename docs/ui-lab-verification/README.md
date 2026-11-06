# Rosita UI Lab

Acceso directo: `http://localhost:4190/laboratorio-ui` (o el puerto del servidor Vite). No se añadieron enlaces desde la tienda. Rama de trabajo: `mejoras-design-system`.

## Arquitectura y aislamiento

Una aplicación Vite, una raíz React y dos entradas diferidas. `main.tsx` conserva StrictMode y selecciona una entrada antes de montar proveedores. `root-entry.tsx` reconoce exclusivamente `/laboratorio-ui`, con barra final opcional. Las demás URLs siguen montando `store-entry.tsx`, que contiene **los mismos proveedores, router y hojas comerciales que antes estaban en main**. Las rutas comerciales y sus componentes no se editaron.

El laboratorio no monta BrowserRouter, RositaProvider, notificaciones, Toaster, Lenis ni transiciones comerciales. Su navegación es local: no hay una segunda aplicación ni otro servidor. Shadow DOM abierto + portal React encapsulan estilos, controles y diálogos. `lab.css?inline` nunca se inyecta en el documento comercial. La única hoja exterior añade las fuentes existentes y reglas limitadas al host del laboratorio. No accede al almacenamiento de la tienda. El navegador comprobó que no se descarga la entrada comercial al abrir el laboratorio y que la clave comercial no se crea ni modifica.

Solo los registros introducidos por el evaluador usan `rosita-ui-lab:evaluations:v1`. Ni autenticación, usuarios, stock, compras, pedidos ni datos comerciales son importados. La búsqueda y los carritos de cada escenario son efímeros y locales. Los cuatro productos son ficticios y se representan mediante una ilustración de bolsa dibujada con Lucide. No necesitan assets comerciales para funcionar. El recurso GLB existente de Nivea se usa únicamente en el visor opcional y bajo demanda.

## Archivos

Modificados:

- `src/main.tsx`: selección diferida de entrada con Suspense, sin montar proveedores comerciales en Lab.
- `package.json`: `test:ui-lab` y su incorporación al final de `npm test`. Sin dependencias nuevas ni cambios de versiones.

Creados:

- `src/app/root-entry.tsx`: selección de entrada por URL directa.
- `src/app/store-entry.tsx`: traslado del montaje y CSS originales, conservando su orden.
- `src/features/ui-lab/lab-entry.tsx`: host Shadow DOM, layout, navegación/buscador, tokens y documentación general.
- `src/features/ui-lab/host.css`: fuentes y host exterior, selectores limitados.
- `src/features/ui-lab/lab.css`: estilos internos, vistas responsive, estados y movimiento reducido.
- `src/features/ui-lab/data.ts`: secciones, catálogo ficticio, tareas y tokens de referencia.
- `src/features/ui-lab/components.tsx`: LabButton, LabInput, LabCard y LabDialog.
- `src/features/ui-lab/explorer.tsx`: LabNavigation, controles configurables, fichas y demostraciones adicionales.
- `src/features/ui-lab/catalog-demo.tsx`: escenario autónomo y comparador A/B.
- `src/features/ui-lab/evaluation.tsx`: cronómetro, formulario, persistencia, comparación y exportación.
- `src/features/ui-lab/metrics.ts`: validación, cálculos y CSV con protección frente a fórmulas.
- `src/features/ui-lab/model-demo.tsx`: visor Three/R3F independiente, carga diferida y límite de error.
- `scripts/verify-ui-lab.mjs`: pruebas de cálculos, validación y serialización CSV.
- `scripts/verify-ui-lab-browser.mjs`: recorrido funcional reproducible con Playwright.
- Esta carpeta: documentación, capturas y resultados técnicos de verificación.

## Mini Design System y explorador

Referencia visual: verde #145a46, rosa #f4b8c8, neutros, estados semánticos, DM Sans y Manrope; valores examinados en `src/styles/tokens.css`. Los tokens de color generan las variables propias del laboratorio; no se leen ni mutan variables comerciales. Se documentan nombre, valor, descripción, uso y muestra para colores, fuentes, escala tipográfica, espaciados, bordes, radios, sombras, elevación, iconos, estados y movimiento.

Cinco componentes base funcionales, todos con ficha técnica, ejemplo de código y propiedades:

- Botón: variantes solid/outline/soft, tamaño, radio, icono, etiqueta y ocho estados (default, hover, active, focus, disabled, loading, error, success).
- Campo: etiqueta, placeholder, tipo, icono, error y estados. Ayuda con identificador único, aria-invalid y edición nativa.
- Tarjeta: título, descripción, precio, etiqueta, ilustración opcional, sombra y respuesta hover.
- Menú: distribución horizontal/vertical, elementos configurables, selección activa y desplegable nativo.
- Modal: tamaño, contenido, fade/lift/none, fondo y cierre exterior configurable. Escape y devolución de foco comprobados; cierre visible siempre disponible.

El selector de estados fuerza una muestra visual; Tab permite comprobar el foco real. El visor de escritorio/tablet/móvil cambia el ancho del área de trabajo, limitado por el espacio disponible. No pretende emular por sí solo un navegador de otro dispositivo: las pruebas reales de viewport se ejecutaron por separado.

También hay catálogo, promoción funcional de prueba, contador de interacción y transición configurable. El visor GLB usa frameloop demand, sin autoplay ni renderizado continuo en reposo; se desmonta al cerrar y no controla productos reales. No se añadieron librerías.

## A/B y protocolo

Ambas variantes tienen cuatro productos, los mismos precios y las mismas capacidades: búsqueda, categoría, detalle, agregar/quitar y compra simulada sin pago. A ofrece listado compacto y respuesta textual; B añade jerarquía de precio, ilustración, recuento de resultados, total y cantidades visibles, y microinteracciones. Ninguna está deliberadamente impedida. Cada instancia conserva su propio estado mientras permanece montada; cambiar de sección o reiniciar descarta el escenario, no los registros guardados.

Cuatro tareas comunes:

1. Buscar Arroz Rosita.
2. Filtrar Despensa.
3. Abrir las características del arroz.
4. Agregar el producto y completar una compra simulada.

El módulo de evaluación incorpora el mismo escenario y permite alternar A/B, reiniciarlo y registrar un identificador anónimo, tarea, tiempo manual o medido, errores, éxito/fracaso, comentarios y observaciones. Los controles de contexto se bloquean mientras corre el cronómetro. Para guardar hay que pausarlo; los errores y el éxito los decide el evaluador. Se recomienda alternar el orden de variantes y mantener una definición consistente de error. La documentación interna describe el protocolo y los criterios de finalización.

## Métricas y exportación

Solo se calculan a partir de registros válidos:

- Tiempo medio = suma de segundos / intentos registrados.
- Errores medios = errores totales / intentos registrados.
- Éxito = intentos exitosos / intentos registrados × 100.
- Diferencia = media B − media A; un número negativo indica menor tiempo en B.

Tabla por tarea/variante, número de pruebas, medias, errores totales, éxito y diferencia. El filtro por código permite comparar al mismo participante. Las notas cualitativas permanecen visibles por intento. Se muestra un gráfico de medias cuando hay al menos una tarea con registros en ambas variantes; A gris y B verde. No hay gráficos ni conclusiones fabricadas en el estado inicial.

CSV de registros: datos por intento y notas. CSV de resultados: ámbito de participante, tarea, variante, conteo, métricas y diferencia. UTF-8 con BOM, comillas, saltos y separadores escapados; neutralización de posibles fórmulas de hoja de cálculo. Exportaciones verificadas como descargas reales con encabezado y ocho filas técnicas. Permite eliminar un registro tras confirmación. Fallos de almacenamiento se comunican sin afirmar que se guardó.

## Validación

- `npm run check`: TypeScript, ESLint, contraste comercial y build de producción.
- `npm test`: regresiones de operaciones, catálogo, Halloween, estados de pedidos y teléfono internacional.
- `npm run test:ui-lab`: validación de intentos, denominadores vacíos, medias, errores, éxito, CSV y clave propia.
- Chrome/Playwright sobre build: cinco componentes y sus controles; modal con Escape/foco; búsqueda de componentes; cuatro tareas completas en **cada** variante; vacío de búsqueda; cronómetro; ocho registros técnicos; persistencia tras recarga; filtro; descargas CSV; visor GLB; desmontaje; 1440, 768, 390 y 320 px; navegación móvil y reduced-motion.
- Rutas comerciales visitadas: `/`, `/catalogo`, `/categoria/halloween`, `/carrito`, `/login`, `/checkout`, `/nosotros`. Sin enlaces al laboratorio. Catálogo visible y mismo fondo/fuentes tras visitar Lab; almacenamiento comercial sin cambios por Lab.
- Cero excepciones de página en ese recorrido.

**Las pruebas automáticas utilizan TEST_ONLY en un contexto de navegador efímero y borran esos registros antes de finalizar. No son participantes humanos, no se precargan en la aplicación y no se usan para declarar una variante ganadora.**

El inspector de la skill no atraviesa Shadow DOM. Para sus medidas estáticas se utilizó una copia exacta del render inicial, con `:host` trasladado a `:root` y las mismas fuentes; la interacción y el aislamiento se verificaron directamente en el build real con Playwright. La inspección estática no sustituye el recorrido funcional.

## Límites

Persistencia local sin sincronización ni backend; exportar antes de limpiar datos. No introducir información sensible en las notas. El protocolo requiere participantes reales y supervisión para producir evidencia de usabilidad. No hay inferencia estadística, asignación experimental automática ni medición automática del éxito. La interfaz incorpora las hipótesis A/B; aún no existen conclusiones de investigación.

El visor necesita WebGL y el archivo local existente. Las compras son deliberadamente simuladas y nunca generan pedidos. Las vistas de dispositivo son un marco de previsualización; no sustituyen pruebas en dispositivos físicos. Las capturas móviles corresponden a emulación en Chrome.

La separación por entrada se decide en la carga de documento; no hay navegación interna desde/hacia la tienda. Las pruebas de regresión existentes pueden escribir sus informes habituales: se restauraron esos artefactos ajenos para mantener el cambio limitado al laboratorio.

## Evidencia visual

- [Tokens](tokens-1440.png), [explorador](explorer-1440.png), [comparador A/B](comparison-1440.png).
- [Evaluación inicial sin registros](evaluation-empty-1440.png), [visor GLB](model-1440.png).
- [Tablet](explorer-768.png), [móvil 390](explorer-390.png), [móvil 320](explorer-320.png).
- [Catálogo comercial verificado](store-catalog.png).
- [Resultado técnico del navegador](results.json), [log navegador](browser.txt), [regresiones](regression.txt), [check](check.txt).
- [Revisión visual y excepciones justificadas](visual-review.md), [inspector](inspection/report.json).

El script de navegador admite `BASE_URL`, `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXPECT_MODULE`, `CHROME_PATH` y `VERIFICATION_OUT`. En este entorno se ejecutó usando el Playwright del runtime de Codex y Chrome de Windows; no se añadió Playwright como dependencia del proyecto.
