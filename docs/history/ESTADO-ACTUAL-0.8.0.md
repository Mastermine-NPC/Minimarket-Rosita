# Estado actual · cierre 0.8.0 · 29/10/2026

Proyecto: `/home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO`. App 0.8.0 / DS 2.6.0 / almacenamiento 7. Cambios previos conservados; sin publicación, despliegue o cambios en Framer/Figma. Git ya existe en esta etapa y contenía archivos modificados/untracked del usuario: no se reinicializó, descartó ni hizo commit de ellos. Dependencias frontend intactas; package/lock solo actualizan versión de app. Snapshots anteriores y documentación histórica permanecen.

## Implementado

- Video de compra en marco del hero, separado de títulos/CTA. Clip secundario inspeccionado: comedia con paquete maltratado, integrado como ficción opcional sin autoplay; no es entrega Rosita. Derivados/posters conservan originales y evitan cargar ambos MP4 al entrar. Pausa/reanuda, intersección, visibilidad, error/autoplay bloqueado y movimiento reducido.
- Tarjeta exclusivamente ficticia junto a efectivo/Yape/Plin: validación RHF/Zod, foco, formato, CVV oculto y aprobación/rechazo/error. Datos solo en memoria; campos limpiados y aprobación ligada a token/cliente/huella. Pedido conserva referencia ficticia, marca Demo y últimos 4. No pago real ni pasarela.
- Carrito valida mediante cálculo compartido; cantidades mínimas y destructivos diferenciados. Modificar/restaurar cantidad invalida revisión, evita reutilizar aprobación y no permite confirmar una respuesta pendiente obsoleta. Stock y pedido únicos.
- Administración con espaciados comunes y cuatro estados calculados de inventario. Nosotros/Ayuda/contacto/footer pulidos; foto actual 1024×598 preservada y atributos corregidos. Contacto admite tildes/guion/apóstrofe, recorta email, bloquea doble envío y confirma simulación.
- Esquema 6 congelado y migración a 7 conservando colecciones/históricos/archivos. DS 2.6 real con nuevos patrones, token 650 ms y 26 contrastes.

## Comprobaciones aprobadas

Evidencia completa en `docs/polish-verification`:

- `legacy-core.json` y `card-core.json`: compatibilidad anterior y v6→7, conservación, permisos/referencias, datos inválidos, huella/idempotencia y stock. Las etiquetas de texto del harness legado conservan referencias históricas a 6; sus aserciones de escritura comprueban 7.
- `tarjeta-ui.json`: 1440/768/390, obligatorios/foco, rechazo/error, aprobación, cambio de envío, campos limpiados, sin número completo/vencimiento/CVV persistidos o POST, un pedido/stock único, salida/abandono sin operación tardía.
- `video-ui.json`: 1440/1200/1024/768/390, fotogramas reales, pausa/reanuda/intersección, visibilitychange simulado, secundario opt-in, posters/fallo/bloqueo/reintento/reducedmotion, enlaces/footer y layout público.
- `publico.json`: regresión menú/FAQ/contacto/perfil/teclado/movimiento reducido a 1440/768/390.
- `regresion-cliente/flujo.json`: registro, compra con efectivo/vuelto/errores, pasos, doble clic, historial/seguimiento/salida y stock único a 1440/768/390.
- `administracion-contacto.json`: seis secciones a 1440/1024/768/600/390, estados/umbral/desactivación, modales largos/foco/Escape y contacto con espacios/nombres legítimos/doble envío.
- `adicionales.json`: transformación real del hero con scroll; mínimo 1/destructivos; cambiar/restaurar cantidad dentro del panel invalida revisión y aprobación; espaciado final de párrafos.
- `foto-dimensiones.json`: atributos y dimensiones naturales 1024×598 coinciden tras el último ajuste.
- `check.log`: tipos, ESLint sin advertencias, 26 contrastes y compilación final aprobados.

Sin excepciones JS inesperadas. Se inspeccionaron visualmente interfaces ejecutadas y fotogramas; no se dedujo reproducción de capturas. Tras cambios finales se verificaron solo casos relacionados, sin repetir las baterías aprobadas por rutina.

## Pendientes y límites

**No queda comprobación ni fallo funcional confirmado pendiente de este alcance. No continuar desarrollando sin nueva instrucción.**

Sin backend/autenticación de servidor, pagos/contacto/reparto reales, caja/cajero o A/B. Una pestaña/navegador. No pruebas con participantes, lectores de pantalla, Safari/Firefox o dispositivos físicos. Visibilidad se simuló mediante evento/propiedad de documento, no suspensión real de teléfono. No CoreWebVitals medidos. Clip secundario es ficción ajena al negocio, voluntario y sin audio; no se verificó licencia comercial. Fotos del atlas de baja resolución y seis ilustraciones siguen identificadas. LS/IDB mantienen límites de fallo parcial/archivos compartidos; no hay respaldo remoto.

## Datos de exposición

Cliente: `cliente@rosita.test / ClienteDemo!2026`; admin: `admin@rosita.test / RositaDemo!2026`. Ante colisión, Completar acceso usa la cuenta realmente asignada.

Tarjeta: titular CLIENTE DEMO, 12/99, CVV 123. Número ficticio 0000 0000 0000 0001 aprueba; terminación 0002 rechaza; 0003 simula error. Usar Completar en checkout; nunca datos reales. Todo el conjunto está documentado en [PULIDO-0.8.0](PULIDO-0.8.0.md).

## Retomar si se interrumpe

1. Leer este checkpoint, informe de pulido y evidencia. Las pruebas ya están aprobadas: **no repetir ni ampliar alcance** sin cambio relacionado o nuevo encargo.
2. Preview de esta sesión: **http://localhost:4174/**, servidor creado por exec74379; 4173 estaba ocupado y no se alteró ese proceso. Comprobar si sigue vivo antes de levantar otro.
3. Para iniciar desarrollo:

```bash
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
nvm use
npm run dev
```

Abrir puerto mostrado por Vite, normalmente 5173. Node 20.19.4/npm 11.21.1. Si nvm no carga: `export PATH=/home/hisok/.nvm/versions/node/v20.19.4/bin:$PATH`. npm de esta sesión: `node /home/hisok/.npm/_npx/676e59db29371ba5/node_modules/npm/bin/npm-cli.js <comando>`.

Solo con cambio relacionado: typecheck/lint/contraste/build y caso pertinente; no reconstruir dist con pruebas UI activas. Herramientas externas Playwright y comandos en `polish-verification/README.md`; dependen de /tmp, no package.json. FFmpeg temporal en `/tmp/rosita-video-runtime` ya no es necesario para usar la aplicación.

La carpeta está fuera del cwd `truthlens-extension`: herramientas de escritura necesitan escalación justificada ya autorizada; no tocar el vecino. Copia previa `docs/recovery/antes-pulido-0.8.0.zip`, final `docs/recovery/pulido-0.8.0.zip`, hashes/recuperación en esa carpeta. Recuperar siempre en directorio separado; ZIP no contiene localStorage/IndexedDB personal. Conservar formatos futuros al inspeccionar versiones antiguas.

Documentación final: [PULIDO](PULIDO-0.8.0.md), [verificación](VERIFICACION.md), [DS](DESIGN-SYSTEM.md), [persistencia](PERSISTENCIA.md), [recursos](RECURSOS.md), [README](../README.md). Estado 0.7 archivado en history/ESTADO-CIERRE-0.7.0.md.
