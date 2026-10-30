# Minimarket Rosita · Tienda frontend 0.2.0

Prototipo independiente con React, Vite y TypeScript. Inicio comercial, seis categorías, catálogo, detalle reutilizable y carrito persistente. Nueva identidad verde/rosa y sistema de diseño 2.0.0. No modifica Framer ni Figma; no incluye servidor, base de datos, acceso seguro ni pagos.

## Abrir localmente

Requisitos: Node 20.19.4 (`.nvmrc`), npm 11.21.1 y dependencias instaladas según `package-lock.json`.

```bash
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
nvm use
npm run dev
```

Abrir **http://localhost:5173/** (o el puerto indicado por Vite). Sistema de diseño: `/sistema-diseno`. La comprobación original se conserva en `/comprobacion` y `/estado`.

Para reinstalar exactamente el lock: `npx --yes npm@11.21.1 ci`. En esta etapa no se añadieron dependencias ni se reinicializó la aplicación.

```bash
npm run check          # tipos, ESLint, contraste y build
npm run dev            # desarrollo local
npm run preview        # servir dist localmente después del build
```

## Estructura

- `src/app`: proveedores, rutas y Context/useReducer.
- `src/components/ui`: shadcn personalizado; `layout`: encabezado, búsqueda y pie.
- `src/features/catalogo`, `carrito`, `comprobacion`: piezas por función.
- `src/pages`: composiciones concretas; `data/catalog.ts`: 24 productos y seis categorías.
- `src/hooks`, `lib`, `types`: estado, persistencia, moneda, movimiento y tipos.
- `src/styles`: tokens, fuentes y estilos; `public/images`, `public/fonts`: recursos locales.
- `docs`: verificación, fuentes de recursos y copias recuperables.

## Datos y límites

Se comparten identificadores, precios, stock y carrito. Añadir al carrito **no descuenta inventario**. El almacenamiento v2 migra el contador técnico v1; repara cantidades inválidas y protege formatos futuros. El restablecimiento elimina exclusivamente claves `minimarket-rosita:`, nunca todo localStorage.

Checkout, pedidos, seguimiento, acceso, administración y caja quedan para próximas etapas; la interfaz lo explica. Todos los precios y existencias son de prueba. Hay 18 fotografías reutilizadas y seis marcadores «Fotografía pendiente».

Consulta [verificación y rutas](docs/VERIFICACION.md), [recursos y licencias](docs/RECURSOS.md) y el [sistema de diseño](docs/DESIGN-SYSTEM.md). La evidencia 0.1.0 en `docs/verification` es histórica; los resultados actuales están en `docs/commerce-verification`.
