/**
 * Ben-Day 网点系统。
 *
 * 借用 1879 年商业印刷的机械网点工艺：不画渐变，用等大等距的圆点叠印
 * 制造出"看起来像灰色"的第二色。这是波普艺术最核心的视觉手段。
 *
 * 实现要点：图案在离屏 canvas 上烘焙一次，之后作为 CanvasPattern 反复填充，
 * 因此即使每帧绘制整片岛屿也不会有性能问题。
 */

import { INK } from './palette.js';

const cache = new Map();

/**
 * 生成一个网点图案。
 * @param {string} color 网点颜色
 * @param {number} radius 圆点半径（像素）
 * @param {number} spacing 点心间距（像素）
 * @param {string} [key] 缓存键，缺省时由参数自动拼接
 */
export function getDotPattern(ctx, color, radius, spacing, key) {
  const cacheKey = key || `${color}|${radius}|${spacing}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const cell = Math.max(2, Math.ceil(spacing));
  const tile = document.createElement('canvas');
  tile.width = cell;
  tile.height = cell;
  const tctx = tile.getContext('2d');

  // 错位排布：对角线方向的网点比正交排列更接近手工丝网印的质感。
  const offset = cell / 2;
  const points = [
    [offset, offset],
    [0, 0],
    [cell, 0],
    [0, cell],
    [cell, cell],
  ];
  tctx.fillStyle = color;
  for (const [x, y] of points) {
    tctx.beginPath();
    tctx.arc(x, y, radius, 0, Math.PI * 2);
    tctx.fill();
  }

  const pattern = ctx.createPattern(tile, 'repeat');
  cache.set(cacheKey, pattern);
  return pattern;
}

/** 平行斜线图案，用于水体或阴影的次级纹理。 */
export function getLinePattern(ctx, color, gap, width, angleDeg, key) {
  const cacheKey = key || `line|${color}|${gap}|${width}|${angleDeg}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const size = Math.max(4, Math.ceil(gap * 2));
  const tile = document.createElement('canvas');
  tile.width = size;
  tile.height = size;
  const tctx = tile.getContext('2d');
  tctx.strokeStyle = color;
  tctx.lineWidth = width;
  tctx.lineCap = 'square';

  const angle = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(angle) * size;
  const dy = Math.sin(angle) * size;

  // 画四条线，保证平铺后接缝处不断线。
  for (const sign of [1, -1]) {
    tctx.beginPath();
    tctx.moveTo(size / 2 - dx * sign, size / 2 - dy * sign);
    tctx.lineTo(size / 2 + dx * sign, size / 2 + dy * sign);
    tctx.stroke();
  }

  const pattern = ctx.createPattern(tile, 'repeat');
  cache.set(cacheKey, pattern);
  return pattern;
}

/**
 * 在给定区域内绘制网点覆盖层。
 * 波普配色的关键：网点层用 alpha 控制在 25%~55% 之间，
 * 低于 25% 看不见，高于 55% 就糊成实色，失去印刷质感。
 */
export function fillDots(ctx, x, y, w, h, pattern, alpha = 0.42) {
  if (!pattern) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = pattern;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** 漫画描边：波普风格的粗黑线是整个画面的骨架，不能省。 */
export function inkStroke(ctx, path, width = 3, color = INK) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  path();
  ctx.stroke();
  ctx.restore();
}