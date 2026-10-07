/**
 * 世界模块：世界尺寸、岛屿形状（半径函数）、岛屿内外判定、
 * 随机落点与静态装饰生成。
 */

export const WORLD = { w: 2400, h: 1800 };
export const ISLAND = { cx: 1200, cy: 900, baseR: 620 };

/** 岛屿半径函数：以角度为输入，叠加正弦噪声形成有机轮廓 */
export function islandRadius(angle) {
  return (
    ISLAND.baseR *
    (1 +
      0.1 * Math.sin(angle * 3 + 1.7) +
      0.07 * Math.sin(angle * 5 + 0.9) +
      0.05 * Math.sin(angle * 7 + 4.1))
  );
}

/** 点是否在岛屿内（可留边距 pad） */
export function inIsland(x, y, pad = 0) {
  const dx = x - ISLAND.cx;
  const dy = y - ISLAND.cy;
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx);
  return r <= islandRadius(a) - pad;
}

/** 在岛上随机取点，t 为相对半径系数区间，带边距校验 */
export function randomIslandPoint(rMin = 0.3, rMax = 0.92) {
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * Math.PI * 2;
    const t = rMin + Math.random() * (rMax - rMin);
    const r = islandRadius(a) * t;
    const x = ISLAND.cx + Math.cos(a) * r;
    const y = ISLAND.cy + Math.sin(a) * r;
    if (inIsland(x, y, 34)) return { x, y };
  }
  return { x: ISLAND.cx, y: ISLAND.cy };
}

/** 岛屿轮廓路径 */
export function islandPath(ctx, scale = 1) {
  const N = 140;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = islandRadius(a) * scale;
    const x = ISLAND.cx + Math.cos(a) * r;
    const y = ISLAND.cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** 生成岛屿静态装饰（棕榈/花/岩石/汽水罐），随关卡刷新 */
export function makeDecorations() {
  const list = [];
  const push = (type, count, spread) => {
    for (let i = 0; i < count; i++) {
      const p = randomIslandPoint(0.18, spread);
      list.push({ type, x: p.x, y: p.y, s: 0.8 + Math.random() * 0.5 });
    }
  };
  push('palm', 9, 0.9);
  push('flower', 16, 0.95);
  push('rock', 7, 0.9);
  push('can', 5, 0.85);
  return list;
}
