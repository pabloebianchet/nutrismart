# Tests E2E — Nui App

Tests automatizados con Playwright. Cubren los flujos principales de la app.

## Setup

```bash
cd tests
cp .env.test.example .env.test
# Completar .env.test con tus credenciales de prueba
npm install
```

## Correr todos los tests

```bash
npm test
```

## Correr un módulo específico

```bash
npm run test:auth       # Login y sesión
npm run test:notif      # Notificaciones
npm run test:training   # Plan de entrenamiento + sesión
npm run test:analysis   # Análisis de producto
npm run test:recipes    # Generación de recetas
npm run test:sub        # Suscripción y membresía
```

## Ver reporte HTML

```bash
npm run report
```

Abre un reporte interactivo con capturas de pantalla de cada paso,
videos de los tests fallidos y tiempos de ejecución.

## Qué cubre cada test

| Archivo | Flujos |
|---|---|
| 01-auth | Login OK, login fallido, cerrar sesión |
| 02-notifications | Toggle switches, pausar notificaciones |
| 03-training | Crear plan Hipertrofia/Gym, registrar sesión |
| 04-analysis | Subir imagen, ver resultado, historial |
| 05-recipes | Generar receta Fit, ver detalle, tab Guardadas |
| 06-subscription | Página pricing, modal checkout, Mi membresía |

## Imagen de prueba para análisis

Colocar en `specs/assets/test-product.jpg` una foto de cualquier
producto con etiqueta nutricional visible. Sin esta imagen el test
de análisis se saltea automáticamente.

## Notas

- Los tests corren en Chromium (desktop) y Mobile Safari (iPhone)
- En caso de fallo: capturas + video guardados en `test-results/`
- Los tests con GPT pueden tardar hasta 45 segundos
- No correr en paralelo para evitar múltiples planes de prueba
