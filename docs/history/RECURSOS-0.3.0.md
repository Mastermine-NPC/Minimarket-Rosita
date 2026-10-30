# Recursos y referencias · 0.3.0

## Rosita

Se leyó directamente el PDF del usuario `INFORME_2_HERRAMIENTAS_PROTOTIPADO (1).docx.pdf` (52 páginas). Capítulo 5 en páginas PDF 32–50: acceso, registro, inicio, nosotros, categorías, seis catálogos, carrito, contacto, seguimiento y administración. Se inspeccionaron visualmente las capturas de inicio/categorías/catálogo y referencias del material. Se conserva negocio, logotipo y seis categorías; no se afirma implementar las 19 pantallas en esta etapa.

`public/images/rosita-logo.png`, `negocio-rosita.jpg` y `productos-rosita-atlas.jpg` reutilizan recursos del prototipo previo disponible en la sesión. La foto del local y el atlas son recursos aportados/preexistentes, no fotografías nuevas. El atlas representa 18 productos; se recorta por CSS manteniendo formato cuadrado. Seis productos usan un marcador visible «Fotografía pendiente», sin imágenes ajenas a su descripción. La atribución a este material no implica derechos de redistribución comercial.

Dirección y teléfono del pie provienen del informe; no se inventaron redes sociales, reseñas, reputación ni garantías. Nombres, presentaciones, precios y stock se identifican como datos de prueba.

## Tipografía

Dos fuentes variables latinas desde Google Fonts oficial: Manrope 600–800 y DM Sans 400–700. Archivos WOFF2 locales y licencias SIL Open Font License en `public/fonts`. `SOURCES.json` conserva URL exacta de cada recurso y licencia; no hay peticiones de fuentes externas en ejecución. Tamaño conjunto aproximado: 61 KB.

## Referencias comerciales y creativas

- Mercado Libre Perú: https://www.mercadolibre.com.pe/ devolvió 403 tanto al acceso web como al navegador local. No se afirma haber inspeccionado visualmente su sitio actual. Se siguieron los criterios expresos del usuario: búsqueda protagonista, categorías/filtros y comparación de precios, sin copiar marca, amarillo ni servicios.
- Daniel Spatzek: https://www.danielspatzek.com/home/ accesible; se inspeccionó en navegador. Se adaptó el uso de tipografía expresiva, fotografía y movimiento breve a un comercio con controles permanentes; no se copió su composición ni introducción.
- Framer demo-log no se modificó ni publicó. Esta etapa trabaja exclusivamente en el repositorio local.

Se leyó el sílabo HERRAMIENTASDEPROTOTIPADO_undefined.pdf (siete páginas; unidades en páginas 1–2 y cronograma 4–6). La evidencia del sílabo no se reinterpreta como autorización para crear autenticación real, pagos reales o backend. La relación académica se limita a los ejemplos realmente implementados, documentados en DESIGN-SYSTEM.md y VERIFICACION.md.

## Referencias técnicas consultadas en 0.3.0

No se añadieron fotos, fuentes, servicios ni bibliotecas. Las zonas/tarifas/tiempos de `src/data/delivery.ts` son inventados exclusivamente para demostración y no describen cobertura real.

- React useReducer: https://react.dev/reference/react/useReducer — reducer puro; fecha/UUID llegan en la acción, sin efectos dentro de la transacción.
- Web Crypto PBKDF2: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits y https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey — verificador local de contraseña ficticia. No se interpreta como seguridad de producción.
- Vite 8 build: https://vite.dev/config/build-options.html y Rolldown https://rolldown.rs/reference/OutputOptions.codeSplitting — grupo separado para Zod, evitando incrementar el límite de advertencia artificialmente. La separación se comprueba también en build local.
- Compatibilidad Node verificada directamente en package.json de Vite 8.3.5, ESLint 10.13.0, plugin React 6.1.2, typescript-eslint 8.72.1 y shadcn 4.23.0 instalados. No se mezclan instrucciones de Vite/Rollup antiguos.
