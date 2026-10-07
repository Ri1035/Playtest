/**
 * 地形与建筑绘制。
 *
 * 性能策略：地形是静态的，烘焙到一张离屏 canvas 上，每帧只 blit 一次；
 * 建筑数量少且需要动画，单独逐个绘制。
 */

import { TILE, BUILDINGS } from '../game/defs.js';
import { TERRAIN_COLORS, INK, SWATCH } from './palette.js';
import { getDotPattern, getLinePattern, fillDots } from './patterns.js';
import { GRID_SIZE } from '../game/island.js';

const TILE_PX = 34;

/** 把整片地形烘焙成一张离屏图。 */
export function bakeTerrain(state, tilePx = TILE_PX) {
  const size = GRID_SIZE * tilePx;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 底：深海网点
  ctx.fillStyle = TERRAIN_COLORS.water.base;
  ctx.fillRect(0, 0, size, size);
  fillDots(ctx, 0, 0, size, size, getDotPattern(ctx, TERRAIN_COLORS.water.dot, 2.6, 9, 'sea-dots'), 0.55);
  // 波普水波：粗白线，间距均匀，避免写实。
  fillDots(
    ctx,
    0,
    0,
    size,
    size,
    getLinePattern(ctx, TERRAIN_COLORS.water.foam, 18, 2.5, -20, 'sea-lines'),
    0.32,
  );

  // 先收集所有非水格子，再绘制，保证陆地在水之上。
  const isLand = (x, y) => {
    if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return false;
    const t = state.tiles[y * GRID_SIZE + x];
    return t !== TILE.DEEP_WATER && t !== TILE.SHALLOW;
  };
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const tile = state.tiles[y * GRID_SIZE + x];
      if (tile === TILE.DEEP_WATER || tile === TILE.SHALLOW) continue;
      drawLandTile(ctx, x, y, tile, tilePx, isLand);
    }
  }
  return canvas;
}

function drawLandTile(ctx, gx, gy, tile, tilePx, isLand) {
  const px = gx * tilePx;
  const py = gy * tilePx;
  const colors = colorForTile(tile, gx, gy);
  const key = `tile-${tile}`;

  ctx.save();
  // 波普平涂：无渐变，直接铺满主色。
  ctx.fillStyle = colors.base;
  ctx.fillRect(px, py, tilePx, tilePx);
  // 网点层制造第二色。
  fillDots(ctx, px, py, tilePx, tilePx, getDotPattern(ctx, colors.dot, 2.3, 8, key), 0.62);
  // 极细内描边，强调格子结构。
  ctx.strokeStyle = 'rgba(20,20,20,0.22)';
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, tilePx - 1, tilePx - 1);

  ctx.restore();

  // 沙滩/浅水交界画泡沫线，是这类游戏读图的关键线索。
  if (tile === TILE.SAND) drawFoamEdge(ctx, gx, gy, tilePx, isLand);
  drawTileDecor(ctx, gx, gy, tile, tilePx, colors);
}

function colorForTile(tile, gx = 0, gy = 0) {
  switch (tile) {
    case TILE.SAND:
      return TERRAIN_COLORS.sand;
    case TILE.GRASS:
      // 交错使用两种草地色，靠网点区分出大片草地的层次，
      // 否则 22x22 的连续草地会显得像一张色卡。
      return (gx + gy) % 2 === 0 ? TERRAIN_COLORS.grass : TERRAIN_COLORS.grassAlt;
    case TILE.FOREST:
      return TERRAIN_COLORS.forest;
    case TILE.ROCK:
      return TERRAIN_COLORS.rock;
    case TILE.BUILDABLE:
      return TERRAIN_COLORS.build;
    case TILE.SHALLOW:
      return TERRAIN_COLORS.water;
    default:
      return TERRAIN_COLORS.water;
  }
}

function drawFoamEdge(ctx, gx, gy, tilePx, isLand) {
  const px = gx * tilePx;
  const py = gy * tilePx;
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const wobble = 4;
  const offsets = [
    [-1, 0, px, py + wobble, px, py - wobble],
    [1, 0, px + tilePx, py + wobble, px + tilePx, py - wobble],
    [0, -1, px + wobble, py, px - wobble, py],
    [0, 1, px + wobble, py + tilePx, px - wobble, py + tilePx],
  ];
  for (const [ox, oy, x1, y1, x2, y2] of offsets) {
    const nx = gx + ox;
    const ny = gy + oy;
    if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) continue;
    if (isLand(nx, ny)) continue; // 只在水的一侧画
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}

/** 每种地形的专属装饰物，让同色格子之间也能一眼区分。 */
function drawTileDecor(ctx, gx, gy, tile, tilePx, colors) {
  const cx = gx * tilePx + tilePx / 2;
  const cy = gy * tilePx + tilePx / 2;
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  if (tile === TILE.FOREST) {
    // 三棵高低不一的松树，顶端带网点。
    const spots = [
      [cx - 7, cy + 3, 1],
      [cx + 6, cy + 4, 0.85],
      [cx + 1, cy - 5, 1.1],
    ];
    for (const [sx, sy, scale] of spots) {
      const h = 16 * scale;
      const w = 11 * scale;
      ctx.fillStyle = SWATCH.greenDeep;
      ctx.beginPath();
      ctx.moveTo(sx, sy - h);
      ctx.lineTo(sx + w, sy + 2);
      ctx.lineTo(sx - w, sy + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = SWATCH.brownDeep;
      ctx.fillRect(sx - 1.5, sy + 1, 3, 5);
    }
  } else if (tile === TILE.ROCK) {
    ctx.fillStyle = colors.dot;
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy + 8);
    ctx.lineTo(cx - 4, cy - 8);
    ctx.lineTo(cx + 5, cy + 1);
    ctx.lineTo(cx + 12, cy - 6);
    ctx.lineTo(cx + 12, cy + 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (tile === TILE.BUILDABLE) {
    // 空地必须一眼可辨：淡暖底 + 粗虚线框 + 中心十字定位标。
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(gx * tilePx + 6, gy * tilePx + 6, tilePx - 12, tilePx - 12);
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy);
    ctx.lineTo(cx + 5, cy);
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx, cy + 5);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** 绘制一座建筑，带轻微的呼吸缩放动画。 */
export function drawBuilding(ctx, building, gx, gy, tilePx, time) {
  const def = BUILDINGS[building.type];
  if (!def) return;
  const cx = gx * tilePx + tilePx / 2;
  const cy = gy * tilePx + tilePx / 2;

  ctx.save();
  ctx.translate(cx, cy);
  // 波普式"跳动"：正弦缩放而非缓动，模仿漫画的抖动感。
  const bounce = 1 + Math.sin(time / 320 + gx * 0.7 + gy * 0.5) * 0.035;
  ctx.scale(bounce, bounce);

  // 影子：波普不用柔和投影，用硬边椭圆。
  ctx.fillStyle = 'rgba(20,20,20,0.22)';
  ctx.beginPath();
  ctx.ellipse(0, tilePx * 0.34, tilePx * 0.34, tilePx * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';

  switch (building.type) {
    case 'HOUSE':
      drawHouse(ctx, tilePx);
      break;
    case 'MILL':
      drawMill(ctx, tilePx, time);
      break;
    case 'QUARRY':
      drawQuarry(ctx, tilePx);
      break;
    case 'REFINERY':
      drawRefinery(ctx, tilePx, time);
      break;
    case 'TOWER':
      drawTower(ctx, tilePx, time);
      break;
    default:
      break;
  }
  ctx.restore();
}

function drawHouse(ctx, s) {
  // 墙体：柠檬黄平涂 + 网点
  ctx.fillStyle = SWATCH.yellow;
  ctx.fillRect(-s * 0.28, -s * 0.06, s * 0.56, s * 0.36);
  ctx.strokeRect(-s * 0.28, -s * 0.06, s * 0.56, s * 0.36);
  // 屋顶：洋红三角
  ctx.fillStyle = SWATCH.magenta;
  ctx.beginPath();
  ctx.moveTo(-s * 0.36, -s * 0.06);
  ctx.lineTo(0, -s * 0.42);
  ctx.lineTo(s * 0.36, -s * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 门
  ctx.fillStyle = INK;
  ctx.fillRect(-s * 0.07, s * 0.1, s * 0.14, s * 0.2);
}

function drawMill(ctx, s, time) {
  ctx.fillStyle = SWATCH.cyan;
  ctx.fillRect(-s * 0.18, -s * 0.1, s * 0.36, s * 0.4);
  ctx.strokeRect(-s * 0.18, -s * 0.1, s * 0.36, s * 0.4);
  // 叶片：红白相间，直角拼色
  ctx.save();
  ctx.translate(0, -s * 0.16);
  ctx.rotate((time / 900) % (Math.PI * 2));
  for (let i = 0; i < 4; i += 1) {
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = i % 2 === 0 ? SWATCH.magenta : SWATCH.white;
    ctx.fillRect(0, -s * 0.42, s * 0.1, s * 0.38);
    ctx.strokeRect(0, -s * 0.42, s * 0.1, s * 0.38);
  }
  ctx.restore();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(0, -s * 0.16, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawQuarry(ctx, s) {
  ctx.fillStyle = SWATCH.orange;
  ctx.beginPath();
  ctx.moveTo(-s * 0.3, s * 0.3);
  ctx.lineTo(-s * 0.3, -s * 0.14);
  ctx.lineTo(0, -s * 0.32);
  ctx.lineTo(s * 0.3, -s * 0.14);
  ctx.lineTo(s * 0.3, s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 开采面：斜线纹理
  ctx.save();
  ctx.beginPath();
  ctx.rect(-s * 0.26, s * 0.02, s * 0.52, s * 0.24);
  ctx.clip();
  ctx.strokeStyle = SWATCH.black;
  ctx.lineWidth = 1.5;
  for (let i = -8; i < 12; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 5, s * 0.3);
    ctx.lineTo(i * 5 + s * 0.3, -s * 0.02);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRefinery(ctx, s, time) {
  // 罐体
  ctx.fillStyle = SWATCH.purple;
  ctx.fillRect(-s * 0.24, -s * 0.08, s * 0.48, s * 0.38);
  ctx.strokeRect(-s * 0.24, -s * 0.08, s * 0.48, s * 0.38);
  // 烟囱
  ctx.fillStyle = SWATCH.magenta;
  ctx.fillRect(s * 0.04, -s * 0.38, s * 0.1, s * 0.3);
  ctx.strokeRect(s * 0.04, -s * 0.38, s * 0.1, s * 0.3);
  // 泡泡：上升的方块，代替写实烟雾
  const rise = (time / 12) % 34;
  ctx.fillStyle = SWATCH.cyan;
  for (let i = 0; i < 3; i += 1) {
    const y = -s * 0.38 - rise - i * 9;
    if (y < -s * 0.5) continue;
    ctx.fillRect(s * 0.06 + i * 2, y, 6 - i, 6 - i);
  }
  // 观察窗
  ctx.fillStyle = SWATCH.cyan;
  ctx.fillRect(-s * 0.18, s * 0.02, s * 0.14, s * 0.12);
  ctx.strokeRect(-s * 0.18, s * 0.02, s * 0.14, s * 0.12);
}

function drawTower(ctx, s, time) {
  // 塔身：上窄下宽的梯形
  ctx.fillStyle = SWATCH.white;
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, -s * 0.24);
  ctx.lineTo(s * 0.1, -s * 0.24);
  ctx.lineTo(s * 0.2, s * 0.3);
  ctx.lineTo(-s * 0.2, s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 红白横条
  ctx.save();
  ctx.clip();
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? SWATCH.magenta : SWATCH.white;
    ctx.fillRect(-s * 0.24, -s * 0.22 + i * s * 0.14, s * 0.48, s * 0.07);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, -s * 0.24);
  ctx.lineTo(s * 0.1, -s * 0.24);
  ctx.lineTo(s * 0.2, s * 0.3);
  ctx.lineTo(-s * 0.2, s * 0.3);
  ctx.closePath();
  ctx.stroke();
  // 灯室与旋转光束
  ctx.fillStyle = SWATCH.yellow;
  ctx.fillRect(-s * 0.13, -s * 0.36, s * 0.26, s * 0.13);
  ctx.strokeRect(-s * 0.13, -s * 0.36, s * 0.26, s * 0.13);
  const beam = ((time / 1100) % (Math.PI * 2));
  ctx.save();
  ctx.translate(0, -s * 0.3);
  ctx.rotate(beam);
  ctx.fillStyle = 'rgba(255,212,0,0.35)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(s * 0.7, -s * 0.12);
  ctx.lineTo(s * 0.7, s * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export { TILE_PX };