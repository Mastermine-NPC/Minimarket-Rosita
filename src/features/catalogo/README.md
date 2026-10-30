# Catálogo compartido · 0.4.0

ProductCard, ProductImage, ProductPrice y QuantitySelector se comparten entre inicio, catálogo, detalle y sistema. CatalogFilters y catalog-logic gestionan búsqueda/orden/filtros URL. data/catalog.ts conserva la semilla y las seis categorías; el catálogo actual reside en state.products y sus existencias/precios en state.inventory, resueltos por useCatalog. Productos desactivados se excluyen de nueva compra y los existentes en carrito se explican para corregirlos.
