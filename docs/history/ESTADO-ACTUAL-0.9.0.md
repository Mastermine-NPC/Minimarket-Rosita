# Estado actual · catálogo 0.9.0 · 30/10/2026

Proyecto: `/home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO`. App 0.9.0 / esquema 8 / DS 2.6.0. Cambios y archivos previos conservados; sin reinicialización, nuevas dependencias, publicación/despliegue o cambios en Framer/Figma. Estado 0.8 conservado en history/ESTADO-ACTUAL-0.8.0.md.

## Implementado

- Base unificada 63: 24 anteriores conservados y 39 nuevos, nombres/marcas/precios/stock suministrados exactos. Cero duplicados en la base anterior; ningún artículo previo eliminado. Seis categorías originales intactas y 13 subcategorías basadas en los artículos nuevos. Umbral inicial 5, todos los nuevos stock≥10.
- 39 fotos reutilizadas: 30 movimientos necesarios y 9 de Consumibles en su lugar, bytes/hashes iguales, sin descargar/generar/reemplazar fotos. HDMI ROS-043, mouse ROS-062 y UNO ROS-044 resueltos por contenido. Tres notas de material: Powerade 600 ml/registro 500 ml, Meli 135 g/registro 100 g, Barbie Dreamhouse no acreditado por la foto. Marcas Mikas/Kingstone se conservan según lista.
- Conflicto ROS-024: pasta Colgate mantiene ID ROS-024, stock/precio/histórico; código comercial ROS-063. Powerade código ROS-024 e ID ROS-024-IMPORT. Búsqueda/UI usan código comercial; relaciones y URLs ID estable. Nunca se remapean pedidos de pasta a Powerade.
- Integración única con catalogRevision y migración v7→8; versiones previas conservadas, v3 reconstruye sus 24 registros antes de añadir 39. Productos propios, cuentas/sesión, carrito, stock/precios anteriores, históricos y metadata de subidas se mantienen; no se toca IndexedDB ni otras claves.
- Tienda, búsqueda, categorías, gestión/inventario y reportes comparten estado. Crear/editar/ajustar precio/stock funcionan. Eliminar es recuperable, conserva referencias y no reaparece al recargar; restaurar devuelve desactivado para activación explícita.

## Pruebas aprobadas (no repetir sin cambio relacionado)

Evidencia: `docs/catalog-verification`.

- `core.json`: 39 exactos, 24 conservados, 63 identidades/códigos únicos; filtros, conflicto, migraciones v1/v2/v3/v4/v7, cuenta/sesión/pedido de pasta/carrito/metadata/precios propios preservados, coincidencia exacta con otro ID y eliminación recuperable/permisos.
- `interfaz.json`: tienda 1440/768/390, 39 fotos decodificadas/contain, búsquedas nombre/marca/código, seis categorías y combinación; detalle/zoom/notas. Gestión/compra 1440/390: 63 registros, creación/edición/precio/stock/recarga, eliminación y restauración, Powerade 7.50 con stock 30→29 y una sola salida/pedido, pasta intacta y seguimiento. Migración en navegador conserva 64 con un producto propio sin duplicar en recargas.
- `images.json`: 39 rutas/hashes,30 movidas y 9 intactas. `recursos-previos.json`: 6 SVG y atlas anterior responden 200. `comparacion.json`: comparación completa de datos fuente. Mosaico y capturas ejecutadas revisados; capturas de detalle se repitieron solo para retirar el desenfoque transitorio del cierre del visor.
- `check.log`: `npm run check` aprobado; tipos, ESLint sin advertencias, 26 contrastes y compilación. Versión obsoleta del sidebar administrativo corregida a 0.9; no se repitieron flujos aprobados por ese texto.

## Pendientes/límites

**No queda fallo funcional confirmado ni comprobación pendiente de este alcance.** No ampliar ni repetir baterías aprobadas por rutina; esperar siguiente instrucción.

Limitaciones de contenido: confirmar comercialmente presentaciones/modelo de las tres fotos señaladas y grafías de marcas si se requiere exactitud real; no se sustituyeron datos ni fotos contra la instrucción. No imágenes sin identificar/rutas nuevas rotas.

No se inspeccionó almacenamiento personal: pruebas con fixtures/contextos aislados. La fixture de subida demuestra referencias/metadata, no existencia de un blob personal. No se limpió IndexedDB. Una pestaña/navegador; sin backend/pagos/autenticación de servidor/contacto/reparto reales, POS/cajero o A/B. No Safari/Firefox/dispositivos físicos ni estudio de usuarios. Funciones de video/tarjeta no modificadas; evidencia 0.8 permanece.

## Retomar y recuperar

Leer [CATALOGO-0.9.0](CATALOGO-0.9.0.md), [verificación](VERIFICACION.md), [evidencia](catalog-verification/README.md), README y persistencia. No queda desarrollo pendiente autorizado. No modificar `truthlens-extension`.

Preview conocida: **http://localhost:4174/catalogo**. Verificar proceso antes de abrir otra instancia. Para iniciar:

```bash
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
nvm use
npm run dev
```

Abrir puerto mostrado por Vite, normalmente 5173. Node 20.19.4/npm 11.21.1. Si nvm no carga: `export PATH=/home/hisok/.nvm/versions/node/v20.19.4/bin:$PATH`; npm de la sesión puede ejecutarse con `node /home/hisok/.npm/_npx/676e59db29371ba5/node_modules/npm/bin/npm-cli.js <comando>`. No compilar dist durante prueba UI. Herramientas Playwright externas y comandos en la carpeta de evidencia; dependen de /tmp y no de package.json.

Copia previa: `docs/recovery/antes-catalogo-0.9.0.zip` (incluye imágenes en sus rutas originales). Final: `docs/recovery/catalogo-0.9.0.zip`; hashes e instrucciones en recovery. Extraer siempre aparte, no sobrescribir cambios posteriores. ZIP no incluye localStorage/IndexedDB personal. Migración automática se realiza al abrir origen de navegador válido; formatos futuros protegidos.

Escrituras fuera del cwd necesitan escalación justificada ya autorizada. Conservar Git existente y cambios/untracked ajenos; no reset, publicación o commit automático.
