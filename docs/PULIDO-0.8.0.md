# Pulido de interfaz, tarjeta y video · Rosita 0.8.0

29/10/2026. DS 2.6.0 / almacenamiento v7. Trabajo sobre el proyecto existente; Git contenía cambios y archivos del usuario, conservados sin reinicializar, actualizar dependencias ni modificar Framer/Figma. Punto previo: `docs/recovery/antes-pulido-0.8.0.zip`. No se publicó ni desplegó.

## Mejoras

- Inicio conserva búsqueda, CTA, destacados, categorías, carrusel y movimiento útil. El video de compra ocupa el marco visual del hero, separado del texto para mantener contraste y proporción 16:9. No obliga a esperar su reproducción para comprar.
- El segundo MP4 es una escena de comedia, no una entrega de Rosita. Se integra en un bloque secundario sobre entrega como **referencia de ficción opcional**. No representa empleados o servicio real ni se reproduce automáticamente. Acción principal: conocer entregas/pagos de demostración.
- Ambos tienen posters, control accesible, reproducción silenciosa inline, pausa al salir de pantalla/ocultarse la pestaña y alternativa si fallan o se bloquea autoplay. Movimiento reducido inicia estático. Sin loop por el montaje; el clip secundario no solicita su MP4 hasta elegir reproducir.
- Carrito distingue principal/secundario/destructivo. Disminuir se detiene en 1; eliminar es separado. Las reglas compartidas rechazan cantidades inválidas, referencias inexistentes, inactivos, precio no positivo/no finito y stock insuficiente; cálculos en céntimos. Cambiar carrito invalida revisión incluso si se restaura su cantidad.
- Tarjeta ficticia se añade a efectivo/Yape/Plin, con errores próximos, foco, formato, datos de exposición, CVV oculto y estados deterministas. La aprobación efímera corresponde a cliente/token/huella de compra; nunca actúa como cobro real.
- Administración comparte un ritmo de títulos, filtros, tarjetas, tablas, formularios y modales. Disponible verde, bajo ámbar, agotado rojo y desactivado neutro, todos con etiquetas calculadas. Cambiar umbral cambia el estado.
- Nosotros mejora proporción real de foto, jerarquía, párrafos y ancho de lectura sin inventar historia. Ayuda mejora temas/acordeones y explica tarjeta. Footer separa categorías, información/ayuda, contacto y recursos técnicos. Contacto recorta entradas, admite nombres legítimos y bloquea doble envío; confirma solo simulación.

## Videos: inspección y optimización ejecutadas

| Fuente                       | Contenido y metadatos comprobados                                                                                  | Ubicación                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `video-intro.mp4`            | Compra en supermercado,23.80s,1280×720 horizontal,H.264 Main, 25 fps, sin audio                                    | Hero: marco 16:9 con texto/CTA fuera de la imagen; ambientación, no local Rosita |
| `video-entrega-Delivery.mp4` | Escena de comedia con paquete maltratado, créditos y diálogo,127.59s,1280×720,H.264 Main, 23.98 fps/AAC 48 kHz 5.1 | Bloque secundario, desplegable de ficción y reproducción voluntaria              |

Se inspeccionaron mosaicos distribuidos por ambos videos y reproducción real en navegador. Derivados web 960×540, H.264/yuv420p, faststart, sin audio; posters reales en 1s/18s. Intro: **7163048→1476521 bytes (−79.4%)**. Secundario: **19423533→8233666 bytes (−57.6%)**. Originales intactos; Zone.Identifier ignorados, no recursos importados. Registro: [video-inspection.json](video-inspection.json). Herramienta temporal FFmpeg 7.0.2 mediante imageio-ffmpeg 0.7.0, fuera de dependencias frontend.

El secundario no debe presentarse como demostración logística; su carácter ajeno al negocio justifica acceso opcional y descripción explícita. No aporta información necesaria: entrega, pago y seguimiento siguen explicados en texto. No se afirma que el material tenga licencia comercial verificada. No se midieron CoreWebVitals ni rendimiento de todas las redes; sí tamaños y solicitudes de medios en las pruebas.

## Probar tarjeta sin datos reales

En cliente: producto→carrito→checkout→entrega→seleccionar «Tarjeta de crédito/débito — simulación». Los botones Completar rellenan los datos sin enviar automáticamente.

| Escenario  | Número exclusivamente ficticio | Resultado                             |
| ---------- | ------------------------------ | ------------------------------------- |
| Aprobación | `0000 0000 0000 0001`          | Permite revisar y confirmar           |
| Rechazo    | `0000 0000 0000 0002`          | No pedido; conserva carrito           |
| Error      | `0000 0000 0000 0003`          | Error recuperable, permite reintentar |

Conjunto requerido: titular **CLIENTE DEMO**, vencimiento **12/99**, CVV **123**. Son números inválidos como tarjetas reales y exclusivos de esta simulación. Se rechaza cualquier otra combinación, vencimiento o CVV. La fecha de prueba es diciembre de 2099. No se solicitan transferencias ni tarjetas verdaderas.

Número/vencimiento/CVV/titular de tarjeta permanecen en memoria del formulario. Se limpian al aprobar, cambiar de paso/salir o finalizar; nunca entran al estado persistido, URLs, consola, analítica o evidencia visual de pruebas. Rechazo/error mantienen el formulario activo para corregir/reintentar. Los datos de prueba documentados no son datos capturados de una persona.

Aprobación ligada a cliente/token/huella que incluye carrito, precios, stock, entrega y total. Cambio de importe o carrito exige otra simulación; restaurar cantidades no recupera revisión. Salir/recargar no conserva aprobación. Confirmación revalida y evita reutilizar referencia. Temporizadores se cancelan al salir; pedido único y descuento único con requestId. Pedido guarda únicamente referencia ficticia, marca Demo y últimos 4; no aprobación completa ni datos de tarjeta. Es interfaz local, no seguridad de servidor.

Accesos iniciales: cliente@rosita.test / ClienteDemo!2026 y admin@rosita.test / RositaDemo!2026. Ante colisión migrada, usar Completar acceso para el correo realmente asignado. No se creó caja presencial.

## Archivos y finalidad

| Archivos                                                                                                        | Finalidad                                                                                                        |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `features/inicio/ambient-video.tsx`, `hero-photo.tsx`, `pages/home-page.tsx`                                    | Video compartido, hero y referencia secundaria; conserva estructura comercial                                    |
| `public/images/video/web/*`                                                                                     | Dos derivados optimizados y dos posters; originales sin editar                                                   |
| `features/pedidos/card-simulation.tsx`, `payment-form.tsx`, `pages/checkout-page.tsx`                           | Formulario ficticio en memoria, escenarios/validación/temporizadores y aprobación de compra                      |
| `lib/order-transaction.ts`, `checkout-validation.ts`, `types/commerce.ts`, `types/state.ts`, `data/delivery.ts` | Método, contrato de recibo/aprobación, validaciones y confirmación única                                         |
| `lib/state-schema.ts`, `legacy-v6-schema.ts`, `storage.ts`                                                      | Esquema7, formato6 congelado, migración y recibo mínimo validado                                                 |
| `app/state/reducer.ts`, `lib/cart-pricing.ts`, `features/carrito/cart-content.tsx`, `pages/cart-page.tsx`       | Validación común, invalidación de revisión y jerarquía destructiva                                               |
| `features/pedidos/order-summary.tsx`, `pages/order-page.tsx`, `pages/admin/order-detail-page.tsx`               | Mostrar recibo ficticio mínimo con el resumen existente                                                          |
| `styles/polish.css`, `main.tsx`                                                                                 | Ritmo compartido, lectura, footer, estados, responsive y medios                                                  |
| `pages/admin/inventory-page.tsx`                                                                                | Estados calculados por activación/stock/umbral                                                                   |
| `pages/about-page.tsx`, `contact-page.tsx`, `help-page.tsx`, `components/layout/store-footer.tsx`               | Proporción de foto, validación/lock, explicación y agrupación de enlaces                                         |
| `lib/motion.ts`, `styles/tokens.css`, `pages/system-page.tsx`, `features/sistema/module-patterns.tsx`           | Token 650 ms, versión2.6 y ejemplos/reglas reutilizados                                                          |
| `scripts/check-contrast.mjs`                                                                                    | Dos pares nuevos para superficies de inventario;26 en total                                                      |
| `package.json`, `package-lock.json`, `eslint.config.js`, `.gitignore`                                           | Versión de aplicación, revisión de evidencia y exclusión de metadata Windows; versiones de dependencias intactas |
| `docs/*`, `docs/polish-verification/*`, recuperación                                                            | Documentación, checkpoint, resultados/scripts y copias; evidencias previas conservadas                           |

Rutas `src/…` salvo recursos y configuración. No se alteraron imágenes/logos aportados previamente, referencias históricas de pedidos ni módulos de catálogo/taxonomía/archivos por una refactorización general. Inventario completo de rutas previo sigue en [MODULOS-0.7.0](MODULOS-0.7.0.md); no se añadieron rutas para cada estado del video/tarjeta ni pantallas responsive adicionales.

## Verificación

Chromium 156.0.8078.4 mediante Playwright externo, contextos aislados sin datos personales. Evidencia: [polish-verification](polish-verification/README.md).

| Comprobación               | Resultado y alcance                                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tipos, ESLint, compilación | Aprobados, sin advertencias de lint; build final en check.log                                                                                                          |
| Contraste                  | 26 combinaciones aprobadas: texto≥4.5:1, controles/foco≥3:1; no certificación WCAG integral                                                                            |
| Carrito y datos            | Core: NaN/Infinity/fracciones/negativos, ID desconocido, precio inválido, categoría inactiva; UI: mínimo1 y destructivos; cambiar/restaurar cantidad invalida revisión |
| Tarjeta                    | 1440/768/390: obligatorios/foco, rechazo/error/aprobación, cambio de envío obliga resimular, doble clic único, stock 9→8, un movimiento, recibo mínimo y recarga       |
| Privacidad                 | Estado real guardado sin número completo/vencimiento/CVV; no POST; capturas solo tras limpiar campos o en confirmación                                                 |
| Abandono/salida            | Procesamiento cancelado al salir o cerrar sesión; no pedido tardío, carrito conservado                                                                                 |
| Migración                  | v6→7 conserva colecciones; regresión de utilidades anteriores adaptada al formato 7 y formatos v4/v5; sin ventas/cuentas añadidas silenciosamente                      |
| Compra previa              | Registro, efectivo insuficiente/vuelto, revisión/confirmación/doble clic, historial/seguimiento, stock único, acceso/salida a 1440/768/390                             |
| Contacto                   | Vacío/solo espacios, email incorrecto/corregido, nombre con tildes/guion/apóstrofe, espacios exteriores y confirmación simulada; foco/teclado y doble envío            |
| Inventario/admin           | 1440/1024/768/600/390: seis secciones, estados disponibles/bajos/agotados/desactivados, cambio de umbral, modal con texto largo/Escape/foco y DS                       |
| Video                      | 1440/1200/1024/768/390: fotogramas en reproducción, pausa/reanuda, fuera de pantalla, visibilitychange simulado; poster/fallo/bloqueo/reintento/reducedmotion          |
| Carga                      | Sin solicitud al secundario antes de reproducción voluntaria; solo derivados web, nunca Zone.Identifier u originales en esas pruebas                                   |
| Nosotros/Ayuda/footer      | Enlaces internos resuelven; lectura y layout en anchos principales/intermedios, sin desplazamiento horizontal de página                                                |
| Movimiento y foco          | Transformación del hero cambia realmente con scroll; teclado en formularios/acordeones/Sheet, foco visible/Escape/retorno; reducedmotion estático                      |
| Foto actual                | Atributos 1024×598 coinciden con dimensiones naturales, sin deformación y con proporción reservada correcta                                                            |

No hubo excepciones JS inesperadas en los recorridos finales. La prueba intencional de carga fallida produce el error de recurso esperado y el fallback; no se confunde con un fallo no resuelto. Al cerrar no se repitieron baterías aprobadas: tras el último cambio de invalidación de carrito se ejecutó el caso focalizado, y tras ajustar proporción solo se comprobó ese recurso.

## Sílabo y reglas documentadas

Unidad 2: alta fidelidad con flujos reales, Manrope/DM Sans y cifras tabulares; contrastes semánticos, composición responsive, errores próximos, controles compartidos. Proximidad en campos/ayudas, similitud en cantidades, región común en filtros/tarjeta, figura-fondo en superficies y controles del video, continuidad de entrega/pago/revisión, simplicidad del clip opt-in. Jerarquía como principio complementario.

Unidad 3: respuesta de carrito, procesamiento/aprobación/rechazo/error, pausa/reanuda/fallback de video, control de temporizadores, token 650 ms y movimiento reducido. DS 2.6 versionado distingue UI Kit de reglas de uso/datos/accesibilidad y conserva biblioteca real. No se inventan participantes, tiempos de tareas, satisfacción o resultados A/B.

## Límites reales

- Sin backend, pasarela, cobro/contacto real, autenticación de servidor o reparto en vivo. Caja y A/B siguen sin implementar, fuera de esta tarea.
- Una pestaña/navegador; sin coordinación distribuida. Reset y recuperación siguen exclusivos de Rosita. ZIP guarda código, no almacenamiento personal.
- Videos aportados: no se verificó licencia comercial. El segundo no encaja como publicidad logística; por eso es ficción opcional, sin audio. No hay reproducción simultánea automática ni loop.
- Chromium y móvil simulado; no Safari/Firefox, lector de pantalla, impresora o dispositivos físicos. Ocultación de pestaña se probó mediante evento/propiedad de visibilidad simulados, no suspensión de un teléfono real. Autoplay depende del navegador; existe alternativa.
- Atlas de producto de 300×300 por celda y seis ilustraciones identificadas siguen limitando zoom; no se añadió resolución inventada. Se conservaron recursos subidos e históricos.
- No estudio de usuarios ni métricas de rendimiento comercial/experimentación. Sin pendiente funcional confirmado de este alcance.

## Abrir

Vista previa de esta sesión: **http://localhost:4174/** (4173 estaba ocupado). Para iniciar desarrollo desde el proyecto: `nvm use`, `npm run dev` y abrir el puerto mostrado por Vite, normalmente 5173. `npm run preview` sirve dist local después de compilar; no publica. Instrucciones de continuidad: [ESTADO-ACTUAL](ESTADO-ACTUAL.md).
