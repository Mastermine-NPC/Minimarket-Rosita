# Minimarket Rosita · Frontend 0.8.0

Prototipo interactivo de tienda y administración, con procesos simulados y persistencia local v7. React + Vite + TypeScript, Context/useReducer, Tailwind/shadcn personalizado, Motion y Router. Sin backend, cobros, autenticación de servidor ni despliegue. No se modificó Framer/Figma.

## Abrir en local

Node **20.19.4** (`.nvmrc`); admite ^20.19.0 / ^22.13.0 / >=24. npm **11.21.1**, lock conservado. Node 18 no es compatible. Dependencias instaladas; no se añadieron ni actualizaron en esta etapa.

```bash
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
nvm use
npm run dev
```

Abre **http://localhost:5173/** o el puerto indicado por Vite. `npm run check` ejecuta tipos, ESLint, contraste y compilación. `npm run preview` abre el build local en http://localhost:4173/ después de compilar; no publica. Para reinstalación exacta: `npx --yes npm@11.21.1 ci`.

## Accesos ficticios

En `/login` o `/personal`, «Accesos de demostración» permite completar credenciales sin enviarlas automáticamente.

| Perfil        | Correo inicial      | Contraseña ficticia |
| ------------- | ------------------- | ------------------- |
| Cliente       | cliente@rosita.test | ClienteDemo!2026    |
| Administrador | admin@rosita.test   | RositaDemo!2026     |

Si un correo ya existía al migrar, se conserva esa cuenta y se busca otro libre (+1, +2…). Usa los botones del login: muestran la cuenta correspondiente. El registro público crea solo clientes. Mi cuenta permite editar nombre y correo, con validación. Contraseñas ficticias con salt/verificador PBKDF2, nunca texto plano persistido. Perfiles y permisos locales **no equivalen a seguridad de servidor**. No había caja presencial implementada: no existe cajero ni se inventan sus ventas.

## Novedades 0.8 · video y tarjeta exclusivamente ficticia

Inicio: video de compra en un marco junto al título, con poster, pausa y alternativa estática. El clip de entrega resultó ser una escena de comedia: aparece como referencia de ficción opcional, sin autoplay. Originales intactos; derivados web medidos y sin audio en `public/images/video/web`. No se solicitan ambos videos al abrir inicio. Movimiento reducido empieza con imágenes.

Checkout conserva efectivo/Yape/Plin y añade tarjeta simulada. Usa los botones Completar:

| Escenario         | Número exclusivamente ficticio |
| ----------------- | ------------------------------ |
| Aprobación        | 0000 0000 0000 0001            |
| Rechazo           | 0000 0000 0000 0002            |
| Error recuperable | 0000 0000 0000 0003            |

Titular **CLIENTE DEMO**, vencimiento **12/99**, CVV **123**. No usar tarjetas reales. Solo se aceptan estas combinaciones. Los campos viven en memoria, se limpian al aprobar/salir; una aprobación no persiste ni sirve para otra compra/importe. Pedido: únicamente referencia ficticia, marca Demo y últimos cuatro. Ningún cobro ni servicio financiero. Cambiar el carrito invalida la revisión aunque se restaure la cantidad anterior.

Se pulieron espaciados administrativos, estados de inventario, lectura de Nosotros/Ayuda, footer y contacto (incluye email con espacios exteriores). [Informe de cambios, archivos, pruebas y límites](docs/PULIDO-0.8.0.md). [Checkpoint actual](docs/ESTADO-ACTUAL.md). Evidencia: `docs/polish-verification`; versiones previas conservadas.

## Qué incluye

- Menú informativo separado de categorías: Nosotros, ayuda, FAQ, compra, entregas/pagos y contacto simulado.
- Catálogo, seis categorías iniciales y subcategorías dependientes, filtros combinados/orden y selección en URL. Administración puede ampliar/ordenar/desactivar la taxonomía sin editar código.
- Productos, detalle y zoom con teclado/táctil, carrito persistente, registro/acceso, checkout, confirmación, historial y seguimiento manual.
- Panel `/admin`: estadísticas reales del prototipo, productos, categorías/subcategorías, inventario, pedidos y reportes.
- Archivos JPG/PNG/WebP desde computadora, previsualización, compresión, referencias estables e IndexedDB; recargar conserva la imagen.
- Reportes de inventario/stock bajo/pedidos/digital/top: filtros, totales, CSV e impresión para guardar como PDF. Presencial se identifica como no implementado.
- `/sistema-diseno`: fundamentos y ejemplos de componentes/estados reales del DS 2.6.0.

Los importes se calculan en céntimos. Confirmar un pedido descuenta stock una vez; avanzar su estado no vuelve a descontar. Cambiar precio/nombre no reescribe compras históricas. No se insertan pedidos para decorar estadísticas.

## Estructura

`src/app`: proveedores, navegación y reducer. `components/ui`: controles base; `components/layout`: estructuras. `features`: catálogo/carrito/acceso/pedidos/administración/información/inicio/sistema. `pages`: composiciones. `data`: semillas; `hooks`: lógica compartida; `lib`: operaciones, cálculos y persistencia; `styles`: tokens y estilos; `types`: contratos. `public/images` y `public/fonts`: recursos locales y licencias.

`state.products/categories/subcategories/media` y `inventory` son la fuente compartida. `lib/module-operations.ts` gestiona taxonomía/perfil/metadata; `admin-operations.ts` productos/stock; `order-transaction.ts` confirma pedidos; `analytics.ts` concentra estadísticas/reportes; `image-store.ts` conserva archivos.

## Recuperación y límites

Administrador → «Restablecer demostración» → `/estado` → confirmar. Solo elimina claves `minimarket-rosita:` y archivos del almacén propio `minimarket-rosita-assets`; conserva recursos de otras aplicaciones. Restaura catálogo y dos cuentas iniciales. Para formatos futuros se abre sesión temporal sin sobrescribirlos. Datos corruptos se conservan hasta una modificación explícita o reset. Cuota/bloqueo informa sesión temporal; navegar conserva memoria, recargar puede perder cambios.

Uso en un navegador y una pestaña. No hay sincronización, servidor, contacto real, cobros ni reparto en vivo. Caja, cajero y comparación A/B siguen sin implementar. Seis productos iniciales usan ilustraciones identificadas; el atlas original de 300×300 px por foto limita zoom. Las imágenes subidas dependen del archivo aportado y no recuperan detalle inexistente.

[Inventario previo y guion A–M](docs/MODULOS-0.7.0.md) · [Verificación](docs/VERIFICACION.md) · [Persistencia](docs/PERSISTENCIA.md) · [DS 2.6.0](docs/DESIGN-SYSTEM.md) · [Recursos](docs/RECURSOS.md). Evidencia en `docs/module-verification`; copias antes/después en `docs/recovery`. Documentación anterior conservada en `docs/history` y carpetas de evidencia previas.

# Minimarket-Rosita

# Minimarket-Rosita

# Minimarket-Rosita
