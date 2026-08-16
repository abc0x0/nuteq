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


## Mini SMAE v4.1 PWA

Esta distribución agrega soporte PWA sin modificar la base tecnológica.

Se añadieron:
- `manifest.webmanifest`;
- `service-worker.js`;
- iconos 192x192 y 512x512;
- `apple-touch-icon.png`;
- instrucciones de instalación en Android.

Para que Android ofrezca la instalación como PWA, la carpeta debe publicarse mediante HTTPS.
Una vez instalada y cargada inicialmente, puede funcionar sin conexión gracias al service worker.


## Mini SMAE v5

La versión 5 incorpora la **Tabla base personalizada** a partir de la tabla de aporte nutrimental promedio proporcionada para el proyecto.

Reglas implementadas:
- cantidades siempre enteras;
- límites mínimos y máximos editables por grupo/subgrupo;
- perfil General editable (sexo, edad, energía objetivo y distribución secundaria de macronutrimentos);
- optimización jerárquica: primero cercanía energética, después cercanía a los objetivos de macronutrimentos y finalmente menor número de equivalentes;
- hasta cuatro alternativas de solución;
- iconografía por grupos y nuevo ícono de intercambio manzana ↔ pera;
- base de alimentos: JSON validado de la 4.ª edición, v7.


## Mini SMAE v5.1

Cambios respecto a v5:

- «Optimizar automáticamente» aplica de inmediato la alternativa «Más cercana».
- Las demás alternativas continúan disponibles y pueden aplicarse manualmente.
- Las filas cuyas cantidades cambian reciben una animación temporal para confirmar visualmente la actualización.
- La columna «Cantidad» se resalta permanentemente en azul claro para facilitar su lectura.


## Mini SMAE v5.2

Cambios principales:

- El perfil objetivo usa unidades absolutas: kcal, g de proteína, g de lípidos, g de hidratos y conteo de hidratos.
- Los objetivos ya no necesitan sumar 100%.
- El renglón «IDEAL (Objetivo)» muestra todos los valores del perfil.
- El renglón «DIFERENCIA» muestra la diferencia de cada variable y colorea según el margen ±10%.
- El resumen actual hace más visible la energía objetivo.
- La optimización se ordena exclusivamente por cercanía relativa al perfil completo.
- Un resultado se considera bueno cuando todas las referencias quedan dentro de ±10%.
- La mejor alternativa se aplica automáticamente y se conservan hasta tres alternativas adicionales.


## Mini SMAE v5.3

Cambios en «Tabla base»:

- Los perfiles editados se guardan localmente y pueden recuperarse desde una lista compacta de una sola línea por perfil.
- «Referencias del perfil» aparece inmediatamente después de «Perfil objetivo».
- En «Resumen actual», los valores fuera del margen ±10% se resaltan en rojo.
- Se eliminaron de la vista las columnas Mínimo y Máximo.
- Las cantidades se inicializan y reinician en 0.
- Al optimizar se muestra «Procesando...» y un indicador animado antes de presentar las alternativas.
- La tabla se hizo más compacta para mejorar la visualización en teléfono vertical.


## Mini SMAE v5.4

Cambios en perfiles:

- «Perfiles guardados» abre una ventana independiente.
- Los perfiles se muestran verticalmente y en formato compacto, por ejemplo:
  `General_M_32a_1500kcal_P186.7_L40_HC350_CH12.2`.
- Al seleccionar un perfil se aplica inmediatamente como perfil objetivo.
- En «Editar perfil», Sexo sólo permite «Hombre» o «Mujer».
