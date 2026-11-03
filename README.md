# Minimarket Rosita · Frontend 1.0.0

Tienda, administración y caja interactivas con procesos ficticios y persistencia local v9. React/Vite/TypeScript, Context/useReducer, Tailwind/shadcn personalizado, Motion y Router. Sin backend, base de datos, cobros reales, GPS ni autenticación de servidor. No publicado ni desplegado; Framer/Figma intactos.

## Abrir y comprobar

Node **20.19.4** (`.nvmrc`), npm **11.21.1**. Se conserva el lock y la tecnología existente. Esta etapa añade solamente Leaflet **1.9.4** y `@types/leaflet` **1.9.21**; las demás versiones no se actualizaron.

```sh
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
nvm use
npm run dev
```

Abre el puerto mostrado por Vite (normalmente [localhost:5173](http://localhost:5173/)). La vista previa compilada final de esta sesión está en **[127.0.0.1:4176](http://127.0.0.1:4176/)**. `npm run check` ejecuta tipos, ESLint, 26 contrastes y build. `npm test` ejecuta las pruebas de operaciones, catálogo, migraciones, pedidos y teléfonos con datos aislados. La prueba vial de `test:operations` usa una respuesta sintética sin red y no certifica al proveedor. `npm run test:routing:live` comprueba el proveedor real y transmite coordenadas; ejecútala solo con autorización para esa transmisión. `npm run preview` sirve la compilación local; no publica. Reinstalación exacta: `npx --yes npm@11.21.1 ci`.

## Accesos ficticios

En `/login` o `/personal`, pulsa «Completar acceso…» y luego «Iniciar sesión».

| Perfil         | Correo inicial      | Contraseña ficticia | Acceso                                     |
| -------------- | ------------------- | ------------------- | ------------------------------------------ |
| Cliente        | cliente@rosita.test | ClienteDemo!2026    | Tienda, checkout, sus pedidos              |
| Administrador  | admin@rosita.test   | RositaDemo!2026     | `/admin`, reportes, agentes, origen y caja |
| Agente de caja | caja@rosita.test    | CajaDemo!2026       | `/caja`, sus ventas y turno                |

Si hay colisión de correo al migrar, se conserva la cuenta anterior y se elige otro libre; los botones muestran el correo efectivo. El registro público crea solo clientes. Nuevos agentes/restablecimientos no semilla usan **AgenteDemo!2026**. Perfiles, contraseñas verificadas localmente y permisos de rutas/reducer **no proporcionan seguridad de servidor**.

## Entrega, recojo y caja

- Origen confirmado por el usuario: **−16.33112128439101, −71.58692292883559**. Dirección: UPIS Mercado Mayorista, Zona B, Manzana D, Lote 6, Arequipa.
- En checkout elige delivery, selecciona UTP u otro punto mediante mapa/coordenadas y pulsa **Confirmar punto y calcular ruta**. La cobertura y tarifas son ficticias: hasta 7 km de ruta S/ 4; más de 7 km S/ 6.50. Recojo: envío cero, sin dirección de delivery ni repartidor.
- Mapa Leaflet/OpenStreetMap y rutas viales OSRM/FOSSGIS son funciones distintas. Fallback exclusivo Rosita→UTP con 358 puntos verificados; otros destinos necesitan servicio disponible. Sin línea recta que aparente ruta.
- Seguimiento: avanza a «En camino», inicia/pausa/reanuda y cambia velocidad. Recarga en pausa. Llegar al final visual no confirma entrega ni vuelve a descontar stock.
- Caja: abre turno, agrega por búsqueda o código, revisa cantidades y cobra con efectivo o tarjeta ficticia. Historial, recibo imprimible y cierre. Ejemplo: dos Coca-Cola de S/ 3.50 = S/ 7; recibido S/ 10, vuelto S/ 3. Fondo S/ 100 → efectivo esperado S/ 107. La tarjeta no entra al efectivo físico.

Códigos ficticios (texto, conservan ceros; no son códigos GS1 comerciales): Coca-Cola **0000000000017**, Lay’s **0000000000024**, Doritos **0000000000031**, destornilladores **0000000000048**. Escribe en «Escanear o ingresar código» y pulsa Enter; también hay selector «Simular lectura». No se probó hardware físico. Cámara opcional nativa donde BarcodeDetector esté disponible; alternativa manual y sin nueva dependencia.

Tarjeta: usa los botones de completar escenarios; CLIENTE DEMO, 12/99, CVV 123, números ficticios 0000 0000 0000 0001/0002/0003 para aprobación/rechazo/error. No introduzcas datos reales. Campos solo en memoria; recibo guarda referencia Demo y últimos cuatro dígitos.

## Estructura y continuidad

`app`: proveedores, reducer y rutas; `components/ui` y `components/layout`: piezas/estructuras compartidas; `features`: catálogo, acceso, carrito, pedidos, entrega, administración y caja; `pages`: composiciones; `data`: catálogo/taxonomía/semillas/geografía/ruta verificada; `lib`: precios, operaciones, esquemas, rutas y almacenamiento; `hooks`, `types`, `styles`; `public/images`: recursos locales.

Se conservan 63 productos iniciales, fotografías, Manrope/DM Sans, verde/rosa, categorías, búsquedas/filtros, zoom, videos, cuenta, carrito, tarjeta y administración. Las existencias pueden cambiar por operaciones locales. ID interno y SKU comercial siguen separados: Powerade ROS-024-IMPORT/código ROS-024; pasta ROS-024/código ROS-063. Borrador de caja independiente del carrito; confirmaciones descuentan exactamente una vez del mismo inventario. No hay descuentos mayoristas automáticos: no existe una regla explícita previa.

[Guiones, coordenadas, proveedores, rutas y límites](docs/OPERACIONES-1.0.0.md) · [Pruebas reales](docs/VERIFICACION.md) · [Persistencia](docs/PERSISTENCIA.md) · [Design System 2.7](docs/DESIGN-SYSTEM.md) · [Checkpoint y recuperación](docs/ESTADO-ACTUAL.md) · [Integración anterior de catálogo](docs/CATALOGO-0.9.0.md).

Usa una pestaña/navegador. No hay sincronización entre dispositivos ni garantía transaccional entre pestañas. Datos corruptos/futuros/bloqueados muestran aviso; restablecimiento exclusivo de Rosita, nunca `localStorage.clear()`.

## Auditoría integral · 3 de noviembre de 2026

[Informe técnico y límites de verificación](docs/integral-audit/README.md) · [Inventario de rutas](docs/integral-audit/ROUTES.md). La auditoría usa un perfil de navegador y fixtures independientes de los datos del usuario. No despliega ni modifica sesiones reales.

El sitemap puede generarse después del build con `SITE_URL` configurado al origen público confirmado: `SITE_URL=https://tu-dominio-confirmado.example npm run seo:sitemap`. El dominio del ejemplo debe reemplazarse; no se genera ni publica un sitemap de producción sin ese dato. Incluye el catálogo inicial, no modificaciones posteriores guardadas en localStorage.
