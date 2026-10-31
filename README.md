# Portfolio

Sitio estático de Matías Cipriano. HTML, CSS y JavaScript, sin framework y sin paso de build. Se puede abrir `index.html` directo en el navegador.

## Editar el contenido

El texto está en `index.html`.

La antigüedad en PagoTIC se calcula sola en `script.js`, desde la fecha del atributo `data-desde` en `#antiguedad` (`2022-07-04`). El texto que está dentro de ese elemento es el respaldo por si JavaScript no corre: si cambiás la fecha de inicio, actualizá también ese texto.

La tarjeta de AWS GEN AI está en la sección de certificaciones de `index.html`. Falta la imagen del badge y el enlace de verificación: no inventes fecha, ID ni URL.

1. Guardá la imagen en `assets/` (por ejemplo `assets/aws-gen-ai.png`).
2. Reemplazá el recuadro `.tarjeta-imagen` por `<img src="assets/aws-gen-ai.png" alt="Badge AWS GEN AI">`.
3. Reemplazá el párrafo `.tarjeta-verificacion` por `<a href="URL">verificar</a>`, con el enlace real.

Para sumar otra certificación, duplicá ese `<li>`.

El pie (rock, la línea del alambre y el cierre) está al final de `index.html`. Colores y tipografía, en `styles.css`.

## GitHub Pages

En el repositorio: Settings > Pages > Deploy from a branch > main / root.

`.nojekyll` está para que Pages publique los archivos como están, sin pasarlos por Jekyll. Después del merge a `main`, el sitio queda en `https://barduek.github.io/portfolio/`.
