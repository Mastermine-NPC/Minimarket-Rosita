# Recuperación local

`antes-inicio-0.5.0.zip` conserva la aplicación 0.4.0 antes de esta etapa. `inicio-0.5.0.zip` conserva el resultado final. SHA256SUMS permite comprobar integridad. También se mantienen snapshots anteriores.

Extrae la versión deseada en una carpeta separada; evita sobrescribir trabajo posterior. No incluyen node_modules, dist, .git ni otros snapshots. Usa Node 20.19.4, npm 11.21.1, instala con `npx --yes npm@11.21.1 ci` y ejecuta `npm run check` y `npm run dev`. No contiene datos del localStorage de tu navegador ni sustituye una exportación de esos datos.


## Zoom 0.5.1

`antes-zoom-0.5.1.zip` conserva src, public y configuraciones/README previos a esta etapa. Los informes anteriores también se conservan en docs/history y en la copia completa inicio-0.5.0.zip. `zoom-0.5.1.zip` incluye código, assets, configuración y documentación/pruebas del visor final, sin node_modules, dist ni otros ZIP. Extrae en una carpeta nueva y usa Node 20.19.4, npm 11.21.1. No restablece el localStorage del navegador.


## Subcategorías 0.6.0

`antes-subcategorias-0.6.0.zip` conserva src/public/scripts y configuraciones/README anteriores. `subcategorias-0.6.0.zip` contiene el resultado, documentación y evidencia de la etapa; sin node_modules, dist ni otros snapshots. Usa Node 20.19.4 y npm 11.21.1, npm ci y npm run check. Los ZIP no contienen el localStorage personal: las migraciones se ejecutan en el navegador al abrir la aplicación. No mezcles una aplicación anterior a v5 con datos ya migrados; conserva el almacenamiento si vas a inspeccionar una copia histórica.
