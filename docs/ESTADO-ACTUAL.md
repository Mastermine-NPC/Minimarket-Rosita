# Checkpoint final · Rosita 1.0.0 / esquema9 / DS2.7 · 30/10/2026

Proyecto `/home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO`. Etapa implementada y comprobaciones pertinentes finalizadas. No publicar/desplegar/commit/push/Framer/Figma. Cambios previos conservados y las 19 bajas de recuperación del índice pertenecen a la etapa anterior; no se añadieron cambios preparados.

## Implementado

- Origen Rosita exacto confirmado por usuario: **−16.33112128439101, −71.58692292883559**. Configurable por admin, sin reescribir pedidos.
- Delivery/recojo, selección/confirmación/cobertura, Leaflet/OSM separado de rutas OSRM/FOSSGIS, destino rápido UTP Tacna y Arica y otro destino real. Ruta verificada358 puntos/11 486.9m/1225.4s, fallback exclusivo de extremos originales. Puerta peatonal no verificada.
- Seguimiento por distancia sobre geometría completa, SVG/rumbo/tramo recorrido, pausa/reanuda/velocidad/recarga pausada, movimiento reducido manual. Llegada no entrega ni descuenta.
- Agente semilla y administración de agentes; caja manual/códigos/cámara nativa opcional, cantidades validadas, tarjeta compartida con checkout, dinero en céntimos, cobro idempotente, stock único, turnos/cierres/recibos/historial/reportes/CSV. Etiquetas españolas centralizadas.
- Migración v8→9 y conversiones previas, preserva productos/media/cuentas/precios/stock/carrito e históricos; semillas sin duplicación. Sin PAN/CVV/vencimiento persistidos. Documentación y DS actualizados.

## Pruebas aprobadas

Tipos (tsc en build), ESLint sin advertencias,26 pares de contraste y compilación final. Solo Leaflet1.9.4, tipos1.9.21 y transitivo geojson añadidos; lock anterior conserva todas sus versiones.

Evidencia `docs/operations-verification`: logic/extra/targeted, ui/browser-extra/final-ui/visual-final, report-final/labels-final JSON sin errores finales. Compras delivery/recojo, caja efectivo/tarjeta, duplicados/stock/turnos, permisos/agentes, migración histórica/corrupción/futuro/bloqueo, dos rutas reales, errores/abortos/fallback simulados, cámara sintética/deduplicación/tracks, teclado/foco, 1440/768/390 y anchos1024/600. Matriz exacta en [VERIFICACION](VERIFICACION.md).

No se repitieron ventas/mapa ya aprobados para cerrar documentos. Los ajustes finales tuvieron comprobaciones dirigidas. Guiones de lógica reproducibles en scripts/verify-operations*.mjs.

## Pendientes y errores conocidos

Sin fallo funcional conocido pendiente en este alcance. No comprobado: hardware físico de cámara/lector/impresora, otros motores/dispositivos, puerta peatonal exacta UTP, GPS/reparto real, pruebas con participantes. Simulaciones de vídeo/detector/red y toque están identificadas; no equivalen a hardware. Una pestaña, sin sincronización ni seguridad de servidor. Servicio público sin SLA.

## Recuperación

Previo: `docs/recovery/antes-operaciones-1.0.0.zip`. Final: `docs/recovery/operaciones-1.0.0.zip`, con hash en SHA256SUMS. Copias excluyen node_modules/dist/.git/.vercel/.env privados y otros snapshots, conservan código/configuración/docs/recursos y .env.example si existe. No contienen localStorage/IndexedDB personal. Extraer en carpeta separada; no sobrescribir trabajo actual. Checkpoint previo en docs/history/ESTADO-ACTUAL-0.9.0.md. Capturas intermedias del guion en recovery/operaciones-intermedios, no evidencia final.

## Retomar exactamente

Vista previa compilada activa: **http://127.0.0.1:4176/** (sesión75598). Si termina:

```sh
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
export PATH=/home/hisok/.nvm/versions/node/v20.19.4/bin:$PATH
npm run preview -- --host 127.0.0.1 --port 4176 --strictPort
```

Para cambios nuevos: `npm run dev`, y después comprobar solo código relacionado. `npm run check` cubre tipos/lint/contraste/build; `npm run test:operations` repite explícitamente lógica con red externa y fixtures aisladas, no es necesario repetirlo sin cambios.

Para exposición: `/login` cliente@rosita.test / ClienteDemo!2026; `/personal` admin@rosita.test / RositaDemo!2026 o caja@rosita.test / CajaDemo!2026. Usar botones de completar si hubo colisiones de correo. Caja: abrir turno100, código0000000000017+Enter dos veces, total7, recibido10, vuelto3; tarjeta solo escenarios ficticios. Delivery: elegir UTP, confirmar punto/ruta, pagar ficticio, confirmar, avanzar a En camino e iniciar simulación. Recojo no lleva envío ni ruta.

Si se interrumpe aquí, **no reiniciar implementación ni repetir pruebas aprobadas**: revisar estado Git, este checkpoint y VERIFICACION; retomar solo el trabajo nuevo solicitado. No hay instalación ni cierre funcional pendiente.
