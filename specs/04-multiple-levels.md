# SPEC 04 — Múltiples niveles

> **Estado:** Draft
> **Depende de:** 01-mvp-arkanoid, 02-block-explosion, 03-ball-bounce-sound
> **Fecha:** 2026-07-03
> **Objetivo:** Añadir 10 niveles con layouts declarativos y huecos, que avanzan automáticamente conservando score y vidas, con velocidad de bola creciente y número de nivel visible en el HUD.

## Scope

**In:**

- Nuevo archivo `levels.js` con un array `LEVELS` de 10 layouts declarativos. Se incluye antes de `game.js`.
- Cada layout es un array de strings; ancho fijo de 10 columnas, filas variables (0–N). Cada carácter mapea a color (`R`,`C`,`G`,`M`,`Y`,`H`) o `.` = celda vacía.
- Los layouts permiten huecos y formas no rectangulares dentro del grid de 10 de ancho.
- `initBlocks()` deja de generar el grid procedural y construye los bloques a partir de `LEVELS[state.level]`.
- Nuevo campo `state.level` (índice 0–9).
- Al romper todos los bloques de un nivel: avanzar automáticamente al siguiente, **conservando score y vidas**. Tras el nivel 10 → pantalla de Victoria final.
- Velocidad de la bola creciente: nivel 1 = velocidad actual; **+8% por nivel** sobre las componentes base.
- HUD muestra el número de nivel actual (1–10).
- Game Over (0 vidas) → "Reiniciar" vuelve al **nivel 1**.

**Fuera de scope (para specs futuras):**

- Editor visual de niveles.
- Bloques irrompibles o de varios golpes (todos mueren de un impacto).
- Persistencia del nivel alcanzado o high scores (localStorage).
- Powerups, nuevos tipos de bloque, o layouts de ancho variable.
- Pantalla intermedia "Nivel completado" (el avance es automático, sin pausa).
- Bonus de score por completar nivel o vidas extra.

## Data model

Se añade un campo `level` al estado global y el catálogo de niveles en `levels.js`.

```js
// Estado global (game.js) — se añade `level`
const state = {
  phase: 'playing', // 'playing' | 'paused' | 'gameover' | 'win'
  lives: 3,
  score: 0,
  level: 0,         // índice 0–9 dentro de LEVELS
};
```

```js
// levels.js — catálogo de niveles
// Ancho fijo: 10 columnas. Filas variables. Cada char = 1 celda.
// R=red C=cyan G=green M=magenta Y=yellow H=hotpink  '.'=vacío
const CHAR_COLORS = {
  R: 'red', C: 'cyan', G: 'green',
  M: 'magenta', Y: 'yellow', H: 'hotpink',
};

const LEVELS = [
  [ // nivel 1
    'RRRRRRRRRR',
    'CCCCCCCCCC',
    'GGGGGGGGGG',
  ],
  // ... 9 niveles más, con huecos y formas variadas
];
```

Convenciones:

- `initBlocks()` recorre `LEVELS[state.level]`: por cada char distinto de `.`, crea un bloque con el color de `CHAR_COLORS[char]`.
- Se reutilizan las constantes `BLOCK_COLS = 10`, `BLOCK_W`, `BLOCK_H`, `offsetX`, `offsetY` actuales. La fila define `y`, la columna define `x`.
- Velocidad por nivel: factor `speedFactor = 1 + 0.08 * state.level`; al resetear la bola, `vx`/`vy` base (±4) se multiplican por `speedFactor`.
- `state.level` es índice interno (0–9); el HUD muestra `state.level + 1`.

## Plan de implementación

1. **Crear `levels.js`.** Definir `CHAR_COLORS` y `LEVELS` con los 10 layouts (con huecos y formas variadas). Enlazarlo en `index.html` antes de `game.js`.
   Verificación: `LEVELS.length === 10` en consola, sin errores al cargar.

2. **Añadir `state.level`.** Inicializar `level: 0` en el objeto `state` de `game.js`.
   Verificación: `state.level` accesible, valor 0 al arrancar.

3. **Reescribir `initBlocks()`.** Construir los bloques desde `LEVELS[state.level]` usando `CHAR_COLORS`, saltando los `.`. Mantener `offsetX`/`offsetY` y tamaños actuales.
   Verificación: el nivel 1 se dibuja según su layout, los huecos quedan vacíos.

4. **Velocidad por nivel en `resetBall()`.** Aplicar `speedFactor = 1 + 0.08 * state.level` a las componentes base ±4 de `vx`/`vy`, conservando la dirección.
   Verificación: la bola va más rápida en niveles altos; en nivel 1 igual que hoy.

5. **Avance de nivel.** Donde hoy se hace `state.phase = 'win'` (todos los bloques muertos): si `state.level < 9`, incrementar `state.level`, `initBlocks()` y `resetBall()` (score y vidas intactos); si es el último, `state.phase = 'win'`.
   Verificación: romper todos los bloques pasa al siguiente nivel; tras el nivel 10 aparece Victoria.

6. **Reinicio a nivel 1.** En `resetGame()`, poner `state.level = 0` antes de `initBlocks()`.
   Verificación: Game Over → "Reiniciar" arranca en nivel 1 con score y vidas reseteados.

7. **HUD con nivel.** Mostrar `Nivel: {state.level + 1}` junto a score y vidas.
   Verificación: el número de nivel se actualiza al avanzar y al reiniciar.

## Criterios de aceptación

- [ ] `levels.js` carga sin errores y `LEVELS.length === 10`.
- [ ] `index.html` incluye `levels.js` antes de `game.js`.
- [ ] El juego arranca en el nivel 1 (`state.level === 0`).
- [ ] Cada nivel dibuja los bloques según su layout, con las celdas `.` vacías.
- [ ] Al menos un nivel tiene huecos internos o forma no rectangular.
- [ ] Al romper todos los bloques de un nivel (no siendo el último) se pasa automáticamente al siguiente.
- [ ] Al avanzar de nivel, el score y las vidas se conservan.
- [ ] La bola se reposiciona al avanzar de nivel.
- [ ] La velocidad de la bola en el nivel 1 es la actual (±4 por componente).
- [ ] La velocidad de la bola aumenta un 8% por nivel respecto a la base.
- [ ] Tras romper todos los bloques del nivel 10 aparece la pantalla de Victoria.
- [ ] Perder las 3 vidas muestra Game Over en cualquier nivel.
- [ ] En Game Over, "Reiniciar" vuelve al nivel 1 con score 0 y 3 vidas.
- [ ] El HUD muestra `Nivel: N` (1–10) actualizado al avanzar y al reiniciar.
- [ ] La página carga sin errores en consola.

## Decisiones

- **Sí:** Layouts declarativos en `LEVELS` (array de strings). Fáciles de leer, editar y ampliar; permiten huecos con `.`.
- **Sí:** Ancho fijo de 10 columnas, filas variables. Reutiliza `BLOCK_COLS`, `offsetX` y el centrado actuales sin refactor.
- **No:** Ancho variable por nivel. Complicaría el centrado y el mapeo columna→x; no aporta lo suficiente ahora.
- **Sí:** 10 niveles diseñados a mano. Control total sobre la curva de dificultad.
- **No:** Generación procedural. Menos predecible; los layouts a mano dan mejor progresión.
- **Sí:** Avance automático conservando score y vidas. Flujo arcade clásico, sin fricción entre niveles.
- **No:** Pantalla intermedia "Nivel completado". Rompe el ritmo; el avance directo es más fluido.
- **Sí:** Velocidad +8% por nivel. Dificultad creciente perceptible sin volverse injugable en el nivel 10.
- **Sí:** Game Over reinicia en nivel 1. Convención arcade; reintentar el mismo nivel sería otra decisión de diseño.
- **No:** Persistencia del nivel o high scores. Fuera de scope, spec futura.
- **No:** Bloques irrompibles o de varios golpes. Mantiene el modelo de un impacto = destrucción; spec futura si se pide.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Un layout con una fila de más/menos de 10 chars descuadra el mapeo columna→x. | Al construir en `initBlocks()`, usar el índice de carácter como columna; documentar en `levels.js` que cada fila debe tener exactamente 10 chars. |
| Un carácter no mapeado en `CHAR_COLORS` crearía un bloque sin color. | Tratar cualquier char no reconocido como celda vacía (igual que `.`). |
| Velocidad acumulada en nivel 10 (+72%) puede atravesar bloques por túnel (tunneling). | Aceptado para este spec; si aparece, spec futura con colisión por barrido (swept collision). |

## Qué **no** entra en esta spec

- Editor visual de niveles.
- Bloques irrompibles o de varios golpes.
- Persistencia del nivel alcanzado o high scores.
- Powerups, nuevos tipos de bloque o layouts de ancho variable.
- Pantalla intermedia entre niveles y bonus de score.

Cada uno, si se pide, irá en su propia spec.
