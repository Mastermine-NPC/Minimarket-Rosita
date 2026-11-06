# Inicio Coca-Cola y acceso Full Screen

Rutas: `/`, `/login`, `/registro`, `/personal`.

## Resultado y alcance

El Home comienza con la escena Coca-Cola existente, de borde a borde. Se retiraron el hero de Arequipa y la introducción Halloween: no se ocultan mediante CSS, ya no se renderizan. También se eliminó el componente `LiquidVideos` sin consumidores y sus reglas de composición. Los archivos audiovisuales siguen disponibles para otros usos: por ejemplo, Nosotros conserva su video Arequipa.

La secuencia de cinco escenas, sus ocho videos originales, selección de marcas, navegación, transiciones acuáticas y productos destacados siguen funcionando. La primera escena utiliza un h1 y su poster es prioritario. El pin empieza en `top top` y tiene altura de viewport; se eliminó exclusivamente en Home la antigua reserva de 44 px del header. La primera superficie no extiende una onda decorativa fuera del borde superior. No se reconstruyeron los shaders ni se alteraron los archivos de video.

Login y registro ocupan el ancho completo y al menos `100dvh`. La mitad audiovisual y la superficie del formulario llegan a los bordes: no hay contenedor de tarjeta exterior ni margen global. En escritorio la película se mantiene sticky mientras se recorre el formulario; en móvil pasa a una cabecera de 240 px con reencuadre y formulario de ancho disponible. Es posible desplazar la página para acceder a todos los campos, incluso en pantallas bajas.

Se conservaron colores y fuentes de Rosita, video introductorio y poster originales. Los overlays locales sobre el video controlan contraste; las entradas tienen foco visible, estados y respuesta breve. Las imágenes de referencia proporcionadas se pudieron abrir desde `/mnt/c/Users/hisok/AppData/Local/Temp/` y se compararon con el resultado. Se conservó también una captura propia de la compilación anterior.

## Autenticación conservada

La implementación existente es **local y simulada**, con verificadores de contraseña y persistencia en el navegador; no tiene endpoints de autenticación de servidor. No se añadieron cuentas, credenciales, APIs ni datos precargados.

`AuthForm` conserva schema, validación, submit, verificación, reducer, roles, sesión, mensajes y retorno seguro. Su único cambio es de presentación: el bloque existente de accesos de demostración se movió debajo del formulario dentro de un `details` nativo cerrado inicialmente. Todos los accesos originales siguen disponibles.

Se mantienen:

- Correo y contraseña; nombre y confirmación en registro.
- Mostrar/ocultar ambas contraseñas mediante el componente original.
- Errores de formato, correo duplicado, contraseña incorrecta y confirmación distinta.
- Botón y estado Procesando, confirmaciones y toasts originales.
- Redirección según rol y `volver`, persistencia y cierre de sesión.
- Carrito e información comercial al registrarse o entrar.

No existía recuperación de contraseña; no se añadió un enlace sin funcionalidad.

## Continuidad y aislamiento visual

La familia de rutas de acceso comparte la misma clave de layout. El cambio login/registro evita la cortina general únicamente en ese par y anima la superficie del formulario durante 280 ms. Se verificó que **el mismo nodo de video** sobrevive al cambio. El formulario se reinicia al cambiar de modo, como antes.

Se evita SplitText y el movimiento de toda la página en las rutas de acceso, para mantener React dueño del título y no desplazar una superficie Full Screen. Lenis se omite solo allí para usar desplazamiento nativo y foco de formulario. El resto de rutas mantiene sus animaciones y scroll originales. `prefers-reduced-motion` elimina el movimiento de entrada y el componente audiovisual compartido conserva su política de poster/ahorro de datos.

El header, su comportamiento bajo demanda, footer y enlaces comerciales no se rediseñaron. Los estilos nuevos están limitados a `.auth-screen` y `.auth-store-shell`; los ajustes de apertura usan `.home-opening` y `.home-store-shell`. No se editaron catálogo, tarjetas comerciales, filtros, carrito, checkout, modelos GLB ni lógica de pedidos. Los cambios de UI Lab que estaban pendientes al iniciar esta tarea se conservaron.

## Archivos de esta tarea

- `src/pages/home-page.tsx`: retirada real de los dos bloques iniciales, imports, motion del hero y observer que ya no se necesita.
- `src/features/inicio/cinematic-story.tsx`: inicio de pin sin reserva antigua y primera escena de apertura.
- `src/features/inicio/cinematic-chapter.tsx`: h1 de apertura, foco y prioridad de poster sin duplicar el componente.
- `src/features/inicio/liquid-videos.tsx`: eliminado al quedar sin uso.
- `src/styles/home.css`: retirada del bloque de composición LiquidVideos y ajustes limitados a la apertura.
- `src/pages/auth-page.tsx`: composición audiovisual y formulario Full Screen.
- `src/styles/auth-screen.css`: nueva hoja local al acceso, responsive y movimiento reducido.
- `src/features/acceso/auth-form.tsx`: accesos existentes plegables; lógica intacta.
- `src/components/layout/app-layout.tsx`: identificación de la familia de acceso y clave compartida.
- `src/features/cinema/route-transition.tsx`: cambio breve solo entre login y registro.
- `src/features/cinema/use-public-motion.ts`: excepción local de animación general en acceso.
- `src/features/cinema/use-smooth-scroll.ts`: scroll nativo exclusivamente en acceso.
- `scripts/verify-home-auth-browser.mjs`: recorrido reproducible de navegador.
- Esta carpeta: pruebas, capturas y revisión visual.

Sin dependencias nuevas. Sin cambios de esquema, backend, datos, reglas de sesión ni recursos multimedia.

## Verificación

`npm run check`: TypeScript, ESLint, contraste y build de producción. Se conservan las advertencias de tamaño de chunks de los módulos 3D/mapa existentes.

`npm test`: suite existente de operaciones, catálogo, Halloween, pedidos, teléfono internacional y métricas del UI Lab. Los informes de operaciones que escribe esa suite se restauraron para no incorporar artefactos ajenos al cambio.

Chrome/Playwright sobre la compilación:

- Home sin `.cinema-hero-media`, `.liquid-videos`, `.cinema-intro` ni `.home-hero`.
- Ocho elementos de video en escenas, Coca-Cola primero, reproducción progresiva y sin solicitudes de los videos retirados al abrir Home.
- Borde superior de la apertura en 0; altura mínima de viewport; sin overflow horizontal.
- Login y registro a ancho completo y al menos altura de viewport en 1440×1000, 1024×768, 768×1024, 390×844 y 320×740.
- Cambio Coca-Cola/Inka Kola, recorrido de las cinco escenas y limpieza de pin/canvas Home al navegar al acceso mediante el header.
- Validaciones, mostrar/ocultar contraseña, correo duplicado, registro nuevo, login, recarga, logout y retorno al carrito.
- Accesos originales de cliente, administrador y caja; destinos correspondientes.
- Carrito, inventario, pedidos y ventas conservados tras registrar la cuenta técnica.
- Continuidad del nodo de video entre login y registro.
- Rutas catálogo, Halloween, detalle de producto, carrito, checkout, Nosotros y UI Lab.
- Movimiento reducido: poster disponible, Home sin pin y formulario sin animación.
- Contexto móvil con pantalla táctil: mostrar contraseña, navegación al registro y campos accesibles por scroll.

Las cuentas de verificación se crearon mediante el formulario en un contexto de navegador de prueba separado. No se incorporan a los datos del proyecto ni a la sesión del usuario. Son datos técnicos, no cuentas de producción.

El script admite `BASE_URL`, `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXPECT_MODULE`, `CHROME_PATH` y `VERIFICATION_OUT`. Se usó Chrome de Windows con el Playwright instalado en el runtime de Codex, sin instalar dependencias en el proyecto.

## Límites

Las pruebas responsive se hicieron en Chrome con emulación y tamaños de viewport; no sustituyen pruebas con teclado virtual en dispositivos físicos. Autoplay sigue sujeto a la política del navegador; el poster original queda disponible si no se puede reproducir. La autenticación conserva las limitaciones del prototipo local y no se convirtió en autenticación de servidor.

## Capturas y evidencia

- Antes: [Home](before/home.png), [login](before/login.png), [registro](before/register.png).
- Escritorio: [Home](home-1440.png), [login](login-1440.png), [registro](registering-1440.png).
- Tablet: [Home](home-768.png), [login](login-768.png), [registro](registering-768.png).
- Móvil: [Home](home-390.png), [login](login-390.png), [registro](registering-390.png), [táctil](touch-register.png).
- Móvil estrecho: [Home](home-320.png), [login](login-320.png), [registro](registering-320.png).
- Escenas: [Oreo](scene-Oreo.png), [Nivea](scene-Nivea.png), [Faber-Castell](scene-Faber-Castell.png), [Ferretería](scene-Ferreter-a.png), [Coca-Cola](scene-Coca-Cola.png).
- [Medidas y resultados](results.json), [navegador](browser.txt), [check](check.txt), [regresiones](regression.txt).
- [Revisión visual](visual-review.md), [informe del inspector](inspection/report.json).
