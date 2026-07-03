# SPEC 03 — Sonido de rebote de la bola

> **Estado:** Implemented
> **Depende de:** 01-mvp-arkanoid, 02-block-explosion
> **Fecha:** 2026-07-03
> **Objetivo:** Reproducir `ball-bounce.mp3` cada vez que la bola rebota en pared, techo o paddle, pero nunca cuando el impacto destruye un bloque.

## Scope

**In:**

- Reproducir `assets/sounds/ball-bounce.mp3` en cada rebote de pared izquierda/derecha.
- Reproducir el sonido en cada rebote de techo.
- Reproducir el sonido en cada rebote del paddle.
- Objeto `Audio` reutilizable (`bounceSound`) con `currentTime = 0` antes de `play()`, igual patrón que `breakSound`.
- Se apoya en el desbloqueo de audio por autoplay ya existente (`unlockAudio`).

**Fuera de scope (para specs futuras):**

- Sonido/rebote contra bloques (la destrucción ya suena con `break-sound.mp3` de la spec 02).
- Distintos sonidos según el tipo de superficie (pared vs paddle suenan igual).
- Control de volumen, mute o mezcla de audio.
- Sonidos de otros eventos (vida perdida, victoria, game over).

## Data model

No se introducen nuevas estructuras de estado. Solo se añade un objeto `Audio` reutilizable, siguiendo el patrón de `breakSound` de la spec 02:

```js
const bounceSound = new Audio('assets/sounds/ball-bounce.mp3');
```

Dentro de `updateBall` se usa una bandera local por frame para respetar la prioridad del sonido de destrucción sobre el de rebote:

```js
let bouncedThisFrame = false; // se pone true en cada rebote pared/techo/paddle
```

- El rebote solo suena si al final del frame no se destruyó ningún bloque.
- La destrucción de bloque (spec 02) tiene prioridad: si ocurre, se omite el sonido de rebote de ese frame.

## Plan de implementación

1. **Inicializar audio.** En `game.js`, junto a `breakSound`, declarar:
   `const bounceSound = new Audio('assets/sounds/ball-bounce.mp3');`
   Verificación: sin errores en consola al cargar la página.

2. **Contar rebotes en `updateBall`.** Al inicio de `updateBall`, declarar `let bounces = 0`. Incrementar `bounces++` en cada uno de los tres puntos de rebote existentes: pared izquierda, pared derecha, techo y paddle. Devolver el conteo: `return bounces;`
   Verificación: `updateBall` devuelve el número de rebotes del frame.

3. **Señalizar destrucción en `updateBlocks`.** Hacer que `updateBlocks` devuelva `true` si en ese frame se destruyó un bloque (el `break` del bucle), `false` si no.
   Verificación: `updateBlocks` devuelve `true` solo en frames con destrucción.

4. **Decidir el sonido en `update`.** En `update()`, capturar `const bounces = updateBall();` y `const destroyed = updateBlocks();`. Si `!destroyed && bounces > 0`, reproducir el rebote una vez por cada rebote: `for (let i = 0; i < bounces; i++) { bounceSound.currentTime = 0; bounceSound.play(); }`.
   Verificación: al rebotar en pared/techo/paddle suena `ball-bounce.mp3`; al destruir un bloque solo suena `break-sound.mp3`.

## Criterios de aceptación

- [x] Al rebotar en la pared izquierda suena `ball-bounce.mp3`.
- [x] Al rebotar en la pared derecha suena `ball-bounce.mp3`.
- [x] Al rebotar en el techo suena `ball-bounce.mp3`.
- [x] Al rebotar en el paddle suena `ball-bounce.mp3`.
- [x] Al destruir un bloque suena solo `break-sound.mp3` y NO `ball-bounce.mp3`, aunque en ese mismo frame haya un rebote de pared/techo/paddle.
- [x] Rebotes sucesivos (en frames distintos) suenan cada uno de forma independiente.
- [x] El sonido respeta el desbloqueo de audio existente (no suena antes de la primera interacción del usuario).
- [x] El resto de la lógica del juego (paddle, bola, vidas, score, pausa, explosiones) no se ve afectada.
- [x] La página carga sin errores en consola.

## Decisiones

- **Sí:** El sonido cubre solo pared, techo y paddle. Son los rebotes no destructivos del juego.
- **No:** Sonido de rebote contra bloque. La destrucción ya suena con `break-sound.mp3` (spec 02); duplicarlo sería ruido.
- **Sí:** Prioridad a la destrucción. Si en un frame se destruye un bloque, se omite el rebote aunque también haya tocado pared/paddle. Un solo evento sonoro por impacto.
- **Sí:** Un sonido por cada rebote (no uno por frame). Refleja fielmente cada colisión.
- **Sí:** `Audio` único reutilizable con `currentTime = 0`, igual patrón que `breakSound`. Consistencia con spec 02 y sin coste de crear objetos por rebote.
- **Sí:** Decisión vía `update()` con valores de retorno de `updateBall`/`updateBlocks`. Evita banderas globales y mantiene la lógica de prioridad en un solo sitio.
- **No:** Sonidos distintos por superficie, volumen o mute. Fuera de scope, spec futura si se pide.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Dos rebotes en el mismo frame (esquinas) sobre un único `Audio`: `currentTime = 0` reinicia y se oye como un solo sonido. | Aceptado. Caso raro y poco perceptible; evita crear objetos `Audio` por rebote. Si molesta, spec futura con pool de `Audio` o `cloneNode()`. |
| Cambiar la firma de `updateBall`/`updateBlocks` (ahora devuelven valor) podría afectar otras llamadas. | Solo se invocan desde `update()`. Verificar que no haya otros llamadores antes de implementar. |
| Política de autoplay del navegador bloquea `play()` antes de interacción. | Ya cubierto por `unlockAudio` existente; el rebote reutiliza ese desbloqueo. |

## Qué **no** entra en esta spec

- Sonido de rebote contra bloques.
- Sonidos distintos por superficie.
- Volumen, mute o mezcla de audio.
- Sonidos de vida perdida, victoria o game over.

Cada uno, si se pide, irá en su propia spec.
