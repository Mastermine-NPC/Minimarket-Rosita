# Verificación final · Rosita 1.0.0 · 30/10/2026

Implementación sobre el proyecto local existente, esquema 9, DS 2.7.0. No publicado, desplegado, commit/push ni cambios en Framer/Figma. [Evidencia final](operations-verification/README.md), [guiones/rutas/permisos/proveedores](OPERACIONES-1.0.0.md). No se afirma una cifra de pantallas sin enumerarlas: rutas añadidas y vistas internas se distinguen en ese documento.

## Comprobaciones realizadas

| Comprobación                                  | Resultado                       | Evidencia / alcance                                                                                                                                              |
| --------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tipos TypeScript                              | Verificado                      | `tsc -b` dentro del build final, sin errores                                                                                                                     |
| ESLint                                        | Verificado                      | `npm run lint --max-warnings 0` mediante script configurado; log de cierre sin errores                                                                           |
| Compilación                                   | Verificado                      | Vite 8.3.5, build final; sin despliegue                                                                                                                          |
| Contraste de tokens                           | Verificado                      | 26 combinaciones; blanco/verde 8.14:1, texto/rosa 9.68:1. No certifica cartografía ni aplicación completa                                                        |
| Dependencias/lock                             | Verificado                      | Comparación con copia previa: solo leaflet1.9.4, @types/leaflet1.9.21 y transitivo @types/geojson7946.0.16 añadidos; ninguna versión previa sustituida           |
| Origen Rosita                                 | Verificado                      | Coincide exactamente con coordenadas confirmadas por el usuario; UI permite configurarlo para nuevos pedidos                                                     |
| Dirección/pin del campus UTP                  | Verificado                      | Sitio oficial UTP y llegada vial por Avenida Tacna y Arica, procedencia documentada                                                                              |
| Puerta peatonal exacta UTP                    | No comprobado                   | Pin oficial y ajuste vial no acreditan una puerta; no se presenta como certificada                                                                               |
| Delivery completo                             | Verificado                      | Cliente→punto→ruta→tarjeta ficticia→revisión→confirmación→seguimiento                                                                                            |
| Otro destino y cobertura                      | Verificado                      | Coordenadas/clic/arrastre, ruta real alternativa, fuera de área rechazado, confirmación explícita                                                                |
| Ruta actualizada y respuestas anteriores      | Verificado                      | Cambiar punto invalida datos; cancelación y respuesta tardía simulada no sobrescriben el último destino                                                          |
| Proveedor caído / fallback                    | Verificado                      | Intercepción de fallo: solo Rosita→UTP recupera ruta verificada; otros destinos no simulan cálculo universal                                                     |
| Teselas fallidas                              | Verificado                      | Fallo interceptado muestra aviso; resumen y pedido siguen disponibles                                                                                            |
| Repartidor y geometría                        | Verificado                      | 358 puntos, interpolación por distancia, tramo recorrido, flecha por rumbo y progreso; SVG visible sin depender de emoji                                         |
| Inicio/pausa/velocidad/recarga                | Verificado                      | En camino, pausa/reanuda, velocidad; progreso persiste y recarga pausada. No escritura por fotograma ni valores idénticos                                        |
| Llegada no entrega ni descuenta               | Verificado                      | Progreso100% mantiene estado2, stock idéntico; confirmación de estado separada                                                                                   |
| Recojo completo                               | Verificado                      | Nombre/celular, envío0, sin domicilio/ruta, Listo para recoger→Recogido sin otra venta/salida                                                                    |
| Tarjeta al cambiar modalidad                  | Verificado                      | Recojo→delivery cambia total e invalida aprobación; revisión exige simular de nuevo                                                                              |
| Roles y agentes                               | Verificado                      | Cliente/caja/admin, creación/desactivación/restablecimiento local, correo único, guardas de ruta/reducer; no promoción a admin                                   |
| Caja manual y por código                      | Verificado                      | Filtros, SKU/código, Enter, ceros iniciales, desconocido, cantidades; borrador independiente del carrito                                                         |
| Cámara opcional                               | Verificado con simulación       | Incompatibilidad/permiso denegado; vídeo y detector sintéticos: deduplicación, selector y tracks detenidos. No cámara real                                       |
| Efectivo y duplicados                         | Verificado                      | Insuficiente rechazado, exacto por lógica, vuelto por UI, doble clic/acción repetida crea una venta y salida                                                     |
| Tarjeta de caja                               | Verificado                      | Rechazo/error sin venta/stock, aprobación vinculada a borrador, cambio invalida; componente compartido con checkout                                              |
| Stock compartido y snapshots                  | Verificado                      | Pedido digital y venta presencial consumen inventario común; precio/stock/inactivo revalidados; historial independiente                                          |
| Apertura/cierre                               | Verificado                      | Fondo + recibido − vuelto; tarjetas fuera del efectivo; diferencia y cierre inmutable; esperado manipulado rechazado                                             |
| Historial/recibo/impresión                    | Verificado                      | Filtros y detalle, acción de imprimir invocada, PDF Chromium con leyenda sin validez tributaria; sin impresión física                                            |
| Reportes, CSV y estadísticas                  | Verificado                      | Canales separados, agente/pago/turno/productos/movimientos; filtros sin residuos ocultos, totales compartidos y CSV sin doble conteo                             |
| Migración y recuperación                      | Verificado                      | v8→9 y fixture real v7 con pedidos/productos propios; stock/precios/media/históricos preservados, sin duplicar agente; futuro/corrupto/bloqueado/reset exclusivo |
| Teclado/foco/errores                          | Verificado en recorridos nuevos | Coordenadas por teclado, errores con texto, Escape/retorno de foco en modales; nueva venta al lector y cierre al encabezado                                      |
| Movimiento reducido                           | Verificado                      | Sin reproducción automática de repartidor, pasos manuales 10%; preferencia emulada                                                                               |
| 1440 /768 /390 y anchos intermedios           | Verificado                      | Nuevos recorridos y capturas; caja/agentes/reportes sin desbordamiento a1024/600; seguimiento del propietario con SVG a los tres anchos                          |
| Tacto móvil                                   | Verificado con emulación        | Toque sobre mapa selecciona punto; no teléfono físico                                                                                                            |
| Cámara/lector USB-Bluetooth/impresora físicos | No comprobado                   | Escáner emulado como teclado, detector/vídeo sintéticos y PDF; sin afirmación de hardware probado                                                                |
| Firefox/Safari/dispositivos reales            | No comprobado                   | Navegador disponible Chromium156; medidas no equivalen a dispositivos físicos                                                                                    |
| Participantes/métricas de usabilidad          | No comprobado                   | No se realizaron estudios ni se inventaron conclusiones                                                                                                          |

Sin fallo funcional conocido pendiente en el alcance implementado. Límites anteriores son explícitos, no pruebas omitidas que se declaren aprobadas. Las cuentas/pagos/entrega/autorización son demostraciones locales; no seguridad de servidor, reparto real ni ingresos.

## Correcciones y criterio de iteración

Se preservó el estado anterior en ZIP y checkpoint histórico. Se separó mapa de servicio de rutas; el pin de campus inicialmente ajustaba a Angamos y se eligió llegada vial a Tacna y Arica, conservando la incertidumbre de puerta. Se corrigieron cantidades locales inválidas para impedir cobro, selección de coordenadas pendiente, foco de caja/cierre, cierres inconsistentes, filtros ocultos al cambiar reportes y etiquetas españolas. Inspección visual detectó glifos de mapa faltantes: reemplazados por SVG con rumbo independiente. Incidencias de guiones por nombres antiguos, selectores exactos y fixture incoherente se corrigieron sin inventar fallos de negocio; solo se retomaron ramas pendientes.

Unidad1: flujo Entrega→Pago→Revisión y Caja→Cobro→Historial/Turno, decisiones actuales y registro de correcciones. No bocetos/storyboards históricos inventados. Unidad2: interfaces de alta fidelidad, Atomic Design por responsabilidad, Manrope/DM Sans, Gestalt, cifras/tablas/contraste/foco. Unidad3: confirmaciones, validación, procesamiento sin duplicados, subtotales, estados de mapa y tokens de movimiento; [DS actualizado](DESIGN-SYSTEM.md). No conclusiones de A/B con participantes inventados.

## Repetir solo cuando sea necesario

`npm run check`: tipos, lint, contraste y build. `npm run test:operations`: guiones de lógica conservados, servicio de rutas externo para segundo destino. Los guiones originales se ejecutaron desde /tmp; tras cambios solo se ejecutaron las ramas relacionadas. No se repitieron baterías ya aprobadas de videos, zoom o catálogo sin cambios funcionales allí. Historial de pruebas anterior: [0.9.0](history/VERIFICACION-0.9.0.md).

Para abrir la **vista previa interactiva final**, entra a **http://127.0.0.1:4176/**. Si el proceso se detuvo:

```sh
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
nvm use
npm run preview -- --host 127.0.0.1 --port 4176 --strictPort
```

Se usa el build ya generado. Si modificas fuente, compila antes. Para desarrollar: `npm run dev` y abrir el puerto indicado. No publica.
