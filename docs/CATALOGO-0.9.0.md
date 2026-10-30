# Catálogo integrado · aplicación 0.9.0 / esquema v8

30/10/2026. Proyecto existente conservado, sin instalar/actualizar dependencias, reinicializar, publicar o modificar Framer/Figma. Antes de editar se revisaron README/estado, catálogo, filtros, inventario, esquemas/migración y vistas administrativas. Git y archivos del usuario se conservaron. Copia previa: `docs/recovery/antes-catalogo-0.9.0.zip`.

## Resultado y comparación

**63 artículos en la base unificada: 24 anteriores conservados + 39 nuevos.** No hubo coincidencias de artículo entre esas listas ni duplicados verificables en los 24 anteriores: **0 artículos anteriores eliminados**. No se confundió compartir marca/tipo con ser el mismo producto: USB HP 32 GB y Kingstone 16 GB, o pelota infantil genérica y pelotas Walon/Mikas, son distintos. Los precios/stock previos permanecen intactos; nuevos precios/stock son exactamente los suministrados y todos parten de 10 unidades o más.

Esta cifra describe la base del código, no un inventario personal del navegador que no se inspeccionó. Migración conserva productos propios adicionales; una fixture con uno de esos productos produce 64 registros. Se probaron cuentas/sesión, carrito, recursos registrados y pedidos ficticios aislados, no datos personales.

Comparación exportada desde las fuentes reales: [comparacion.json](catalog-verification/comparacion.json). `data/catalog.ts` conserva la semilla anterior, sin reemplazarla por la nueva. `data/catalog-additions.ts` contiene el manifiesto 39; solo alimentan el estado compartido, no catálogos separados para tienda/administración.

## Conflicto ROS-024 resuelto sin cambiar identidad interna

ROS-024 anterior es **Pasta dental Colgate**; ROS-024 de la lista es **Powerade**. No son duplicados. Reutilizar el ID de pasta para Powerade habría asociado carrito, stock y pedidos antiguos al artículo equivocado.

| Artículo                        | ID interno estable | Código comercial actual |
| ------------------------------- | ------------------ | ----------------------- |
| Pasta dental Colgate conservada | ROS-024            | ROS-063                 |
| Powerade nuevo                  | ROS-024-IMPORT     | ROS-024                 |

Los códigos comerciales son únicos y visibles en tarjeta, detalle, gestión/inventario y búsqueda. Relaciones y URLs usan ID interno: `/producto/ROS-024` sigue siendo pasta; `/producto/ROS-024-IMPORT` es Powerade. El editor explica ambas claves. No se reescriben líneas históricas, precios, stock ni movimientos por cambiar el código visible. ROS-044 es UNO y ROS-062 es mouse Logitech.

En migraciones con otros códigos ocupados se preserva cada ID y registro; el artículo distinto recibe un código libre desde 063, evitando también los 39 códigos reservados. Un artículo existente exactamente coincidente reutiliza su ID, precio/stock válidos e imagen subida; no se le vuelve a cargar inventario inicial. No se fusionan solo por marca/nombre genérico. Una coincidencia no comprobable no autoriza borrar datos.

## Artículos incorporados: datos iniciales

Precio referencial de venta en soles, no cotización garantizada. Umbral inicial 5; no se inventaron descuentos o precios mayoristas. Los cambios del administrador posteriores se guardan sin que la semilla los restablezca al recargar.

| Código  | Producto                                              | Marca de la lista |     S/ | Stock inicial | Categoría existente |
| ------- | ----------------------------------------------------- | ----------------- | -----: | ------------: | ------------------- |
| ROS-052 | Caja de colores                                       | Faber Castell     |   7.00 |            20 | educacion-oficina   |
| ROS-053 | Folder Manila                                         | Genérico          |   1.00 |            25 | educacion-oficina   |
| ROS-054 | Post its                                              | Faber Castell     |   3.50 |            15 | educacion-oficina   |
| ROS-055 | Portaminas                                            | Faber Castell     |   6.00 |            15 | educacion-oficina   |
| ROS-050 | Borradores                                            | Artesco           |   1.50 |            25 | educacion-oficina   |
| ROS-051 | Tajador                                               | Faber Castell     |   2.50 |            20 | educacion-oficina   |
| ROS-033 | Martillo                                              | Armatec           |  28.90 |            12 | ferreteria          |
| ROS-034 | Serrucho                                              | CAT               |  32.90 |            10 | ferreteria          |
| ROS-035 | Extensión                                             | Paramic           |  24.90 |            12 | ferreteria          |
| ROS-036 | Pela cables                                           | Acsetron          |  18.90 |            12 | ferreteria          |
| ROS-037 | Tornillos                                             | Genérico          |   4.50 |            25 | ferreteria          |
| ROS-038 | Cinta aislante                                        | Genérico          |   3.50 |            20 | ferreteria          |
| ROS-044 | Juego de cartas UNO                                   | UNO               |  24.90 |            15 | jugueteria          |
| ROS-045 | Pelota de fútbol                                      | Walon             |  39.90 |            12 | jugueteria          |
| ROS-046 | Pelota de vóley                                       | Mikas             |  34.90 |            12 | jugueteria          |
| ROS-047 | Osito de peluche                                      | Genérico          |  24.90 |            12 | jugueteria          |
| ROS-048 | Arma de juguete con balas de hidrogel                 | Genérico          |  29.90 |            10 | jugueteria          |
| ROS-049 | Muñeca Barbie Dreamhouse                              | Barbie            |  79.90 |            10 | jugueteria          |
| ROS-039 | Auriculares                                           | SONY              |  69.90 |            12 | tecnologia          |
| ROS-040 | Proyector                                             | MAC               | 299.90 |            10 | tecnologia          |
| ROS-041 | USB 16 GB                                             | Kingstone         |  19.90 |            20 | tecnologia          |
| ROS-042 | Auriculares de cable                                  | Toshiba           |  29.90 |            12 | tecnologia          |
| ROS-043 | Cable HDMI                                            | Genérico          |  15.90 |            15 | tecnologia          |
| ROS-062 | Mouse inalámbrico                                     | Logitech          |  49.90 |            12 | tecnologia          |
| ROS-024 | Powerade Bebida Rehidratante 500 ml                   | Powerade          |   3.50 |            30 | consumibles         |
| ROS-025 | Gaseosa Pepsi 1.5 L                                   | Pepsi             |   7.00 |            25 | consumibles         |
| ROS-026 | Gaseosa Fanta Naranja 500 ml                          | Fanta             |   2.50 |            25 | consumibles         |
| ROS-027 | Gaseosa Sprite 500 ml                                 | Sprite            |   2.50 |            25 | consumibles         |
| ROS-028 | Galletas Tentación Naranja 135 g                      | Sayón             |   2.00 |            25 | consumibles         |
| ROS-029 | Cheetos Cheese Tris 35 g                              | Frito-Lay         |   2.00 |            25 | consumibles         |
| ROS-030 | Chocolates Vizzio 72 g                                | Costa             |   5.00 |            20 | consumibles         |
| ROS-031 | Wafer MAX Fresa 36 g                                  | Field             |   1.50 |            25 | consumibles         |
| ROS-032 | Cereal Meli 100 g                                     | Angel             |   2.50 |            20 | consumibles         |
| ROS-056 | Desodorante en Aerosol Old Spice VIP 150 ml           | Old Spice         |  16.90 |            15 | cuidado-personal    |
| ROS-057 | Crema Facial Pond's Clarant B3 100 g                  | Pond's            |  19.90 |            12 | cuidado-personal    |
| ROS-058 | Shampoo Head & Shoulders Classic Clean 375 ml         | Head & Shoulders  |  18.90 |            15 | cuidado-personal    |
| ROS-059 | Jabón en Barra Dove Original 90 g                     | Dove              |   4.50 |            20 | cuidado-personal    |
| ROS-060 | Desodorante en Aerosol Rexona Men Active Dry 150 ml   | Rexona            |  16.90 |            15 | cuidado-personal    |
| ROS-061 | Toallas Higiénicas Nosotras Invisibles / Normal 10 un | Nosotras          |   6.90 |            15 | cuidado-personal    |

## Anteriores conservados

Códigos y valores del catálogo base, no operaciones personales actuales. Solo el código visible de pasta cambia por el conflicto; ID/precio/stock no cambian.

| ID anterior y actual | Código comercial | Producto                      | S/ conservado | Stock conservado |
| -------------------- | ---------------- | ----------------------------- | ------------: | ---------------: |
| ROS-001              | ROS-001          | Gaseosa Coca-Cola             |          3.50 |               24 |
| ROS-002              | ROS-002          | Papas Lay’s clásicas          |          4.00 |               18 |
| ROS-003              | ROS-003          | Doritos sabor a queso         |          4.00 |               12 |
| ROS-004              | ROS-004          | Set de destornilladores       |         15.50 |                9 |
| ROS-005              | ROS-005          | Juego de llaves y dados Husky |         20.50 |                7 |
| ROS-006              | ROS-006          | Taladro inalámbrico           |        120.00 |                3 |
| ROS-007              | ROS-007          | Adaptador de enchufe          |          2.50 |                8 |
| ROS-008              | ROS-008          | Pilas Duracell AA             |         15.50 |               10 |
| ROS-009              | ROS-009          | Memoria USB HP 32 GB          |         22.00 |                0 |
| ROS-010              | ROS-010          | Monopoly clásico              |         16.00 |               11 |
| ROS-011              | ROS-011          | Ajedrez magnético 4 en 1      |         14.50 |               15 |
| ROS-012              | ROS-012          | Jenga familiar                |         25.00 |                6 |
| ROS-013              | ROS-013          | Juego de escuadras            |          4.50 |               16 |
| ROS-014              | ROS-014          | Sobres manila Grafi           |          5.50 |               13 |
| ROS-015              | ROS-015          | Perforador Artesco            |         10.00 |               12 |
| ROS-016              | ROS-016          | Jabón Protex avena            |          2.50 |               20 |
| ROS-017              | ROS-017          | Shampoo Sedal                 |         12.90 |               29 |
| ROS-018              | ROS-018          | Tratamiento Nutribela 10      |          1.50 |                6 |
| ROS-019              | ROS-019          | Galletas Oreo                 |          1.80 |               20 |
| ROS-020              | ROS-020          | Cinta métrica de 3 metros     |          8.90 |               10 |
| ROS-021              | ROS-021          | Cable USB-C                   |          9.90 |               14 |
| ROS-022              | ROS-022          | Pelota infantil               |          7.50 |                8 |
| ROS-023              | ROS-023          | Cuaderno cuadriculado         |          4.90 |               18 |
| ROS-024              | ROS-063          | Pasta dental Colgate          |          2.50 |               17 |

## Imágenes locales

**39 fotos reutilizadas, 30 movidas y 9 conservadas en su ubicación.** Se inspeccionó visualmente un mosaico de las 39 y, a mayor tamaño, los envases con discrepancias. No se descargaron, generaron, comprimieron ni reemplazaron fotos de producto. Formato/calidad/proporciones originales y SHA256 se conservaron byte por byte. El mosaico es evidencia de inspección, no un recurso nuevo del catálogo.

Carpetas: `productos/tecnologia`, `educacion`, `ferreteria`, `jugueteria`, `consumibles`, `cuidado-personal`. Las9 de consumibles ya estaban bien ubicadas: no se movieron ni renombraron. Las30 de carpetas antiguas se trasladaron a las rutas requeridas con nombre ROS correspondiente, sin sobrescribir destinos.

Correcciones verificadas por contenido: la foto HDMI estaba nombrada ROS-042 y ahora es `tecnologia/ROS-043.jpg`; el mouse estaba nombradoROS-043 y ahora es `tecnologia/ROS-062.jpg`; auriculares Toshiba permanecen vinculados a ROS-042 y cartas UNO a ROS-044. [Mapa completo antes/después y hashes](catalog-verification/images.json).

Limitaciones reales de los materiales, sin alterar la lista:

- Powerade: imagen 600 ml, registro 500 ml.
- Meli: imagen 135 g, registro 100 g.
- Barbie: foto de una muñeca; no acredita un set/modelo Dreamhouse.

Las tres diferencias se explican en detalle del producto. Las marcas «Mikas» y «Kingstone» se conservan como las escribió el usuario, aunque en fotos se leen MIKASA/Kingston; no se corrigieron silenciosamente. No hubo imágenes sin identificar ni rutas nuevas rotas. Confirmar presentación/modelo comercial queda como revisión de contenido si se busca exactitud de una tienda real; no se solicitaron ni crearon fotos nuevas.

## Una fuente y conservación

`integrateCatalog` enriquece una sola vez; `catalogRevision` y esquema 8 impiden repetir importación al cargar/reiniciar. `legacy-v7-schema.ts` congela el formato instalado. v1–7 conservan sus conversiones hasta 8; v3 trata su inventario heredado de 24 antes de añadir 39, evitando referencias sin stock.

Se mantienen usuarios/verificadores, sesión, categorías y configuraciones conocidas, carrito por ID, pedidos/snapshots, movimientos, precios/stock previos y metadata de subidas. La integración no limpia IndexedDB ni otros espacios de almacenamiento. Formatos futuros (>8), corrupción y fallos de almacenamiento conservan la protección previa. No se fabrican ventas o movimientos de entrada para los 39 registros iniciales.

Las seis categorías originales no se crearon de nuevo ni reemplazaron. Se añadieron 13 subcategorías justificadas por los nuevos artículos —escritura, accesorios de ferretería, audio/proyección/periféricos, peluches/muñecas/acción, dulces/cereales y cuidado específico—, reutilizando las existentes cuando corresponden. Se conserva la activación y configuración previa; una categoría desactivada por el usuario no se reactiva silenciosamente.

## Gestión y eliminación recuperable

Crear/editar, precio y ajustes de inventario reutilizan formularios/operaciones existentes. Búsqueda por código/nombre/marca y filtros combinados consumen el mismo estado. Las tarjetas muestran también código/categoría y disponibilidad usa el umbral configurado.

Eliminar retira de tienda y lista administrativa habitual con confirmación. Se conserva un registro archivado para no romper pedidos, movimientos, stock o referencias. «Eliminados · recuperar» permite restaurar como desactivado y luego activar explícitamente. No es borrado físico ni se suman existencias duplicadas sin evidencia. El inventario permite consultar también eliminados; los códigos no se reciclan.

Para duplicados existentes solo se retira automáticamente una coincidencia estricta de nombre/marca/categoría/presentación, misma imagen e inventario idéntico. Sus referencias se conservan y no se duplican existencias. Esto se probó con fixture; no ocurrió en los 24 iniciales. Datos contradictorios no se sobrescriben por una deducción genérica.

## Archivos modificados

| Archivos                                                                                                                     | Finalidad                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `data/catalog-additions.ts`, `lib/catalog-update.ts`, `data/demo.ts`                                                         | Manifiesto39, comparación/enriquecimiento idempotente e inicialización unificada          |
| `data/product-images.ts`, `public/images/productos/*`                                                                        | Registro de fotos y30 movimientos necesarios; 9 archivos intactos en sitio                |
| `types/catalog.ts`, `types/state.ts`, `lib/state-schema.ts`, `legacy-v7-schema.ts`, `storage.ts`                             | Código comercial/archivado/notas, marcador y migración8 con referencias estables          |
| `features/catalogo/catalog-logic.ts`, `product-card.tsx`, `pages/product-page.tsx`                                           | Búsqueda por código, código/categoría visibles, umbral y notas de referencia              |
| `lib/catalog-state.ts`, `cart-pricing.ts`, `app/state/reducer.ts`, `lib/admin-operations.ts`                                 | Estado compartido, exclusión de archivados y operaciones protegidas                       |
| `pages/admin/products-page.tsx`, `inventory-page.tsx`, `features/administracion/product-editor.tsx`                          | Gestión de todos los artículos, código/ID y eliminación/restauración recuperables         |
| `lib/analytics.ts`, `styles/modules.css`                                                                                     | Código comercial/estado correcto en inventario reportado y estilo de metadata reutilizado |
| `pages/system-page.tsx`, `features/administracion/admin-layout.tsx`, `package.json`, `package-lock.json`, `eslint.config.js` | Versión0.9 y revisión de pruebas; dependencias sin cambios                                |
| Documentación/evidencia/recuperación                                                                                         | Comparación, mapa de archivos/hashes, resultados y continuidad                            |

Rutas de fuente relativas a `src`. No se modificaron recursos de inicio/video, tipografía, paleta, autenticación, formulario de pago o lógica histórica de pedidos por una refactorización general.

## Comprobaciones

| Requisito                  | Resultado concreto                                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 39 nuevos y24 conservados  | Verificado automáticamente, nombres/marcas/precios/cantidades exactos;63 identidades/códigos únicos en la base                                                       |
| Stock inicial              | 39 con mínimo 10, umbral 5, importes enteros en céntimos                                                                                                             |
| Duplicados                 | 0 en base; fixture de coincidencia exacta con otro ID no añade otro artículo ni sobrescribe stock/precio válidos                                                     |
| Imágenes                   | 39 decodifican en navegador, contain y rutas válidas; 30 movimientos con hash igual;6 SVG anteriores y atlas responden 200                                           |
| Buscar/filtrar             | 1440/768/390: nombre,marca,código; categorías13/10/10/10/10/10 y búsqueda combinada; pasta/Powerade,UNO/mouse distinguidos                                           |
| Gestión/inventario         | 1440/390:63 resultados, crear producto temporal, editar precio y entrada de stock; reload conserva 9.25 y 15 unidades de prueba                                      |
| Eliminar/restaurar         | Desaparece de lista habitual, persiste archivado sin reimportarse; restore desactivado→activar explícito funciona                                                    |
| Compra/seguimiento         | Powerade S/3.50 + 4 envío=7.50; doble clic crea 1 pedido y 1 salida, stock 30→29, pasta intacta; recarga/seguimiento funcionan                                       |
| Migración/preservación     | v7→8 en navegador: conserva cuenta/sesión, carrito de pasta, pedido histórico de pasta y recursos/metadata registrados;64 con un producto propio; recarga no duplica |
| Versiones anteriores       | Unitarias v1/v2/v3/v4 y utilidades del formato instalado; precios/stock propios y snapshots preservados                                                              |
| Tipos/lint/contraste/build | `npm run check` aprobado;26 pares de contraste, sin errores/advertencias de ESLint                                                                                   |
| Ejecución/responsive       | Sin excepciones JS capturadas en los recorridos principales, sin desplazamiento horizontal en anchos probados                                                        |

[Resultados y scripts](catalog-verification/README.md). Pruebas en Chromium 156 con contextos aislados y datos ficticios, no almacenamiento personal. No se afirma inspección de usuarios/reales, Safari/Firefox o dispositivos físicos. La fixture de subida conserva metadata/referencia; no contiene un blob personal ni demuestra su existencia fuera del navegador probado. Las funciones ajenas al catálogo mantienen evidencias anteriores; no se repitieron por rutina.

No queda fallo funcional confirmado pendiente de este alcance. Las discrepancias visuales/de denominación de los materiales anteriores quedan documentadas, no ocultas.

## Abrir

Preview local de esta sesión: **http://localhost:4174/catalogo**. Para iniciar: `nvm use`, `npm run dev` desde el proyecto y abrir el puerto de Vite. No publica. Copias antes/después y continuidad en [ESTADO-ACTUAL](ESTADO-ACTUAL.md).
