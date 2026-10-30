# Verificación · catálogo 0.9.0 / esquema 8

[Informe de comparación, archivos, resultados y límites](CATALOGO-0.9.0.md) · [Checkpoint](ESTADO-ACTUAL.md) · [Evidencia](catalog-verification/README.md).

Aprobados:39 nuevos exactos en precio/stock/marca/código y24 conservados, 63 identidades y códigos únicos;39 imágenes decodificadas en navegador y sin modificación de bytes; búsquedas por nombre/marca/código, categorías/filtros combinados; administración, inventario, crear/editar/eliminar/restaurar y recarga; compra Powerade sin afectar pasta, pedido/stock únicos y seguimiento; migración 7→8 con carrito/sesión/pedido de pasta y datos propios conservados; rutas heredadas y utilidades antiguas.

Tienda 1440/768/390; gestión/compra 1440/390. Chromium 156.0.8078.4, contextos aislados. No excepciones JS capturadas ni desbordamiento de página en los recorridos principales. `npm run check`: tipos, ESLint sin advertencias,26 contrastes y build aprobados. Los testcases aprobados no se repitieron al cerrar documentos.

No se accedió al almacenamiento personal ni se promete una auditoría de datos no disponibles. La fixture de subida comprueba referencias/metadata; IndexedDB no se limpia en importación. Sin prueba nueva de otros motores o dispositivos físicos. Las etapas anteriores de video/tarjeta conservan su evidencia en polish-verification; no se hicieron cambios funcionales allí ni se repitió su batería completa.

Límites de materiales: fotos Powerade/Meli tienen otra presentación; foto Barbie no acredita el modelo; marcas se conservaron según lista. Notas visibles en detalle, sin generar nuevas fotos. Sin fallo funcional confirmado pendiente; no publicación/despliegue/Framer/Figma.

Abrir **http://localhost:4174/catalogo** en esta sesión. Para iniciar: `nvm use`, `npm run dev` y abrir el puerto mostrado.
