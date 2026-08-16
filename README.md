# Mini SMAE v4 — Comidas y trazabilidad

Aplicación web estática y local basada en el JSON validado SMAE v7.

## Tecnología
- HTML
- CSS
- JavaScript
- JSON
- localStorage del navegador

No requiere compilación, paquetes, backend, servidor de base de datos ni conexión a Internet.

## Novedades de la v4

### 1. Mi comida
Permite:
- agregar alimentos por número de equivalentes;
- modificar equivalentes;
- calcular totales de energía, proteína, lípidos, hidratos de carbono, fibra y sodio;
- ver distribución de equivalentes por grupo/subgrupo;
- identificar el alimento con mayor aporte de proteína y sodio.

### 2. Sustitución dentro de la comida
Cada alimento puede sustituirse por otro del mismo `grupo_codigo`.
La sustitución conserva el número de equivalentes y registra:
- alimento anterior;
- alimento nuevo;
- grupo;
- cambio de energía;
- cambio de sodio.

### 3. Guardar comidas
Las comidas pueden guardarse y cargarse mediante `localStorage`.
No se envían datos a Internet.

### 4. Reto didáctico de sustitución
Permite tomar una comida como punto inicial y tratar de reducir el sodio sin modificar los equivalentes de cada grupo. La aplicación evalúa el resultado.

### 5. Correcciones y validación
El botón global `ⓘ Correcciones y validación` abre un panel cuyo resumen comienza con:

**Base de Datos SMAE 4d, v7**

El panel se genera a partir de la información contenida en el propio JSON y muestra:
- correcciones confirmadas;
- normalizaciones del selenio;
- valores estimados;
- advertencias activas;
- metodología de validación.

La información no está codificada como una lista fija: JavaScript recorre los objetos `correccion`, `estado`, y `validacion_semantica` del JSON.

## Ejecutar
Descomprima el ZIP y abra:

`index.html`

La aplicación incluye `data/smae-data.js`, por lo que funciona también mediante `file://`.

Opcionalmente puede utilizar:

```bash
python3 -m http.server 8000
```

## Archivos
- `index.html`
- `style.css`
- `app.js`
- `v3.js`
- `v4.js`
- `README.md`
- `data/SMAE-4ed-normalizado-validado-v7.json`
- `data/smae-data.js`

## Nota
Herramienta didáctica y de consulta. No sustituye valoración ni prescripción profesional.
