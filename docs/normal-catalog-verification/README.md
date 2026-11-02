# Catálogo general: productos con y sin GLB

La entrada es **`http://localhost:4190/catalogo`**, sin parámetros. Los 75 productos de la semilla se renderizan desde la misma lista, con `useCatalog`, `currentProducts`, `filterProducts` y `ProductCard`. Tener GLB solo determina la presentación en la ficha y el distintivo de la tarjeta.

## Corrección en datos y navegación

Los registros anteriores ya formaban parte del estado comercial compartido, pero se añadían al final y tenían códigos especiales. El enlace de entrega a una búsqueda por ese código reforzaba una separación que no debía formar parte de la experiencia.

- Las altas nuevas tienen identificadores ordinarios **ROS-064 a ROS-075** en una semilla limpia: lata 064, Nivea 065, Sunsilk 066 y nueve sabores adicionales 067–075. La clásica sigue siendo ROS-002. Son los mismos registros comerciales, categorías e inventarios; no hay catálogo adicional ni filtro por capacidad 3D.
- La migración `rosita-normal-catalog-v2` sustituye los códigos comerciales anteriores por códigos numéricos disponibles y no sobrescribe códigos ya ocupados. No crea duplicados ni restablece precios o cantidades.
- En sesiones guardadas conserva los IDs canónicos antiguos como claves internas, porque los usan pedidos, movimientos, ventas y borradores de caja. Los códigos visibles y enlaces de tienda son normales. Mantener esas claves permite conservar intactos los documentos históricos y los artículos de un carrito ya creado.
- **Todos** los productos calculan `publicId` con la misma regla, independiente de `modelKey`: se usa el código comercial cuando no colisiona con el ID canónico de otro artículo; en las colisiones preexistentes se conserva el enlace anterior. Las 75 rutas se comprobaron contra sus propios registros. La ficha acepta ID canónico y código público, y las operaciones de carrito siguen usando la clave canónica.
- Las tres referencias nuevas principales usan la propiedad ordinaria `featured`, que Lay’s clásica ya tenía. El orden «Destacados» desempata alfabéticamente para todo el catálogo. Así aparecen las cuatro entre las primeras doce tarjetas, mezcladas con botella Coca-Cola, Protex, Monopoly, Duracell, Stanley y otros artículos. No se ordena ni filtra por GLB.
- La búsqueda normal incluye nombre, marca y código comercial. `Coca-Cola`, `Lay's`, `Nivea` y `Sunsilk` encuentran los artículos; las categorías y los filtros comunes funcionan igual. `ROS-3D` ya no coincide con sus códigos públicos y no es una entrada recomendada.

## Verificación

- `npm run check`: TypeScript, ESLint, contraste y compilación correctos. Se mantiene el aviso existente por el tamaño del chunk diferido de Three.js.
- `node scripts/verify-normal-catalog.mjs`: catálogo general, primeras doce tarjetas, búsqueda, resolución de las 75 rutas, colisiones, migración e idempotencia. Incluye **un pedido confirmado real de prueba** y un movimiento de stock con IDs antiguos: se conservan exactamente, junto con el carrito y un borrador de caja.
- `node scripts/verify-model-catalog.mjs` y `npm run test:operations`: ampliación sin duplicados, edición de precios, inventario, pedidos, caja y migraciones históricas.
- `verify.mjs`: Chrome en 1440, 768 y 390 px. Abre `/catalogo` sin parámetros y verifica 75 tarjetas, las cuatro referencias dentro de las primeras doce y enlaces sin códigos especiales. Comprueba búsquedas normales, diez sabores Lay’s, categorías, marca, disponibilidad, orden por precio, cuatro visores, controles, carrito de S/46.30 y recarga.
- Sesión antigua en navegador: migra un carrito de lata Coca-Cola con precio editado de S/8.75 y stock 7. La URL pública ROS-064 abre el mismo artículo; agregar otra unidad actualiza su carrito canónico a 2, sin duplicar inventario ni reiniciar el precio. Los enlaces del carrito vuelven a su ficha normal.

Resultados y capturas: `data-results.json`, `screenshots/results.json` y `screenshots/`. Los códigos normales indican los de la semilla limpia; una sesión con códigos previamente ocupados recibe los siguientes códigos libres, sin renumerar artículos del usuario.

## Capturas del catálogo general, sin parámetros

- [Coca-Cola lata junto a Sunsilk y botella, escritorio](screenshots/catalogo-ROS-064-1440.png)
- [Nivea junto a productos existentes, escritorio](screenshots/catalogo-ROS-065-1440.png)
- [Lay’s junto a productos existentes, escritorio](screenshots/catalogo-ROS-002-1440.png)
- [Sunsilk y lata, móvil](screenshots/catalogo-ROS-066-390.png)
- [Carrito con los cuatro artículos](screenshots/cart-1440.png)

La única referencia a `ROS-3D` que queda en el código de la aplicación es el reconocimiento de códigos antiguos dentro de la migración. No se utiliza para filtrar, seleccionar, ordenar o mostrar productos. La visibilidad y navegación comparten las mismas reglas para artículos con y sin modelo.
