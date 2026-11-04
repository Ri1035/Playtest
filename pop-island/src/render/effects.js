/**
 * 漫画特效层。
 * 波普艺术的情绪全靠这些拟声词气泡承载：POW! / SPLASH! / ZAP! 配放射状爆炸形。
 */

import { INK, SWATCH, PAPER } from './palette.js';

const WORDS_BUILD = ['POW!', 'BAM!', 'ZAP!', 'KAPOW!', 'WHAM!', 'POP!'];
const WORDS_RESOURCE = ['+1', 'YUM!', 'GOLD!', 'NICE!', 'YEAH!'];

const bursts = [];
const floaters = [];
const ripples = [];

const PALETTE = [SWATCH.magenta, SWATCH.cyan, SWATCH.yellow, SWATCH.green, SWATCH.orange];

/** 在指定格子上炸开一个拟声词。 */
export function spawnBurst(gx, gy, tilePx, kind = 'build') {
  const pool = kind === 'build' ? WORDS_BUILD : WORDS_RESOURCE;
  const word = pool[Math.floor(Math.random() * pool.length)];
  bursts.push({
    x: gx * tilePx + tilePx / 2,
    y: gy * tilePx + tilePx / 2,
    text: word,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    life: 0,
    duration: 620,
    rotation: (Math.random() - 0.5) * 0.35,
    scale: 0.6,
  });
}

/** 飘字：产出资源时在格子上方升起数值。 */
export function spawnFloater(gx, gy, tilePx, text, color = SWATCH.magenta) {
  floaters.push({
    x: gx * tilePx + tilePx / 2,
    y: gy * tilePx + tilePx / 2,
    text,
    color,
    life: 0,
    duration: 900,
  });
}

/** 水面涟漪，点击海洋时给反馈，避免"点了没反应"的困惑。 */
export function spawnRipple(gx, gy, tilePx) {
  ripples.push({ x: gx * tilePx + tilePx / 2, y: gy * tilePx + tilePx / 2, life: 0, duration: 520 });
}

export function updateEffects(dt) {
  for (let i = bursts.length - 1; i >= 0; i -= 1) {
    bursts[i].life += dt;
    if (bursts[i].life >= bursts[i].duration) bursts.splice(i, 1);
  }
  for (let i = floaters.length - 1; i >= 0; i -= 1) {
    floaters[i].life += dt;
    if (floaters[i].life >= floaters[i].duration) floaters.splice(i, 1);
  }
  for (let i = ripples.length - 1; i >= 0; i -= 1) {
    ripples[i].life += dt;
    if (ripples[i].life >= ripples[i].duration) ripples.splice(i, 1);
  }
}

export function drawEffects(ctx) {
  for (const ripple of ripples) drawRipple(ctx, ripple);
  for (const floater of floaters) drawFloater(ctx, floater);
  for (const burst of bursts) drawBurst(ctx, burst);
}

function drawRipple(ctx, ripple) {
  const t = ripple.life / ripple.duration;
  ctx.save();
  ctx.globalAlpha = 1 - t;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3 * (1 - t) + 1;
  ctx.beginPath();
  ctx.arc(ripple.x, ripple.y, 6 + t * 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawFloater(ctx, floater) {
  const t = floater.life / floater.duration;
  ctx.save();
  ctx.globalAlpha = 1 - t * t;
  ctx.translate(floater.x, floater.y - t * 34);
  ctx.font = 'bold 17px "Arial Black", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // 白色粗描边保证任何底色上都读得清。
  ctx.lineWidth = 4;
  ctx.strokeStyle = PAPER;
  ctx.strokeText(floater.text, 0, 0);
  ctx.fillStyle = floater.color;
  ctx.fillText(floater.text, 0, 0);
  ctx.restore();
}

/**
 * 爆炸形气泡：12 角星形 + 粗黑描边 + 网点填充 + 硬投影。
 * 这三层叠加是 Lichtenstein 式构图的最小可辨识单元。
 */
function drawBurst(ctx, burst) {
  const t = burst.life / burst.duration;
  const pop = t < 0.25 ? easeOutBack(t / 0.25) : 1;
  const alpha = t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1;
  const size = 30 * burst.scale * pop;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(burst.x, burst.y - t * 12);
  ctx.rotate(burst.rotation);

  const points = 12;
  const path = new Path2D();
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? size : size * 0.62;
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (i === 0) path.moveTo(px, py);
    else path.lineTo(px, py);
  }
  path.closePath();

  // 硬投影：波普不用柔和阴影
  ctx.save();
  ctx.translate(3, 3);
  ctx.fillStyle = INK;
  ctx.fill(path);
  ctx.restore();

  ctx.fillStyle = burst.color;
  ctx.fill(path);

  // 中心留白形成文字底
  ctx.save();
  ctx.clip(path);
  ctx.fillStyle = PAPER;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'miter';
  ctx.stroke(path);

  ctx.font = `bold ${Math.round(15 * burst.scale)}px "Arial Black", Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = INK;
  ctx.fillText(burst.text, 0, 1);
  ctx.restore();
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}