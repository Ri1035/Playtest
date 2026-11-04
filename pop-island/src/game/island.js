/**
 * 岛屿生成。
 * 用分形噪声决定海岸线形状与植被分布，避免出现"一个圆加一圈沙"这类
 * 一眼就能看出来的程序化痕迹。
 */

import { TILE } from './defs.js';
import { createRng, createFbm, weightedPick } from '../core/rng.js';

export const GRID_SIZE = 22;

/** 生成一张完整的地形网格。 */
export function generateIsland(seed) {
  const rng = createRng(seed);
  const fbm = createFbm(rng, 5, 0.52);
  const detail = createFbm(rng, 3, 0.6);
  const tiles = new Uint8Array(GRID_SIZE * GRID_SIZE);
  const center = (GRID_SIZE - 1) / 2;

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const idx = y * GRID_SIZE + x;
      // 径向衰减：越靠中心越高，形成天然穹形岛体。
      const dx = (x - center) / center;
      const dy = (y - center) / center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const warp = fbm(x * 0.14, y * 0.14);
      const height = (1 - dist) * 1.45 + (warp - 0.5) * 0.95;

      if (height < 0.02) {
        tiles[idx] = TILE.DEEP_WATER;
      } else if (height < 0.16) {
        tiles[idx] = TILE.SHALLOW;
      } else if (height < 0.3) {
        tiles[idx] = TILE.SAND;
      } else if (height < 0.62) {
        tiles[idx] = TILE.GRASS;
      } else {
        // 高地区域按细节噪声细分岩地与森林。
        const alt = detail(x * 0.22, y * 0.22);
        tiles[idx] = alt > 0.58 ? TILE.ROCK : TILE.FOREST;
      }
    }
  }

  smoothTerrain(tiles);
  // 草地上开出一片可建造的空地，作为玩家的起始落点。
  carveStarterArea(tiles, rng);
  return tiles;
}

/** 轻量 cellular 噪声平滑：随机把边缘格与其邻居交换，消除锯齿。 */
function smoothTerrain(tiles) {
  for (let pass = 0; pass < 3; pass += 1) {
    const snapshot = tiles.slice();
    for (let y = 1; y < GRID_SIZE - 1; y += 1) {
      for (let x = 1; x < GRID_SIZE - 1; x += 1) {
        const idx = y * GRID_SIZE + x;
        const here = snapshot[idx];
        const neighbors = [
          snapshot[idx - 1],
          snapshot[idx + 1],
          snapshot[idx - GRID_SIZE],
          snapshot[idx + GRID_SIZE],
        ];
        const counts = new Map();
        for (const n of neighbors) counts.set(n, (counts.get(n) || 0) + 1);
        let best = here;
        let bestCount = 0;
        for (const [tile, count] of counts) {
          if (count > bestCount) {
            bestCount = count;
            best = tile;
          }
        }
        tiles[idx] = bestCount >= 3 ? best : here;
      }
    }
  }
}

/** 在岛屿质心附近挖出一块 3x3 的可建造空地。 */
function carveStarterArea(tiles, rng) {
  const candidates = [];
  for (let y = 2; y < GRID_SIZE - 2; y += 1) {
    for (let x = 2; x < GRID_SIZE - 2; x += 1) {
      const idx = y * GRID_SIZE + x;
      if (tiles[idx] !== TILE.GRASS && tiles[idx] !== TILE.FOREST) continue;
      // 要求周围一圈也是陆地，保证这块地不会被水切成孤岛。
      let landCount = 0;
      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          const t = tiles[(y + oy) * GRID_SIZE + (x + ox)];
          if (t === TILE.GRASS || t === TILE.FOREST || t === TILE.ROCK) landCount += 1;
        }
      }
      if (landCount === 9) candidates.push({ x, y });
    }
  }
  if (candidates.length === 0) return;
  const spot = candidates[Math.floor(rng() * candidates.length)];
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      tiles[(spot.y + oy) * GRID_SIZE + (spot.x + ox)] = TILE.BUILDABLE;
    }
  }
}

/** 统计各类地形数量，供 HUD 与平衡性校验使用。 */
export function countTiles(tiles) {
  const counts = {};
  for (const tile of tiles) {
    counts[tile] = (counts[tile] || 0) + 1;
  }
  return counts;
}