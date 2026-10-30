# Verificación · aplicación 0.6.0 / DS 2.4.0 / esquema v5

Etapa actual: categorías generales y subcategorías diferenciadas, filtros combinados y URL persistente, formulario administrativo dependiente y migración sin reescribir historial. Informe con clasificación completa, comprobaciones y límites: **[SUBCATEGORIAS.md](SUBCATEGORIAS.md)**. Evidencia: subcategory-verification.

Compilación, tipos, ESLint y contraste aprobados. Catálogo a 1440/768/390 y administración a 1440/390 verificados. Migración v4→v5 con producto personalizado, carrito y pedido generado, además de versiones previas, verificada. Compra y seguimiento completos comprobados con el esquema nuevo a tres anchos. Dependencias y reglas de importes/stock sin cambios.

## Inventario conservado

No se crearon pantallas funcionales por cada subcategoría. Se reutiliza `/categoria/:slug?subcategoria=:id`, `/catalogo`, detalle y formulario administrativo existentes. Panel móvil y estados sin resultados son variantes/estados, no rutas adicionales. No se declara «24 vistas conectadas».

Inventario completo: [informe 0.4.0](history/VERIFICACION-0.4.0.md). Inicio/motion: [0.5.0](history/VERIFICACION-0.5.0.md). Visor: [0.5.1](history/VERIFICACION-0.5.1.md) y [ZOOM-IMAGENES.md](ZOOM-IMAGENES.md). Sus evidencias anteriores permanecen intactas; no se declara una nueva auditoría completa de módulos no afectados. Caja y A/B siguen fuera de lo implementado.

## Abrir

`nvm use`, `npm run dev`; **http://localhost:5173/categoria/consumibles?subcategoria=snacks**. En móvil abre Filtros. Entorno, credenciales ficticias y comandos en [README](../README.md). Sin publicación/despliegue.
