/**
 * 主控制器：装配渲染循环、输入处理、HUD 更新与存档。
 */

import { createGame, loadGame, saveGame, clearSave, canBuild, placeBuilding, tickProduction, countBuildings } from './core/state.js';
import { TILE, TILE_INFO, BUILDINGS, RESOURCES, CHATTER } from './game/defs.js';
import { GRID_SIZE } from './game/island.js';
import { Renderer } from './render/renderer.js';
import { spawnBurst, spawnFloater, spawnRipple, updateEffects } from './render/effects.js';
import { playTone, setSound } from './ui/audio.js';
import { INK } from './render/palette.js';

const canvas = document.getElementById('board');
const renderer = new Renderer(canvas);
const state = loadGame() || createGame(Math.floor(Math.random() * 1e9));

const hud = {
  wood: document.getElementById('res-wood'),
  stone: document.getElementById('res-stone'),
  crystal: document.getElementById('res-crystal'),
  pop: document.getElementById('stat-pop'),
  buildings: document.getElementById('stat-buildings'),
  combo: document.getElementById('stat-combo'),
  hint: document.getElementById('hint'),
  toolbar: document.getElementById('toolbar'),
  reset: document.getElementById('btn-reset'),
  sound: document.getElementById('btn-sound'),
};

renderer.rebake(state);
setSound(state.sound);
buildToolbar();
refreshHud();
say('欢迎登岛！点空地盖房子，去林子和岩地采集。');

/* ---------- 交互 ---------- */

canvas.addEventListener('mousemove', (event) => {
  renderer.hover = renderer.clientToGrid(event.clientX, event.clientY);
});
canvas.addEventListener('mouseleave', () => {
  renderer.hover = null;
});

canvas.addEventListener('click', (event) => {
  const cell = renderer.clientToGrid(event.clientX, event.clientY);
  if (!cell) return;
  handleClick(cell);
});

function handleClick({ gx, gy, index }) {
  const tile = state.tiles[index];

  // 海洋：给涟漪反馈，明确区分可交互与不可交互区域。
  if (tile === TILE.DEEP_WATER || tile === TILE.SHALLOW) {
    spawnRipple(gx, gy, renderer.terrain ? 34 : 34);
    playTone('error');
    say('水太深啦，去岛上找空地吧。');
    return;
  }

  // 已有建筑：点击累计连击，是主要的人口增长来源。
  const building = state.buildings[index];
  if (building) {
    const def = BUILDINGS[building.type];
    state.combo += 1;
    state.comboTimer = 4;
    if (state.combo > state.bestCombo) state.bestCombo = state.combo;
    state.pops += state.combo;
    state.pop = state.totalPop + state.pops;
    state.lastEvent = `连击 x${state.combo}`;
    spawnBurst(gx, gy, 34, 'collect');
    spawnFloater(gx, gy, 34, `x${state.combo}`, '#ff2d78');
    playTone('pop');
    // 高连击额外奖励资源，激励玩家找准节奏连点。
    if (state.combo % 5 === 0) {
      const bonus = RESOURCES[def.produce ? Object.keys(def.produce)[0] : 'wood'];
      const res = Object.keys(def.produce)[0];
      state.resources[res] += 1;
      spawnFloater(gx, gy - 1, 34, `+1 ${bonus.icon}`, '#00c2e0');
    }
    refreshHud();
    return;
  }

  // 可建造空地
  if (tile === TILE.BUILDABLE) {
    const check = canBuild(state, index);
    if (!check.ok) {
      playTone('error');
      say(check.reason);
      return;
    }
    const building = placeBuilding(state, index);
    if (building) {
      state.totalPop += 1;
      state.pop = state.totalPop + state.pops;
      spawnBurst(gx, gy, 34, 'build');
      say(`${BUILDINGS[building.type].name} 落成！岛上人口 +1`);
      playTone('build');
      refreshHud();
      saveGame(state);
    }
    return;
  }

  // 林地与岩地：直接采集
  const info = TILE_INFO[tile];
  if (info && info.yields) {
    state.resources[info.yields] += 1;
    spawnBurst(gx, gy, 34, 'collect');
    spawnFloater(gx, gy, 34, RESOURCES[info.yields].icon, RESOURCES[info.yields].color);
    state.combo = 0;
    playTone('collect');
    refreshHud();
    return;
  }

  say('这块地不能建造，找带虚线框的空地。');
}

window.addEventListener('resize', () => renderer.resize());

/* ---------- 工具栏 ---------- */

function buildToolbar() {
  hud.toolbar.innerHTML = '';
  for (const def of Object.values(BUILDINGS)) {
    const button = document.createElement('button');
    button.className = 'build-btn';
    button.dataset.type = def.id;
    button.title = def.desc;
    button.innerHTML = `
      <span class="btn-emoji">${def.emoji}</span>
      <span class="btn-name">${def.name}</span>
      <span class="btn-cost">${Object.entries(def.cost)
        .map(([res, cost]) => `${RESOURCES[res].icon}${cost}`)
        .join(' ')}</span>
    `;
    button.addEventListener('click', () => {
      state.selected = def.id;
      playTone('pop');
      syncToolbar();
      refreshHud();
      saveGame(state);
    });
    hud.toolbar.appendChild(button);
  }
  syncToolbar();
}

function syncToolbar() {
  for (const button of hud.toolbar.querySelectorAll('.build-btn')) {
    button.classList.toggle('active', button.dataset.type === state.selected);
  }
}

hud.reset.addEventListener('click', () => {
  // 重开岛是不可逆操作（存档被覆盖），因此需要显式确认。
  const confirmed = window.confirm('确定要重新生成一座新岛吗？当前存档将被清除。');
  if (!confirmed) return;
  clearSave();
  window.location.reload();
});

hud.sound.addEventListener('click', () => {
  state.sound = !state.sound;
  setSound(state.sound);
  hud.sound.textContent = state.sound ? '🔊 音效开' : '🔇 音效关';
  saveGame(state);
  if (state.sound) playTone('pop');
});

/* ---------- HUD ---------- */

function refreshHud() {
  hud.wood.textContent = Math.floor(state.resources.wood);
  hud.stone.textContent = Math.floor(state.resources.stone);
  hud.crystal.textContent = Math.floor(state.resources.crystal);
  hud.pop.textContent = state.pop;
  hud.buildings.textContent = countBuildings(state);
  hud.combo.textContent = state.combo > 1 ? `x${state.combo}` : '-';
  hud.sound.textContent = state.sound ? '🔊 音效开' : '🔇 音效关';

  // 买不起的按钮置灰，降低误操作。
  const def = BUILDINGS[state.selected];
  const affordable = Object.entries(def.cost).every(([res, cost]) => state.resources[res] >= cost);
  for (const button of hud.toolbar.querySelectorAll('.build-btn')) {
    button.classList.toggle('unaffordable', button.dataset.type === state.selected && !affordable);
  }
}

function say(text) {
  hud.hint.textContent = text;
}

/* ---------- 主循环 ---------- */

let lastTime = performance.now();
let autosave = 0;

function frame(now) {
  const dt = now - lastTime;
  lastTime = now;

  tickProduction(state, dt / 1000);
  updateEffects(dt);
  renderer.render(state, dt);
  refreshHud();

  // 每 20 秒自动存档，防止意外关闭丢失进度。
  autosave += dt;
  if (autosave > 20000) {
    autosave = 0;
    saveGame(state);
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// 供自动化验收使用：暴露就绪标记与关键状态。
window.__ready = true;
window.__game = { state, renderer, GRID_SIZE, INK, CHATTER };