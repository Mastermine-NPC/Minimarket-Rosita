# Verificación · aplicación 0.8.0 / DS 2.6.0 / esquema 7

[Informe de cambios, archivos, pruebas, videos y tarjeta](PULIDO-0.8.0.md) · [Checkpoint](ESTADO-ACTUAL.md) · [Evidencia](polish-verification/README.md).

Aprobados: tipos, ESLint, compilación y26 contrastes; tarjeta aprobada/rechazada/error, privacidad de persistencia, cancelación y pedido/stock únicos; validación de carrito y revisión invalidada al cambiar/restaurar cantidad; migración 6→7; compra previa con efectivo/registro/seguimiento; contacto inválido/corregido/legítimo; inventario con umbral/activación; navegación y layout público/admin; videos reproducidos realmente, pausa/fallo/autoplay bloqueado/reducedmotion y carga secundaria voluntaria.

Anchuras 1440/768/390, intermedias 1200/1024 para video/público y 1024/600 para administración. Chromium 156.0.8078.4; sin excepciones JS inesperadas. La visibilidad de pestaña se simuló por evento; no dispositivo físico. Se inspeccionaron capturas de inicio/video, Nosotros, inventario y footer. La última corrección de atributos de foto se comprobó frente a dimensiones naturales 1024×598.

Baterías aprobadas no se repitieron al cerrar documentación. Los cambios finales de carrito/foto se verificaron mediante casos focalizados y compilación. Evidencia histórica 0.7 y guion A–M permanecen en sus documentos; no se afirma nueva auditoría completa de módulos ajenos al pulido.

Sin POS/cajero/A-B, backend, pagos/contacto/reparto reales. Sin usuarios inventados ni certificación WCAG; no Safari/Firefox/lector de pantalla/dispositivo físico. Un solo navegador/pestaña; datos locales. El segundo video es ficción opcional y no entrega de Rosita.

Preview actual: **http://localhost:4174/**. Desarrollo: `nvm use`, `npm run dev`, abrir puerto de Vite. No despliegue ni modificación de Framer/Figma.
