# Filtros sticky dentro del catálogo

El aside tenía `min-width: 0`, pero ninguna regla sticky activa. Sus ancestros mantienen `overflow-y: visible`, según la inspección real de Chrome; no fue necesario modificar sus recortes o alturas.

Se usa `position: sticky` en el breakpoint de escritorio existente (1024px), `align-self: start` y `max-height` calculado desde el viewport. El límite natural es `.catalog-layout`: la barra termina con la cuadrícula de productos, antes del footer. No se utiliza posición fija.

`useHeaderClearance` mide el borde inferior visible del activador/header mediante ResizeObserver y durante la transición CSS. Publica una variable en el contenedor de tienda. La barra deja el espaciado existente de 16px por debajo del header y otros 16px al pie del viewport. La altura del header no está hardcodeada.

El aside tiene `overflow-y: auto` y evita que Lenis intercepte su rueda; los controles inferiores se alcanzan mediante scroll interno. Colores, fuentes, padding, anchura y lógica de filtros permanecen iguales. En móvil no aparece el aside y se conserva el Sheet de filtros.

## Validación

`npm run check` aprobado: TypeScript, ESLint, contraste y compilación. Se mantiene el aviso previo del chunk diferido de Three.js.

Chrome: 1440×1000, 1440×720, 1440×480 y 1024×640. Se comprobaron inicio, primeros productos, mitad, final y footer. En todas las muestras la barra usa sticky, respeta el viewport y termina antes del footer. Con el header abierto, su borde inferior fue ~206–212px y la barra empezó en 222–228px. En la pantalla de 480px de alto, dejó 242px útiles y permitió 650px de desplazamiento interno sin mover el documento. Se comprobó también el cierre del header y la recuperación del espacio disponible.

A 390×800 no hay aside y el botón abre el diálogo de filtros existente.

- [Mitad del catálogo](screenshots/1440x1000-middle.png)
- [Header desplegado en pantalla baja](screenshots/1440x480-header.png)
- [Controles inferiores accesibles](screenshots/1440x480-inner-bottom.png)
- [Límite del footer](screenshots/1440x720-footer.png)
- [Filtros móviles](screenshots/mobile-filters.png)

Resultados completos en `results.json`; prueba reproducible en `verify.mjs` con Playwright y Chrome, usando `PLAYWRIGHT_MODULE`, `CHROME_PATH` y `VERIFICATION_OUT` cuando sea necesario.
