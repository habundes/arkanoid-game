# SPEC 01 — MVP Arkanoid

> **Estado:** Draft
> **Depende de:** —
> **Fecha:** 2026-07-03
> **Objetivo:** Crear un juego Arkanoid jugable en el navegador con un nivel, paddle controlable por ratón y teclado, 3 vidas, puntuación en pantalla y pantallas de Game Over y Victoria.

## Scope

**In:**

- Canvas 2D con sprites del spritesheet existente (`assets/spritesheet-breakout.png`).
- Paddle controlable con ratón (posición X) y teclado (flechas izquierda/derecha).
- Bola con física de rebote (paredes, techo, paddle, bloques). Velocidad constante.
- Grid de bloques 10 × 6, una fila por color (red, cyan, green, magenta, yellow, hotpink, gray × 2 filas reutilizadas).
- 3 vidas. Al perder una vida la bola se resetea; al perder las 3, pantalla Game Over con botón de reinicio.
- Pantalla de Victoria al romper todos los bloques, con botón de reinicio.
- Puntuación visible en pantalla durante el juego (no persiste entre sesiones).
- Pausa con tecla Esc o P.
- Archivos: `index.html`, `style.css`, `game.js` (+ `assets/spritesheet.js` ya existente).

**Fuera de scope (para specs futuros):**

- Sonidos (`ball-bounce.mp3`, `break-sound.mp3`).
- Animaciones de explosión al romper bloques.
- Múltiples niveles.
- Velocidad variable de la bola.
- Persistencia de puntuación (localStorage / high scores).
- Powerups.
- Controles táctiles (móvil).
- Editor de niveles.

## Data model

```js
// Estado global del juego
const state = {
  phase: 'playing', // 'playing' | 'paused' | 'gameover' | 'win'
  lives: 3,
  score: 0,
};

// Paddle
const paddle = {
  x: 0,       // centro horizontal
  y: 0,       // posición vertical fija
  width: 162, // ancho del sprite
  height: 14, // alto del sprite
  speed: 6,   // px/frame (teclado)
};

// Bola
const ball = {
  x: 0,
  y: 0,
  radius: 8,
  vx: 4,  // px/frame
  vy: -4, // px/frame (negativo = hacia arriba)
};

// Bloque individual
// { x, y, width: 64, height: 32, color: string, alive: boolean }

// Array de bloques (60 en total: 10 cols × 6 filas)
const blocks = []; // Block[]
```

Convenciones:
- Origen de coordenadas: esquina superior izquierda del canvas.
- Velocidades en píxeles por frame (requestAnimationFrame, ~60 fps).
- Los bloques se escalan al doble del sprite original (32×16 → 64×32) para mejor visibilidad.

## Plan de implementación

1. Crear `index.html`: canvas centrado en pantalla, enlaza `assets/spritesheet.js`
   y `game.js`, incluye `style.css`. Verificación: página abre sin errores en consola.

2. Crear `style.css`: fondo negro, canvas centrado, cursor oculto sobre el canvas.
   Verificación: canvas visible y centrado al abrir `index.html`.

3. Crear `game.js` — esqueleto: inicializa canvas/ctx, llama `loadSpritesheet`,
   arranca el loop con `requestAnimationFrame`. Verificación: consola sin errores,
   loop corriendo.

4. Implementar paddle: dibuja el sprite, responde al movimiento del ratón y a
   flechas izquierda/derecha. Verificación: paddle se mueve con ambos controles
   sin salirse del canvas.

5. Implementar bola: dibuja el sprite, rebota en paredes y techo, detecta colisión
   con paddle (rebote) y suelo (pierde vida → resetea bola; si `lives === 0`,
   `phase = 'gameover'`). Verificación: bola rebota correctamente y la vida se
   descuenta al caer.

6. Generar el grid de bloques (10 × 6) con los colores definidos. Dibujar bloques
   vivos con `drawSprite`. Verificación: 60 bloques visibles en pantalla.

7. Detectar colisión bola–bloque: marcar bloque como `alive = false`, sumar puntos
   (10 por bloque). Si todos los bloques están muertos, `phase = 'win'`.
   Verificación: bloques desaparecen al tocarse, score sube.

8. Implementar pausa: tecla Esc/P alterna entre `'playing'` y `'paused'`; el loop
   detiene la lógica pero sigue dibujando un overlay "PAUSA". Verificación: juego
   se pausa y reanuda correctamente.

9. Implementar HUD: mostrar `score` y `lives` en canvas. Verificación: score y
   vidas actualizados en tiempo real.

10. Implementar pantalla Game Over: overlay con texto "GAME OVER", score final y
    botón "Reiniciar" que resetea el estado completo. Verificación: aparece al
    perder las 3 vidas, el botón reinicia el juego.

11. Implementar pantalla de Victoria: overlay con texto "¡GANASTE!", score final y
    botón "Reiniciar". Verificación: aparece al romper el último bloque.

## Criterios de aceptación

- [ ] `index.html` abre en el navegador sin errores en consola.
- [ ] El spritesheet carga y los sprites de paddle, bola y bloques son visibles.
- [ ] El paddle se mueve con el ratón (seguimiento de posición X).
- [ ] El paddle se mueve con flechas izquierda/derecha sin salirse del canvas.
- [ ] La bola rebota en la pared izquierda, derecha y techo.
- [ ] La bola rebota al golpear el paddle.
- [ ] Al caer la bola por el suelo se descuenta una vida y la bola se resetea.
- [ ] Con 0 vidas aparece la pantalla de Game Over con el score final.
- [ ] El botón "Reiniciar" en Game Over reinicia el juego completamente.
- [ ] Los 60 bloques (10 × 6) se muestran con los colores correctos.
- [ ] Al golpear un bloque desaparece y el score sube 10 puntos.
- [ ] Al romper el último bloque aparece la pantalla de Victoria con el score final.
- [ ] El botón "Reiniciar" en Victoria reinicia el juego completamente.
- [ ] Tecla Esc o P pausa el juego mostrando un overlay "PAUSA".
- [ ] Volviendo a pulsar Esc o P reanuda el juego desde donde estaba.
- [ ] El HUD muestra el score y las vidas actualizados en tiempo real.

## Decisiones

- **Sí:** Un único nivel para el MVP. Niveles adicionales en spec futuro.
- **Sí:** Controles por ratón y teclado (flechas). Ambos activos simultáneamente.
- **Sí:** 3 vidas con pantalla Game Over y botón de reinicio explícito.
- **Sí:** Puntuación en pantalla, sin persistencia entre sesiones.
- **Sí:** Archivos separados (`index.html`, `style.css`, `game.js`). Más mantenible que todo inline.
- **Sí:** Grid 10 × 6, bloques escalados a 64 × 32 px (doble del sprite original) para mejor visibilidad.
- **Sí:** Velocidad de bola constante. Velocidad variable queda para otro spec.
- **Sí:** Pausa con Esc/P. Vale la pena incluso en MVP.
- **No:** Sonidos. Descartados para simplificar el MVP.
- **No:** Animaciones de explosión. Descartadas para simplificar el MVP.
- **No:** Persistencia de score (localStorage). Fuera de scope del MVP.
- **No:** Controles táctiles. Para un spec futuro si se quiere soporte móvil.

## Qué **no** está en este spec

- Sonidos y animaciones de explosión.
- Múltiples niveles o velocidad variable.
- Persistencia de puntuación.
- Powerups, controles táctiles, editor de niveles.
