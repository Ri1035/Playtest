/**
 * 入口：装配 UI、初始化游戏、绑定按钮与特效遮罩。
 */

import './styles.css';
import { Game } from './game/engine.js';
import { sound } from './game/audio.js';

// roundRect 兼容兜底（旧浏览器）
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    return this;
  };
}

const $ = (id) => document.getElementById(id);

const canvas = $('game-canvas');

const ui = {
  hud: $('hud'),
  score: $('score-val'),
  best: $('best-val'),
  comboBox: $('combo-box'),
  comboVal: $('combo-val'),
  comboFill: $('combo-fill'),
  paintFill: $('paint-fill'),
  levelVal: $('level-val'),
  menuBest: $('menu-best'),

  levelFlashEl: $('level-flash'),
  hitFlashEl: $('hit-flash'),
  levelFlashTimer: 0,

  showPause() {
    $('pause-screen').classList.remove('hidden');
  },
  hidePause() {
    $('pause-screen').classList.add('hidden');
  },

  flashLevel(level) {
    this.levelFlashEl.textContent = `LEVEL ${level}`;
    this.levelFlashEl.classList.remove('hidden');
    clearTimeout(this.levelFlashTimer);
    this.levelFlashTimer = setTimeout(() => this.levelFlashEl.classList.add('hidden'), 1400);
  },

  flashHit() {
    this.hitFlashEl.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.hitFlashEl.classList.add('hidden');
    });
  },
};

const game = new Game(canvas, ui);

const menu = $('menu-screen');
$('start-btn').addEventListener('click', () => {
  sound.unlock();
  game.start();
  menu.classList.add('hidden');
});
$('resume-btn').addEventListener('click', () => {
  sound.unlock();
  game.resume();
});
$('restart-btn').addEventListener('click', () => {
  sound.unlock();
  game.restart();
});

const muteBtn = $('mute-btn');
const syncMute = () => {
  muteBtn.textContent = sound.muted ? 'SOUND OFF' : 'SOUND ON';
};
syncMute();
muteBtn.addEventListener('click', () => {
  sound.unlock();
  sound.toggleMute();
  syncMute();
});

window.addEventListener('resize', () => game.resize());
