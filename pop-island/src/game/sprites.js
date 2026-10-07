/**
 * 精灵绘制库：全部角色/物品/装饰均为程序化 Canvas 绘制，
 * 统一波普语言 —— 粗黑描边、纯色填充、网点(half-tone)、硬投影。
 */

export const FONT = '"Impact","Arial Black","PingFang SC","Microsoft YaHei",sans-serif';

/** 关卡调色板，随等级循环切换 */
export const PALETTES = [
  { sea: '#2B7AFF', seaDot: '#8FC0FF', sand: '#FFC93C', sandLight: '#FFE08A', grass: '#2A9D4E', grassDot: '#7FD18F', body: '#FF3B30', hair: '#FFC93C', face: '#FFF4E0', accent: '#FFE066' },
  { sea: '#00B4C8', seaDot: '#9BE8F0', sand: '#FF9F1C', sandLight: '#FFD18A', grass: '#0FA958', grassDot: '#7FD9A0', body: '#E71D36', hair: '#F5B700', face: '#FFF4E0', accent: '#FFD166' },
  { sea: '#8338EC', seaDot: '#C3A6FF', sand: '#FFD166', sandLight: '#FFEDB0', grass: '#06D6A0', grassDot: '#8CE8C8', body: '#EF476F', hair: '#FFD166', face: '#FFF4E0', accent: '#FF9F1C' },
  { sea: '#2B2B2B', seaDot: '#5C5C5C', sand: '#F4F1DE', sandLight: '#FFFFFF', grass: '#6A994E', grassDot: '#A7C957', body: '#FF3B30', hair: '#FFD166', face: '#FFF4E0', accent: '#FFE066' },
];

const INK = '#111111';

/** 以路径填充+粗描边绘制 */
export function outlineShape(ctx, pathFn, fill, lw = 4) {
  ctx.save();
  ctx.beginPath();
  pathFn();
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();
}

/** 五角星路径 */
export function starPath(ctx, x, y, R, r, points = 5, rot = -Math.PI / 2) {
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = rot + (i * Math.PI) / points;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
}

/** 在矩形区域内绘制确定性网点（坐标决定偏移，稳定不闪烁） */
export function halftoneRect(ctx, x, y, w, h, dotR, step, color) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = color;
  const seed = Math.floor(x / step) + Math.floor(y / step) * 7;
  for (let gx = x - step; gx < x + w + step; gx += step) {
    for (let gy = y - step; gy < y + h + step; gy += step) {
      const px = gx + ((seed + gy * 3 + gx * 5) % 7) - 3;
      const py = gy + ((seed + gx * 2 + gy * 7) % 5) - 2;
      ctx.beginPath();
      ctx.arc(px, py, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** 波普漫画文字：黑色粗描边 + 纯色填充 */
export function popText(ctx, text, x, y, size, color, align = 'center') {
  ctx.save();
  ctx.font = `900 ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(3, size * 0.18);
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/* ================= 收集品（分值物品） ================= */

function drawStarItem(ctx, x, y, s) {
  outlineShape(
    ctx,
    () => starPath(ctx, x, y, 17 * s, 7.5 * s, 5),
    '#FFD166',
    4 * s
  );
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(x - 5 * s, y - 6 * s, 2.4 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawCherry(ctx, x, y, s) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  ctx.moveTo(x, y - 6 * s);
  ctx.quadraticCurveTo(x + 8 * s, y - 18 * s, x + 16 * s, y - 14 * s);
  ctx.stroke();
  // 叶子
  ctx.fillStyle = '#2A9D4E';
  ctx.beginPath();
  ctx.ellipse(x + 16 * s, y - 14 * s, 6 * s, 3 * s, -0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2 * s;
  ctx.stroke();
  outlineShape(ctx, () => { ctx.arc(x - 8 * s, y + 4 * s, 9 * s, 0, Math.PI * 2); }, '#EF476F', 4 * s);
  outlineShape(ctx, () => { ctx.arc(x + 8 * s, y + 4 * s, 9 * s, 0, Math.PI * 2); }, '#EF476F', 4 * s);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(x - 11 * s, y + 1 * s, 2.6 * s, 0, Math.PI * 2);
  ctx.arc(x + 5 * s, y + 1 * s, 2.6 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawBanana(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.5);
  ctx.beginPath();
  ctx.arc(0, 0, 15 * s, Math.PI * 0.15, Math.PI * 0.9);
  ctx.arc(0, 0, 8 * s, Math.PI * 0.9, Math.PI * 0.15, true);
  ctx.closePath();
  ctx.fillStyle = '#FFD166';
  ctx.fill();
  ctx.lineWidth = 4 * s;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.fillStyle = '#B26A00';
  ctx.beginPath();
  ctx.arc(12 * s, -9 * s, 2.6 * s, 0, Math.PI * 2);
  ctx.arc(-2 * s, 12 * s, 2.6 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLips(ctx, x, y, s) {
  outlineShape(ctx, () => { ctx.arc(x - 8 * s, y - 3 * s, 9 * s, 0, Math.PI * 2); }, '#EF476F', 4 * s);
  outlineShape(ctx, () => { ctx.arc(x + 8 * s, y - 3 * s, 9 * s, 0, Math.PI * 2); }, '#EF476F', 4 * s);
  outlineShape(ctx, () => { ctx.arc(x, y + 3 * s, 12 * s, 0, Math.PI); }, '#EF476F', 4 * s);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  ctx.moveTo(x, y + 3 * s);
  ctx.lineTo(x, y - 8 * s);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(x - 11 * s, y - 6 * s, 2.4 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlowerItem(ctx, x, y, s) {
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    outlineShape(
      ctx,
      () => {
        ctx.ellipse(x + Math.cos(a) * 11 * s, y + Math.sin(a) * 11 * s, 7 * s, 4.4 * s, a, 0, Math.PI * 2);
      },
      i % 2 === 0 ? '#F78C6B' : '#FFD166',
      3.4 * s
    );
  }
  outlineShape(ctx, () => { ctx.arc(x, y, 6.5 * s, 0, Math.PI * 2); }, '#FFF4E0', 3.4 * s);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(x, y, 2 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawSoda(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  outlineShape(ctx, () => { ctx.roundRect(-9 * s, -13 * s, 18 * s, 26 * s, 4 * s); }, '#E8E8E8', 3.6 * s);
  ctx.fillStyle = '#FF3B30';
  ctx.fillRect(-9 * s, -13 * s, 18 * s, 8 * s);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2 * s;
  ctx.strokeRect(-9 * s, -13 * s, 18 * s, 8 * s);
  ctx.font = `900 ${7.5 * s}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FF3B30';
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 1.6 * s;
  ctx.strokeText('POP', 0, -8 * s);
  ctx.fillText('POP', 0, -8 * s);
  ctx.beginPath();
  ctx.ellipse(0, 6 * s, 5 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#B9B9B9';
  ctx.fill();
  ctx.lineWidth = 1.8 * s;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();
}

function drawDonut(ctx, x, y, s) {
  outlineShape(ctx, () => { ctx.arc(x, y, 14 * s, 0, Math.PI * 2); }, '#F9A8D4', 4 * s);
  outlineShape(ctx, () => { ctx.arc(x, y, 5.2 * s, 0, Math.PI * 2); }, '#FFE08A', 3.4 * s);
  const colors = ['#FFD166', '#8338EC', '#2A9D4E', '#FF3B30'];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const r = 9.6 * s;
    ctx.strokeStyle = colors[i % colors.length];
    ctx.lineWidth = 2.2 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * (r - 2.4 * s), y + Math.sin(a) * (r - 2.4 * s));
    ctx.lineTo(x + Math.cos(a) * (r + 2.4 * s), y + Math.sin(a) * (r + 2.4 * s));
    ctx.stroke();
  }
}

function drawCone(ctx, x, y, s) {
  outlineShape(
    ctx,
    () => {
      ctx.moveTo(x, y + 12 * s);
      ctx.lineTo(x - 10 * s, y - 8 * s);
      ctx.lineTo(x + 10 * s, y - 8 * s);
    },
    '#E8C07A',
    3.6 * s
  );
  ctx.strokeStyle = '#B26A00';
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  ctx.moveTo(x - 5 * s, y + 5 * s);
  ctx.lineTo(x + 5 * s, y - 3 * s);
  ctx.moveTo(x + 3 * s, y + 7 * s);
  ctx.lineTo(x + 8 * s, y + 1 * s);
  ctx.stroke();
  outlineShape(ctx, () => { ctx.arc(x, y - 9 * s, 8.6 * s, 0, Math.PI * 2); }, '#F4A261', 3.6 * s);
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(x - 3 * s, y - 12 * s, 2 * s, 0, Math.PI * 2);
  ctx.fill();
}

/** 分值物品注册表：id -> 半径/分值/颜色/绘制函数 */
export const ITEMS = {
  star: { r: 22, worth: 10, color: '#FFD166', draw: drawStarItem },
  cherry: { r: 20, worth: 10, color: '#EF476F', draw: drawCherry },
  banana: { r: 20, worth: 10, color: '#FFD166', draw: drawBanana },
  lips: { r: 20, worth: 10, color: '#EF476F', draw: drawLips },
  flower: { r: 22, worth: 10, color: '#F78C6B', draw: drawFlowerItem },
  soda: { r: 22, worth: 15, color: '#E8E8E8', draw: drawSoda },
  donut: { r: 20, worth: 15, color: '#F9A8D4', draw: drawDonut },
  cone: { r: 20, worth: 15, color: '#F4A261', draw: drawCone },
};

/* ================= 道具 ================= */

function drawMagnet(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#FF3B30';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.6 * s;
  ctx.beginPath();
  ctx.rect(-10 * s, -12 * s, 8 * s, 16 * s);
  ctx.rect(2 * s, -12 * s, 8 * s, 16 * s);
  ctx.arc(0, 0, 10 * s, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#E8E8E8';
  ctx.fillRect(-10 * s, -12 * s, 8 * s, 5 * s);
  ctx.fillRect(2 * s, -12 * s, 8 * s, 5 * s);
  ctx.strokeRect(-10 * s, -12 * s, 8 * s, 5 * s);
  ctx.strokeRect(2 * s, -12 * s, 8 * s, 5 * s);
  ctx.restore();
}

function drawClock(ctx, x, y, s) {
  outlineShape(ctx, () => { ctx.arc(x, y, 13 * s, 0, Math.PI * 2); }, '#00B4C8', 4 * s);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 7 * s);
  ctx.moveTo(x, y);
  ctx.lineTo(x + 5.6 * s, y + 3 * s);
  ctx.stroke();
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(x, y, 1.6 * s, 0, Math.PI * 2);
  ctx.fill();
}

/** 道具注册表：id -> 半径/持续时长/绘制函数 */
export const POWERUPS = {
  magnet: { r: 24, dur: 5, color: '#8338EC', draw: drawMagnet },
  freeze: { r: 24, dur: 4, color: '#00B4C8', draw: drawClock },
};

/* ================= 角色与敌人 ================= */

export function drawPlayer(ctx, x, y, time, pal) {
  // 影子
  ctx.fillStyle = 'rgba(17,17,17,0.22)';
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);

  // 身体
  outlineShape(ctx, () => { ctx.arc(0, 0, 20, 0, Math.PI * 2); }, pal.body, 5);

  // 头发（上半圆）
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 17, Math.PI * 1.05, Math.PI * 1.95);
  ctx.closePath();
  ctx.fillStyle = pal.hair;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();

  // 脸
  outlineShape(ctx, () => { ctx.arc(0, 4, 12.5, 0, Math.PI * 2); }, pal.face, 3.5);

  // 眼睛（看向移动方向）
  const look = Math.sin(time * 3) * 0; // 眼睛静态，简化
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(-4.5, 2.5, 4.2, 0, Math.PI * 2);
  ctx.arc(4.5, 2.5, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-4.5, 2.5, 2.1, 0, Math.PI * 2);
  ctx.arc(4.5, 2.5, 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(-3.9, 1.9, 0.7, 0, Math.PI * 2);
  ctx.arc(5.1, 1.9, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // 微笑
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 4.5, 5.4, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  // 腮红
  ctx.fillStyle = 'rgba(255,59,48,0.55)';
  ctx.beginPath();
  ctx.arc(-8.6, 6.4, 2.2, 0, Math.PI * 2);
  ctx.arc(8.6, 6.4, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawGull(ctx, x, y, flap, dir, bodyColor = '#FFF') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);

  // 影子
  ctx.fillStyle = 'rgba(17,17,17,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 身体
  outlineShape(ctx, () => { ctx.ellipse(0, 2, 14, 10, 0, 0, Math.PI * 2); }, bodyColor, 4);
  // 头
  outlineShape(ctx, () => { ctx.arc(12, -4, 8, 0, Math.PI * 2); }, bodyColor, 4);
  // 喙
  ctx.fillStyle = '#FF8C00';
  ctx.beginPath();
  ctx.moveTo(19, -5);
  ctx.lineTo(26, -3);
  ctx.lineTo(19, -1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();
  // 眼睛
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(13, -6, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // 翅膀
  ctx.save();
  ctx.translate(-3, 0);
  ctx.rotate(Math.sin(flap) * 0.5);
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(-8, 4, 9, 5, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.restore();
  // 尾羽
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-13, 2);
  ctx.lineTo(-20, -3);
  ctx.lineTo(-18, 5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  ctx.restore();
}

/* ================= 静态装饰 ================= */

export function drawPalm(ctx, x, y, s, pal) {
  ctx.save();
  ctx.translate(x, y);
  // 树干
  ctx.strokeStyle = '#A8642A';
  ctx.lineWidth = 9 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 6 * s);
  ctx.quadraticCurveTo(4 * s, -6 * s, -2 * s, -18 * s);
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 11 * s;
  ctx.stroke();
  // 树叶
  const leaf = (a) => {
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -20 * s);
    ctx.beginPath();
    ctx.ellipse(0, -8 * s, 5.6 * s, 15 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1F8A4C';
    ctx.fill();
    ctx.lineWidth = 3.4 * s;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.restore();
  };
  for (let i = 0; i < 6; i++) leaf((i / 6) * Math.PI * 2);
  // 椰子
  ctx.fillStyle = '#6B4226';
  ctx.beginPath();
  ctx.arc(3 * s, -18 * s, 4.4 * s, 0, Math.PI * 2);
  ctx.arc(9 * s, -15 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2.4 * s;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.restore();
}

export function drawFlowerDecor(ctx, x, y, s, pal) {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    outlineShape(
      ctx,
      () => { ctx.ellipse(x + Math.cos(a) * 8 * s, y + Math.sin(a) * 8 * s, 5.6 * s, 3.4 * s, a, 0, Math.PI * 2); },
      i % 2 === 0 ? '#EF476F' : '#FFF4E0',
      3 * s
    );
  }
  outlineShape(ctx, () => { ctx.arc(x, y, 5 * s, 0, Math.PI * 2); }, '#FFD166', 3 * s);
  ctx.fillStyle = '#E8A800';
  ctx.beginPath();
  ctx.arc(x, y, 1.8 * s, 0, Math.PI * 2);
  ctx.fill();
}

export function drawRock(ctx, x, y, s, pal) {
  outlineShape(
    ctx,
    () => {
      ctx.arc(x - 6 * s, y + 2 * s, 7 * s, 0, Math.PI * 2);
      ctx.arc(x + 5 * s, y + 2 * s, 8 * s, 0, Math.PI * 2);
      ctx.arc(x - 1 * s, y - 4 * s, 6 * s, 0, Math.PI * 2);
    },
    '#9AA5B1',
    3.6 * s
  );
  ctx.fillStyle = '#7B8794';
  ctx.beginPath();
  ctx.arc(x - 5 * s, y - 2 * s, 1.8 * s, 0, Math.PI * 2);
  ctx.arc(x + 3 * s, y + 1 * s, 1.6 * s, 0, Math.PI * 2);
  ctx.arc(x + 7 * s, y - 3 * s, 1.4 * s, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCanDecor(ctx, x, y, s, pal) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.4, 1.4);
  outlineShape(ctx, () => { ctx.roundRect(-8 * s, -11 * s, 16 * s, 22 * s, 3.4 * s); }, '#EF476F', 3.2 * s);
  ctx.fillStyle = '#FFF';
  ctx.font = `900 ${6.4 * s}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POP', 0, 0);
  ctx.restore();
}
