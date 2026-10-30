# Verificación · aplicación 0.5.1 / Design System 2.3.1 / esquema v4

La etapa actual incorpora zoom de imagen en el detalle, sin cambiar funciones de compra ni dependencias. Resultado, tabla de comprobaciones, recursos, limitaciones y acceso: **[ZOOM-IMAGENES.md](ZOOM-IMAGENES.md)**. Evidencia: `zoom-verification`.

- Tipos, ESLint, 24 pares de contraste y compilación: aprobados.
- Visor en 1440/768/390, puntero/teclado/táctil, límites, foco, movimiento reducido, fuente fallida y pinza nativa: verificados en Chromium local.
- Regresión de tienda a tres tamaños: aprobada. Administración/checkout no se reimplementaron ni se declara una nueva comprobación completa de esos módulos en esta etapa.
- No se recibieron capturas accesibles con esta solicitud; la referencia fue el comportamiento escrito. Sin publicación o despliegue.

## Inventario e informes conservados

El visor es un modal/estado del detalle `/producto/:id`, no una ruta ni una pantalla funcional adicional. No se cuentan variantes responsive como vistas nuevas. No existen miniaturas/múltiples fotografías por producto en los datos actuales.

[Informe del inicio 0.5.0](history/VERIFICACION-0.5.0.md) conserva su navegación, motion y pruebas. [Inventario completo 0.4.0](history/VERIFICACION-0.4.0.md) enumera tienda, cliente y administración, accesos y límites. Siguen vigentes frontend/persistencia local, pagos/seguimiento simulados y caja/A-B pendientes. No se afirma «24 vistas conectadas».

## Abrir

`nvm use`, `npm run dev`; abre **http://localhost:5173/producto/ROS-001**. Consulta [README](../README.md) para entorno y credenciales ficticias; **[sistema de diseño](DESIGN-SYSTEM.md)** para reglas actuales.
