// ===== POP BREAKER 游戏引擎：状态机、物理、连击、道具、渲染 =====
import { BRICK_TYPES, COL_COUNT, CELL_W, CELL_H, CELL_GAP, BRICK_TOP, levelConfig } from './levels.js';
import * as S from './sprites.js';
import { sfx } from './audio.js';

export const W = 960;
export const H = 640;
const PADDLE_Y = 580;
const PADDLE_H = 16;
const PADDLE_W = 120;
const PADDLE_WIDE_W = 180;
const BALL_R = 10;
const BASE_SPEED = 350;
const COMBO_WINDOW = 1.5;
const WIDE_TIME = 8;
const SLOW_TIME = 6;
const PADDLE_SPEED = 760;

export class Engine {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui;
    this.state = 'menu';
    this.time = 0;
    this.best = Number(localStorage.getItem('pop-breaker-best') || 0);
    this.ui.setBest(this.best);
    this.keys = new Set();
    this.resetRun();
    this.bindInput();
    this.last = performance.now();
    this.loop();
  }

  resetRun() {
    this.score = 0;
    this.lives = 3;
    this.level = 0;
    this.combo = { count: 0, t: 0 };
    this.effects = { wideT: 0, slowT: 0 };
    this.powerups = [];
    this.particles = [];
    this.popups = [];
    this.introT = 0;
    this.paddle = { x: W / 2, w: PADDLE_W, dx: 0, targetX: W / 2 };
    this.loadLevel();
    this.balls = [this.newBall()];
    this.ui.setScore(this.score);
    this.ui.setLives(this.lives);
    this.ui.setLevel(this.level + 1);
    this.setCombo();
  }

  newBall() {
    return { x: this.paddle.x, y: PADDLE_Y - 16, vx: 0, vy: 0, r: BALL_R, stuck: true, rot: Math.random() * 6.28 };
  }

  loadLevel() {
    const cfg = levelConfig(this.level);
    this.levelCfg = cfg;
    this.bricks = [];
    const startX = (W - COL_COUNT * (CELL_W + CELL_GAP)) / 2;
    cfg.rows.forEach((row, ri) => {
      for (let ci = 0; ci < COL_COUNT; ci++) {
        const ch = row[ci];
        if (!ch || ch === '.') continue;
        const t = BRICK_TYPES[ch];
        this.bricks.push({
          x: startX + ci * (CELL_W + CELL_GAP),
          y: BRICK_TOP + ri * (CELL_H + CELL_GAP),
          w: CELL_W,
          h: CELL_H,
          type: ch,
          hp: t.hp,
          maxHp: t.hp,
          color: cfg.palette.bricks[(ri + ci) % cfg.palette.bricks.length],
        });
      }
    });
  }

  ballSpeed() {
    const slow = this.effects.slowT > 0 ? 0.6 : 1;
    return BASE_SPEED * this.levelCfg.speedMul * slow;
  }

  launch(ball) {
    ball.stuck = false;
    ball.vy = -this.ballSpeed();
    ball.vx = (Math.random() - 0.5) * this.ballSpeed() * 0.3;
    sfx.launch();
  }

  // ===== 对外控制 =====
  start() {
    this.resetRun();
    this.state = 'playing';
    this.introT = 1.0;
    this.ui.showPlay();
    this.addPopup(W / 2, H * 0.4, 'CLICK TO LAUNCH', '#ffd60a', 26);
    sfx.click();
  }

  toMenu() {
    this.state = 'menu';
    this.resetRun();
    this.ui.showMenu();
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.ui.showPause(true);
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.ui.showPause(false);
    }
  }

  toggleMute() {
    this.ui.toggleMute();
  }

  gameOver() {
    this.state = 'gameover';
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('pop-breaker-best', String(this.best));
      this.ui.setBest(this.best);
    }
    this.ui.showGameOver(this.score, this.best, this.level + 1);
    sfx.gameOver();
  }

  // ===== 输入 =====
  bindInput() {
    const canvas = this.canvas;
    const toLogical = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * W;
    };

    canvas.addEventListener('pointermove', (e) => {
      this.paddle.targetX = toLogical(e.clientX);
    });

    canvas.addEventListener('pointerdown', (e) => {
      this.unlock();
      if (this.state === 'menu') {
        this.start();
        return;
      }
      if (this.state === 'gameover') return;
      this.paddle.targetX = toLogical(e.clientX);
      if (this.state === 'playing') {
        const stuck = this.balls.find((b) => b.stuck);
        if (stuck) this.launch(stuck);
      }
    });

    window.addEventListener('keydown', (e) => {
      const k = e.key;
      if (['ArrowLeft', 'ArrowRight', ' ', 'Spacebar'].includes(k)) e.preventDefault();
      this.keys.add(k === ' ' ? ' ' : k);
      if (k === ' ' || k === 'Enter') {
        if (this.state === 'menu') this.start();
        else if (this.state === 'gameover') this.start();
        else if (this.state === 'playing') {
          const stuck = this.balls.find((b) => b.stuck);
          if (stuck) this.launch(stuck);
        }
      }
      if (k === 'p' || k === 'P' || k === 'Escape') this.togglePause();
      if (k === 'm' || k === 'M') this.toggleMute();
    });

    window.addEventListener('keyup', (e) => this.keys.delete(e.key === ' ' ? ' ' : e.key));
  }

  unlock() {
    // 由 main 注入
  }

  // ===== 主循环 =====
  loop() {
    const now = performance.now();
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;

    if (this.state === 'playing') this.update(dt);
    this.render();

    requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    // 连击计时
    if (this.combo.t > 0) {
      this.combo.t -= dt;
      if (this.combo.t <= 0) {
        this.combo.count = 0;
        this.setCombo();
      }
    }
    // 道具计时
    if (this.effects.wideT > 0) {
      this.effects.wideT -= dt;
      if (this.effects.wideT <= 0) this.paddle.w = PADDLE_W;
    }
    if (this.effects.slowT > 0) this.effects.slowT -= dt;

    // 关卡切换过渡
    if (this.introT > 0) {
      this.introT -= dt;
      if (this.introT <= 0 && this.balls.length === 0) {
        this.balls = [this.newBall()];
      }
      return;
    }

    // 挡板移动
    const prevX = this.paddle.x;
    const dir = (this.keys.has('ArrowLeft') ? -1 : 0) + (this.keys.has('ArrowRight') ? 1 : 0);
    if (dir !== 0) this.paddle.targetX += dir * PADDLE_SPEED * dt;
    this.paddle.targetX = Math.max(this.paddle.w / 2 + 10, Math.min(W - this.paddle.w / 2 - 10, this.paddle.targetX));
    this.paddle.x += (this.paddle.targetX - this.paddle.x) * Math.min(1, dt * 14);
    this.paddle.dx = (this.paddle.x - prevX) / dt;

    // 道具下落
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.y += 150 * dt;
      const caught =
        p.y + 9 >= PADDLE_Y - PADDLE_H / 2 &&
        p.y - 9 <= PADDLE_Y + PADDLE_H / 2 + 12 &&
        Math.abs(p.x - this.paddle.x) <= this.paddle.w / 2 + 13;
      if (caught) {
        this.applyPowerup(p.kind);
        this.powerups.splice(i, 1);
      } else if (p.y > H + 20) {
        this.powerups.splice(i, 1);
      }
    }

    // 球
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      if (ball.stuck) {
        ball.x = this.paddle.x;
        ball.y = PADDLE_Y - 16;
        continue;
      }
      ball.rot += dt * 6;
      const nx = ball.x + ball.vx * dt;
      const ny = ball.y + ball.vy * dt;

      // 侧墙
      if (nx - ball.r < 0) { ball.vx = Math.abs(ball.vx); ball.x = ball.r; }
      else if (nx + ball.r > W) { ball.vx = -Math.abs(ball.vx); ball.x = W - ball.r; }
      else ball.x = nx;

      // 顶墙
      if (ny - ball.r < 0) {
        ball.vy = Math.abs(ball.vy);
        ball.y = ball.r;
      } else if (ny + ball.r > PADDLE_Y + 4 && ball.vy > 0 && this.hitPaddle(ball, nx, ny)) {
        // 挡板反弹（已处理）
      } else {
        ball.y = ny;
      }

      // 挡板
      if (!ball.stuck && ball.vy > 0 && ball.y + ball.r >= PADDLE_Y - PADDLE_H / 2 && ball.y - ball.r <= PADDLE_Y + PADDLE_H) {
        if (ball.x >= this.paddle.x - this.paddle.w / 2 - ball.r && ball.x <= this.paddle.x + this.paddle.w / 2 + ball.r) {
          const rel = Math.max(-1, Math.min(1, (ball.x - this.paddle.x) / (this.paddle.w / 2)));
          const ang = rel * (Math.PI / 3);
          const sp = this.ballSpeed();
          ball.vx = Math.sin(ang) * sp;
          ball.vy = -Math.cos(ang) * sp;
          ball.y = PADDLE_Y - PADDLE_H / 2 - ball.r;
          sfx.paddle();
          if (this.combo.count > 0) {
            this.combo.count = 0;
            this.setCombo();
          }
        }
      }

      // 砖块碰撞
      for (let j = 0; j < this.bricks.length; j++) {
        const b = this.bricks[j];
        const hit = this.collideBrick(ball, b);
        if (hit) break; // 每帧只处理一块砖
      }

      // 掉出底部
      if (ball.y - ball.r > H) {
        this.balls.splice(i, 1);
      }
    }

    // 生命结算
    if (this.balls.length === 0 && this.state === 'playing' && this.introT <= 0) {
      this.lives--;
      this.ui.setLives(this.lives);
      sfx.lost();
      if (this.lives <= 0) {
        this.gameOver();
      } else {
        this.balls = [this.newBall()];
      }
    }

    // 过关
    if (this.bricks.length === 0 && this.state === 'playing') {
      this.level++;
      this.ui.setLevel(this.level + 1);
      this.loadLevel();
      this.balls = [];
      this.introT = 1.1;
      this.addPopup(W / 2, H * 0.42, `LEVEL ${this.level + 1}`, this.levelCfg.palette.pop, 30);
      sfx.levelUp();
    }

    // 粒子 / 飘字
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 240 * dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.life -= dt;
      p.y -= 42 * dt;
      if (p.life <= 0) this.popups.splice(i, 1);
    }
  }

  hitPaddle(ball, nx, ny) {
    return nx + ball.r >= this.paddle.x - this.paddle.w / 2 && nx - ball.r <= this.paddle.x + this.paddle.w / 2;
  }

  collideBrick(ball, b) {
    const bx = ball.x, by = ball.y, r = ball.r;
    if (bx + r <= b.x || bx - r >= b.x + b.w || by + r <= b.y || by - r >= b.y + b.h) return false;

    const ox = Math.min(bx + r - b.x, b.x + b.w - (bx - r));
    const oy = Math.min(by + r - b.y, b.y + b.h - (by - r));
    if (ox < oy) {
      ball.vx = ball.vx > 0 ? -Math.abs(ball.vx) : Math.abs(ball.vx);
      ball.x += ball.vx > 0 ? ox : -ox;
    } else {
      ball.vy = ball.vy > 0 ? -Math.abs(ball.vy) : Math.abs(ball.vy);
      ball.y += ball.vy > 0 ? oy : -oy;
    }

    b.hp--;
    if (b.hp <= 0) {
      const idx = this.bricks.indexOf(b);
      this.bricks.splice(idx, 1);
      this.combo.count++;
      this.combo.t = COMBO_WINDOW;
      const gain = b.maxHp * 10 * this.combo.count;
      this.score += gain;
      this.ui.setScore(this.score);
      this.burst(b.x + b.w / 2, b.y + b.h / 2, b.color);
      this.addPopup(b.x + b.w / 2, b.y, `+${gain}`, '#ffffff', 16 + Math.min(this.combo.count * 2, 10));
      this.setCombo();
      sfx.brickPop(this.combo.count);
      sfx.brickBreak();
      if (Math.random() < this.levelCfg.powerChance) {
        const kinds = ['W', 'M', 'S'];
        this.powerups.push({ kind: kinds[Math.floor(Math.random() * kinds.length)], x: b.x + b.w / 2, y: b.y + b.h / 2 });
      }
    } else {
      this.score += b.maxHp * 10;
      this.ui.setScore(this.score);
      this.addPopup(b.x + b.w / 2, b.y, `+${b.maxHp * 10}`, '#111111', 14);
      sfx.brickHit();
    }
    return true;
  }

  applyPowerup(kind) {
    sfx.powerup();
    if (kind === 'W') {
      this.effects.wideT = WIDE_TIME;
      this.paddle.w = PADDLE_WIDE_W;
      this.addPopup(this.paddle.x, PADDLE_Y - 40, 'WIDE!', '#00c2ff', 22);
    } else if (kind === 'M') {
      const sp = this.ballSpeed();
      for (const ang of [-0.42, 0.42]) {
        this.balls.push({
          x: this.paddle.x + ang * 80,
          y: PADDLE_Y - 16,
          vx: Math.sin(ang) * sp,
          vy: -Math.cos(ang) * sp,
          r: BALL_R,
          stuck: false,
          rot: Math.random() * 6.28,
        });
      }
      this.addPopup(this.paddle.x, PADDLE_Y - 40, 'MULTI!', '#ff2d95', 22);
    } else {
      this.effects.slowT = SLOW_TIME;
      this.addPopup(this.paddle.x, PADDLE_Y - 40, 'SLOW!', '#00e676', 22);
    }
  }

  setCombo() {
    if (this.combo.count >= 2) this.ui.setCombo(true, `COMBO x${this.combo.count}`);
    else this.ui.setCombo(false);
  }

  burst(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 160;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0.5 + Math.random() * 0.3,
        size: 3 + Math.random() * 4,
        color,
      });
    }
  }

  addPopup(x, y, text, color, size) {
    this.popups.push({ x, y, text, color, size, life: 0.9 });
  }

  // ===== 渲染 =====
  render() {
    const ctx = this.ctx;
    const pal = this.levelCfg.palette;
    S.drawBackground(ctx, W, H, pal, this.time);

    // 砖块
    for (const b of this.bricks) S.drawBrick(ctx, b, pal);

    // 道具
    for (const p of this.powerups) S.drawPowerup(ctx, p);

    // 挡板
    S.drawPaddle(ctx, this.paddle.x, PADDLE_Y, this.paddle.w, PADDLE_H, pal.bricks[1], this.paddle.dx);

    // 球
    for (const ball of this.balls) {
      S.drawBall(ctx, ball.x, ball.y, ball.r, ball.rot);
    }

    // 粒子
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / 0.8);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 飘字
    for (const p of this.popups) {
      ctx.globalAlpha = Math.max(0, p.life / 0.9);
      S.popText(ctx, p.text, p.x, p.y, p.size, p.color);
      ctx.globalAlpha = 1;
    }

    // 暂停遮罩
    if (this.state === 'paused') {
      ctx.fillStyle = 'rgba(17,17,17,0.55)';
      ctx.fillRect(0, 0, W, H);
      S.popText(ctx, 'PAUSED', W / 2, H / 2, 48, '#ffd60a', 6);
      S.popText(ctx, '按 P 继续', W / 2, H / 2 + 52, 20, '#ffffff', 4);
    }
  }
}
