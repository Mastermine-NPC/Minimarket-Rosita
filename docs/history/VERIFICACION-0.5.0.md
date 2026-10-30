# Verificación · aplicación 0.5.0 / Design System 2.3.0 / esquema v4

29/10/2026. Rediseño del inicio sobre proyecto existente. No se encontraron AGENTS.md en proyecto/ancestros. Se leyeron documentación, inicio, recursos y reglas previas. Copia anterior: `recovery/antes-inicio-0.5.0.zip`. No se reinicializó, actualizó el stack ni modificó Framer/Figma. Sin publicación ni despliegue.

## Resultado y alcance

Inicio implementado con foto real, composición tipográfica, cursor suplementario, magnetismo moderado, marquesina pausable, carrusel funcional y seis categorías editoriales. No cambian catálogo, stock, sesión, checkout o administración. Un texto obsoleto del pie se corrigió para reconocer administración y aclarar que caja sigue pendiente. Se conserva almacenamiento v4, sin migración nueva. `home-verification/entorno.json` compara dependencias, lock y archivos contra la copia previa.

Se revisaron las referencias en Chromium. Observaciones y propuestas separadas en [RECURSOS.md](RECURSOS.md); capturas y datos en `home-verification/references`. No se atribuye a Les Animals un cursor que no pudo verificarse. Las fotos ambientales no se presentan como artículos disponibles.

## Comprobaciones ejecutadas

Node 20.19.4, npm 11.21.1; versiones instaladas sin cambios respecto de 0.4.0. Chromium 156.0.8078.4 mediante Playwright externo, no dependencia del frontend. Desarrollo local 127.0.0.1:5173; compilación final comprobada en 127.0.0.1:4173, sin HMR.

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| TypeScript, ESLint, contraste y compilación | Verificado | `home-verification/check.log`; `npm run check` |
| Contraste de 24 pares de tokens | Verificado | `scripts/check-contrast.mjs`; incluye blanco/verde, rosa/verde, verde/rosa y verde suave/verde |
| Entrada de título y máscara | Verificado | `inicio-pruebas.json`: transformaciones y clip-path en distintos instantes; no solo captura estática |
| Parallax y transición curva | Verificado | `adicionales.json`, transformaciones medidas; grabación de recorrido |
| Cursor, dos fondos, campo, teclado y panel | Verificado | Cursor no intercepta, conserva nativo; se oculta en campo/modal y al usar teclado |
| Magnetismo | Verificado | Caja del CTA inmóvil; transformación solo de su contenido |
| Marquesina, pausa y fuera de vista | Verificado | Cambios de transform; detención al pulsar y al salir de pantalla |
| Carga normal, lenta y fallida del hero | Verificado | Estado listo persistente; retraso 3 s, límite 1.8 s y foto tardía; aborto muestra alternativa sin bloquear CTA |
| Preloader no repetido | Verificado | Tres salidas/regresos, sin cargador repetido; sin espera mínima ni porcentaje |
| Imagen ambiental fallida | Verificado | Alternativa textual, categoría sigue navegable |
| Carrusel, flechas, Inicio/Fin y ratón | Verificado | Mueve tarjetas; gesto cancela apertura accidental; arrastre desde Agregar no compra |
| Carrusel táctil | Verificado | CDP touchStart/move/end, 390 px; desplazamiento de 318 px, sin navegar |
| Movimiento reducido | Verificado | Sin cursor, parallax, entradas ni marquesina en movimiento; contenido directo |
| Agregar, categoría, detalle y regreso | Verificado | Datos compartidos, confirmación real del prototipo y ruta de producto; Atrás restaura scroll |
| Ancla Ver categorías | Verificado | Foco en título y posición bajo encabezado sticky |
| Carrito/filtros, foco, Escape y scroll propio | Verificado | Regresión de tienda y `paneles.json`; panel largo con rueda sin desplazar página |
| Desmontaje de efectos | Verificado en alcance indicado | Tres cambios de ruta sin cursor residual/duplicado; revisión de cleanup de observadores/listeners/timers. Sin perfilador de memoria |
| 1440, 1100, 900, 768, 600, 480 y 390 px | Verificado | Ancho documento <= viewport, sin imágenes rotas; capturas y revisión de hero/categoría/destacados |
| Registro/acceso/salida, checkout y seguimiento | Verificado | Regresión cliente completa 1440/768/390 en `regression/regresion-cliente/flujo.json` |
| Productos, inventario, pedidos y perfiles | Verificado | Regresión administrativa compilada 1440/768/390, `regression/flujo.json` |
| Formularios, modal, notificación y dos rutas técnicas | Verificado | Regresión base a tres anchos |
| FPS, batería y todos los navegadores/dispositivos físicos | No comprobado | No se afirma 60 FPS, auditoría universal o rendimiento de producción |
| Pruebas con participantes / satisfacción | No realizadas | No se inventan usuarios, mediciones ni conclusiones de usabilidad |

Las pruebas de fallo de recursos abortan solicitudes intencionadamente; esos errores de red son esperados. No se detectaron excepciones JavaScript en los recorridos aprobados. La ausencia de excepciones no sustituye una revisión de accesibilidad asistida o de seguridad.

## Fallos encontrados y correcciones

- El timer de preparación podía cambiar una foto lista a timeout: ahora se cancela al cargar/fallar y acepta éxito tardío.
- Scroll-snap anulaba el arrastre por especificidad CSS: se suspende durante el gesto; se bloquea el clic que lo sigue.
- Alineación heredada estrechaba imágenes editoriales móviles: categorías fijan ancho completo y alineación propia.
- El pie aparecía antes del chunk diferido y saltaba al cargar el inicio. PerformanceObserver identificó un desplazamiento 0.391 atribuido al footer. Se reservó altura de contenido durante la carga. La repetición aislada de carga/scroll produjo **ningún evento** y la muestra del recorrido adicional sumó 0. Esto describe esas sesiones locales; no certifica CLS en otras redes/equipos.
- Algunas primeras ejecuciones en desarrollo sufrieron recargas mientras se escribían código/evidencias. Se repitieron carga de imágenes, movimiento y administración sobre la compilación estable. Las evidencias finales son los JSON/grabación de esa repetición.

## Inventario real: qué cambió

No se añade una ruta funcional por cada sección o efecto. El inicio sigue siendo **una página** `/`, accesible por logotipo o Inicio.

| Elemento dentro de `/` | Tipo / acceso |
| --- | --- |
| Hero | Sección; Explorar productos -> `/catalogo`, Ver categorías -> `/#categorias` |
| Destacados | Organismo con ocho productos iniciales activos; flechas/teclado/táctil; detalle -> `/producto/:id`, Agregar -> carrito compartido |
| Categorías | Sección con seis enlaces `/categoria/consumibles`, `/categoria/ferreteria`, `/categoria/tecnologia`, `/categoria/jugueteria`, `/categoria/educacion-oficina`, `/categoria/cuidado-personal` |
| Promoción | Sección; Ver precios especiales -> `/catalogo?ofertas=1` |
| Cierre editorial | Sección; Sigue explorando -> `/catalogo` |
| Preparando foto / timeout / fallo | Estados del mismo hero; no pantallas funcionales adicionales |
| Cursor, marquesina, máscara y curva | Efectos/componentes decorativos con alternativas; no vistas |
| 1440/768/390 y anchos intermedios | Variantes responsive de las mismas vistas |
| Referencias externas | Evidencia visual; no interfaz interactiva de Rosita |

El inventario completo conservado de tienda, cliente y administración, con accesos y límites, está en [verificación 0.4.0](history/VERIFICACION-0.4.0.md). No se afirma una cifra de «24 vistas conectadas». La página `/sistema-diseno`, accesible desde el pie, se actualizó a 2.3.0 y describe tokens, estados, reglas y presentación.

## Recorrido breve

1. Abre `/`: observa título/foto y prueba los dos CTA con el puntero. Cambia a movimiento reducido para comparar la alternativa estática.
2. Pausa/reanuda la marquesina. Baja a destacados, usa flechas o desliza, consulta un detalle y agrega un producto.
3. Abre carrito, modifica cantidad y comprueba total. Regresa y entra por una de las seis categorías; búsqueda/filtros siguen operativos.
4. Si deseas continuar la compra de demostración, registra/inicia sesión, completa entrega, selecciona pago simulado, revisa y confirma. Mis pedidos -> seguimiento manual.
5. `/personal` permite entrar al panel ficticio conservado; credenciales y recorrido de administración en README. Caja no está implementada.

## Límites y simulación

Frontend académico, localStorage y una pestaña/navegador; sin backend, base de datos, autorización segura, cobros o reparto real. Caja y comparativa A/B siguen pendientes del alcance anterior; no se añadieron ni eliminaron aquí. No se reconstruyó checkout ni administración para animarlos.

La foto real original tiene solo 1025×260 px y el encuadre grande limita nitidez. Cinco fotos nuevas son ambientación y seis artículos mantienen ilustraciones identificadas por falta de fotografía exacta con permiso verificado. No hay vídeo comercial nuevo ni dependencias 3D. El scroll es nativo, sin inercia artificial, secciones fijadas o secuencias obligatorias. La aplicación React requiere JavaScript; el fallback indicado se refiere a efectos de presentación, no a funcionar como aplicación sin JS.

No se ejecutó una auditoría WCAG completa, lector de pantalla humano, batería/GPU, Safari/Firefox ni prueba en móvil físico. Las comprobaciones de movimiento son transformaciones/estados reales y grabación local; no una afirmación de fluidez universal.

## Cómo abrir

En la carpeta del proyecto: `nvm use` y `npm run dev`. Abre **http://localhost:5173/** (o el puerto indicado por Vite). Para verificar la compilación: `npm run build`, `npm run preview`, **http://localhost:4173/**. Ambos son servidores locales; no publican. Conserva la terminal abierta.
