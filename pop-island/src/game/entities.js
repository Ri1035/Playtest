/**
 * 实体类：玩家、收集物、海鸥、粒子、飘字。
 */

import { ITEMS, POWERUPS } from './sprites.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 24;
    this.dir = 0;
    this.invUntil = 0; // 无敌截止时间
    this.magnetUntil = 0; // 磁铁截止时间
  }
}

export class Item {
  constructor(kind, x, y) {
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.phase = Math.random() * Math.PI * 2;
    this.r = ITEMS[kind] ? ITEMS[kind].r : POWERUPS[kind].r;
  }

  get isPower() {
    return Boolean(POWERUPS[this.kind]);
  }
}

export class Gull {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.r = 22;
    this.speed = speed;
    this.wx = x;
    this.wy = y;
    this.timer = 0;
    this.flap = Math.random() * 10;
    this.chasing = false;
  }
}

export class Particle {
  constructor(x, y, vx, vy, color, r, life, shape = 'dot') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.r = r;
    this.life = life;
    this.max = life;
    this.shape = shape;
  }
}

export class Popup {
  constructor(x, y, text, color, size = 24) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.size = size;
    this.life = 0.9;
    this.max = 0.9;
  }
}
