# Revisión visual final

## Dirección y referencias

Se abrieron las tres capturas del usuario y se registró el antes propio. El material real de Rosita —video de compra, poster, logotipo, Manrope, DM Sans, verde y rosa— determina la composición. No se descargaron fotografías ni se generaron sustitutos del material audiovisual.

El sorteo de la skill produjo «The contact sheet», semilla 502717870. Su mosaico de múltiples marcos contradice la petición explícita de una película principal y formularios Full Screen; no se aplicó ese patrón ni se añadieron sus bloques de marketing. La composición sigue las referencias y la prioridad del usuario: una película a escala de pantalla, una superficie de formulario integrada y una versión móvil con jerarquía propia. No se cambió la identidad de Rosita para seguir el sorteo.

## Revisión de capturas y mejoras

- En cinco segundos: Home abre con Coca-Cola y una acción de catálogo; acceso presenta correo, contraseña y acción primaria directamente.
- Jerarquía: un título dominante sobre la película y otro en el formulario. El video ocupa el área visual principal, no una tarjeta.
- Identidad: logotipo original, dos fuentes existentes, verde para la acción y rosa conservado en Home. No se añadieron motivos ajenos.
- Encuadre: cover mantiene la proporción original. En móvil el fondo del acceso se reencuadra en una cabecera, sin estrechar el formulario a una columna de escritorio reducida.
- Espaciado: se detectó y eliminó la reserva superior antigua de 44 px solo en las rutas intervenidas. Se retiró la onda extendida del primer borde en móvil para que el video llegue al extremo superior.
- Legibilidad: se reemplazó la tarjeta sobre un fondo por una superficie de formulario opaca, campos de 52 px y textos de ayuda separados. El overlay se limita al video.
- Sustancia: los accesos de demostración siguen completos y plegables; las acciones de mostrar contraseña, registro y login funcionan. No hay botones sin destino ni recuperación ficticia.
- Continuidad: cambiar login/registro conserva el nodo audiovisual y anima solo la superficie del formulario. Movimiento reducido elimina esa entrada.
- Responsive: se revisaron escritorio 1440, tablet 768 y móvil 390/320. Sin overflow de documento. Registro y formularios extensos se recorren mediante scroll nativo.
- Home: se mantuvo la secuencia de cinco escenas. Las capturas por escena y el estado de navegación verifican que el pin no deja un tramo blanco durante el recorrido real. Una captura full-page del pin no representa ese comportamiento porque reúne en una sola imagen sus posiciones de scroll.

## Inspector y excepciones documentadas

Inspector de la URL real `/login` a 1440, 768 y 390: **0 FAIL, 2 WARN** con excepciones explícitas:

- `gradient`: scrims de contraste sobre el video, solicitados por el usuario; no son degradados decorativos sobre formularios o botones.
- `covered-text`: el inspector identifica «Rosita.» de la cortina general, intencionadamente recortada y aria-hidden, como texto cubierto. Esa cortina compartida no forma parte del login visible. No se cambió ni ocultó código para pasar la prueba; se documentó la falsa detección y se revisaron las capturas reales.

Advertencias conservadas:

- Tamaño de h1 de 58 px en escritorio: responde a la petición explícita de tipografía de alto impacto; baja a 42/34 px en tablet/móvil.
- Tono crema: procede de la identidad y superficies compartidas existentes. No se alteró el footer para corregir una preferencia de paleta de la skill.

Lint de los archivos nuevos de acceso: **0 FAIL, 1 WARN**. La coincidencia de sombra corresponde únicamente al halo de foco de la entrada, no a una sombra de tarjeta en reposo. Las dos líneas de scrim tienen anotación de excepción justificada.

Se abrieron las seis imágenes finales del inspector y las capturas del recorrido funcional. El recorrido termina sin excepciones de página. No se atribuyen estos resultados técnicos a una prueba de usabilidad con personas.

## Valoración interna

Diseño 7.6, usabilidad 8, creatividad 6.8, contenido 8. Ponderación 40/30/20/10: **7.6/10**. Es una autoevaluación cualitativa, no un premio ni una medición de participantes. La principal limitación pendiente es comprobar el teclado virtual y los encuadres de video en dispositivos físicos. La composición utiliza un patrón conocido con la identidad y los recursos propios de Rosita.
