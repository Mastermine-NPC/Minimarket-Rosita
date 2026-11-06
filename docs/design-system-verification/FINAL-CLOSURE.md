# Cierre de verificación — 5 de noviembre de 2026

Se corrigió el único pendiente de arranque: `npm run dev` ejecutaba solo Vite. Ahora `scripts/dev.mjs` inicia Vite y el servicio visual, carga `.env` sin publicar secretos, ajusta el origen permitido al puerto real, conecta el proxy y coordina el cierre de ambos procesos. Si 5173 está ocupado, Vite elige el siguiente puerto; un `--port` explícito se respeta de forma estricta.

Verificación final realizada mediante `npm run dev`: frontend `http://localhost:5174` (5173 ocupado), backend 4191. Chrome comprobó Home, catálogo, acceso administrador, editor, propuesta aislada, publicación a través del proxy, visitante independiente y restauración. La configuración temporal quedó restaurada a sus valores originales. Sin errores de ejecución detectados. Resultado en `dev-final.json` y captura `screenshots/dev-final-5174.png`.

Se aprovecharon las comprobaciones anteriores, sin volver a ejecutar indiscriminadamente la suite: 39 rutas/estados, escritorio/tablet/móvil, persistencia tras reiniciar, permisos y CSRF en backend, inventario/carrito/pedidos intactos, Home con video reproduciéndose y cuatro GLB en estado ready con giro funcional. `npm run check`, `npm test`, `npm run test:design` y ESLint del script de arranque pasaron. El build conserva el aviso informativo sobre bundles grandes; no bloquea la compilación. Inspector: 0 fallos, con advertencias justificadas en `critique.md`.

Los procesos, archivos y credenciales de prueba son temporales y se han cerrado/eliminado. No se ha desplegado la aplicación. Para uso normal, `npm run dev` lee `.env`; configurar una credencial privada `ROSITA_DESIGN_ADMIN_PASSWORD` de al menos 16 caracteres habilita publicar. Sin credencial, los dos servicios arrancan y la configuración visual permanece en modo de solo lectura. Las cuentas comerciales siguen siendo una demostración local y no se presentan como autenticación de servidor.

No se añadieron otras funcionalidades ni se realizaron refactorizaciones durante el cierre.
