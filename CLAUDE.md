# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project goal

Build an Arkanoid game in pure HTML, CSS, and JavaScript — zero dependencies, runs in the browser.

## Current state

**Implemented specs (all merged to main):**
- `01-mvp-arkanoid` — Canvas game loop, paddle (mouse + keyboard), ball physics, 60 blocks, HUD, pause, Game Over, Victory.
- `02-block-explosion` — Sprite-based explosion animation when a block is destroyed.
- `03-ball-bounce-sound` — Audio feedback on ball bounce and block break.
- `04-multiple-levels` — 10 declarative levels (`levels.js`), auto-advance, score/lives preserved, ball speed +8%/level, level shown in HUD.

## Architecture

- Single-page app: `index.html`, `style.css`, `game.js`, `levels.js`.
- **No build step, no bundler, no npm.** Open `index.html` directly in a browser to run.
- Script load order in `index.html`: `assets/spritesheet.js` → `levels.js` → `game.js`.
- `assets/spritesheet-breakout.png` — sole sprite atlas (paddle, ball, blocks, explosions).
- `assets/sounds/` — `ball-bounce.mp3`, `break-sound.mp3`.

### Sprite system (`assets/spritesheet.js`)

- `loadSpritesheet(cb)` — async load; calls `cb` when ready.
- `drawSprite(ctx, name, x, y, w, h)` — draw a named sprite. Block names: `block_<color>`.
- `drawFrame(ctx, frame, x, y, w, h)` — draw a `{sx, sy, sw, sh}` frame. Used for explosion frames.

Available block colors: `gray`, `red`, `yellow`, `cyan`, `magenta`, `hotpink`, `green`.
Explosion: 4 frames per color, `EXPLOSION_DURATION = 150` ms.

### Game state (`game.js`)

```js
const state = {
  phase: 'playing', // 'playing' | 'paused' | 'gameover' | 'win'
  lives: 3,
  score: 0,
  level: 0,         // 0-indexed; HUD shows level + 1
};
```

Ball base speed: ±4 px/frame. Speed factor per level: `1 + 0.08 * state.level`.

### Level system (`levels.js`)

```js
// Each level: array of strings, 10 chars wide, variable rows.
// R=red C=cyan G=green M=magenta Y=yellow H=hotpink  '.'=empty cell
const LEVELS = [ /* 10 layouts */ ];
const CHAR_COLORS = { R:'red', C:'cyan', G:'green', M:'magenta', Y:'yellow', H:'hotpink' };
```

`initBlocks()` reads `LEVELS[state.level]`; unrecognized chars treated as empty.

## Spec-driven workflow

New features are defined before coded. Use the custom skills:

- `/spec <description>` — guided Q&A that produces a spec file in `specs/`. Never writes code.
- `/spec-impl <NN-slug>` — implements an **Approved** spec step by step, creating a git branch `spec-NN-slug`.

Spec files live in `specs/` and follow the format in `.claude/skills/spec/template.md`. Valid states: `Draft` → `Approved` → `Implemented`. `/spec-impl` will refuse to run on a non-Approved spec.

Branch-creation behavior is controlled by `specs/.spec-config.yml` (`AutoCreateBranch: true` by default).
