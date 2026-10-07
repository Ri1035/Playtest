/**
 * 渲染调度：负责清屏、blit 烘焙地形、绘制建筑与特效、绘制悬停高亮。
 */

import { GRID_SIZE } from '../game/island.js';
import { TILE_PX, bakeTerrain, drawBuilding } from './sprites.js';
import { drawEffects } from './effects.js';
import { canBuild } from '../core/state.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.terrain = null;
    this.hover = null;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.time = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
  }

  /** 地形变化时重新烘焙（新建岛屿、加载存档时调用）。 */
  rebake(state) {
    this.terrain = bakeTerrain(state, TILE_PX);
    this.resize();
  }

  resize() {
    const boardPx = GRID_SIZE * TILE_PX;
    const availableW = this.canvas.clientWidth;
    const availableH = this.canvas.clientHeight;
    this.scale = Math.min(availableW / boardPx, availableH / boardPx, 1.35);
    // 保证留出边距，避免岛屿贴边。
    this.scale = Math.max(this.scale * 0.94, 0.4);

    const renderW = Math.round(availableW * this.dpr);
    const renderH = Math.round(availableH * this.dpr);
    if (this.canvas.width !== renderW || this.canvas.height !== renderH) {
      this.canvas.width = renderW;
      this.canvas.height = renderH;
    }
    this.offsetX = (availableW - boardPx * this.scale) / 2;
    this.offsetY = (availableH - boardPx * this.scale) / 2;
  }

  /** 屏幕坐标 → 格子坐标，超出边界返回 null。 */
  clientToGrid(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (clientX - rect.left - this.offsetX) / this.scale;
    const y = (clientY - rect.top - this.offsetY) / this.scale;
    const gx = Math.floor(x / TILE_PX);
    const gy = Math.floor(y / TILE_PX);
    if (gx < 0 || gy < 0 || gx >= GRID_SIZE || gy >= GRID_SIZE) return null;
    return { gx, gy, index: gy * GRID_SIZE + gx };
  }

  render(state, dt) {
    this.time += dt;
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

    // 舞台背景：奶油纸色 + 斜线网点，呼应印刷品
    ctx.fillStyle = '#fff6e9';
    ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    if (this.terrain) ctx.drawImage(this.terrain, 0, 0);

    drawHover(ctx, this.hover, state);
    for (const building of state.buildings) {
      if (!building) continue;
      drawBuilding(ctx, building, building.tileIndex % GRID_SIZE, Math.floor(building.tileIndex / GRID_SIZE), TILE_PX, this.time);
    }
    drawEffects(ctx);
    ctx.restore();
    ctx.restore();
  }
}

/** 悬停格：可建造显示青色，否则显示禁止标记。 */
function drawHover(ctx, hover, state) {
  if (!hover) return;
  const x = hover.gx * TILE_PX;
  const y = hover.gy * TILE_PX;
  const valid = canBuild(state, hover.index).ok;

  ctx.save();
  ctx.strokeStyle = valid ? '#00c2e0' : '#ff2d78';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(x + 1.5, y + 1.5, TILE_PX - 3, TILE_PX - 3);
  ctx.setLineDash([]);

  if (!valid && !state.buildings[hover.index]) {
    // 画一个粗黑叉，明确表达"这里不行"
    ctx.strokeStyle = '#ff2d78';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 10);
    ctx.lineTo(x + TILE_PX - 10, y + TILE_PX - 10);
    ctx.moveTo(x + TILE_PX - 10, y + 10);
    ctx.lineTo(x + 10, y + TILE_PX - 10);
    ctx.stroke();
  }
  ctx.restore();
}