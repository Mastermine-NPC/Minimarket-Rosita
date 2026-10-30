# Subcategorías de Rosita · aplicación 0.6.0

Trabajo en el proyecto local existente, con copia anterior recuperable. No se modificó el menú principal de seis categorías ni se añadieron productos, precios, stock, servicios o dependencias para llenar grupos. Se inspeccionaron los 24 artículos de la semilla en código; no se afirma haber leído el almacenamiento del navegador personal del usuario. Los registros guardados se migran al abrir su aplicación.

## Clasificación inicial real

| Categoría | Subcategoría e ID estable | Productos |
| --- | --- | --- |
| Consumibles | Bebidas · bebidas | ROS-001 Coca-Cola |
| Consumibles | Snacks · snacks | ROS-002 Lay’s, ROS-003 Doritos |
| Consumibles | Galletas · galletas | ROS-019 Oreo |
| Ferretería | Herramientas manuales · herramientas-manuales | ROS-004 destornilladores, ROS-005 llaves/dados, ROS-020 cinta métrica |
| Ferretería | Herramientas eléctricas · herramientas-electricas | ROS-006 taladro |
| Tecnología | Cables y adaptadores · cables-adaptadores | ROS-007 adaptador, ROS-021 cable USB-C |
| Tecnología | Pilas · pilas | ROS-008 Duracell |
| Tecnología | Almacenamiento · almacenamiento | ROS-009 USB HP, existente pero agotado |
| Juguetería | Juegos de mesa · juegos-mesa | ROS-010 Monopoly, ROS-011 ajedrez, ROS-012 Jenga |
| Juguetería | Juegos deportivos · juegos-deportivos | ROS-022 pelota |
| Educación y oficina | Geometría · geometria | ROS-013 escuadras |
| Educación y oficina | Cuadernos y papel · cuadernos-papel | ROS-023 cuaderno |
| Educación y oficina | Organización · organizacion | ROS-014 sobres |
| Educación y oficina | Accesorios de oficina · accesorios-oficina | ROS-015 perforador |
| Cuidado personal | Higiene bucal · higiene-bucal | ROS-024 pasta dental |
| Cuidado personal | Cuidado capilar · cuidado-capilar | ROS-017 shampoo, ROS-018 Nutribela |
| Cuidado personal | Jabones · jabones | ROS-016 Protex |

Son 17 subcategorías comerciales para 24 productos. No se añadieron abarrotes, audio, vehículos o desodorantes sin artículos. Hay seis identificadores técnicos `<categoria>-por-clasificar`, uno por categoría, para conservar productos antiguos/desconocidos sin inventar clasificación. No aparecen vacíos en la tienda. Se pueden revisar desde administración.

## Navegación y filtros

Menú principal: conserva Consumibles, Ferretería, Tecnología, Juguetería, Educación y oficina, Cuidado personal. Barra lateral: subcategorías de la categoría actual y Todos los productos de [categoría]. El catálogo general muestra filtros comunes y explica cómo elegir categoría, sin un segundo listado idéntico.

La selección usa `?subcategoria=snacks` y se combina con q, marca, max, disponibles, ofertas y orden. Estado activo con texto, borde, aria-pressed y etiqueta Quitar selección. Quitar o Todos elimina solo subcategoria; Limpiar filtros elimina selección y filtros comerciales, conservando búsqueda/orden según la acción existente; Limpiar búsqueda y filtros vacía toda la consulta. Los contadores de grupos excluyen solo su propio filtro y consideran los demás; la leyenda aclara que no son unidades de stock. El número superior refleja el resultado final.

Al abrir un producto, volver contiene la ruta y consulta completas. La opción Volver al catálogo recupera selección y orden. Cambiar categoría desde el menú usa una consulta nueva; un parámetro incompatible en una URL directa se elimina sin perder búsqueda/orden válidos. En catálogo general subcategoria se elimina. El panel móvil reutiliza los mismos datos/filtros y ofrece Ver N productos para regresar a resultados.

No se cambiaron cálculos de compra. Los cambios rápidos de filtros y la búsqueda diferida usan la URL más reciente para no restaurar una consulta antigua. El filtrado se realiza antes del ordenamiento. Un conjunto sin coincidencias muestra la acción real de limpiar.

## Datos y administración

Categorías centrales existentes en data/catalog.ts; registro de subcategorías y relaciones en data/subcategories.ts. Product/CatalogRecord/ProductInput comparten subcategory. Semilla, catálogo actual, creación, edición, validador de persistencia y operación administrativa utilizan la misma relación. Editar muestra el grupo actual; cambiar categoría vacía la selección y no permite guardar un grupo incompatible. La tabla muestra subcategoría y avisa revisar si está Por clasificar.

V4 se valida con el esquema histórico congelado. V5 extiende solo products, preservando las comprobaciones anteriores con Zod safeExtend; no duplica toda la validación actual. Las reglas de inferencia usan categoría y nombre actual, no ID o imagen. Así un ROS-001 renombrado a arroz no se clasifica como bebida por su ID. Un producto personalizado desconocido conserva todos sus datos en Por clasificar hasta revisión. Se comprobaron ambigüedades: llaves para puerta, taladro manual y agua micelar no se asignan por una palabra aislada a herramientas eléctricas o bebidas.

La migración conserva campos de productos, nombres, presentación, fechas, estado activo, precios, stock, carrito válido, usuarios/sesión, borrador, pedidos, movimientos y operaciones procesadas. No reescribe snapshots de líneas, importes, cliente o historial. Permanece la reparación de carrito fuera de stock ya existente, no una regla nueva. No existe una colección de ventas de caja separada en la implementación actual; no se afirma haber migrado una función inexistente.

No se añadió un editor de taxonomías: ampliar los grupos comerciales requiere actualizar el registro central con una clasificación comprobada. No se inventan subcategorías vacías a partir de ejemplos orientativos.

## Verificación ejecutada

Chromium 156.0.8078.4, compilación local :4173; Node 20.19.4 y npm 11.21.1. Tipos, ESLint, 24 pares de contraste y compilación con npm run check. No se instaló/actualizó ninguna dependencia; lock solo cambia versión raíz. Evidencia reproducible en subcategory-verification.

| Caso | Resultado / evidencia |
| --- | --- |
| 24 asignaciones, relaciones y 17 grupos | Verificado: logica.json |
| Búsqueda + subcategoría + marca + precio + stock | Verificado: lógica e interfaz en tres anchos |
| Orden con precios distintos | Verificado: herramientas manuales en orden ROS-005, ROS-004, ROS-020 |
| Estado activo, resultado, quitar selección, vacío/limpiar | Verificado: interfaz.json |
| URL, recarga y regreso desde detalle | Verificado: selección y precio-desc conservados |
| Categoría nueva y URL incompatible/general | Verificado: elimina subcategoría incompatible, conserva consulta válida al normalizar |
| Escritorio 1440, tablet 768, móvil 390 | Verificado: barra lateral/panel, sin scroll horizontal accidental |
| Crear/editar en 1440 y 390 | Verificado: opciones dependientes, obligatorio, foco de error, reset al cambiar, persistencia y reflejo en tienda |
| Migración con catálogo personalizado | Verificado en lógica y navegador, persistencia v5 tras abrir y recargar |
| Preservación de pedido histórico | Verificado: pedido generado a 567 céntimos, precio actual 999; snapshot y movimientos idénticos antes/después |
| Carrito, stock, usuarios, sesión y otras claves | Verificado por comparación profunda; clave ajena intacta |
| Compra completa y seguimiento | Regresión aprobada en 1440/768/390: acceso, checkout, confirmación única y stock coherente |
| Referencias y migraciones anteriores | Verificado: v1/v2/v3 siguen produciendo estado v5 válido; inventario inconsistente se rechaza |
| Navegadores adicionales, móvil físico y lector humano | No comprobado; no se afirma auditoría universal |

Las primeras capturas tomadas durante la entrada del panel no se usaron como prueba visual final. vista-1440/768/390.png registran el viewport con transición terminada; visual.json comprueba opacidad 1 y transform none en panel. Se revisaron visualmente escritorio y móvil. Sin excepciones JavaScript en los recorridos aprobados; no hay participantes ni resultados de usabilidad inventados.

## Abrir

`nvm use`, `npm run dev`; abre **http://localhost:5173/categoria/consumibles?subcategoria=snacks**. Prueba Quitar selección, marca/precio, abre un artículo y vuelve. En móvil usa Filtros. Para administración: /personal y credenciales ficticias del README. La compilación comprobada está en **http://localhost:4173/** mientras preview siga abierto (`npm run preview` después de build).

Copia anterior: recovery/antes-subcategorias-0.6.0.zip; resultado: recovery/subcategorias-0.6.0.zip y SHA256SUMS. Los datos de tu navegador no están en esos ZIP. No se publicó, desplegó ni modificó Framer/Figma.

Referencias técnicas: [React Hook Form useWatch](https://react-hook-form.com/docs/usewatch), [setValue](https://react-hook-form.com/docs/useform/setvalue), [Zod refinements/safeExtend](https://zod.dev/api?id=safeextend). Se usaron las APIs disponibles en las versiones instaladas; no se migró RHF a otra versión.
