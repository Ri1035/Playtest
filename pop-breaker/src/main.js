// ===== 启动与 UI 桥接 =====
import { Engine } from './game/engine.js';
import { unlockAudio, setMuted, isMuted, sfx } from './game/audio.js';

const $ = (id) => document.getElementById(id);

const el = {
  hud: $('hud'),
  score: $('score'),
  combo: $('hud-combo'),
  level: $('level'),
  lives: $('lives'),
  best: $('best'),
  menuBest: $('menu-best'),
  finalScore: $('final-score'),
  finalBest: $('final-best'),
  finalLevel: $('final-level'),
  menu: $('menu'),
  gameover: $('gameover'),
  btnPause: $('btn-pause'),
  btnMute: $('btn-mute'),
};

const HEART = (x) =>
  `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 20 C4 13 2 8 6 5 C9 3 12 6 12 6 C12 6 15 3 18 5 C22 8 20 13 12 20 Z" fill="#ff3b30" stroke="#111" stroke-width="2.4"/></svg>`;

const ui = {
  setScore(n) {
    el.score.textContent = n;
  },
  setBest(n) {
    el.best.textContent = n;
    el.menuBest.textContent = `最高分 ${n}`;
    el.menuBest.classList.remove('hidden');
  },
  setLives(n) {
    el.lives.innerHTML = Array.from({ length: n }, (_, i) => HEART(i)).join('');
  },
  setLevel(n) {
    el.level.textContent = n;
  },
  setCombo(visible, text) {
    el.combo.classList.toggle('hidden', !visible);
    if (visible) el.combo.textContent = text;
  },
  showPlay() {
    el.menu.classList.add('hidden');
    el.gameover.classList.add('hidden');
    el.hud.classList.remove('hidden');
  },
  showMenu() {
    el.hud.classList.add('hidden');
    el.gameover.classList.add('hidden');
    el.menu.classList.remove('hidden');
  },
  showGameOver(score, best, level) {
    el.finalScore.textContent = score;
    el.finalBest.textContent = score >= best ? '新纪录！' : `最高分 ${best}`;
    el.finalBest.classList.remove('hidden');
    el.finalLevel.textContent = `到达第 ${level} 关`;
    el.hud.classList.add('hidden');
    el.menu.classList.add('hidden');
    el.gameover.classList.remove('hidden');
  },
  showPause(paused) {
    el.btnPause.textContent = paused ? '▶' : 'II';
  },
  toggleMute() {
    setMuted(!isMuted());
    el.btnMute.textContent = isMuted() ? '×' : '♪';
    return isMuted();
  },
};

const canvas = $('game');
const engine = new Engine(canvas, ui);
engine.unlock = unlockAudio;

// 按钮
$('btn-start').addEventListener('click', () => {
  unlockAudio();
  sfx.click();
  engine.start();
});
$('btn-again').addEventListener('click', () => {
  unlockAudio();
  sfx.click();
  engine.start();
});
$('btn-menu').addEventListener('click', () => {
  sfx.click();
  engine.toMenu();
});
el.btnPause.addEventListener('click', () => engine.togglePause());
el.btnMute.addEventListener('click', () => engine.toggleMute());

// 画布适配容器宽度（内部逻辑分辨率固定 960×640）
function fitCanvas() {
  const wrap = document.getElementById('app');
  const maxW = Math.min(window.innerWidth - 16, 960);
  canvas.style.width = `${maxW}px`;
  canvas.style.height = `${(maxW * 640) / 960}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();
