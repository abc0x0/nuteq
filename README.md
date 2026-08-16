# Mini SMAE

Mini aplicación web estática para consultar un alimento del Sistema Mexicano de Alimentos Equivalentes (SMAE) y mostrar posibles sustitutos del mismo grupo o subgrupo.

## Funciones

- Búsqueda local por nombre de alimento.
- Sugerencias automáticas mientras se escribe.
- Ficha nutrimental.
- Lista de sustitutos del mismo `grupo_codigo`.
- Identificación visual de valores estimados de la base v7.
- Consulta de fuente, página y estado de validación.
- Sin servidor de base de datos.
- Sin compilación.
- Sin dependencias externas.

## Cómo ejecutar

### Opción 1: abrir directamente

Abra `index.html` con un navegador moderno.

La aplicación incluye `data/smae-data.js`, una copia de los datos necesarios empaquetada como JavaScript, para evitar las restricciones `file://` que algunos navegadores aplican al leer JSON mediante `fetch()`.

### Opción 2: servidor web local sencillo

Desde esta carpeta:

```bash
python3 -m http.server 8000
```

Después abra:

```text
http://localhost:8000
```

Cuando se ejecuta mediante HTTP, la aplicación intenta leer directamente:

`data/SMAE-4ed-normalizado-validado-v7.json`

## Archivos

- `index.html` — interfaz.
- `style.css` — estilos responsivos.
- `app.js` — búsqueda, ficha y sustituciones.
- `data/SMAE-4ed-normalizado-validado-v7.json` — base de datos validada v7.
- `data/smae-data.js` — respaldo para ejecución directa sin servidor.
- `README.md` — instrucciones.

## Regla de sustitución

Se consideran candidatos de sustitución los alimentos con el mismo `grupo_codigo` que el alimento consultado. Esto respeta los subgrupos normalizados del SMAE, por ejemplo:

- `cereales_sin_grasa`
- `cereales_con_grasa`
- `aoa_muy_bajo`
- `aoa_bajo`
- `aoa_moderado`
- `aoa_alto`
- `leche_descremada`
- `leche_semidescremada`
- `leche_entera`
- `leche_con_azucar`

Los candidatos se ordenan primero por cercanía de energía respecto al alimento seleccionado y después se muestran de forma interactiva.

## Valores estimados

Cuando un nutrimento tiene `estado: "estimado"`, la aplicación utiliza el valor operativo de la v7 y muestra un aviso. El usuario puede desplegar el detalle para consultar:

- valor original;
- valor estimado;
- intervalo;
- método;
- motivo.

## Nota

Esta aplicación es una demostración didáctica y de consulta del SMAE. No sustituye la valoración ni la prescripción de un profesional de nutrición.
