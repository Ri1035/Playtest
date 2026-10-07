// ===== 波普风程序化绘制：背景、挡板、球、砖块、道具、飘字 =====

export const FONT = '900 16px "Arial Black", "Microsoft YaHei", Arial, sans-serif';
export const INK = '#111111';

export function outlineShape(ctx, draw, lineWidth = 4) {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = lineWidth;
  ctx.fillStyle = INK;
  draw();
  ctx.stroke();
  ctx.restore();
}

// 网点（半调）填充
export function halftoneRect(ctx, x, y, w, h, color, dot = 5, gap = 10, alpha = 1) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  for (let yy = y + dot; yy < y + h; yy += gap) {
    for (let xx = x + dot; xx < x + w; xx += gap) {
      ctx.beginPath();
      ctx.arc(xx, yy, dot, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function starPath(ctx, x, y, r, points = 5, inset = 0.5, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inset;
    const a = rot + (i * Math.PI) / points;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function popText(ctx, text, x, y, size, color, outline = 4, align = 'center') {
  ctx.save();
  ctx.font = `900 ${size}px "Arial Black", "Microsoft YaHei", Arial, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = outline;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ===== 背景 =====
export function drawBackground(ctx, W, H, pal, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, pal.bgTop);
  g.addColorStop(1, pal.bgBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // 半调网点场
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#ffffff';
  for (let yy = 8; yy < H; yy += 22) {
    for (let xx = 8; xx < W; xx += 22) {
      ctx.beginPath();
      ctx.arc(xx, yy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 巨大旋转星星剪影
  ctx.save();
  ctx.translate(W * 0.5, H * 0.5);
  ctx.rotate(t * 0.02);
  ctx.globalAlpha = 0.07;
  starPath(ctx, 0, 0, 300, 5, 0.5, 0);
  ctx.fillStyle = '#111111';
  ctx.fill();
  ctx.restore();
}

// ===== 挡板（油漆滚筒）=====
export function drawPaddle(ctx, x, y, w, h, color, dx) {
  const tilt = Math.max(-0.18, Math.min(0.18, dx * 0.002));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  // 滚筒主体
  outlineShape(ctx, () => {
    roundedRect(ctx, -w / 2, -h / 2, w, h, 6);
    ctx.fillStyle = color;
    ctx.fill();
    // 网点带
    ctx.save();
    ctx.beginPath();
    roundedRect(ctx, -w / 2, -h / 2, w, h, 6);
    ctx.clip();
    ctx.fillStyle = '#ffffff';
    for (let xx = -w / 2 + 6; xx < w / 2; xx += 14) {
      ctx.fillRect(xx, -h / 2 + 2, 3, h - 4);
    }
    ctx.restore();
  });
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  roundedRect(ctx, -w / 2 + 5, -h / 2 + 3, w - 10, h * 0.32, 4);
  ctx.fill();
  // 手柄
  outlineShape(ctx, () => {
    ctx.beginPath();
    ctx.arc(w / 2 + 4, 0, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd60a';
    ctx.fill();
  });
  ctx.restore();
}

// ===== 球（旋转五角星核心）=====
export function drawBall(ctx, x, y, r, rot, color = '#ffd60a') {
  ctx.save();
  outlineShape(ctx, () => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  starPath(ctx, 0, 0, r * 0.55, 5, 0.5);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ===== 砖块图标 =====
export function drawItem(ctx, type, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 44, s / 44);
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = INK;
  switch (type) {
    case 's': { // 星星
      starPath(ctx, 0, 0, 20, 5, 0.5);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-6, -8, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'd': { // 甜甜圈
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 12.5, Math.sin(a) * 12.5, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'l': { // 嘴唇
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.bezierCurveTo(-18, -14, 18, -14, 18, 0);
      ctx.bezierCurveTo(12, 8, -12, 8, -18, 0);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-18, 2);
      ctx.bezierCurveTo(0, 10, 0, -4, 18, 2);
      ctx.stroke();
      break;
    }
    case 'c': { // 樱桃
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(-8, -8, 8, -12, 0, -24);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-10, 10, 9, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(10, 10, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-10, 10, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(10, 10, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'b': { // 香蕉
      ctx.beginPath();
      ctx.moveTo(-14, -14);
      ctx.bezierCurveTo(16, -18, 20, 10, 10, 18);
      ctx.lineTo(2, 12);
      ctx.bezierCurveTo(12, 6, 8, -8, -8, -6);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'f': { // 花
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 12, Math.sin(a) * 12, 9, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd60a';
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'o': { // 汽水罐
      ctx.beginPath();
      ctx.roundRect(-14, -18, 28, 36, 5);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-14, -18, 28, 8);
      ctx.beginPath();
      ctx.roundRect(-10, -20, 20, 4, 2);
      ctx.fillStyle = '#c9c9c9';
      ctx.fill();
      ctx.stroke();
      ctx.font = '900 10px Arial Black, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.strokeText('POP', 0, 4);
      ctx.fillText('POP', 0, 4);
      break;
    }
    case 'h': { // 钻石
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(14, -8);
      ctx.lineTo(0, 20);
      ctx.lineTo(-14, -8);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(-14, -8);
      ctx.lineTo(0, -8);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fill();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

// 砖块主体
export function drawBrick(ctx, brick, pal) {
  const { x, y, w, h } = brick;
  const color = brick.color;
  const damaged = brick.hp < brick.maxHp;

  ctx.save();
  // 阴影
  ctx.fillStyle = 'rgba(17,17,17,0.18)';
  roundedRect(ctx, x + 3, y + 4, w, h, 5);
  ctx.fill();

  outlineShape(ctx, () => {
    roundedRect(ctx, x, y, w, h, 5);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // 高光条
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  roundedRect(ctx, x + 4, y + 3, w - 8, 5, 3);
  ctx.fill();

  // 图标
  drawItem(ctx, brick.type, x + w / 2, y + h / 2 + 2, h * 0.9, damaged ? shade(color) : color);

  // 受损裂纹
  if (damaged) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h - 5);
    ctx.lineTo(x + 12, y + 8);
    ctx.lineTo(x + 18, y + h - 8);
    ctx.lineTo(x + 26, y + 8);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function shade(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 255) - 50);
  const g = Math.max(0, ((n >> 8) & 255) - 50);
  const b = Math.max(0, (n & 255) - 50);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// ===== 道具 =====
export function drawPowerup(ctx, p) {
  const { x, y } = p;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(y * 0.06) * 0.15);
  outlineShape(ctx, () => {
    ctx.beginPath();
    ctx.roundRect(-13, -9, 26, 18, 9);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });
  ctx.fillStyle = INK;
  ctx.font = '900 13px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (p.kind === 'W') {
    ctx.fillRect(-7, -2, 14, 4);
    ctx.beginPath();
    ctx.arc(7, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.kind === 'M') {
    for (const dx of [-6, 0, 6]) {
      ctx.beginPath();
      ctx.arc(dx, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.font = '900 12px "Arial Black", sans-serif';
    ctx.fillText('SLOW', 0, 1);
  }
  ctx.restore();
}

// ===== 爱心（生命）=====
export function drawHeart(ctx, x, y, s, color = '#ff3b30') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 24, s / 24);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-12, -4, -12, -12, -4, -12);
  ctx.bezierCurveTo(0, -12, 2, -8, 4, -8);
  ctx.bezierCurveTo(6, -12, 12, -12, 12, -4);
  ctx.bezierCurveTo(12, -4, 12, 2, 0, 6);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}
