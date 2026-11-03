# Inventario de rutas

33 patrones de ruta identificados en src/app/router.tsx. Las subcategorías, la búsqueda y el ordenamiento son parámetros del catálogo; no existen rutas separadas inventadas para ellos.

| Patrón | Vista |
|---|---|
| / | Inicio |
| /catalogo | Catálogo, búsqueda, filtros y orden |
| /categoria/:slug | Categorías y filtros de subcategoría |
| /producto/:id | Ficha fotográfica o 3D |
| /carrito | Carrito persistente |
| /checkout | Entrega, pago y revisión |
| /login | Acceso de cliente |
| /registro | Registro de cliente |
| /personal | Acceso de personal |
| /cuenta | Perfil de cliente |
| /mis-pedidos | Historial |
| /pedido/:id | Detalle del pedido |
| /pedido/:id/confirmacion | Confirmación |
| /pedido/:id/seguimiento | Seguimiento |
| /nosotros | Información de tienda |
| /ayuda | Ayuda y anclas de preguntas/pagos |
| /contacto | Contacto |
| /sistema-diseno | Biblioteca de diseño |
| /comprobacion | Comprobaciones del prototipo |
| /estado | Estado y persistencia |
| /* | Página no encontrada |
| /admin | Resumen y control de acceso |
| /admin/productos | Gestión de productos |
| /admin/categorias | Taxonomía |
| /admin/inventario | Existencias y movimientos |
| /admin/pedidos | Gestión de pedidos |
| /admin/pedidos/:id | Detalle administrativo |
| /admin/clientes | Clientes |
| /admin/agentes | Agentes de caja |
| /admin/ubicacion | Origen de tienda |
| /admin/reportes | Informes |
| /admin/* | Sección administrativa inexistente |
| /caja | Ventas presenciales, turnos e historial |

## Visitas de navegador

40 casos de rutas base, permisos y errores, cada uno en nueve tamaños.

| URL | Sesión ficticia | Muestras |
|---|---|---:|
| / | guest | 9 |
| /catalogo | guest | 9 |
| /catalogo?q=coca&marca=Coca-Cola&orden=precio-asc | guest | 9 |
| /categoria/consumibles | guest | 9 |
| /categoria/halloween | guest | 9 |
| /categoria/no-existe | guest | 9 |
| /producto/ROS-001 | guest | 9 |
| /producto/ROS-064 | guest | 9 |
| /producto/no-existe | guest | 9 |
| /carrito | guest | 9 |
| /nosotros | guest | 9 |
| /ayuda | guest | 9 |
| /contacto | guest | 9 |
| /personal | guest | 9 |
| /login | guest | 9 |
| /registro | guest | 9 |
| /cuenta | customer | 9 |
| /checkout | customer | 9 |
| /mis-pedidos | customer | 9 |
| /pedido/ROS-AUDIT-ORDER | customer | 9 |
| /pedido/ROS-AUDIT-ORDER/confirmacion | customer | 9 |
| /pedido/ROS-AUDIT-ORDER/seguimiento | customer | 9 |
| /pedido/no-existe | customer | 9 |
| /admin | guest | 9 |
| /admin | admin | 9 |
| /admin/productos | admin | 9 |
| /admin/categorias | admin | 9 |
| /admin/inventario | admin | 9 |
| /admin/pedidos | admin | 9 |
| /admin/pedidos/ROS-AUDIT-ORDER | admin | 9 |
| /admin/clientes | admin | 9 |
| /admin/agentes | admin | 9 |
| /admin/ubicacion | admin | 9 |
| /admin/reportes | admin | 9 |
| /admin/no-existe | admin | 9 |
| /caja | cashier | 9 |
| /sistema-diseno | guest | 9 |
| /comprobacion | guest | 9 |
| /estado | guest | 9 |
| /no-existe | guest | 9 |

## Catálogo dinámico

125 URLs adicionales: 79 productos, 7 categorías y 39 subcategorías. Se verificaron a 320 y 1440 px. La ruta de cereales se repitió en nueve tamaños después de una interferencia de recompilación del servidor de pruebas.

- /producto/ROS-001
- /producto/ROS-002
- /producto/ROS-003
- /producto/ROS-004
- /producto/ROS-005
- /producto/ROS-006
- /producto/ROS-007
- /producto/ROS-008
- /producto/ROS-009
- /producto/ROS-010
- /producto/ROS-011
- /producto/ROS-012
- /producto/ROS-013
- /producto/ROS-014
- /producto/ROS-015
- /producto/ROS-016
- /producto/ROS-017
- /producto/ROS-018
- /producto/ROS-019
- /producto/ROS-020
- /producto/ROS-021
- /producto/ROS-022
- /producto/ROS-023
- /producto/ROS-024
- /producto/ROS-052
- /producto/ROS-053
- /producto/ROS-054
- /producto/ROS-055
- /producto/ROS-050
- /producto/ROS-051
- /producto/ROS-033
- /producto/ROS-034
- /producto/ROS-035
- /producto/ROS-036
- /producto/ROS-037
- /producto/ROS-038
- /producto/ROS-044
- /producto/ROS-045
- /producto/ROS-046
- /producto/ROS-047
- /producto/ROS-048
- /producto/ROS-049
- /producto/ROS-039
- /producto/ROS-040
- /producto/ROS-041
- /producto/ROS-042
- /producto/ROS-043
- /producto/ROS-062
- /producto/ROS-024-IMPORT
- /producto/ROS-025
- /producto/ROS-026
- /producto/ROS-027
- /producto/ROS-028
- /producto/ROS-029
- /producto/ROS-030
- /producto/ROS-031
- /producto/ROS-032
- /producto/ROS-056
- /producto/ROS-057
- /producto/ROS-058
- /producto/ROS-059
- /producto/ROS-060
- /producto/ROS-061
- /producto/ROS-064
- /producto/ROS-065
- /producto/ROS-066
- /producto/ROS-067
- /producto/ROS-068
- /producto/ROS-069
- /producto/ROS-070
- /producto/ROS-071
- /producto/ROS-072
- /producto/ROS-073
- /producto/ROS-074
- /producto/ROS-075
- /producto/ROS-076
- /producto/ROS-077
- /producto/ROS-078
- /producto/ROS-079
- /categoria/consumibles
- /categoria/ferreteria
- /categoria/tecnologia
- /categoria/jugueteria
- /categoria/educacion-oficina
- /categoria/cuidado-personal
- /categoria/halloween
- /categoria/consumibles?subcategoria=bebidas
- /categoria/consumibles?subcategoria=snacks
- /categoria/consumibles?subcategoria=galletas
- /categoria/ferreteria?subcategoria=herramientas-manuales
- /categoria/ferreteria?subcategoria=herramientas-electricas
- /categoria/tecnologia?subcategoria=cables-adaptadores
- /categoria/tecnologia?subcategoria=pilas
- /categoria/tecnologia?subcategoria=almacenamiento
- /categoria/jugueteria?subcategoria=juegos-mesa
- /categoria/jugueteria?subcategoria=juegos-deportivos
- /categoria/educacion-oficina?subcategoria=geometria
- /categoria/educacion-oficina?subcategoria=cuadernos-papel
- /categoria/educacion-oficina?subcategoria=organizacion
- /categoria/educacion-oficina?subcategoria=accesorios-oficina
- /categoria/cuidado-personal?subcategoria=higiene-bucal
- /categoria/cuidado-personal?subcategoria=cuidado-capilar
- /categoria/cuidado-personal?subcategoria=jabones
- /categoria/consumibles?subcategoria=consumibles-por-clasificar
- /categoria/ferreteria?subcategoria=ferreteria-por-clasificar
- /categoria/tecnologia?subcategoria=tecnologia-por-clasificar
- /categoria/jugueteria?subcategoria=jugueteria-por-clasificar
- /categoria/educacion-oficina?subcategoria=educacion-oficina-por-clasificar
- /categoria/cuidado-personal?subcategoria=cuidado-personal-por-clasificar
- /categoria/educacion-oficina?subcategoria=escritura
- /categoria/ferreteria?subcategoria=accesorios-ferreteria
- /categoria/jugueteria?subcategoria=peluches
- /categoria/jugueteria?subcategoria=juguetes-accion
- /categoria/jugueteria?subcategoria=munecas
- /categoria/tecnologia?subcategoria=audio
- /categoria/tecnologia?subcategoria=proyeccion
- /categoria/tecnologia?subcategoria=perifericos
- /categoria/consumibles?subcategoria=dulces-chocolates
- /categoria/consumibles?subcategoria=cereales
- /categoria/cuidado-personal?subcategoria=desodorantes
- /categoria/cuidado-personal?subcategoria=cuidado-facial
- /categoria/cuidado-personal?subcategoria=higiene-intima
- /categoria/halloween?subcategoria=halloween-accesorios
- /categoria/halloween?subcategoria=halloween-dulces
- /categoria/halloween?subcategoria=halloween-disfraces
