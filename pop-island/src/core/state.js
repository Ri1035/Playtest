/**
 * 游戏状态与存档。
 * 状态集中在此，避免散落在各模块；所有修改都要经过本文件导出的方法，
 * 这样存档与 UI 刷新只需挂钩一处。
 */

import { generateIsland, GRID_SIZE } from '../game/island.js';
import { TILE, BUILDINGS } from '../game/defs.js';

const STORAGE_KEY = 'pop-island-save-v1';

export function createGame(seed = 20261007) {
  const state = {
    seed,
    tiles: generateIsland(seed),
    /** buildings[i] = { type, tileIndex, level, timer } 或 null */
    buildings: new Array(GRID_SIZE * GRID_SIZE).fill(null),
    resources: { wood: 12, stone: 6, crystal: 0 },
    pop: 1,
    totalPop: 1,
    pops: 0,
    combo: 0,
    comboTimer: 0,
    bestCombo: 0,
    lastEvent: '',
    tick: 0,
    selected: 'HOUSE',
    sound: true,
  };
  return state;
}

export function saveGame(state) {
  try {
    const payload = {
      seed: state.seed,
      tiles: Array.from(state.tiles),
      buildings: state.buildings.map((b) => (b ? { ...b } : null)),
      resources: state.resources,
      pop: state.pop,
      totalPop: state.totalPop,
      pops: state.pops,
      bestCombo: state.bestCombo,
      selected: state.selected,
      sound: state.sound,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    // 隐私模式下 localStorage 可能抛异常，属于预期内情况，不打断游戏。
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data.seed !== 'number' || !Array.isArray(data.tiles)) return null;
    const state = createGame(data.seed);
    state.tiles = Uint8Array.from(data.tiles);
    state.buildings = data.buildings || new Array(GRID_SIZE * GRID_SIZE).fill(null);
    state.resources = { ...state.resources, ...(data.resources || {}) };
    state.pop = data.pop ?? 1;
    state.totalPop = data.totalPop ?? 1;
    state.pops = data.pops ?? 0;
    state.bestCombo = data.bestCombo ?? 0;
    state.selected = data.selected || 'HOUSE';
    state.sound = data.sound !== false;
    return state;
  } catch (err) {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    /* 忽略 */
  }
}

/** 检查某格是否满足建造条件。 */
export function canBuild(state, index) {
  const tile = state.tiles[index];
  if (tile !== TILE.BUILDABLE) return { ok: false, reason: '只能在空地上建造' };
  if (state.buildings[index]) return { ok: false, reason: '这格已经有建筑了' };
  const def = BUILDINGS[state.selected];
  for (const [res, cost] of Object.entries(def.cost)) {
    if ((state.resources[res] || 0) < cost) {
      return { ok: false, reason: `${res} 不够` };
    }
  }
  return { ok: true, reason: '' };
}

/** 扣料建造，成功返回建筑对象，失败返回 null。 */
export function placeBuilding(state, index) {
  const check = canBuild(state, index);
  if (!check.ok) return null;
  const def = BUILDINGS[state.selected];
  for (const [res, cost] of Object.entries(def.cost)) {
    state.resources[res] -= cost;
  }
  const building = { type: def.id, tileIndex: index, level: 1, timer: 0 };
  state.buildings[index] = building;
  return building;
}

/** 每帧推进资源产出。 */
export function tickProduction(state, dt) {
  state.tick += dt;
  // 每 2 秒结算一次，避免每帧写状态导致的性能抖动。
  if (state.tick < 2) return false;
  state.tick -= 2;

  let produced = false;
  for (const building of state.buildings) {
    if (!building) continue;
    const def = BUILDINGS[building.type];
    if (!def) continue;
    // 灯塔产出效率随等级提升，形成后期扩张动力。
    const multiplier = 1 + (building.level - 1) * 0.5;
    for (const [res, amount] of Object.entries(def.produce)) {
      state.resources[res] = (state.resources[res] || 0) + amount * multiplier;
      produced = true;
    }
  }
  if (state.comboTimer > 0) {
    state.comboTimer -= 2;
    if (state.comboTimer <= 0) state.combo = 0;
  }
  return produced;
}

/** 统计建筑总数。 */
export function countBuildings(state) {
  let total = 0;
  for (const b of state.buildings) if (b) total += 1;
  return total;
}