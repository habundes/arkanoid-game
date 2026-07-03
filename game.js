const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const state = {
  phase: 'playing', // 'playing' | 'paused' | 'gameover' | 'win'
  lives: 3,
  score: 0,
};

const paddle = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  width: 162,
  height: 14,
  speed: 6,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  radius: 8,
  vx: 4,
  vy: -4,
};

const BLOCK_COLS = 10;
const BLOCK_ROWS = 6;
const BLOCK_W = 36;
const BLOCK_H = 22;
const BLOCK_COLORS = ['red', 'cyan', 'green', 'magenta', 'yellow', 'hotpink'];

const blocks = [];
const explosions = [];

const breakSound = new Audio('assets/sounds/break-sound.mp3');

// Unlock AudioContext on first user interaction (browser autoplay policy)
function unlockAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume().then(() => ctx.close());
  document.removeEventListener('keydown', unlockAudio);
  document.removeEventListener('mousemove', unlockAudio);
}
document.addEventListener('keydown', unlockAudio);
document.addEventListener('mousemove', unlockAudio);

function initBlocks() {
  blocks.length = 0;
  const offsetX = (canvas.width - BLOCK_COLS * BLOCK_W) / 2;
  const offsetY = 48;
  for (let row = 0; row < BLOCK_ROWS; row++) {
    const color = BLOCK_COLORS[row % BLOCK_COLORS.length];
    for (let col = 0; col < BLOCK_COLS; col++) {
      blocks.push({
        x: offsetX + col * BLOCK_W,
        y: offsetY + row * BLOCK_H,
        width: BLOCK_W,
        height: BLOCK_H,
        color,
        alive: true,
      });
    }
  }
}

const keys = { ArrowLeft: false, ArrowRight: false };

const BTN = { x: 220, y: 300, width: 200, height: 44 };

function resetGame() {
  state.phase = 'playing';
  state.lives = 3;
  state.score = 0;
  explosions.length = 0;
  initBlocks();
  resetBall();
}

canvas.addEventListener('click', (e) => {
  if (state.phase !== 'gameover' && state.phase !== 'win') return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;
  if (mx >= BTN.x && mx <= BTN.x + BTN.width && my >= BTN.y && my <= BTN.y + BTN.height) {
    resetGame();
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  paddle.x = (e.clientX - rect.left) * scaleX;
});

document.addEventListener('keydown', (e) => {
  if (e.key in keys) keys[e.key] = true;
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
    if (state.phase === 'playing') state.phase = 'paused';
    else if (state.phase === 'paused') state.phase = 'playing';
  }
});
document.addEventListener('keyup', (e) => {
  if (e.key in keys) keys[e.key] = false;
});

function updatePaddle() {
  if (keys.ArrowLeft)  paddle.x -= paddle.speed;
  if (keys.ArrowRight) paddle.x += paddle.speed;
  const half = paddle.width / 2;
  paddle.x = Math.max(half, Math.min(canvas.width - half, paddle.x));
}

function drawPaddle() {
  drawSprite(ctx, 'paddle', paddle.x - paddle.width / 2, paddle.y, paddle.width, paddle.height);
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = paddle.y - ball.radius - 1;
  ball.vx = 4 * (Math.random() < 0.5 ? 1 : -1);
  ball.vy = -4;
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall bounces
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x + ball.radius > canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.vx = -Math.abs(ball.vx);
  }

  // Ceiling bounce
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy);
  }

  // Paddle collision
  const halfPaddle = paddle.width / 2;
  if (
    ball.vy > 0 &&
    ball.y + ball.radius >= paddle.y &&
    ball.y + ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x - halfPaddle &&
    ball.x <= paddle.x + halfPaddle
  ) {
    ball.vy = -Math.abs(ball.vy);
    const offset = (ball.x - paddle.x) / halfPaddle;
    ball.vx = offset * 5;
  }

  // Ball lost
  if (ball.y - ball.radius > canvas.height) {
    state.lives -= 1;
    if (state.lives <= 0) {
      state.phase = 'gameover';
    } else {
      resetBall();
    }
  }
}

function drawBall() {
  drawSprite(ctx, 'ball', ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
}

function updateBlocks() {
  for (const b of blocks) {
    if (!b.alive) continue;
    if (
      ball.x + ball.radius > b.x &&
      ball.x - ball.radius < b.x + b.width &&
      ball.y + ball.radius > b.y &&
      ball.y - ball.radius < b.y + b.height
    ) {
      b.alive = false;
      state.score += 10;
      explosions.push({ x: b.x, y: b.y, color: b.color, startTime: performance.now(), frame: 0 });
      breakSound.currentTime = 0;
      breakSound.play();

      const overlapLeft   = ball.x + ball.radius - b.x;
      const overlapRight  = b.x + b.width - (ball.x - ball.radius);
      const overlapTop    = ball.y + ball.radius - b.y;
      const overlapBottom = b.y + b.height - (ball.y - ball.radius);
      const minH = Math.min(overlapLeft, overlapRight);
      const minV = Math.min(overlapTop, overlapBottom);
      if (minH < minV) ball.vx = -ball.vx;
      else             ball.vy = -ball.vy;

      break;
    }
  }

  if (blocks.every(b => !b.alive)) state.phase = 'win';
}

function updateExplosions(now) {
  for (const e of explosions) {
    e.frame = Math.max(0, Math.floor((now - e.startTime) / (EXPLOSION_DURATION / 4)));
  }
  for (let i = explosions.length - 1; i >= 0; i--) {
    if (explosions[i].frame >= 4) explosions.splice(i, 1);
  }
}

function update() {
  const now = performance.now();
  if (state.phase !== 'playing') return;
  updatePaddle();
  updateBall();
  updateBlocks();
  updateExplosions(now);
}

function drawBlocks() {
  for (const b of blocks) {
    if (b.alive) drawSprite(ctx, 'block_' + b.color, b.x, b.y, b.width, b.height);
  }
}

function drawOverlay(text) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE: ' + state.score, 8, 20);
  const ballSize = 16;
  const ballGap = 4;
  for (let i = 0; i < state.lives; i++) {
    const bx = canvas.width - 8 - ballSize - i * (ballSize + ballGap);
    drawSprite(ctx, 'ball', bx, 4, ballSize, ballSize);
  }
}

function drawEndScreen(title) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 52px monospace';
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 60);
  ctx.font = '24px monospace';
  ctx.fillText('SCORE: ' + state.score, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = '#e63946';
  ctx.fillRect(BTN.x, BTN.y, BTN.width, BTN.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('Reiniciar', canvas.width / 2, BTN.y + 29);
}

function drawExplosions() {
  for (const e of explosions) {
    drawFrame(ctx, EXPLOSION_FRAMES[e.color][e.frame], e.x, e.y, 64, 32);
  }
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawBlocks();
  drawExplosions();
  drawPaddle();
  drawBall();
  drawHUD();
  if (state.phase === 'paused')  drawOverlay('PAUSA');
  if (state.phase === 'gameover') drawEndScreen('GAME OVER');
  if (state.phase === 'win')      drawEndScreen('¡GANASTE!');
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadSpritesheet(() => {
  initBlocks();
  loop();
});
