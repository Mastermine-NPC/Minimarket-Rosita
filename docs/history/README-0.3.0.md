# Minimarket Rosita · Frontend 0.3.0

Tienda interactiva con acceso local de demostración, checkout de tres pasos, confirmación, historial y seguimiento manual. Conserva catálogo, filtros, carrito y la identidad Manrope/DM Sans, verde y rosa. **Sin backend, base de datos, cobros o reparto real.** No modifica Framer/Figma ni está desplegado.

## Ejecutar

La intersección de requisitos instalados es **Node ^20.19.0 || ^22.13.0 || >=24.0.0**, determinada por Vite y ESLint 10. `.nvmrc` y `.node-version` fijan **20.19.4**, utilizado en las comprobaciones. Node 18, detectado en el shell del sistema, no es compatible. Gestor declarado: **npm 11.21.1**, disponible en el runner local; se conserva `package-lock.json`.

```bash
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
nvm use
npm run dev
```

Abrir **http://localhost:5173/** o la URL que indique Vite. Las dependencias ya están instaladas. Para reinstalar exactamente el lock: `npx --yes npm@11.21.1 ci`. No se añadieron ni actualizaron bibliotecas en 0.3.0.

```bash
npm run typecheck
npm run lint
npm run check:contrast
npm run build
npm run check       # todos los controles anteriores
npm run preview     # sirve dist localmente; no publica
```

## Probar una compra

1. Agrega productos del catálogo y abre el carrito.
2. Pulsa «Continuar con mi pedido»; crea una cuenta ficticia o inicia sesión con una creada en este navegador. No hay credenciales precargadas.
3. Completa entrega con datos ficticios. Ejemplo de teléfono de prueba: 999123456. Elige una zona de demostración.
4. Selecciona efectivo simulado e indica un monto suficiente, o Yape/Plin de demostración sin QR ni transferencias.
5. Revisa subtotal, envío y total; confirma el pedido ficticio.
6. Abre seguimiento y usa «Simular siguiente estado». Historial en `/mis-pedidos`; cuenta y salida en `/cuenta`.

## Rutas y organización

Tienda: `/`, `/catalogo`, `/categoria/:slug`, `/producto/:id`, `/carrito`.
Cliente: `/registro`, `/login`, `/cuenta`, `/checkout`, `/pedido/:id/confirmacion`, `/pedido/:id`, `/mis-pedidos`, `/pedido/:id/seguimiento`.
Internas: `/sistema-diseno`, `/comprobacion`, `/estado`.

`src/app` contiene proveedores, rutas y reducer; `components/ui` y `layout` las piezas comunes. `features` agrupa catálogo, carrito, acceso y pedidos; `pages` compone vistas. `data` mantiene productos/zonas de prueba; `lib` concentra precios, transacción, validación, verificador y almacenamiento. `styles`, `types` y `hooks` conservan los patrones compartidos; imágenes y fuentes son locales.

## Persistencia y límites

Un único registro v3 (`minimarket-rosita:app`) agrupa cuentas, sesión, carrito, inventario, borrador y pedidos. Migra v2 conservando carrito/contador y mantiene compatibilidad con v1. Contraseñas ficticias: solo verificador PBKDF2 con salt, nunca texto plano. Esto **no proporciona autenticación ni autorización de servidor**; la sesión permanece hasta cerrar sesión/restablecer. Al salir se limpia el borrador de entrega/pago y se conserva el carrito.

Agregar no descuenta ni reserva stock. Confirmar revalida y actualiza pedido, inventario y carrito juntos, con importes enteros en céntimos e idempotencia por operación. Ante un fallo de almacenamiento se permite una sesión temporal, con advertencia visible. Usa una sola pestaña: no hay coordinación transaccional entre pestañas o dispositivos.

Para una demostración limpia: `/estado` → «Restablecer datos de Rosita» → confirmar. Elimina solo las claves Rosita y restaura stock inicial; conserva datos ajenos. Borra cuentas y pedidos ficticios. No hay `localStorage.clear()`.

Administración, caja y comparación A/B quedan pendientes. Continúan seis fotos de producto identificadas como pendientes. Navegadores físicos, lectores de pantalla y estudios con usuarios no se han probado.

Documentación: [verificación e inventario](docs/VERIFICACION.md), [persistencia y transacción](docs/PERSISTENCIA.md), [Design System 2.1.0](docs/DESIGN-SYSTEM.md), [recursos](docs/RECURSOS.md). Evidencia actual: `docs/order-verification`; anteriores en `docs/commerce-verification` y `docs/verification`. Versiones recuperables en `docs/recovery`.
