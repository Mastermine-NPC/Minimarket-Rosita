# Revisión de etapa comercial · Rosita 0.2.0

Fecha: 29/10/2026. Trabajo sobre la base local existente, sin reinicializar, instalar dependencias adicionales, editar Framer/Figma ni publicar. Se conservaron lock, configuración y las páginas técnicas. Antes de editar se guardó `docs/recovery/antes-tienda-0.2.0.zip`.

## Inventario y acceso

| Vista o plantilla | Ruta y acceso | Implementación |
| --- | --- | --- |
| Inicio | `/`, logotipo e Inicio | Foto del negocio, seis categorías, ocho destacados y promoción identificada |
| Catálogo general | `/catalogo`, encabezado y CTA | 24 productos, búsqueda, filtros y ordenamiento |
| Consumibles | `/categoria/consumibles`, categoría en inicio/menú/pie | Cuatro productos |
| Ferretería | `/categoria/ferreteria` | Cuatro productos |
| Tecnología | `/categoria/tecnologia` | Cuatro productos; incluye agotado |
| Juguetería | `/categoria/jugueteria` | Cuatro productos |
| Educación y oficina | `/categoria/educacion-oficina` | Cuatro productos |
| Cuidado personal | `/categoria/cuidado-personal` | Cuatro productos |
| Detalle reutilizable | `/producto/ROS-001` hasta `/producto/ROS-024`, foto/título de tarjeta | Cantidad, precio, disponibilidad, agregar y vuelta con filtros conservados |
| Carrito | `/carrito`, enlace del panel lateral | Líneas, cantidades, eliminación, subtotal y vaciar con confirmación |
| Sistema de diseño | `/sistema-diseno`, pie | Tres pestañas con fundamentos, muestras y reglas |
| Comprobación técnica | `/comprobacion`, pie | Formulario validado, modal, aviso, movimiento y contador |
| Estado técnico | `/estado`, enlace desde comprobación | Contador compartido y reset exclusivo |
| Recuperación de rutas | URL desconocida, categoría/producto inexistentes | Mensaje y retorno al catálogo |

Los 24 productos son **registros de una plantilla**, no 24 pantallas funcionales diferentes. Escritorio/tablet/móvil son variantes responsive. Búsqueda vacía, agotado y carrito vacío son estados. Menú, filtros móviles, carrito lateral y confirmaciones son paneles/diálogos. Las capturas del informe son referencias visuales, no vistas ejecutables. No se afirma «24 vistas conectadas».

Mapa actual: Inicio → categoría o catálogo → filtros/búsqueda → detalle → agregar → panel de carrito → carrito completo. El enlace de retorno del detalle conserva consulta, marca, precio, disponibilidad y orden en URL. Cuenta explica la siguiente etapa; checkout no ejecuta una compra y muestra por qué está deshabilitado.

## Comprobaciones ejecutadas

Los resultados actuales se encuentran en `docs/commerce-verification`. `funciones.json` enumera 20 grupos de comprobaciones completadas, incluidos los recorridos a 1440/768/390 px; no se deducen pruebas de capturas estáticas.

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| TypeScript, ESLint sin advertencias, build | Verificado | `check.log` |
| 18 pares de contraste semántico | Verificado | `contrast.json` |
| Carga real de Manrope/DM Sans locales | Verificado | Chromium y capturas a 1440/768/390 |
| Desbordamiento de documento e imágenes rotas | Verificado | `layout.json`: 70 casos, siete rutas × diez anchos |
| Formulario obligatorio/correo, error, corrección y aviso | Verificado | `base-tecnica.json`, tres anchos |
| Modal técnico: Tab, Shift+Tab, Escape y retorno del foco | Verificado | `base-tecnica.json` |
| Estado técnico entre rutas, recarga, soles y movimiento reducido | Verificado | `base-tecnica.json` |
| Los 24 detalles y tres rutas inválidas | Verificado | `rutas-recuperacion.json` |
| localStorage bloqueado sin romper sesión temporal | Verificado | `rutas-recuperacion.json` |
| Categorías, búsqueda, filtros, orden, carrito, límites y migración | Verificado | `funciones.json` |
| Ofertas y respuesta de muestras del sistema | Verificado | `ofertas-muestras.json`, tres anchos |
| Autenticación, checkout, seguimiento, administración y caja | No comprobado / fuera de esta etapa | No implementados |
| Firefox, Safari, dispositivos físicos y lector de pantalla | No comprobado | Solo Chromium automatizado |
| Usabilidad con personas o comparación A/B | No comprobado | No se reclutaron participantes ni se midieron resultados |

Anchos del barrido: 1440, 1280, 1024, 1023, 900, 801, 800, 768, 600 y 390 px. Las capturas de inicio, catálogo, detalle y sistema se revisaron visualmente; no se encontraron imágenes estiradas, solapamientos evidentes ni un banner que oculte todos los productos. No se afirma una certificación completa de accesibilidad.

## Decisiones de distribución e iteración

Se preservaron nombre, logotipo, fotografía y seis categorías del informe; el encabezado ahora prioriza búsqueda. El inicio reúne título/fotografía, categorías y productos antes de la promoción secundaria. Las tarjetas repiten dimensiones, presentación, precio y acción para comparar. Filtros visibles en escritorio y Sheet móvil; el carrito comparte contenido entre página y panel. La identidad verde/rosa mantiene acentos controlados, sin seis estilos de botones distintos.

Correcciones durante revisión: promoción inicialmente transparente que dejaba un hueco en captura completa; ahora solo se animan sus imágenes. Presentación de shampoo y nombre del maletín de herramientas ajustados a las fotografías existentes. Se corrigió la restitución de foco del carrito al no tener un único Trigger de Radix. Las pruebas esperan el cierre de paneles y finalización de navegación, sin evaluar estados intermedios como resultados finales.

## Relación con el sílabo

Se leyó `HERRAMIENTASDEPROTOTIPADO_undefined.pdf`, siete páginas, especialmente unidades 1–3 (páginas 1–2) y cronograma (4–6).

- Unidad 1: flujo actual documentado y registro de decisiones/iteraciones. No se aportan bocetos o storyboards históricos ni se inventa feedback. Las pruebas realizadas son de funcionamiento, no una investigación de usabilidad.
- Unidad 2: interfaces de alta fidelidad en inicio/catálogo/detalle/carrito; componentes compartidos y Atomic Design en `DESIGN-SYSTEM.md`. Proximidad en precio/acción, similitud de tarjetas, región común de filtros/resumen, figura-fondo de superficies y continuidad al regresar con filtros. Manrope/DM Sans, jerarquía de precios, contraste, foco y etiquetas.
- Unidad 3: confirmación Sonner y contador al agregar; búsqueda ocupada y resultados/vacío; errores textuales y confirmación de formulario; subtotales inmediatos al cambiar cantidad; tokens de tiempo/curva, reduced-motion, documentación/versionado 2.0.0 y distinción UI Kit/Design System. A/B y procesamiento de pedidos quedan pendientes porque no pertenecen al alcance comercial básico actual.

## Guion de demostración de esta etapa

1. Abrir `/`, entrar en Ferretería y volver a catálogo.
2. Buscar «ajedrez magnetico»; limpiar y filtrar marca Stanley, variar precio y ordenar.
3. Abrir destornilladores, elegir dos unidades y agregar; volver y comprobar conservación del filtro.
4. Abrir carrito, cambiar de dos a tres y comprobar S/ 46.50; eliminar o vaciar con confirmación.
5. Abrir un producto agotado y observar el botón explicado. Visitar `/comprobacion` para error/corrección y modal por teclado.
6. Mostrar `/sistema-diseno`; consultar los límites de cuenta/checkout. No es posible demostrar pedido, seguimiento o caja todavía.

## Límites y recuperación

Datos ficticios locales, precios/stock de prueba y pago no implementado. El carrito no reserva ni descuenta inventario. Seis fotos faltantes están identificadas. Se reutilizaron 18 fotos, logotipo y fotografía del negocio disponibles; no se obtuvieron fotografías nuevas.

Almacenamiento v2 conserva contador técnico v1, repara IDs/cantidades incompatibles y no sobrescribe formatos futuros. Corrupción o almacenamiento bloqueado producen aviso y sesión temporal. Restablecer solo afecta claves Rosita. No es sincronización entre dispositivos o pestañas ni seguridad de servidor.

Mercado Libre Perú respondió 403; no se inspeccionó visualmente. Daniel Spatzek sí pudo abrirse; se adaptaron tipografía/fotografía y movimiento sin copiar su introducción. Procedencias/licencias en `RECURSOS.md`.

Snapshot anterior en `docs/recovery/antes-tienda-0.2.0.zip`; snapshot final de fuentes en `docs/recovery/tienda-0.2.0.zip`. Restaurar en una carpeta separada y reinstalar con el lock si fuera necesario; no incluye node_modules ni dist. Evidencia anterior 0.1.0 en `docs/verification` y documentos conservados en `docs/history`.

## Abrir la vista interactiva

Desde la carpeta del proyecto ejecutar `npm run dev` con Node 20.19.4. Abrir **http://localhost:5173/** o la URL que Vite indique si el puerto está ocupado. No abrir index.html como archivo suelto. No se publicó ni desplegó.
