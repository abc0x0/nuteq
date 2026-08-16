# Mini SMAE v2

Aplicación web estática y local para consultar el SMAE v7 validado.

## Tecnología
- HTML
- CSS
- JavaScript
- JSON

No requiere compilación, instalación, framework, backend ni servidor de base de datos.

## Funciones v2
1. Buscar un alimento y mostrar su ficha.
2. Mostrar sustitutos del mismo `grupo_codigo`.
3. Explorar alimentos por grupo/subgrupo.
4. Comparar dos alimentos.
5. Calcular cantidades para un número de equivalentes.
6. Asistente de sustitución basado en reglas:
   - similar en energía;
   - menos energía;
   - más fibra;
   - menos sodio;
   - más proteína.
7. Mostrar avisos para valores estimados de la base v7.

## Ejecutar
Abra `index.html` directamente con un navegador moderno.

La aplicación incluye `data/smae-data.js` como respaldo para poder funcionar mediante `file://`.

Opcionalmente puede servirse localmente con:

```bash
python3 -m http.server 8000
```

y abrir:

```text
http://localhost:8000
```

## Regla de sustitución
Los sustitutos se obtienen del mismo `grupo_codigo`, de modo que se respetan subgrupos como cereales con/sin grasa, AOA por aporte de grasa y tipos de leche.

## Nota sobre equivalentes
La calculadora supone que la cantidad sugerida del registro equivale a 1 equivalente SMAE. Multiplica esa cantidad por el número de equivalentes solicitado.

## Valores estimados
Cuando `estado="estimado"`, la aplicación utiliza el valor operativo de la v7 y muestra una aclaración. El valor fuente permanece disponible en la ficha.

## Uso
Herramienta didáctica y de consulta. No sustituye valoración ni prescripción profesional.
