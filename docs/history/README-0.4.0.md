# Minimarket Rosita · Frontend 0.4.0

Tienda y administración de demostración, conectadas por Context/useReducer y persistencia local v4. Conserva catálogo, filtros, carrito, acceso, checkout, pedidos y seguimiento. Identidad Manrope/DM Sans, verde profundo, rosa y superficies claras. **Sin backend, base de datos, cobros o reparto real.** Uso en un navegador y una pestaña. No modifica Framer/Figma ni está desplegado.

## Ejecutar

Node compatible: **^20.19.0 || ^22.13.0 || >=24.0.0**. `.nvmrc` y `.node-version` fijan **20.19.4**. npm declarado **11.21.1**, lock conservado. Node 18 del shell no es compatible; no se añadieron/actualizaron dependencias en esta etapa.

```bash
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
nvm use
npm run dev
```

Abrir **http://localhost:5173/** o el puerto mostrado por Vite. Las dependencias ya están instaladas. Reinstalación exacta si fuera necesaria: `npx --yes npm@11.21.1 ci`.

```bash
npm run check       # tipos, ESLint, contraste y build
npm run dev         # desarrollo local
npm run preview     # dist local, después del build; no publica
```

## Administrador ficticio

Entrada: **/personal** o «Acceso de personal» en el pie de la tienda.

| Dato | Credencial ficticia |
| --- | --- |
| Correo | admin@rosita.test |
| Contraseña | RositaDemo!2026 |

Solo para este prototipo. Se persiste salt/verificador PBKDF2, no la contraseña. El registro público crea únicamente clientes; no ofrece selección de perfil. La cuenta de administración inicial se incorpora una sola vez al migrar. Si un cliente v3 ya usaba ese correo, se conserva y la cuenta inicial usa `admin+1@rosita.test` (o siguiente libre); la entrada de personal muestra el correo correcto. Se mantiene la misma contraseña ficticia.

El administrador entra a `/admin`; puede consultar tienda y cerrar sesión. Las rutas y acciones verifican el perfil. Esto **no es seguridad ni autorización de servidor**: quien controla el navegador puede editar sus datos.

## Panel y rutas

- `/admin`: indicadores calculados, pedidos recientes y alertas.
- `/admin/productos`: buscar, filtrar, ordenar, crear, editar y activar/desactivar.
- `/admin/inventario`: existencias, entradas, salidas, conteos e historial.
- `/admin/pedidos` y `/admin/pedidos/:id`: compras digitales de clientes y avance de estados.

Tienda conservada: `/`, `/catalogo`, seis `/categoria/:slug`, `/producto/:id`, `/carrito`.
Cliente: `/registro`, `/login`, `/cuenta`, `/checkout`, `/pedido/:id/confirmacion`, `/pedido/:id`, `/mis-pedidos`, `/pedido/:id/seguimiento`.
Internas: `/sistema-diseno`, `/comprobacion`, `/estado`.

`src/app`: proveedores, rutas y reducer; `features/administracion`: plantilla, tablas y formularios; `pages/admin`: vistas. `state.products` es el catálogo compartido; `inventory` concentra precios en céntimos y stock. `lib/admin-operations.ts` concentra modificaciones y permisos; `order-transaction.ts` confirma compras; `cart-pricing.ts` calcula importes. No hay otro catálogo administrativo.

## Demostrar el ciclo completo

1. Como cliente, agrega dos sets de destornilladores y confirma un pedido ficticio. Zona A: S/4 de envío de prueba. Precio inicial S/15.50 × 2 + S/4 = S/35.
2. Cierra sesión; entra en personal con el administrador y abre Pedidos. Confirma el avance a En preparación.
3. Cierra la sesión administrativa, ingresa con el cliente y consulta seguimiento: muestra el cambio y su origen.
4. Regresa como administrador, edita el precio a S/16.75 y registra entrada de cinco unidades con motivo.
5. Consulta la tienda: refleja el nuevo precio y stock. El pedido anterior mantiene nombre, precio, dirección y cantidades de compra.

Agregar no descuenta stock. Confirmar pedido descuenta y crea movimientos una vez. Cambiar estado no vuelve a descontar. El control del cliente «Simular siguiente estado» pide confirmación y usa la misma operación que administración.

## Recuperación y límites

Para datos limpios: ingresar como administrador → enlace «Restablecer demostración» del panel → confirmar en `/estado`. Borra solo datos Rosita, restaura catálogo/stock y cuenta inicial, y cierra la sesión. Clientes/anónimos no pueden usar este restablecimiento global. Si el formato está corrupto o es futuro, puede ingresarse con el administrador temporal y usar navegación interna para recuperar; no recargar antes de confirmar el reset.

v3→v4 conserva clientes, sesión válida, carrito, stock, pedidos y contador. **No se inventan movimientos ni transiciones antiguas.** El registro comienza en la fecha indicada por la demostración. Formatos futuros no se sobrescriben; si falla localStorage se avisa y se continúa temporalmente en memoria.

Imágenes: 18 fotos reutilizadas y seis ilustraciones SVG originales identificadas; esas seis fotografías reales siguen pendientes. Se eligen recursos locales; no hay subida de archivos, blobs persistidos ni imágenes externas.

Caja presencial y A/B quedan pendientes. No hay cancelaciones, devoluciones, reposición automática, precios mayoristas sin regla, coordinación entre pestañas/dispositivos ni autenticación segura. Solo datos ficticios.

[Verificación y rutas](docs/VERIFICACION.md) · [Persistencia y reglas](docs/PERSISTENCIA.md) · [Design System 2.2.0](docs/DESIGN-SYSTEM.md) · [Recursos](docs/RECURSOS.md). Evidencia actual: `docs/admin-verification`; evidencia previa conservada en sus carpetas. Copias recuperables: `docs/recovery`.
