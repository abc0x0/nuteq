# Instalación de Mini SMAE v4.1 como PWA en Android

## Importante

Una PWA instalable necesita abrirse desde un sitio servido por **HTTPS** (o desde `localhost` durante pruebas).
No puede instalarse como PWA directamente desde `file://`.

Esto no cambia la arquitectura de la aplicación:
- no necesita backend;
- no necesita base de datos;
- no necesita compilar;
- todos los datos del SMAE siguen siendo archivos estáticos.

## Opción recomendada

Publique la carpeta `mini-smae-v4.1-pwa` en un alojamiento estático HTTPS, por ejemplo:
- GitHub Pages;
- Cloudflare Pages;
- Netlify;
- cualquier servidor web con HTTPS.

Después, en Android:

1. Abra la URL con Chrome.
2. Espere a que la aplicación cargue por primera vez.
3. Abra el menú del navegador.
4. Seleccione **Instalar aplicación** o **Agregar a pantalla principal**.
5. Confirme **Mini SMAE**.
6. El icono aparecerá en la pantalla de inicio.

Después de la primera carga, el `service-worker.js` conserva en caché los archivos de la aplicación y la base SMAE para permitir funcionamiento sin conexión.

## Actualizaciones

Cuando se publique una nueva versión, cambie el valor de `CACHE_NAME` en `service-worker.js`.
Esto obliga al navegador a crear una nueva caché y retirar la anterior.

## Prueba local en computadora

Desde la carpeta:

```bash
python3 -m http.server 8000
```

Luego abra:

```text
http://localhost:8000
```

El uso de localhost permite registrar el service worker durante pruebas.

## Archivos PWA añadidos

- `manifest.webmanifest`
- `service-worker.js`
- `icons/icon-192.png`
- `icons/icon-512.png`
- `icons/apple-touch-icon.png`
- `INSTALAR-PWA-ANDROID.md`
