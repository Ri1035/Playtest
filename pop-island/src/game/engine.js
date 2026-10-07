/**
 * 游戏引擎：主循环、输入、相机、生成、碰撞、渲染管线与状态机。
 * 状态机：menu -> playing <-> paused
 */

import { WORLD, ISLAND, islandRadius, inIsland, randomIslandPoint, islandPath, makeDecorations } from './world.js';
import {
  PALETTES, ITEMS, POWERUPS, halftoneRect, popText, starPath,
  drawPlayer, drawGull, drawPalm, drawFlowerDecor, drawRock, drawCanDecor,
} from './sprites.js';
import { Player, Item, Gull, Particle, Popup } from './entities.js';
import { sound } from './audio.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui;
    this.state = 'menu';

    this.keys = {};
    this.joy = { active: false, id: -1, ox: 0, oy: 0, x: 0, y: 0 };

    this.time = 0;
    this.vw = 0;
    this.vh = 0;
    this.dpr = 1;
    this.camX = 0;
    this.camY = 0;
    this.shakeTime = 0;
    this.shakeMag = 0;

    this.seaLayer = null;
    this.islandLayer = null;
    this.decorations = [];

    this.reset();
    this.resize();
    this.bind();

    this._last = performance.now();
    const loop = (t) => {
      const dt = Math.min(0.05, (t - this._last) / 1000);
      this._last = t;
      this.update(dt);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ================= 状态控制 ================= */

  reset() {
    this.level = 1;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.paint = 0;
    this.paintMax = 100;
    this.best = Number(localStorage.getItem('popIslandBest') || 0);
    this.items = [];
    this.gulls = [];
    this.particles = [];
    this.popups = [];
    this.player = new Player(ISLAND.cx, ISLAND.cy);
    this.time = 0;
    this.spawnItemTimer = 0.8;
    this.spawnGullTimer = 2.5;
    this.freezeUntil = 0;
    this.paletteIndex = 0;
    this._s = -1;
    this._c = -1;
    this.buildLayers();
    for (let i = 0; i < 9; i++) this.spawnItem();
    this.camX = clamp(ISLAND.cx - this.vw / 2, 0, Math.max(0, WORLD.w - this.vw));
    this.camY = clamp(ISLAND.cy - this.vh / 2, 0, Math.max(0, WORLD.h - this.vh));
    this.ui.hud.classList.remove('hidden');
    this.ui.menuBest.textContent = String(this.best);
    this.updateHUD(true);
  }

  start() {
    this.reset();
    this.state = 'playing';
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.ui.showPause();
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.ui.hidePause();
    this._last = performance.now();
  }

  restart() {
    this.start();
    this.ui.hidePause();
  }

  /* ================= 输入 ================= */

  bind() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
      if (e.repeat) return;
      this.keys[k] = true;
      if (k === 'escape' || k === 'p') {
        if (this.state === 'playing') this.pause();
        else if (this.state === 'paused') this.resume();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
    window.addEventListener('blur', () => this.pause());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pause();
    });

    // 触屏摇杆（Pointer Events，仅 touch 指针）
    const c = this.canvas;
    const pos = (e) => {
      const r = c.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    c.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      if (this.state !== 'playing') return;
      const p = pos(e);
      this.joy.active = true;
      this.joy.id = e.pointerId;
      this.joy.ox = p.x;
      this.joy.oy = p.y;
      this.joy.x = p.x;
      this.joy.y = p.y;
    });
    c.addEventListener('pointermove', (e) => {
      if (!this.joy.active || e.pointerId !== this.joy.id) return;
      const p = pos(e);
      this.joy.x = p.x;
      this.joy.y = p.y;
    });
    const end = (e) => {
      if (e.pointerId === this.joy.id) this.joy.active = false;
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.vw = rect.width;
    this.vh = rect.height;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.vw * this.dpr);
    this.canvas.height = Math.round(this.vh * this.dpr);
    this.camX = clamp(this.camX, 0, Math.max(0, WORLD.w - this.vw));
    this.camY = clamp(this.camY, 0, Math.max(0, WORLD.h - this.vh));
  }

  /* ================= 更新 ================= */

  update(dt) {
    this.time += dt;
    const playing = this.state === 'playing';
    const p = this.player;

    // —— 玩家移动 ——
    if (playing) {
      let ix = 0;
      let iy = 0;
      if (this.keys['arrowleft'] || this.keys['a']) ix -= 1;
      if (this.keys['arrowright'] || this.keys['d']) ix += 1;
      if (this.keys['arrowup'] || this.keys['w']) iy -= 1;
      if (this.keys['arrowdown'] || this.keys['s']) iy += 1;
      if (this.joy.active) {
        const dx = this.joy.x - this.joy.ox;
        const dy = this.joy.y - this.joy.oy;
        const m = Math.hypot(dx, dy);
        if (m > 6) {
          const k = Math.min(1, m / 52);
          ix = (dx / m) * k;
          iy = (dy / m) * k;
        }
      }
      const len = Math.hypot(ix, iy);
      if (len > 1) {
        ix /= len;
        iy /= len;
      }
      const speed = 265;
      const nx = p.x + ix * speed * dt;
      const ny = p.y + iy * speed * dt;
      if (inIsland(nx, ny, p.r)) {
        p.x = nx;
        p.y = ny;
      } else {
        if (inIsland(nx, p.y, p.r)) p.x = nx;
        if (inIsland(p.x, ny, p.r)) p.y = ny;
      }
      if (ix || iy) p.dir = Math.atan2(iy, ix);

      // 相机跟随
      const tx = clamp(p.x - this.vw / 2, 0, Math.max(0, WORLD.w - this.vw));
      const ty = clamp(p.y - this.vh / 2, 0, Math.max(0, WORLD.h - this.vh));
      this.camX += (tx - this.camX) * Math.min(1, dt * 5);
      this.camY += (ty - this.camY) * Math.min(1, dt * 5);
    } else {
      this.camX = clamp(ISLAND.cx - this.vw / 2, 0, Math.max(0, WORLD.w - this.vw));
      this.camY = clamp(ISLAND.cy - this.vh / 2, 0, Math.max(0, WORLD.h - this.vh));
    }

    // —— 收集物 ——
    const magnetOn = playing && this.time < p.magnetUntil;
    for (const it of this.items) {
      it.phase += dt * 3;
      if (magnetOn) {
        const d = Math.hypot(p.x - it.x, p.y - it.y);
        if (d < 190 && d > 1) {
          it.x += ((p.x - it.x) / d) * 320 * dt;
          it.y += ((p.y - it.y) / d) * 320 * dt;
        }
      }
    }
    if (playing) {
      for (let i = this.items.length - 1; i >= 0; i--) {
        const it = this.items[i];
        if (Math.hypot(p.x - it.x, p.y - it.y) < p.r + it.r - 4) this.collect(i);
      }
    }

    // —— 海鸥 ——
    const frozen = this.time < this.freezeUntil;
    for (const g of this.gulls) {
      if (frozen) {
        g.x += Math.sin(this.time * 22 + g.flap) * 0.35;
        g.flap += dt * 8;
        continue;
      }
      const dp = Math.hypot(p.x - g.x, p.y - g.y);
      g.chasing = playing && dp < 210;
      if (g.chasing) {
        g.wx = p.x;
        g.wy = p.y;
        const d = Math.hypot(g.wx - g.x, g.wy - g.y) || 1;
        g.x += ((g.wx - g.x) / d) * g.speed * 1.2 * dt;
        g.y += ((g.wy - g.y) / d) * g.speed * 1.2 * dt;
      } else {
        g.timer -= dt;
        if (g.timer <= 0 || Math.hypot(g.wx - g.x, g.wy - g.y) < 46) {
          g.timer = 1.2 + Math.random() * 1.8;
          const wp = randomIslandPoint(0.3, 0.98);
          g.wx = wp.x;
          g.wy = wp.y;
        }
        const d = Math.hypot(g.wx - g.x, g.wy - g.y) || 1;
        g.x += ((g.wx - g.x) / d) * g.speed * 0.55 * dt;
        g.y += ((g.wy - g.y) / d) * g.speed * 0.55 * dt;
      }
      g.x = clamp(g.x, 40, WORLD.w - 40);
      g.y = clamp(g.y, 40, WORLD.h - 40);
      g.flap += dt * 10;
      if (playing && this.time >= p.invUntil) {
        if (Math.hypot(p.x - g.x, p.y - g.y) < p.r + g.r - 6) this.hitPlayer();
      }
    }

    // —— 生成与连击计时 ——
    if (playing) {
      this.spawnItemTimer -= dt;
      if (this.spawnItemTimer <= 0) {
        this.spawnItem();
        this.spawnItemTimer = Math.max(0.9, 2.1 - this.level * 0.08);
      }
      const targetItems = 5 + this.level * 2;
      if (this.items.length < targetItems && Math.random() < dt * 1.4) this.spawnItem();

      const maxGulls = Math.min(8, 2 + Math.floor(this.level / 2));
      this.spawnGullTimer -= dt;
      if (this.spawnGullTimer <= 0 && this.gulls.length < maxGulls) {
        this.spawnGull();
        this.spawnGullTimer = 4.2;
      }

      if (this.comboTimer > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) this.combo = 0;
      }
    }

    // —— 粒子 / 飘字 ——
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pa = this.particles[i];
      pa.x += pa.vx * dt;
      pa.y += pa.vy * dt;
      pa.vx *= 1 - 2.6 * dt;
      pa.vy *= 1 - 2.6 * dt;
      pa.life -= dt;
      if (pa.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const po = this.popups[i];
      po.y -= 30 * dt;
      po.life -= dt;
      if (po.life <= 0) this.popups.splice(i, 1);
    }

    if (this.shakeTime > 0) this.shakeTime -= dt;
    this.updateHUD();
  }

  /* ================= 玩法事件 ================= */

  collect(i) {
    const it = this.items.splice(i, 1)[0];
    const p = this.player;

    if (it.isPower) {
      const power = POWERUPS[it.kind];
      if (it.kind === 'magnet') p.magnetUntil = this.time + power.dur;
      else this.freezeUntil = this.time + power.dur;
      this.popups.push(new Popup(it.x, it.y - 30, it.kind === 'magnet' ? 'MAGNET!' : 'FREEZE!', power.color, 26));
      this.burst(it.x, it.y, power.color, 12);
      sound.power();
      return;
    }

    this.combo = Math.min(9, this.combo + 1);
    this.comboTimer = 3.5;
    const mult = 0.5 + this.combo * 0.5;
    const pts = Math.round(ITEMS[it.kind].worth * mult);
    this.score += pts;
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('popIslandBest', String(this.best));
    }
    this.paint += 6 + this.level;

    const color = ITEMS[it.kind].color;
    this.popups.push(new Popup(it.x, it.y - 26, `+${pts}`, color, 20));
    this.burst(it.x, it.y, color, 10);
    sound.pop(this.combo);

    if (this.paint >= this.paintMax) this.levelUp();
  }

  hitPlayer() {
    const p = this.player;
    this.combo = 0;
    this.comboTimer = 0;
    p.invUntil = this.time + 1.5;
    this.shake(0.4, 12);
    this.ui.flashHit();
    this.popups.push(new Popup(p.x, p.y - 44, 'OUCH!', '#EF476F', 30));
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 120 + Math.random() * 160;
      this.particles.push(new Particle(p.x, p.y, Math.cos(a) * sp, Math.sin(a) * sp - 40, '#FFD166', 3 + Math.random() * 3, 0.6, 'star'));
    }
    sound.hit();
  }

  levelUp() {
    this.level += 1;
    this.paint = 0;
    this.paletteIndex = (this.level - 1) % PALETTES.length;
    this.buildLayers();
    this.popups.push(new Popup(this.player.x, this.player.y - 60, `LEVEL ${this.level}!`, PALETTES[this.paletteIndex].accent, 40));

    // 波普冲击波：清空身边海鸥
    for (let i = this.gulls.length - 1; i >= 0; i--) {
      const g = this.gulls[i];
      if (Math.hypot(g.x - this.player.x, g.y - this.player.y) < 320) {
        this.burst(g.x, g.y, '#FFD166', 8);
        this.gulls.splice(i, 1);
      }
    }
    this.freezeUntil = this.time + 2;
    this.player.invUntil = this.time + 2;
    this.ui.flashLevel(this.level);
    sound.level();
  }

  burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 90 + Math.random() * 170;
      this.particles.push(new Particle(x, y, Math.cos(a) * sp, Math.sin(a) * sp, color, 2.5 + Math.random() * 2.5, 0.55 + Math.random() * 0.3));
    }
  }

  shake(dur, mag) {
    this.shakeTime = dur;
    this.shakeMag = mag;
  }

  spawnItem() {
    let kind;
    const roll = Math.random();
    if (roll < 0.05) kind = 'magnet';
    else if (roll < 0.1) kind = 'freeze';
    else {
      const keys = Object.keys(ITEMS);
      kind = keys[Math.floor(Math.random() * keys.length)];
    }
    let pt = randomIslandPoint(0.3, 0.94);
    let tries = 0;
    while (tries++ < 8 && Math.hypot(pt.x - this.player.x, pt.y - this.player.y) < 210) {
      pt = randomIslandPoint(0.3, 0.94);
    }
    this.items.push(new Item(kind, pt.x, pt.y));
  }

  spawnGull() {
    const a = Math.random() * Math.PI * 2;
    const r = islandRadius(a) * 0.92;
    const x = ISLAND.cx + Math.cos(a) * r;
    const y = ISLAND.cy + Math.sin(a) * r;
    this.gulls.push(new Gull(x, y, 120 + this.level * 8));
  }

  /* ================= 图层构建 ================= */

  buildLayers() {
    const pal = PALETTES[this.paletteIndex];

    // 海面：纯色 + 双层网点
    this.seaLayer = document.createElement('canvas');
    this.seaLayer.width = WORLD.w;
    this.seaLayer.height = WORLD.h;
    const sc = this.seaLayer.getContext('2d');
    sc.fillStyle = pal.sea;
    sc.fillRect(0, 0, WORLD.w, WORLD.h);
    halftoneRect(sc, 0, 0, WORLD.w, WORLD.h, 9, 34, pal.seaDot);
    halftoneRect(sc, -200, -200, WORLD.w + 400, WORLD.h + 400, 14, 150, pal.seaDot);

    // 岛屿层：沙滩/草地/装饰，裁剪在岛屿轮廓内
    this.islandLayer = document.createElement('canvas');
    this.islandLayer.width = WORLD.w;
    this.islandLayer.height = WORLD.h;
    const ic = this.islandLayer.getContext('2d');

    ic.save();
    islandPath(ic, 1);
    ic.clip();

    ic.fillStyle = pal.sand;
    ic.fillRect(0, 0, WORLD.w, WORLD.h);

    // 沙滩内侧亮色环
    islandPath(ic, 0.93);
    ic.lineWidth = 26;
    ic.strokeStyle = pal.sandLight;
    ic.stroke();

    // 草地斑块 + 网点
    this.decorations = makeDecorations();
    for (let i = 0; i < 12; i++) {
      const q = randomIslandPoint(0.2, 0.8);
      const r = 50 + Math.random() * 70;
      ic.beginPath();
      ic.arc(q.x, q.y, r, 0, Math.PI * 2);
      ic.fillStyle = pal.grass;
      ic.fill();
      ic.lineWidth = 5;
      ic.strokeStyle = '#111111';
      ic.stroke();
      halftoneRect(ic, q.x - r, q.y - r, r * 2, r * 2, 4, 16, pal.grassDot);
    }

    // 静态装饰
    for (const d of this.decorations) {
      if (d.type === 'palm') drawPalm(ic, d.x, d.y, d.s, pal);
      else if (d.type === 'flower') drawFlowerDecor(ic, d.x, d.y, d.s, pal);
      else if (d.type === 'rock') drawRock(ic, d.x, d.y, d.s, pal);
      else drawCanDecor(ic, d.x, d.y, d.s, pal);
    }

    ic.restore();

    // 岛屿轮廓：黑色粗边 + 白色内边（波普漫画双描边）
    islandPath(ic, 1);
    ic.lineWidth = 12;
    ic.strokeStyle = '#111111';
    ic.stroke();
    islandPath(ic, 1);
    ic.lineWidth = 5;
    ic.strokeStyle = '#FFFFFF';
    ic.stroke();
  }

  /* ================= 渲染 ================= */

  render() {
    const ctx = this.ctx;
    const dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, this.vw, this.vh);

    let sx = 0;
    let sy = 0;
    if (this.shakeTime > 0) {
      sx = (Math.random() - 0.5) * this.shakeMag;
      sy = (Math.random() - 0.5) * this.shakeMag;
    }

    ctx.save();
    ctx.translate(-Math.round(this.camX + sx), -Math.round(this.camY + sy));

    ctx.drawImage(this.seaLayer, 0, 0);
    ctx.drawImage(this.islandLayer, 0, 0);

    // 收集物
    for (const it of this.items) {
      const bob = Math.sin(it.phase) * 4;
      ctx.save();
      ctx.translate(it.x, it.y + bob);
      ctx.fillStyle = 'rgba(17,17,17,0.15)';
      ctx.beginPath();
      ctx.ellipse(0, 13, it.r * 0.7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      if (it.isPower) {
        const pulse = 1 + Math.sin(this.time * 6 + it.phase) * 0.12;
        ctx.scale(pulse, pulse);
        ctx.globalAlpha = 0.35 + 0.25 * Math.sin(this.time * 6 + it.phase);
        ctx.beginPath();
        ctx.arc(0, 0, it.r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = POWERUPS[it.kind].color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      const def = ITEMS[it.kind] || POWERUPS[it.kind];
      def.draw(ctx, 0, 0, 1);
      ctx.restore();
    }

    // 海鸥（冻结时偏蓝）
    const frozen = this.time < this.freezeUntil;
    for (const g of this.gulls) {
      drawGull(ctx, g.x, g.y, g.flap, g.x < this.player.x ? 1 : -1, frozen ? '#9BE8F0' : '#FFFFFF');
    }

    // 玩家（无敌时闪烁）
    const p = this.player;
    const blink = p.invUntil > this.time && Math.floor(this.time * 12) % 2 === 0;
    if (!blink) drawPlayer(ctx, p.x, p.y, this.time, PALETTES[this.paletteIndex]);

    // 粒子
    for (const pa of this.particles) {
      const a = Math.max(0, pa.life / pa.max);
      ctx.globalAlpha = a;
      ctx.fillStyle = pa.color;
      ctx.beginPath();
      if (pa.shape === 'star') {
        starPath(ctx, pa.x, pa.y, pa.r, pa.r * 0.45, 5);
        ctx.fill();
      } else {
        ctx.arc(pa.x, pa.y, pa.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // 飘字
    for (const po of this.popups) {
      const k = po.life / po.max;
      popText(ctx, po.text, po.x, po.y, po.size * (1 + (1 - k) * 0.12), po.color);
    }

    ctx.restore();

    // 触屏摇杆（屏幕空间）
    if (this.joy.active) {
      const j = this.joy;
      const dx = j.x - j.ox;
      const dy = j.y - j.oy;
      const m = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, m / 52);
      const kx = j.ox + (dx / m) * 52 * k;
      const ky = j.oy + (dy / m) * 52 * k;
      ctx.beginPath();
      ctx.arc(j.ox, j.oy, 46, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#111111';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(kx, ky, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD166';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#111111';
      ctx.stroke();
    }
  }

  /* ================= HUD ================= */

  updateHUD(force = false) {
    const ui = this.ui;
    if (force || this.score !== this._s) {
      ui.score.textContent = String(this.score);
      this._s = this.score;
    }
    ui.best.textContent = `BEST ${this.best}`;
    if (force || this.combo !== this._c) {
      this._c = this.combo;
      ui.comboBox.classList.toggle('hidden', this.combo < 2);
      ui.comboVal.textContent = `x${this.combo}`;
    }
    ui.comboFill.style.width = `${(this.comboTimer / 3.5) * 100}%`;
    ui.paintFill.style.width = `${Math.min(100, (this.paint / this.paintMax) * 100)}%`;
    ui.levelVal.textContent = `LV.${this.level}`;
  }
}
