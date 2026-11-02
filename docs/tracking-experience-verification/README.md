# Seguimiento interactivo de pedidos

## Implementación

Se reutilizan React Router, el pedido del estado de Rosita, Leaflet, OpenStreetMap y el servicio OSRM existente. No se añadieron dependencias.

La ruta `/pedido/:id/seguimiento` usa una composición propia: información del pedido a la izquierda y mapa a la derecha, con márgenes fluidos, mapa de altura adaptable y columnas verticales por debajo de 1000 px. El resumen conserva sus importes, destinatario, dirección y pago. Las etapas son compactas y el historial y el avance manual existente quedan en un desplegable secundario.

El destino del mapa es temporal. Se puede buscar una dirección, seleccionar un resultado real, hacer clic en el mapa o arrastrar el marcador; después se confirma para calcular la ruta. Cambiar el punto cancela solicitudes pendientes, elimina el recorrido anterior y reinicia solo la simulación visual. Un fallo conserva el punto y permite reintentar, sin mostrar geometría inventada.

El origen es `state.storeLocation`, la ubicación configurada de la tienda. La búsqueda y el mapa de seguimiento ya no están restringidos al rectángulo de cobertura del checkout. `calculateRoute` admite esta opción únicamente cuando la solicita el seguimiento: las validaciones y tarifas del proceso de compra conservan su comportamiento anterior.

OSRM ajusta puntos a calles transitables. El marcador de llegada se coloca en el extremo real de su geometría, para que el vehículo termine exactamente en ese marcador. Si queda a más de 5 m del punto elegido, la interfaz indica la distancia al acceso vial. La ubicación configurada de la tienda se conserva; el vehículo parte del inicio vial obtenido por OSRM. No se dibujan segmentos rectos para fingir accesos fuera de calles. Se conserva el respaldo vial verificado exclusivo de Rosita–UTP del servicio anterior.

## Animación

`use-route-simulation.ts` usa un reloj monotónico de 10 000 ms. Cada frame calcula el progreso con `performance.now()`, sin sumar pasos de duración fija ni aplicar un multiplicador de velocidad. La pausa conserva el tiempo acumulado; reanudar consume únicamente el tiempo restante. Reiniciar vuelve a cero.

Leaflet recibe la posición y el trazado completado directamente en cada frame. React publica el progreso como máximo diez veces por segundo. Las distancias acumuladas de la geometría se calculan una sola vez por ruta y el segmento se busca mediante búsqueda binaria. La orientación del vehículo sigue el rumbo del tramo. Pausar, reanudar, hacer scroll o actualizar el progreso no recrea el mapa ni recalcula su encuadre; redimensionarlo sí vuelve a mostrar sus extremos. El ciclo se cancela al desmontar.

La simulación vive en memoria del componente y no escribe en pedidos, direcciones, pagos, inventario ni historial. Terminar el mapa no confirma la entrega. El avance manual de estado permanece separado y requiere su confirmación explícita.

## Geocodificación

No había un geocodificador. Se integró Photon con búsqueda explícita mediante el botón Buscar, seis resultados como máximo, cancelación, timeout, caché de sesión limitada a 50 consultas y separación de solicitudes. No se hacen solicitudes mientras se escribe ni búsquedas periódicas.

El endpoint se puede cambiar sin recompilar editando `public/map-services.json`, por ejemplo por una instancia Photon propia o un proxy compatible. Las atribuciones de Photon y OpenStreetMap son visibles; los detalles internos de OSRM y los errores técnicos quedan fuera del contenido comercial.

Documentación y límites consultados: [API de Photon](https://github.com/komoot/photon/blob/master/docs/api-v1.md), [condiciones del servidor de demostración](https://github.com/komoot/photon/blob/master/README.md) y [API de OSRM](https://project-osrm.org/docs/v5.22.0/api/). El servidor público Photon admite un uso moderado y puede limitar solicitudes; no ofrece garantía de disponibilidad. Para despliegues con tráfico sostenido, el archivo de configuración permite usar una instancia con capacidad propia. No se incorporó Nominatim.

## Verificación

- `npm run check`: TypeScript, ESLint, contraste y compilación aprobados. Permanece el aviso preexistente sobre el tamaño del chunk 3D.
- `npm run test:operations`: regresiones de pedidos, caja, inventario, snapshots, migraciones, cobertura del checkout y rutas aprobadas con acceso de red.
- Chrome real con animaciones activas, tamaños 1920 × 1080, 1440 × 600, 1024 × 768, 768 × 1024, 390 × 844 y 320 × 740. Sin desbordamiento horizontal; ambos extremos visibles tras redimensionar.
- Pedido delivery creado por el checkout existente con el cliente de demostración. Su ruta guardada Rosita–UTP aparece sin tener que cambiar su estado a «En camino» para explorar la simulación.
- Búsqueda real de Plaza de Armas de Arequipa, selección y confirmación; ruta real de unos 11,44 km. Clic y arrastre cambian las coordenadas; se obtienen nuevas rutas reales.
- Pausa, reanudación, reinicio, progreso creciente y vehículo que cambia de posición. Recorrido completo medido desde el clic: **10 013,2 ms**, con llegada al marcador de destino vial. El plazo interno es de 10 000 ms; la presentación del último frame depende del refresco del navegador.
- Scroll durante la animación mantiene el nodo del mapa y el progreso. Fallo de conexión de rutas inducido y recuperación mediante Reintentar. Respuesta de búsqueda vacía inducida y mensaje útil. Estos errores de prueba no utilizan coordenadas ni rutas ficticias.
- Búsqueda y ruta reales hasta Plaza de Armas de Cusco: **495,58 km y 11 493 puntos**. Confirma que el seguimiento no hereda el límite local ni el antiguo tope de 5000 puntos del checkout.
- Comparación antes/después: pedidos, dirección, pago, importes, estado de entrega, inventario y movimientos idénticos. Sin errores JavaScript.

## Alcance del pedido de referencia

Se abrió `/pedido/ROS-7e0253c2-f3a5-476e-b118-71189931d0c4/seguimiento`. Primero muestra el acceso de clientes y, tras iniciar sesión en el navegador aislado, «No encontramos este pedido». Los pedidos se guardan en el almacenamiento local de cada navegador; ese registro no existe en el contexto de pruebas. No se fabricó ni se copió ese identificador.

La validación funcional se realizó con `ROS-c289c765-f7a7-4aa6-b259-0dd309594343`, creado mediante el flujo real del checkout en ese contexto aislado. La implementación es común a `/pedido/:id/seguimiento` y se aplicará al pedido de referencia en el navegador donde esté guardado.

## Revisión visual

Se conservaron colores y tipografías de Rosita y superficies opacas en los paneles. El mapa es el bloque dominante; la información existente llena la columna izquierda y las acciones operativas secundarias no compiten con Iniciar simulación. Tras revisar capturas se corrigieron tres puntos: título demasiado grande por especificidad CSS, campo de búsqueda sin su control visual compartido y pérdida del encuadre al redimensionar. Las capturas finales de escritorio, tablet, móvil, resultados, pausa, recorrido completado, error y otra ciudad están en `screenshots/`.

Algunas capturas de página completa realizadas con la página desplazada muestran artefactos de elementos fijos, como el enlace Saltar al contenido. Se comprobó su estilo real: no tiene foco y su borde inferior está fuera del viewport; no se cambió el header ni ese enlace para acomodar las capturas.

`verify.mjs` admite `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXPECT_MODULE`, `CHROME_PATH` y `VERIFICATION_OUT`. Los logs y `screenshots/results.json` documentan los datos medidos.
