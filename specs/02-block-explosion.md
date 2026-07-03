# SPEC 02 — Destrucción de bloques con animación y sonido

> **Estado:** Implemented
> **Depende de:** 01-mvp-arkanoid
> **Fecha:** 2026-07-03
> **Objetivo:** Al destruir un bloque, reproducir el sonido break-sound.mp3 y mostrar una animación de explosión de 4 frames en su posición, sin bloquear la lógica del juego.

## Scope

**In:**

- Reproducir `assets/sounds/break-sound.mp3` en cada destrucción de bloque.
- Mostrar animación de explosión de 4 frames (usando `EXPLOSION_FRAMES[color][i]` y `drawFrame`) en la posición del bloque destruido.
- Duración total de la animación: `EXPLOSION_DURATION = 150` ms (ya definida en `assets/spritesheet.js`).
- La explosión es un overlay independiente: el bloque pasa a `alive = false` al impacto (deja de colisionar y de dibujarse), la animación corre sobre el canvas sin afectar la lógica.
- La pantalla de victoria se dispara al impacto (cuando `alive = false`), no al terminar la animación.

**Fuera de scope:**

- Sonido de rebote de bola (`ball-bounce.mp3`).
- Animaciones de ningún otro evento (vida perdida, victoria, etc.).
- Refactor del sistema de bloques en `game.js`.
- Efectos de partículas o shockwave adicionales.

## Data model

No se introducen nuevas estructuras persistentes. Se añade un array temporal de explosiones activas:

```js
// Explosión activa (creada al destruir un bloque, eliminada al terminar)
// { x, y, color: string, startTime: number, frame: number }
const explosions = []; // Explosion[]
```

- `x`, `y`: posición del bloque destruido (esquina superior izquierda).
- `color`: color del bloque (para seleccionar `EXPLOSION_FRAMES[color]`).
- `startTime`: timestamp en ms (`performance.now()`) del momento del impacto.
- `frame`: índice actual de la animación (0–3), calculado en cada frame del loop.
- El array vive en memoria durante la sesión; se vacía al reiniciar el juego.

El audio se maneja con un objeto `Audio` reutilizable:

```js
const breakSound = new Audio('assets/sounds/break-sound.mp3');
```

## Plan de implementación

1. **Inicializar audio.** En `game.js`, declarar `const breakSound = new Audio('assets/sounds/break-sound.mp3')`.
   Verificación: sin errores en consola al cargar la página.

2. **Inicializar array de explosiones.** Declarar `const explosions = []` junto al resto del estado global.
   Verificación: variable accesible desde el loop.

3. **Disparar explosión al destruir un bloque.** En el punto donde el bloque pasa a `alive = false`,
   añadir: `explosions.push({ x: block.x, y: block.y, color: block.color, startTime: performance.now(), frame: 0 })`.
   Reproducir sonido: `breakSound.currentTime = 0; breakSound.play()`.
   Verificación: al romper un bloque se empuja una entrada en `explosions` y el sonido suena.

4. **Actualizar explosiones en el loop.** En la función de update, iterar `explosions`:
   calcular `frame = Math.floor((now - startTime) / (EXPLOSION_DURATION / 4))`;
   eliminar entradas donde `frame >= 4`.
   Verificación: las entradas desaparecen del array tras ~150 ms.

5. **Dibujar explosiones en el loop.** En la función de draw, después de dibujar bloques,
   iterar `explosions` y llamar `drawFrame(ctx, EXPLOSION_FRAMES[e.color][e.frame], e.x, e.y, 64, 32)`.
   Verificación: animación de 4 frames visible en la posición del bloque destruido.

6. **Limpiar explosiones al reiniciar.** En la función de reset del juego, vaciar el array: `explosions.length = 0`.
   Verificación: al reiniciar no quedan explosiones residuales.

## Criterios de aceptación

- [x] Al romper un bloque suena `break-sound.mp3` inmediatamente.
- [x] Si varios bloques se rompen casi al mismo tiempo, el sonido suena en cada uno.
- [x] Al romper un bloque aparece una animación de 4 frames en su posición.
- [x] La animación usa el color del bloque destruido (`EXPLOSION_FRAMES[color]`).
- [x] La animación dura ~150 ms y desaparece sola al terminar.
- [x] El bloque destruido deja de ser visible y de colisionar desde el momento del impacto.
- [x] La pantalla de victoria aparece al impacto del último bloque, no al terminar su explosión.
- [x] Al reiniciar el juego no quedan explosiones residuales en pantalla.
- [x] El resto de la lógica del juego (paddle, bola, vidas, score, pausa) no se ve afectada.

## Decisiones

- **Sí:** Sonido incluido en esta spec. Ambas funcionalidades (animación + sonido) son parte del mismo evento de destrucción.
- **Sí:** Destrucción inmediata (opción a). El bloque muere al impacto; la explosión es overlay independiente. Evita complejidad de estado "muriendo".
- **Sí:** Victoria al impacto, no al fin de la animación. Consistente con la lógica actual del spec 01.
- **Sí:** `Audio` reutilizable con `currentTime = 0` para permitir sonidos solapados rápidos.
- **No:** Refactor de `game.js`. Solo se añade lo mínimo encima de lo existente.
- **No:** Sonido de rebote (`ball-bounce.mp3`). Queda para spec futuro.
