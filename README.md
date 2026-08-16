# Mini SMAE v3 — Didáctica

Aplicación web local y estática basada en el JSON SMAE v7 validado.

## Tecnología

- HTML
- CSS
- JavaScript
- JSON
- `localStorage` del navegador

No requiere compilación, instalación, backend, servidor de base de datos ni dependencias externas.

## Funciones heredadas de v2

- búsqueda de alimentos y ficha nutrimental;
- sustitutos del mismo `grupo_codigo`;
- exploración por grupos/subgrupos;
- comparación de dos alimentos;
- calculadora de equivalentes;
- asistente de sustitución basado en reglas.

## Novedades v3

### Favoritos e historial

Los favoritos y las últimas 20 consultas se guardan localmente con `localStorage`. No se envía información a ningún servidor.

### Asistente explicativo

El agente basado en reglas conserva los objetivos de v2 y añade una explicación del proceso: primero restringe la búsqueda al mismo grupo/subgrupo SMAE y después ordena los candidatos según el objetivo elegido.

### Modo estudiante

Genera automáticamente ejercicios a partir del JSON local:

- identificar un alimento del mismo grupo/subgrupo;
- elegir el alimento con mayor fibra entre varias opciones equivalentes;
- elegir la porción de menor energía dentro de un grupo.

Incluye retroalimentación y marcador de aciertos.

## Ejecución

Abra `index.html` directamente con un navegador moderno. El archivo `data/smae-data.js` permite funcionar también mediante `file://`.

Opcionalmente puede usar:

```bash
python3 -m http.server 8000
```

pero no es necesario.

## Nota

Herramienta didáctica y de consulta. No sustituye valoración ni prescripción profesional.
