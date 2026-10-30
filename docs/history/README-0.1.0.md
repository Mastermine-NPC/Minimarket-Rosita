# Minimarket Rosita · Base frontend

Proyecto independiente en React, Vite y TypeScript. Esta etapa prepara infraestructura y dos páginas de comprobación; no migra todavía todas las pantallas del [diseño de Framer demo-log](https://framer.com/projects/demo-log--aALIWiPZI7CtrO9ahdgc-7fBGu). No modifica ese proyecto, ni incluye backend, base de datos, autenticación o pagos reales.

## Requisitos y uso

Probado con Node **20.19.4**. `.nvmrc` y `.node-version` fijan esa versión. La instalación usa **npm 11.21.1** (runner local con npx, sin cambiar npm global); se conserva `package-lock.json`.

```bash
cd /home/hisok/Desktop/extension-cor/PROYECTO-PROTOTIPO
# Si usas nvm:
nvm use
# Dependencias ya instaladas. Para reinstalar exactamente el lock:
npx --yes npm@11.21.1 ci
npm run dev
```

Abrir la dirección local que muestre Vite, normalmente `http://localhost:5173`. Rutas: `/` (comprobación) y `/estado` (estado compartido). No es necesario publicar.

```bash
npm run typecheck       # TypeScript
npm run lint            # ESLint, sin advertencias
npm run check:contrast  # Contraste de tokens usados
npm run build          # Compilación local en dist/
npm run check          # Todas las anteriores
npm run preview        # Servir dist/ localmente después de build
```

## Estructura

```text
src/
  app/                  # Proveedores, rutas y Context/useReducer
  components/ui/        # 14 componentes shadcn/ui generados (Radix)
  components/layout/    # Encabezado y estructura compartida
  features/             # Comprobación; carpetas comerciales reservadas
  pages/                # Dos páginas de esta etapa
  data/                 # Producto/categorías iniciales ficticios
  hooks/                # Estado, foco y preferencia de movimiento
  lib/                  # Persistencia, moneda, movimiento y utilidades
  styles/               # CSS normal, variables/tokens y Tailwind v4
  types/                # Tipos compartidos
public/images/          # Recursos locales de Rosita
scripts/                # Comprobación reproducible de contraste
docs/                   # Versiones, verificación y recuperación
```

Alias `@/` apunta a `src/` en TypeScript y Vite. Motion usa `motion/react`, `MotionConfig reducedMotion="user"` y una preferencia reactiva. React Router utiliza modo declarativo, con rutas cargadas bajo demanda. Para un alojamiento estático futuro habrá que configurar el fallback de SPA; no se configuró ni ejecutó un despliegue.

## Estado, estilos y alcance

- Context + useReducer; sin biblioteca adicional de estado.
- Solo se persiste el contador de demostración: `minimarket-rosita:app`, formato `{ version: 1, data: ... }`. El formulario no se guarda ni envía.
- Lectura validada con Zod, recuperación de JSON inválido, aviso si el almacenamiento está bloqueado y protección de versiones futuras. El reset requiere confirmación y afecta únicamente el prefijo `minimarket-rosita:`. No borra almacenamiento ajeno.
- Moneda: `Intl.NumberFormat('es-PE', { currency: 'PEN', style: 'currency' })`.
- Marca `#239898`; botones con blanco pequeño usan `#146E6E` (6,03:1). No usar blanco pequeño sobre el turquesa de marca. Tokens en `src/styles/tokens.css`.
- shadcn/ui: Button, Input, Label, Card, Dialog, Sheet, Select, Checkbox, Tabs, Table, Badge, Skeleton, Alert y Sonner. Radix aporta interacción accesible; las adaptaciones locales incluyen español, foco de contraste completo y controles de 44 px en los botones de prueba.

[Versiones, fuentes oficiales y resultados](docs/VERIFICACION.md). Evidencias en `docs/verification/`. El scaffold inicial recuperable está en `docs/recovery/`; no incluye dependencias ni datos personales. Las carpetas comerciales están reservadas para la siguiente etapa.
