# Configuración y verificación · Rosita 0.1.0

Fecha: 29/10/2026. Proyecto preparado directamente en `/home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO`. La carpeta estaba vacía y no contenía aplicación, lock ni instrucciones AGENTS.md; se revisaron también sus ancestros. El repositorio vecino truthlens-extension no se modificó.

## Herramientas y versiones

Node ejecutado: **20.19.4**. npm global detectado: **10.8.2**; instalación realizada con runner **npm 11.21.1**. El gestor global no se cambió. create-vite **9.3.3**, plantilla React + TypeScript. React Router se instala desde el registro npm disponible como 7.18.5, en modo declarativo; no se configura un framework con servidor.

| Paquete directo | Versión instalada |
| --- | --- |
| @eslint/js | 10.0.1 |
| @hookform/resolvers | 6.0.2 |
| @tailwindcss/vite | 4.3.3 |
| @types/node | 24.19.2 |
| @types/react | 19.3.0 |
| @types/react-dom | 19.3.0 |
| @vitejs/plugin-react | 6.1.2 |
| class-variance-authority | 0.7.1 |
| cn | 0.4.0 |
| eslint | 10.13.0 |
| eslint-plugin-react-hooks | 7.1.1 |
| eslint-plugin-react-refresh | 0.5.7 |
| globals | 17.13.0 |
| lucide-react | 1.64.0 |
| motion | 14.7.1 |
| radix-ui | 1.8.1 |
| react | 19.3.1 |
| react-dom | 19.3.1 |
| react-hook-form | 7.91.0 |
| react-router | 7.18.5 |
| shadcn | 4.23.0 |
| sonner | 2.0.8 |
| tailwindcss | 4.3.3 |
| tw-animate-css | 1.4.0 |
| typescript | 6.0.3 |
| typescript-eslint | 8.72.1 |
| vite | 8.3.5 |
| zod | 4.6.7 |

`package-lock.json` fija las resoluciones completas. TypeScript 6.0.3 satisface el rango `>=4.8.4 <6.1.0` de typescript-eslint 8.72.1; la plantilla proponía 7.0.2, por eso se ajustó antes de instalar el linter. ESLint 10, sus plugins y Vite 8 son compatibles con el Node probado. Los engines del proyecto usan la intersección compatible: `^20.19.0 || ^22.13.0 || >=24.0.0`.

## Integraciones configuradas

- Tailwind v4 mediante el plugin oficial @tailwindcss/vite; no se configura Tailwind v3 ni PostCSS/autoprefixer heredados.
- shadcn CLI 4.23.0, base Radix, preset nova (genera estilo radix-nova), CSS variables y alias @/ en TypeScript/Vite. Los 14 componentes solicitados están en components/ui.
- Las dependencias Radix, cn, class-variance-authority, tw-animate-css y Sonner provienen de esa integración. La CLI shadcn queda como dependencia de desarrollo porque aporta también su CSS oficial. Se retiraron next-themes y la fuente descargable que la plantilla añadía: la base solo necesita tema claro y tipografía de sistema.
- Motion se importa desde motion/react; MotionConfig respeta la preferencia del usuario y un hook con useSyncExternalStore actualiza la muestra cuando cambia prefers-reduced-motion. CSS usa 150 ms para controles y 240 ms para paneles; curvas coherentes, sin animación decorativa continua.
- Formularios: React Hook Form + zodResolver de @hookform/resolvers/zod + Zod 4. No se guardan nombre/correo ni se envían a un servicio.
- Estado: Context/useReducer. Reducer puro y persistencia aislada en lib/storage.ts, con validación de entrada, versión 1, manejo de JSON inválido y bloqueo de sobrescritura de una versión futura hasta reset explícito.
- Dos rutas cargadas bajo demanda; el foco entra al título y los modales Radix conservan/restauran foco. La división por rutas eliminó la advertencia inicial de bundle grande.
- ESLint recomendado JavaScript/TypeScript y reglas de hooks. La excepción de Fast Refresh se limita a los componentes UI generados que exportan variantes junto al componente.

## Resultados ejecutados

| Comprobación | Resultado |
| --- | --- |
| npm run typecheck | Correcto, sin errores |
| npm run lint | Correcto, cero advertencias |
| npm run check:contrast | Correcto, 15 combinaciones usadas dentro de su umbral |
| npm run build | Correcto, sin advertencia de chunks grandes tras dividir rutas |
| npm ls --depth=0 | Dependencias directas resueltas sin conflictos reportados |
| Chromium local 1440/768/390 | Dos rutas, enlace profundo/recarga, estado, formulario, modal, avisos, foco y movimiento reducido verificados |
| JSON inválido, versión futura y almacenamiento bloqueado | Recuperación y avisos verificados; no hay excepción no controlada |
| Reset exclusivo | Clave ajena preservada; claves con prefijo Rosita restablecidas |
| Reducer | Valores limitados a 0–24, sin negativos |

Evidencias: `verification/browser-smoke.json`, capturas, `contrast.json`, `installed.json` y `check.log`. El navegador usado fue Chromium automatizado en Linux/WSL; no se afirma haber probado Safari, dispositivos físicos o lectores de pantalla. No hay resultados de participantes ni auditoría WCAG completa. El harness de navegador utilizó Playwright ya disponible en el entorno de verificación; no se añadió una biblioteca de pruebas a la aplicación.

### Contraste y tokens

La marca original se mantiene como identidad. Blanco sobre #239898 alcanza 3.49:1, insuficiente para texto normal pequeño; por eso primary es #146E6E y alcanza **6,03:1**. Hover y presionado usan tonos más oscuros, incluso cuando Button se compone con DialogTrigger/DialogClose. El foco azul completo tiene 5,17:1 sobre blanco y 4,50:1 sobre celeste. Los errores incluyen texto/símbolo y relación aria-describedby, no solo color.

### Dependencias de herramientas

La auditoría de dependencias de producción reportó cero incidencias (`audit-production.json`). La auditoría completa reportó tres entradas de severidad baja relacionadas entre sí en la cadena de la CLI de desarrollo shadcn → @shadcn/registry → deepmerge. La corrección automática propuesta era cambiar shadcn a 1.0.0 con ruptura de versión; no se aplicó ese downgrade ni un --force. Esto no bloqueó instalación, tipos, lint o build. La CLI no se ejecuta en el navegador. Revisar esa cadena cuando se actualice la herramienta.

## Incidencias resueltas y recuperación

1. El primer comando con permisos de escritura seleccionó por PATH Node 18.19.1, a pesar de que el entorno normal tenía 20.19.4. create-vite falló por falta de node:util.styleText. Se fijó el PATH explícito a Node 20 para todas las instalaciones y pruebas.
2. Ese intento dejó un lock vacío de 97 bytes; se archivó antes de inicializar nuevamente, sin borrar contenido previo del usuario.
3. npm 10.8.2 falló dentro de Arborist con edgesOut al resolver peers. Se repitió la instalación con npm 11.21.1, sin usar legacy-peer-deps ni ignorar conflictos.
4. La CLI actual separa --base radix de --preset nova; se corrigió el nombre del preset antes de que escribiera componentes.
5. La prueba de teclado detectó que las clases generadas anulaban el contorno; se añadió una regla de foco de contraste completo. Se extendieron tamaño/hover a los botones compuestos de Radix, cuyos data-slot cambian.

`recovery/vite-template.zip` conserva el scaffold inicial (antes de la configuración propia) y `empty-lock-after-failed-install.json` conserva el lock de la incidencia. `recovery/base-configurada-0.1.0.zip` conserva fuentes/configuración/lock de la base terminada, excluyendo node_modules y dist; ejecutar el comando de instalación del README para recuperarlo. No restaurar sobre cambios futuros sin compararlos.

## Referencias oficiales consultadas

- [Vite: guía e instalación](https://vite.dev/guide/).
- [Tailwind: plugin oficial para Vite](https://tailwindcss.com/docs/installation/using-vite).
- [shadcn/ui: instalación en Vite](https://ui.shadcn.com/docs/installation/vite).
- [Motion para React: instalación e importaciones](https://motion.dev/docs/react-installation).
- [React Router: modo declarativo](https://reactrouter.com/start/declarative/installation).
- [React Hook Form](https://react-hook-form.com/get-started), [resolvers](https://github.com/react-hook-form/resolvers) y [Zod](https://zod.dev/).
- [Lucide React](https://lucide.dev/guide/react).
- Versiones y engines contrastados además contra los metadatos actuales de npm.

## Alcance de diseño

El enlace aclarado por el usuario corresponde a Framer demo-log, no a un archivo Figma. Se conserva como referencia para la migración posterior. En esta etapa solo se usa la identidad y el logotipo locales de Rosita; no se construyó ni reemplazó la tienda completa. Los PDF aportados son referencias de alcance, no autorización para publicar ni evidencia de pruebas realizadas en esta base. No se afirma una nueva lectura integral de esos PDF durante la instalación. No se accedió ni editó un archivo de Figma. No se publicó ni desplegó nada.
