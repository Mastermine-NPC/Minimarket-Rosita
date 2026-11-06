# Sistema de diseño administrable — Rosita

La tienda conserva su identidad verde/rosa, DM Sans/Manrope, superficies comerciales y composiciones especiales. El editor está en `/admin/personalizacion` y en el menú administrativo y perfil. No se ha desplegado un servicio externo.

## Auditoría previa

`audit-before.json` se generó **antes de modificar los estilos**. Inventaría todas las páginas, patrones de ruta, componentes UI, declaraciones de variables, usos, colores literales, declaraciones tipográficas y archivos especiales. `migration.json` identifica los archivos migrados. El diagnóstico fue:

- `src/styles/tokens.css` ya era la base compartida: colores semánticos, fuentes, espacios, radios, sombras y tiempos. Tailwind utiliza esos colores mediante `@theme inline`.
- `globals.css`, `modules.css`, `operations.css` y `polish.css` contienen los patrones comerciales y administrativos. `rosita-editorial.css` cambia después fondos y radios, con definiciones locales repetidas de `radius-card` y `radius-control`. Los radios efectivos eran 4 px, aunque el laboratorio documentaba 20/10 px.
- El laboratorio en `src/features/ui-lab` tenía tokens literales y componentes experimentales propios dentro de Shadow DOM, catálogo ficticio y evaluación A/B local. Se ha reutilizado, no duplicado. Su registro de tokens ahora viene de la fuente central y hereda la propuesta.
- `/sistema-diseno` conserva su galería pública de componentes reales, ahora con muestras, fuentes, radios y tiempos obtenidos de la configuración publicada. No administra otro tema. La edición está en administración.
- No existían backend, base de datos ni autenticación de servidor. Los perfiles y operaciones comerciales funcionan con Context/reducer y almacenamiento local. No se trasladaron esos datos ni se cambiaron sus procesos.

### Mapa de rutas y componentes

| Rutas reales | Componentes y alcance |
| --- | --- |
| `/` | CinematicStory, capítulos, GSAP, videos, superficie líquida WebGL, interacción de categorías: composición y shaders preservados. Tipografía compartida consume fuentes centrales. |
| `/catalogo`, `/categoria/:slug` y query de búsqueda/ofertas | Catálogo/hook actual, filtros/sidebar sticky, búsqueda, tarjetas y paginación. Siete categorías actuales, incluidas Halloween y las subcategorías del catálogo. |
| `/producto/:id` | Información, cantidades, carrito y ProductPresentation/Canvas existentes. GLB, cámara, luces y fondos de cada modelo conservados. |
| `/carrito`, `/checkout` | CartContent, resumen, formularios, pasos, confirmación y controles existentes. |
| `/login`, `/registro`, `/personal`, `/cuenta` | AuthForm, ProfileForm, accesos y permisos comerciales locales existentes. La credencial del servicio visual es independiente. |
| `/mis-pedidos`, `/pedido/:id`, `/pedido/:id/confirmacion`, `/pedido/:id/seguimiento` | Estados, notificaciones, mapa y recorrido conservados; componentes compartidos reciben tokens. El estilo geográfico del mapa permanece local. |
| `/nosotros`, `/ayuda`, `/contacto` | Hero compartido, contenido, controles y formularios; máscara de alpha y videos intactos. |
| `/sistema-diseno`, `/comprobacion`, `/estado` | Galerías y utilidades existentes, estilos compartidos y muestras publicadas. |
| `/admin`, `/admin/productos`, `/admin/categorias`, `/admin/inventario`, `/admin/pedidos`, `/admin/pedidos/:id`, `/admin/clientes`, `/admin/agentes`, `/admin/ubicacion`, `/admin/reportes` | AdminLayout, formularios/diálogos, tablas, métricas y paneles comunes. Se conservan perfiles, inventario y pedidos. |
| `/caja` | Gestión de caja y su control de acceso existente. |
| `/admin/personalizacion`, `/admin/personalizacion/componentes`, `/admin/personalizacion/laboratorio`, `/admin/personalizacion/variantes` | Editor, galería de componentes reales y laboratorio/A-B original. |
| `/laboratorio-ui` | Redirección compatible hacia el laboratorio dentro de administración, pasando por su control de acceso. |
| Comodines público/administrativo | Estados de ruta no encontrada existentes. |

Primitivas reutilizadas: Button, Input, Card, Badge, Alert, Dialog y sus subcomponentes, Sheet, Select, Dropdown, Tabs, Table, Tooltip, Skeleton y Sonner. Layout, filtros, encabezados, footer, QuantitySelector y tarjetas comerciales conservan sus componentes y lógica.

## Arquitectura y fuente de verdad

- `src/design/registry.json`: 128 tokens tipados por metadatos, valores originales, etiquetas, grupos, rangos, unidades, opciones y enlaces semánticos. Incluye colores, superficies de contexto, fuentes locales/sistema, escalas, pesos, estados, seis variantes de botón, radios, sombras, espaciado y movimiento compartido.
- `tokens.css` se genera desde ese registro: `npm run tokens:generate`. `node scripts/generate-design-tokens.mjs --check` detecta divergencias. Los aliases `brand`/`rose` apuntan a `primary`/`accent`; no son otros editores de color independientes.
- `theme.ts` valida, resuelve enlaces semánticos y aplica propiedades CSS mediante `style.setProperty`. Un botón, por ejemplo, sigue el primario mientras su color semántico conserve el original; se puede personalizar después por separado. La configuración nunca acepta nombres arbitrarios de propiedades, selectores, URLs ni CSS libre.
- `validation.mjs` se comparte entre navegador y servidor: colores hex de seis cifras, familias/sombras/curvas en listas permitidas, valores numéricos con límites y contraste mínimo 4.5:1 en pares de texto importantes. Las variantes solid/outline/ghost/soft/glass/gradient son opciones de código, no CSS recibido del usuario.
- Los estilos comunes usan variables conservando su valor inicial. `design-system.css` une controles semánticos, modales, dropdowns, variantes y estados. Los botones explícitamente outline/ghost/destructive no se convierten a la variante predeterminada.
- El estado publicado se consulta **antes de montar React**; las rutas comparten la configuración y se actualizan al recuperar foco o, mientras la pestaña esté visible, cada 30 segundos. No se aplica primero la tienda predeterminada para luego recolorearla. Si la consulta inicial falla, se muestran los valores originales; una consulta posterior fallida conserva la última versión validada.
- El borrador vive en el editor, sin modificar la tienda publicada. Componentes reales se previsualizan dentro de un ámbito CSS; los modales reciben también la propuesta en su portal. Las rutas de iframe reciben mensajes únicamente de su ventana padre y origen propio. Un protocolo de disponibilidad evita perder la propuesta durante la carga.

Los efectos especiales conservan duraciones, GSAP, Lenis, Three.js, modelos, shaders, videos, fondos geográficos y siluetas propias. Las tarjetas de producto mantienen su superficie blanca de cristal y geometría; se parametrizan color base, radio existente, transparencia y sombra donde corresponde. No se fuerza un único diseño de tarjeta.

## Uso del editor

1. Acceder al administrador de demostración y abrir **Personalización visual**.
2. Elegir un grupo o buscar variables. Los colores tienen selector y hex editable; las dimensiones tienen rangos y valores; fuentes, sombras y variantes usan listas seguras.
3. Revisar los componentes reales, comparar **Publicada / Propuesta** y, opcionalmente, abrir una ruta real en la vista previa.
4. Introducir la **credencial del servidor** en “Permiso de publicación”. El rol local por sí solo no permite publicar.
5. Publicar. “Descartar” recupera la versión guardada; “Restaurar originales” prepara un borrador original, que también requiere publicar para afectar a visitantes.

Si otra sesión publicó antes, el servidor devuelve conflicto 409. “Recuperar versión publicada” recarga la revisión y sustituye el borrador; el mensaje lo indica. Cerrar o recargar con cambios pendientes muestra la advertencia nativa del navegador. Los escenarios de evaluación siguen siendo ficticios, y sus registros locales anónimos no se publican con el tema.

## Arranque de desarrollo

`npm run dev` inicia frontend Vite desde el puerto 5173 (elige el siguiente libre si está ocupado) y servicio visual en 4191, carga `.env` de forma privada, espera a que la API esté disponible y conecta el proxy. Ctrl+C detiene ambos. Si un servicio falla, no deja el otro funcionando como si el arranque hubiera sido completo. La publicación sigue requiriendo `ROSITA_DESIGN_ADMIN_PASSWORD`; sin ella la API informa modo de solo lectura. Para otra URL de acceso de desarrollo se puede indicar `ROSITA_DEV_ORIGIN`; `--port` ajusta el origen local automáticamente. `ROSITA_DESIGN_PORT` permite cambiar el puerto interno del backend.

## Servicio real y configuración

El servicio Node incluido sirve `dist` y `/api/design/*` desde el mismo origen. Guarda un documento JSON con escritura temporal + renombrado atómico, revisión, fecha y las últimas 100 entradas de auditoría (claves modificadas; nunca contraseña). Es apropiado para este documento pequeño con **una instancia escritora**. No necesita una base de datos adicional. En alojamiento con múltiples instancias se debe conectar un repositorio transaccional compartido antes de escalar.

Configuración local, sin incluir secretos en código ni en el bundle:

```sh
cp .env.example .env
# Editar .env en privado y asignar ROSITA_DESIGN_ADMIN_PASSWORD (16+ caracteres).
# ROSITA_APP_ORIGIN debe coincidir exactamente con la URL del navegador.
set -a
source .env
set +a
npm run build
npm start
```

Abrir `http://localhost:4191`. `npm start` lee el entorno del proceso: no carga `.env` automáticamente. En desarrollo, la configuración de Vite redirige `/api/design` al servicio de 4191; es necesario reiniciar una instancia Vite anterior para cargar ese proxy. Si el navegador usa 5173/4190, ajustar `ROSITA_APP_ORIGIN` a ese origen antes de arrancar el backend. Para revisar directamente el servidor construido usar 4191.

En alojamiento: origen HTTPS real en `ROSITA_APP_ORIGIN`, proceso Node detrás del proxy, `ROSITA_DESIGN_FILE` en disco persistente privado fuera de `dist`, copias de seguridad y una única instancia escritora. `HOST=0.0.0.0` solo si el entorno de alojamiento necesita ese enlace. Las variables de servidor no usan prefijo `VITE_`. No se ha añadido una contraseña predeterminada ni una clave ficticia.

Sin credencial, la lectura pública funciona y la publicación responde 503. Sin servicio, el frontend muestra el tema original y no anuncia una publicación exitosa. Las pruebas utilizan credenciales y archivos temporales; no son una configuración de producción.

### Seguridad

La credencial de servidor autoriza una sesión del administrador visual, independiente del usuario comercial simulado. Se verifica con scrypt y comparación constante. Cookie HttpOnly, SameSite=Strict, expiración de ocho horas, Secure si el origen configurado es HTTPS. Escrituras y autenticación requieren Origin exacto; publicar/cerrar sesión requieren CSRF. Intentos de acceso y tamaño de solicitud limitados, sesiones en memoria acotadas. Reiniciar invalida sesiones, conserva tema. No se permite escribir usando el rol enviado desde el cliente ni hay endpoints para establecerlo.

La auditoría identifica al administrador visual compartido (`design-administrator`); no inventa identidad individual ni convierte las cuentas locales en autenticación real. Para múltiples administradores identificados se debe integrar un proveedor de identidad real en el backend. El tema sigue publicado después de cerrar sesión. La sesión del servicio visual tiene su propio botón de cierre.

## Verificación

- `npm run check`: TypeScript, ESLint, contraste original y build.
- `npm test`: operaciones/pedidos/inventario/catálogo/teléfonos y métricas A/B existentes.
- `npm run test:design`: 128 tokens, listas permitidas, CSS/URL no autorizado, rangos, contraste, origen/CSRF, cookie, permisos, publicación, visitante sin sesión, conflictos, persistencia tras reinicio, restauración, auditoría, adición de tokens, archivo corrupto protegido, credencial ausente, SPA y solicitudes Range. Archivos temporales eliminados al terminar.
- `scripts/verify-design-browser.mjs`: Chrome real sobre build, tres anchos, borrador aislado, publicación, visitante independiente, recarga, carrito, laboratorio protegido y reutilizado, A/B, modal real, restauración y estado comercial intacto. El informe detalla las rutas visitadas. Los pedidos sin datos se verifican como estados vacíos/no encontrados; no se presentan como un recorrido de entrega real.
- Inspector de diseño: capturas y observaciones en esta carpeta. El informe distingue advertencias preexistentes de defectos del editor.

Para repetir Chrome, configurar PLAYWRIGHT_MODULE, PLAYWRIGHT_EXPECT_MODULE, CHROME_PATH, BASE_URL, VERIFICATION_OUT y DESIGN_TEST_PASSWORD (o DESIGN_SECRET_FILE privado). Usar un servicio y archivo de configuración temporales: la prueba publica y restaura, nunca apuntarla a una tienda en producción.
