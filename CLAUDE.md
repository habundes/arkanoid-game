# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project goal

Build an Arkanoid game in pure HTML, CSS, and JavaScript — zero dependencies, runs in the browser. The game is **not yet implemented**; all code must be written from scratch.

## Architecture

- Single-page app: one `index.html`, one CSS file, one main JS file.
- **No build step, no bundler, no npm.** Open `index.html` directly in a browser to run.
- `assets/spritesheet-breakout.png` — the sole sprite atlas for all visuals (paddle, ball, blocks, explosions).
- `assets/spritesheet.js` — sprite loader and drawing helpers (`loadSpritesheet`, `drawSprite`, `drawFrame`). Include this before the main game script. Sprites are referenced by name (e.g. `"paddle"`, `"ball"`, `"block_red"`) or by explicit frame coords.
- `assets/sounds/` — `ball-bounce.mp3`, `break-sound.mp3`.

### Sprite system

`spritesheet.js` exposes:
- `loadSpritesheet(cb)` — async load; calls `cb` when ready.
- `drawSprite(ctx, name, x, y, w, h)` — draw a named sprite. Block names follow the pattern `block_<color>` (e.g. `block_red`, `block_cyan`).
- `drawFrame(ctx, frame, x, y, w, h)` — draw an arbitrary `{sx, sy, sw, sh}` frame object. Used for explosion animation frames (`EXPLOSION_FRAMES[color][i]`).

Available block colors: `gray`, `red`, `yellow`, `cyan`, `magenta`, `hotpink`, `green`.
Explosion animation: 4 frames per color, duration constant `EXPLOSION_DURATION = 150` ms.

## Spec-driven workflow

New features are defined before coded. Use the custom skills:

- `/spec <description>` — guided Q&A that produces a spec file in `specs/`. Never writes code.
- `/spec-impl <NN-slug>` — implements an **Approved** spec step by step, creating a git branch `spec-NN-slug`.

Spec files live in `specs/` and follow the format in `.claude/skills/spec/template.md`. Valid states: `Draft` → `Approved` → `Implemented`. `/spec-impl` will refuse to run on a non-Approved spec.

Branch-creation behavior is controlled by `specs/.spec-config.yml` (`AutoCreateBranch: true` by default).
