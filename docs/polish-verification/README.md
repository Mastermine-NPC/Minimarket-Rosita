# Evidencia del pulido 0.8.0

Chromium 156.0.8078.4/Playwright externo, contextos aislados; no cuentas u operaciones reales. Las capturas de tarjeta se toman tras borrar los campos/en confirmación. No trazas/HAR, registros financieros o PAN capturados. Los fixtures están documentados deliberadamente para la exposición.

| Script/registro                                            | Cobertura                                                                                                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| legacy-core.mjs / legacy-core.json                         | Utilidades previas adaptadas a esquema 7: migraciones, conservación, permisos, taxonomía y cálculos                                                                |
| card-core.mjs / card-core.json                             | Datos inválidos, tarjeta ligada a compra, rechazo de confirmación ajena/cambiada, idempotencia, stock y formato 7/v6                                               |
| tarjeta-ui.mjs / tarjeta-ui.json                           | Aprobación/rechazo/error, validación/foco, importe cambiado, campos en memoria, salida/cancelación y pedido único a 1440/768/390                                   |
| publico.mjs / publico.json                                 | Menú/FAQ/contacto/perfil/teclado/reducedmotion, regresión existente a 3 anchos                                                                                     |
| cliente.mjs / regresion-cliente/flujo.json                 | Registro/compra con efectivo, validación, vuelto, doble clic, historial/seguimiento/aislamiento a 3 anchos                                                         |
| video-ui.mjs / video-ui.json                               | Reproducción real, pausa, intersección/visibilitychange, carga voluntaria, posters/fallo/autoplay/reducedmotion, footer/enlaces y público a 1440/1200/1024/768/390 |
| administracion-contacto.mjs / administracion-contacto.json | Seis secciones, estados/umbral/desactivación, modales largos y foco a 1440/1024/768/600/390; contacto legítimo/espacios/doble envío                                |
| adicionales.mjs / adicionales.json                         | Transformación real del hero, jerarquía/min1, carrito modificado/restaurado durante revisión y espaciado final                                                     |
| foto-dimensiones.json                                      | Atributos 1024×598 iguales a recurso natural; comprobación focalizada después de corregir reserva                                                                  |
| check.log                                                  | Tipos, ESLint,26 contrastes y compilación final                                                                                                                    |

Videos/fotogramas/tamaños: `../video-inspection.json`. Los mosaicos de inspección fueron temporales en `/tmp`; los posters reales y derivados web están en public/images/video/web. Capturas muestran interfaces ejecutadas, no reemplazos estáticos del producto.

## Reproducir solo con motivo o código relacionado modificado

Node 20.19.4, npm 11.21.1; dependencias de app sin actualizar. Desde el proyecto, `npm run check`; luego `npm run preview -- --host 127.0.0.1`. Esta sesión utilizó 4174 porque 4173 estaba ocupado. No reconstruir dist con pruebas activas.

```bash
export PLAYWRIGHT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/index.mjs
export PLAYWRIGHT_EXPECT_MODULE=/tmp/rosita-admin-tests/node_modules/playwright/test.mjs
export PLAYWRIGHT_BROWSERS_PATH=/tmp/rosita-admin-tests/browsers
export BASE_URL=http://127.0.0.1:4174
node docs/polish-verification/card-core.mjs
```

Los scripts UI se ejecutan individualmente con node; algunos usan el puerto4174 fijo de esta verificación, revisar base antes de reproducir. Herramientas de prueba no forman parte de dependencias frontend y podrían desaparecer al limpiar /tmp. Core utiliza ViteSSR sin servidor UI; legacy-core necesita la fixture v4 conservada en docs/subcategory-verification.

La primera tentativa de selector del error de tarjeta omitía⚠; se ajustó el harness. Durante desarrollo se corrigió manejo de refs/handler detectado por ESLint. No se reportan esos ajustes como fallos actuales de compra. Las baterías aprobadas no se repitieron sin cambio relacionado.

Límites: móvil y visibilidad simulados, no dispositivos/otros motores/lectores de pantalla. Sin pruebas de usuarios/A-B ni medición de CoreWebVitals. Ver informe para decisiones de contenido del clip secundario y limitaciones locales.
