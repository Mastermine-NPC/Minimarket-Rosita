# Verificación · aplicación 0.7.0 / DS 2.5.0 / esquema v6

Cierre de módulos informativos y administrativos. [Inventario real, tabla A–M, guion y relación con sílabo](MODULOS-0.7.0.md). [Checkpoint y comandos de continuidad](ESTADO-ACTUAL.md).

## Resultados

- A–J y L verificados: menú informativo, páginas/FAQ/contacto, accesos/perfil, taxonomía, archivos persistentes, compra compartida, stock e históricos, estadísticas/CSV/impresión y recuperación.
- K: cliente sin rutas/acciones administrativas; cajero no aplicable porque la caja no existía.
- M: compra/seguimiento previos aprobados; caja no aplicable. No se afirma implementación POS.
- Chromium: información/perfil/compra/filtros/zoom a 1440/768/390; ciclo administrativo completo a 1440/390 y navegación/tablet a 768. Errores JS: ninguno en las ejecuciones finales.
- Tipos, ESLint, 24 contrastes y compilación: resultado final en `module-verification/check.log`.

Evidencia reproducible: [module-verification/README](module-verification/README.md). Los scripts usan contextos aislados sin datos personales. CSV descargado y PDF headless inspeccionado; no se operó una impresora física/diálogo del sistema.

Las correcciones de selectores del harness y espera de render se describen en el informe. No se repiten pruebas aprobadas al cerrar documentación. Documentos/evidencias anteriores se conservan en history y carpetas de etapas previas; sus cifras/resultados describen aquellas versiones.

## Límites y acceso

No hay caja/cajero, A/B, backend, pagos/contacto reales o reparto en vivo. Sin estudio de usuarios/lector de pantalla/dispositivos físicos u otros motores. Anchos principales probados; no se declara revisión exhaustiva de todos los intermedios. Una pestaña/navegador; localStorage+IndexedDB, con avisos y reset exclusivo. Fotos originales de baja resolución y seis ilustraciones identificadas.

Desde el proyecto: `nvm use`, `npm run dev`, abrir **http://localhost:5173/** o puerto mostrado. Para build: `npm run build`, `npm run preview`, **http://localhost:4173/**. No publica ni modifica Framer/Figma.
