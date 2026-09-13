/**
 * core.js — 基础工具：调色板、程序化贴图、三渲二材质、描边、构件工厂
 * 雨夜魔法街区 · 街角微缩场景 / source of truth
 */
import * as THREE from 'three';

export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

/* ------------------------------------------------------------------ *
 * 确定性随机（保证每次生成的细节一致，方便迭代对比）
 * ------------------------------------------------------------------ */
let _seed = 20260914;
export function srand() {
  _seed = (_seed * 1664525 + 1013904223) % 4294967296;
  return _seed / 4294967296;
}
export const sr = (a, b) => a + srand() * (b - a);
export const sri = (a, b) => Math.floor(a + srand() * (b - a + 1));
export function spick(arr) { return arr[Math.floor(srand() * arr.length) % arr.length]; }

/* ------------------------------------------------------------------ *
 * 调色板 —— 夜雨 + 魔法霓虹
 * ------------------------------------------------------------------ */
export const PAL = {
  asphalt: 0x33303e,
  stone: 0x8f8b93,
  stoneDark: 0x6e6a74,
  curb: 0x8a848e,
  paint: 0xd7d3de,
  soil: 0x4a3f39,

  wallStone: 0xcfc7bb,
  wallStoneCool: 0xb6b2b8,
  wallDark: 0x5f5a64,
  timber: 0x5a4436,
  timberDark: 0x3d2e26,
  roofTile: 0x463f4e,
  roofShingle: 0x3a3644,
  metal: 0x9aa1a8,
  metalDark: 0x4c525a,
  brass: 0xb08a4a,
  brassDark: 0x7a5c2c,
  iron: 0x3a3640,
  wood: 0x7b5b3d,
  woodDark: 0x4d3826,

  arcane: 0x8b5cf6,
  arcaneDeep: 0x4c2c8a,
  arcaneSoft: 0xc4a8ff,
  mana: 0x38d8ff,
  manaDeep: 0x1a6f9c,
  ember: 0xff8a3c,
  emberSoft: 0xffc38a,
  witch: 0xff5fa2,
  witchDeep: 0xa8306a,
  emerald: 0x4ade80,
  emeraldDeep: 0x1f7a4a,
  gold: 0xe8c46a,
  goldBright: 0xffe9a8,

  warm: 0xffcf8a,
  warmBright: 0xfff0d2,
  candle: 0xffb24a,
  cool: 0xcfe4ff,
  sky: 0x141026,
};

/* ------------------------------------------------------------------ *
 * 程序化贴图
 * ------------------------------------------------------------------ */
export function canvasTex(w, h, draw, opt = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (opt.repeat) t.repeat.set(opt.repeat[0], opt.repeat[1]);
  if (opt.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = opt.aniso || 8;
  t.needsUpdate = true;
  return t;
}

const css = (hex) => '#' + new THREE.Color(hex).getHexString();

function drawText(ctx, text, x, y, size, color, weight = 'bold', align = 'left', font = 'Georgia, "Times New Roman", serif') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

/** 抽象符文（不依赖字体）：随机笔画 + 圆环 */
function rune(ctx, x, y, s, color, lineW = 3) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineW;
  ctx.lineCap = 'round';
  const strokes = 3 + Math.floor(srand() * 3);
  for (let i = 0; i < strokes; i++) {
    ctx.beginPath();
    const a = srand() * TAU, b = srand() * TAU;
    ctx.moveTo(Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5);
    if (srand() > 0.45) {
      ctx.lineTo(Math.cos(b) * s * 0.5, Math.sin(b) * s * 0.5);
    } else {
      ctx.lineTo(0, sr(-0.2, 0.2) * s);
      ctx.lineTo(Math.cos(b) * s * 0.5, Math.sin(b) * s * 0.5);
    }
    ctx.stroke();
  }
  if (srand() > 0.5) { ctx.beginPath(); ctx.arc(0, 0, s * 0.22, 0, TAU); ctx.stroke(); }
  ctx.restore();
}

/** 沥青（雨夜湿街） */
export function texAsphalt() {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = css(PAL.asphalt); ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8000; i++) {
      const v = 0.5 + srand() * 0.6;
      ctx.fillStyle = `rgba(${Math.floor(70 * v)},${Math.floor(66 * v)},${Math.floor(84 * v)},0.5)`;
      ctx.fillRect(srand() * w, srand() * h, sr(0.6, 2), sr(0.6, 2));
    }
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(22,20,30,${sr(0.05, 0.16)})`;
      ctx.ellipse(srand() * w, srand() * h, sr(20, 90), sr(16, 70), srand() * TAU, 0, TAU);
      ctx.fill();
    }
  }, { repeat: [8, 8] });
}

/** 石板路（人行道 / 停车位） */
export function texStoneSlab(base = PAL.stone, n = 5) {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = css(new THREE.Color(base).offsetHSL(0, 0, -0.18).getHex()); ctx.fillRect(0, 0, w, h);
    const rows = n, seg = w / n;
    for (let j = 0; j < rows; j++) {
      let x = -sr(0, seg * 0.6);
      const y = j * (h / rows);
      while (x < w) {
        const bw = seg * sr(0.75, 1.25), bh = (h / rows) * sr(0.85, 0.97);
        const c = new THREE.Color(base).offsetHSL(sr(-0.02, 0.02), sr(-0.03, 0.03), sr(-0.09, 0.09));
        ctx.fillStyle = css(c.getHex());
        ctx.beginPath(); ctx.roundRect(x + 3, y + 3, bw - 6, bh - 6, sr(4, 12)); ctx.fill();
        for (let k = 0; k < 90; k++) {
          ctx.fillStyle = `rgba(255,255,255,${sr(0.01, 0.05)})`;
          ctx.fillRect(x + 4 + srand() * (bw - 8), y + 4 + srand() * (bh - 8), 2, 2);
        }
        for (let k = 0; k < 40; k++) {
          ctx.fillStyle = `rgba(20,18,26,${sr(0.02, 0.08)})`;
          ctx.fillRect(x + 4 + srand() * (bw - 8), y + 4 + srand() * (bh - 8), sr(2, 6), 2);
        }
        x += bw * 0.99;
      }
    }
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = `rgba(60,80,58,${sr(0.04, 0.14)})`;
      ctx.fillRect(srand() * w, srand() * h, sr(2, 7), sr(2, 4));
    }
  }, { repeat: [1, 1] });
}

/** 石砌外墙 */
export function texStoneWall(base = PAL.wallStone, n = 6) {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = css(new THREE.Color(base).offsetHSL(0, 0, -0.22).getHex()); ctx.fillRect(0, 0, w, h);
    const rows = n, seg = w / n;
    for (let j = 0; j < rows; j++) {
      let x = -sr(0, seg);
      const y = j * (h / rows);
      while (x < w) {
        const bw = seg * sr(0.7, 1.3), bh = (h / rows) * sr(0.86, 0.96);
        ctx.fillStyle = css(new THREE.Color(base).offsetHSL(sr(-0.02, 0.02), sr(-0.04, 0.03), sr(-0.1, 0.1)).getHex());
        ctx.beginPath(); ctx.roundRect(x + 2, y + 2, bw - 4, bh - 4, sr(3, 9)); ctx.fill();
        for (let k = 0; k < 70; k++) {
          ctx.fillStyle = `rgba(255,255,255,${sr(0.01, 0.05)})`;
          ctx.fillRect(x + 3 + srand() * (bw - 6), y + 3 + srand() * (bh - 6), 2, 2);
        }
        x += bw * 0.99;
      }
    }
    for (let i = 0; i < 20; i++) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(60,56,70,0.18)');
      g.addColorStop(1, 'rgba(60,56,70,0.02)');
      ctx.fillStyle = g; ctx.fillRect(srand() * w, 0, sr(4, 14), h);
    }
  }, { repeat: [1, 1] });
}

/** 深色木墙板（榫卯木构） */
export function texTimber(base = PAL.timber) {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = css(base); ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 10; i++) {
      const y = i * (h / 10);
      ctx.fillStyle = css(new THREE.Color(base).offsetHSL(sr(-0.01, 0.01), 0, sr(-0.06, 0.06)).getHex());
      ctx.fillRect(0, y + 1, w, h / 10 - 3);
      for (let k = 0; k < 26; k++) {
        ctx.strokeStyle = `rgba(30,20,14,${sr(0.05, 0.2)})`;
        ctx.lineWidth = sr(0.6, 2);
        ctx.beginPath();
        const yy = y + srand() * (h / 10);
        ctx.moveTo(0, yy);
        ctx.bezierCurveTo(w * 0.3, yy + sr(-4, 4), w * 0.7, yy + sr(-4, 4), w, yy + sr(-3, 3));
        ctx.stroke();
      }
    }
    for (let i = 0; i < 6; i++) {
      const x = srand() * w, y = srand() * h;
      ctx.fillStyle = 'rgba(40,26,18,0.55)';
      ctx.beginPath(); ctx.ellipse(x, y, sr(4, 9), sr(6, 12), 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(30,20,14,0.35)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(x, y, sr(9, 16), sr(12, 20), 0, 0, TAU); ctx.stroke();
    }
  }, { repeat: [2, 2] });
}

/* -------- 商品贴图 -------- */
const GOODS_PALETTE = {
  potion: ['#a855f7', '#38bdf8', '#f472b6', '#4ade80', '#fbbf24', '#f87171', '#c4b5fd', '#22d3ee'],
  crystal: ['#c4b5fd', '#7dd3fc', '#f9a8d4', '#a7f3d0', '#fde68a', '#e9d5ff'],
  tome: ['#7c3aed', '#1e40af', '#9d174d', '#065f46', '#92400e', '#312e81', '#881337', '#134e4a'],
  scroll: ['#e8dcc0', '#d8c9a4', '#c9b48a', '#e0d2b0', '#d2c2a0'],
  herb: ['#4ade80', '#22c55e', '#86efac', '#15803d', '#a3e635'],
  relic: ['#e8c46a', '#b08a4a', '#d8d2c0', '#8aa8b8', '#c08a6a'],
};

export function texGoods(kind = 'potion', cols = 6, rows = 4, seedShift = 0) {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#2a2230'; ctx.fillRect(0, 0, w, h);
    const cw = w / cols, ch = h / rows;
    const pal = GOODS_PALETTE[kind] || GOODS_PALETTE.potion;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x = i * cw, y = j * ch;
        const c = pal[(i * 3 + j * 5 + seedShift) % pal.length];
        const pad = 6, bw = cw - pad * 2, bh = ch - pad * 2;
        ctx.save();
        if (kind === 'potion') {
          ctx.fillStyle = c;
          ctx.beginPath(); ctx.roundRect(x + pad + bw * 0.22, y + pad + bh * 0.34, bw * 0.56, bh * 0.66, 8); ctx.fill();
          ctx.beginPath(); ctx.roundRect(x + pad + bw * 0.38, y + pad + bh * 0.06, bw * 0.24, bh * 0.34, 3); ctx.fill();
          ctx.fillStyle = '#8a6a42';
          ctx.fillRect(x + pad + bw * 0.36, y + pad, bw * 0.28, bh * 0.1);
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillRect(x + pad + bw * 0.28, y + pad + bh * 0.44, bw * 0.1, bh * 0.44);
        } else if (kind === 'crystal') {
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.moveTo(x + cw / 2, y + pad + bh * 0.06);
          ctx.lineTo(x + cw - pad, y + pad + bh * 0.5);
          ctx.lineTo(x + cw / 2, y + ch - pad);
          ctx.lineTo(x + pad, y + pad + bh * 0.5);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.45)';
          ctx.beginPath();
          ctx.moveTo(x + cw / 2, y + pad + bh * 0.06);
          ctx.lineTo(x + cw / 2, y + ch - pad);
          ctx.lineTo(x + pad, y + pad + bh * 0.5);
          ctx.closePath(); ctx.fill();
        } else if (kind === 'tome') {
          ctx.fillStyle = c;
          ctx.fillRect(x + pad, y + pad, bw, bh);
          ctx.fillStyle = 'rgba(255,255,255,0.72)';
          ctx.fillRect(x + pad + bw * 0.16, y + pad + bh * 0.16, bw * 0.68, bh * 0.1);
          ctx.fillRect(x + pad + bw * 0.16, y + pad + bh * 0.36, bw * 0.5, bh * 0.07);
          ctx.fillStyle = '#e8c46a';
          ctx.fillRect(x + pad + bw * 0.16, y + pad + bh * 0.62, bw * 0.68, bh * 0.08);
        } else if (kind === 'scroll') {
          ctx.fillStyle = c;
          ctx.beginPath(); ctx.roundRect(x + pad, y + pad + bh * 0.2, bw, bh * 0.6, 6); ctx.fill();
          ctx.fillStyle = '#6b5230';
          ctx.fillRect(x + pad - 2, y + pad + bh * 0.1, bw + 4, bh * 0.16);
          ctx.fillRect(x + pad - 2, y + ch - pad - bh * 0.26, bw + 4, bh * 0.16);
          rune(ctx, x + cw * 0.5, y + pad + bh * 0.5, bw * 0.28, 'rgba(120,90,50,0.6)', 2);
        } else if (kind === 'herb') {
          ctx.fillStyle = c;
          for (let k = 0; k < 7; k++) {
            ctx.beginPath();
            ctx.ellipse(x + cw * 0.5 + sr(-bw * 0.3, bw * 0.3), y + ch * 0.5 + sr(-bh * 0.28, bh * 0.28), bw * 0.14, bh * 0.26, sr(-0.6, 0.6), 0, TAU);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = c;
          ctx.beginPath(); ctx.roundRect(x + pad, y + pad, bw, bh, 5); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          ctx.fillRect(x + pad + bw * 0.1, y + pad + bh * 0.18, bw * 0.8, bh * 0.26);
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          ctx.fillRect(x + pad + bw * 0.14, y + pad + bh * 0.6, bw * 0.6, bh * 0.1);
        }
        ctx.restore();
      }
    }
    ctx.fillStyle = 'rgba(10,8,14,0.45)';
    for (let j = 1; j < rows; j++) ctx.fillRect(0, j * ch - 4, w, 5);
    ctx.fillRect(0, h - 5, w, 5);
  }, { aniso: 8 });
}

/* -------- 招牌 / 海报 / 灯箱 -------- */
export function texShopSign() {
  return canvasTex(1024, 176, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2a1c3c'); g.addColorStop(1, '#1a1028');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = css(PAL.gold); ctx.lineWidth = 6; ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.strokeStyle = css(PAL.arcaneSoft); ctx.lineWidth = 2; ctx.strokeRect(18, 18, w - 36, h - 36);
    for (let i = 0; i < 4; i++) {
      rune(ctx, 62 + i * 46, h / 2, 44, css(PAL.arcaneSoft), 3);
      rune(ctx, w - 62 - i * 46, h / 2, 44, css(PAL.arcaneSoft), 3);
    }
    drawText(ctx, 'ARCANA', w / 2, 66, 68, css(PAL.goldBright), 'bold', 'center');
    drawText(ctx, 'MAGIC  &  ALCHEMY', w / 2, 122, 26, css(PAL.arcaneSoft), 'bold', 'center');
    ctx.fillStyle = css(PAL.arcane); ctx.fillRect(0, h - 10, w, 10);
  });
}

export function texDoorSign() {
  return canvasTex(512, 128, (ctx, w, h) => {
    ctx.fillStyle = '#f6efdc'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = css(PAL.brass); ctx.lineWidth = 6; ctx.strokeRect(6, 6, w - 12, h - 12);
    drawText(ctx, 'WELCOME', 256, 44, 40, '#4a2c6a', 'bold', 'center');
    drawText(ctx, 'OPEN ALL NIGHT', 256, 92, 26, '#8a5c2c', 'bold', 'center');
  });
}

export function texVertSign() {
  return canvasTex(160, 640, (ctx, w, h) => {
    ctx.fillStyle = '#241834'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = css(PAL.gold); ctx.lineWidth = 5; ctx.strokeRect(7, 7, w - 14, h - 14);
    for (let i = 0; i < 3; i++) rune(ctx, w / 2, 66 + i * 72, 50, css(PAL.arcaneSoft), 3);
    drawText(ctx, 'AR', w / 2, 314, 44, css(PAL.goldBright), 'bold', 'center');
    drawText(ctx, 'CA', w / 2, 364, 44, css(PAL.goldBright), 'bold', 'center');
    for (let i = 0; i < 2; i++) rune(ctx, w / 2, 436 + i * 62, 46, css(PAL.mana), 3);
    ctx.fillStyle = css(PAL.arcane); ctx.fillRect(0, h - 40, w, 40);
    drawText(ctx, '24H', w / 2, h - 20, 24, '#ffffff', 'bold', 'center');
  });
}

export function texPoster(variant = 0) {
  return canvasTex(256, 384, (ctx, w, h) => {
    const themes = [
      { bg: '#f3e8d8', a: '#7c3aed', b: '#c4b5fd', t1: 'POTION', t2: 'NEW BREW', t3: '¥ 320' },
      { bg: '#e8e0f4', a: '#4c1d95', b: '#a78bfa', t1: 'GRIMOIRE', t2: 'RARE TOMES', t3: 'LIMITED' },
      { bg: '#f6e7d2', a: '#b45309', b: '#fbbf24', t1: 'ALCHEMY', t2: 'CIRCLE', t3: 'TRIAL OK' },
      { bg: '#e4f2ea', a: '#15803d', b: '#86efac', t1: 'HERBS', t2: 'FRESH CUT', t3: '¥ 60~' },
      { bg: '#f0e6f8', a: '#a21caf', b: '#f0abfc', t1: 'CURSE', t2: 'REMOVAL', t3: 'BY MASTER' },
      { bg: '#e8f0f8', a: '#1d4ed8', b: '#93c5fd', t1: 'STAR', t2: 'CHART', t3: 'MAP ¥ 480' },
    ];
    const t = themes[variant % themes.length];
    ctx.fillStyle = t.bg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = t.a; ctx.fillRect(0, 0, w, 12); ctx.fillRect(0, h - 12, w, 12);
    ctx.fillStyle = t.b;
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, w * 0.3, 0, TAU); ctx.fill();
    ctx.strokeStyle = t.a; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, w * 0.3, 0, TAU); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      rune(ctx, w * 0.5 + Math.cos(i / 6 * TAU) * w * 0.21, h * 0.42 + Math.sin(i / 6 * TAU) * w * 0.21, 18, t.a, 2);
    }
    drawText(ctx, t.t1, w / 2, h * 0.32, 27, t.a, 'bold', 'center');
    drawText(ctx, t.t2, w / 2, h * 0.46, 21, t.a, 'bold', 'center');
    ctx.fillStyle = t.a; ctx.fillRect(20, h * 0.62, w - 40, 40);
    drawText(ctx, t.t3, w / 2, h * 0.62 + 20, 20, '#ffffff', 'bold', 'center');
    drawText(ctx, 'ARCANA', w / 2, h * 0.85, 17, '#8a8078', 'bold', 'center');
  });
}

export function texVending() {
  return canvasTex(384, 640, (ctx, w, h) => {
    ctx.fillStyle = '#2a1f38'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = css(PAL.arcaneDeep); ctx.fillRect(0, 0, w, 84);
    drawText(ctx, 'POTION', w / 2, 34, 34, css(PAL.goldBright), 'bold', 'center');
    drawText(ctx, 'DISPENSER', w / 2, 64, 20, css(PAL.arcaneSoft), 'bold', 'center');
    for (let i = 0; i < 3; i++) rune(ctx, 30 + i * 162, 42, 32, css(PAL.arcaneSoft), 2.5);
    ctx.fillStyle = '#150f22'; ctx.fillRect(14, 96, w - 28, 300);
    const pal = GOODS_PALETTE.potion;
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 4; i++) {
        const x = 24 + i * 86, y = 106 + j * 96;
        const c = pal[(i + j * 3) % pal.length];
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.roundRect(x + 14, y + 34, 46, 54, 8); ctx.fill();
        ctx.beginPath(); ctx.roundRect(x + 26, y + 14, 22, 24, 3); ctx.fill();
        ctx.fillStyle = '#8a6a42'; ctx.fillRect(x + 24, y + 8, 26, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(x + 18, y + 44, 9, 36);
        ctx.fillStyle = '#3a2e4a'; ctx.fillRect(x + 10, y + 90, 56, 5);
      }
    }
    ctx.fillStyle = '#3a2e4a'; ctx.fillRect(14, 406, w - 28, 28);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? '#6a5a86' : css(PAL.arcane);
      ctx.fillRect(24 + i * 42, 410, 32, 20);
    }
    ctx.fillStyle = '#4a3e5c'; ctx.fillRect(40, 486, w - 80, 62);
    drawText(ctx, '¥320', w / 2, 458, 32, css(PAL.goldBright), 'bold', 'center');
    ctx.fillStyle = '#3a2e4a'; ctx.fillRect(40, 566, w - 80, 46);
    drawText(ctx, 'PUSH', w / 2, 589, 22, '#a89ac0', 'bold', 'center');
    const g = ctx.createLinearGradient(0, 96, w, 396);
    g.addColorStop(0, 'rgba(255,255,255,0.18)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.03)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
    g.addColorStop(1, 'rgba(255,255,255,0.02)');
    ctx.fillStyle = g; ctx.fillRect(14, 96, w - 28, 300);
  });
}

export function texVendingSide() {
  return canvasTex(128, 256, (ctx, w, h) => {
    ctx.fillStyle = '#322844'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = `rgba(150,130,190,${sr(0.02, 0.08)})`;
      ctx.fillRect(srand() * w, srand() * h, 2, 2);
    }
    ctx.fillStyle = 'rgba(200,180,240,0.22)'; ctx.fillRect(0, 0, w, 8);
    for (let i = 0; i < 10; i++) ctx.fillRect(0, 22 + i * 22, w, 1);
  });
}

export function texBoard() {
  return canvasTex(512, 384, (ctx, w, h) => {
    ctx.fillStyle = '#4a3a2c'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = `rgba(110,90,66,${sr(0.05, 0.2)})`;
      ctx.fillRect(srand() * w, srand() * h, sr(1, 4), sr(1, 3));
    }
    const cols = ['#f3e8d8', '#e8e0f4', '#f6e7d2', '#e4f2ea', '#f0e6f8'];
    for (let i = 0; i < 7; i++) {
      const x = sr(16, w - 150), y = sr(16, h - 130), bw = sr(92, 150), bh = sr(84, 122);
      ctx.save(); ctx.translate(x + bw / 2, y + bh / 2); ctx.rotate(sr(-0.08, 0.08));
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-bw / 2 + 3, -bh / 2 + 3, bw, bh);
      ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
      ctx.fillStyle = ['#7c3aed', '#b45309', '#15803d', '#a21caf'][i % 4];
      ctx.fillRect(-bw / 2 + 8, -bh / 2 + 10, bw - 16, 13);
      rune(ctx, 0, -bh * 0.05, bw * 0.3, 'rgba(60,50,40,0.5)', 2.5);
      ctx.fillStyle = 'rgba(80,70,60,0.6)';
      for (let k = 0; k < 4; k++) ctx.fillRect(-bw / 2 + 10, bh * 0.18 + k * 13, (bw - 24) * sr(0.4, 1), 5);
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath(); ctx.arc(bw / 2 - 10, -bh / 2 + 8, 5, 0, TAU); ctx.fill();
      ctx.restore();
    }
  });
}

export function texRoadSign(kind = 0) {
  if (kind === 0) {
    return canvasTex(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#2c4a3c'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = css(PAL.gold); ctx.lineWidth = 8; ctx.strokeRect(10, 10, w - 20, h - 20);
      drawText(ctx, 'OLD', w / 2, 88, 40, css(PAL.goldBright), 'bold', 'center');
      drawText(ctx, 'LANE', w / 2, 136, 40, css(PAL.goldBright), 'bold', 'center');
      for (let i = 0; i < 2; i++) rune(ctx, 72 + i * 112, 194, 38, css(PAL.goldBright), 3);
    });
  }
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#3a2c54'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = css(PAL.arcaneSoft); ctx.lineWidth = 8; ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = css(PAL.arcaneSoft);
    ctx.beginPath();
    ctx.moveTo(58, 118); ctx.lineTo(146, 118);
    ctx.lineTo(146, 86); ctx.lineTo(206, 118); ctx.lineTo(146, 150); ctx.lineTo(146, 118);
    ctx.fill();
    ctx.fillRect(44, 110, 22, 16);
    rune(ctx, w / 2, 196, 36, css(PAL.arcaneSoft), 3);
  });
}

export function texParkSign() {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#3a2c54'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = css(PAL.gold); ctx.lineWidth = 10; ctx.strokeRect(12, 12, w - 24, h - 24);
    drawText(ctx, 'BROOM', w / 2, h / 2 - 28, 42, css(PAL.goldBright), 'bold', 'center');
    drawText(ctx, 'PARK', w / 2, h / 2 + 30, 42, css(PAL.goldBright), 'bold', 'center');
  });
}

/** 彩色玻璃（菱形拼花 + 铅条） */
export function texStainedGlass() {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#2a1c3c'; ctx.fillRect(0, 0, w, h);
    const cols = ['#8b5cf6', '#38bdf8', '#f472b6', '#fbbf24', '#4ade80', '#c4b5fd', '#fb7185'];
    const n = 6, s = w / n;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        ctx.fillStyle = cols[(i * 2 + j * 3) % cols.length];
        ctx.beginPath();
        ctx.moveTo(i * s + s / 2, j * s + 2);
        ctx.lineTo((i + 1) * s - 2, j * s + s / 2);
        ctx.lineTo(i * s + s / 2, (j + 1) * s - 2);
        ctx.lineTo(i * s + 2, j * s + s / 2);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.beginPath();
        ctx.moveTo(i * s + s / 2, j * s + 2);
        ctx.lineTo(i * s + 2, j * s + s / 2);
        ctx.lineTo(i * s + s / 2, (j + 1) * s - 2);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.strokeStyle = '#141018'; ctx.lineWidth = 5;
    for (let i = 0; i <= n; i++) {
      ctx.beginPath(); ctx.moveTo(i * s, 0); ctx.lineTo(i * s, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * s); ctx.lineTo(w, i * s); ctx.stroke();
    }
  });
}

/** 魔法阵地贴 */
export function texRuneCircle() {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    ctx.strokeStyle = css(PAL.arcaneSoft);
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, cy, w * 0.44, 0, TAU); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, w * 0.38, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, w * 0.2, 0, TAU); ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const a = -Math.PI / 2 + (i * 4 / 5) * TAU;
      const x = cx + Math.cos(a) * w * 0.38, y = cy + Math.sin(a) * w * 0.38;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
    for (let i = 0; i < 12; i++) {
      rune(ctx, cx + Math.cos(i / 12 * TAU) * w * 0.41, cy + Math.sin(i / 12 * TAU) * w * 0.41, 28, css(PAL.arcaneSoft), 2.5);
    }
  });
}

export function texFloorArrow() {
  return canvasTex(128, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = css(PAL.arcaneSoft);
    ctx.beginPath(); ctx.moveTo(w / 2, 20); ctx.lineTo(w - 16, 110); ctx.lineTo(w / 2 + 22, 110);
    ctx.lineTo(w / 2 + 22, 236); ctx.lineTo(w / 2 - 22, 236); ctx.lineTo(w / 2 - 22, 110);
    ctx.lineTo(16, 110); ctx.closePath(); ctx.fill();
    rune(ctx, w / 2, 186, 30, '#3a2c54', 3);
  });
}

export function texCaution() {
  return canvasTex(128, 160, (ctx, w, h) => {
    ctx.fillStyle = '#e8c46a'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2a1c3c';
    ctx.fillRect(0, 0, w, 8); ctx.fillRect(0, h - 8, w, 8);
    rune(ctx, w / 2, h * 0.4, 66, '#5a2c8a', 5);
    ctx.fillStyle = '#5a2c8a';
    ctx.fillRect(18, 116, w - 36, 8);
    ctx.fillRect(28, 130, w - 56, 6);
  });
}

export function texPriceStrip() {
  return canvasTex(512, 64, (ctx, w, h) => {
    ctx.fillStyle = '#f4efdf'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      const x = i * 128;
      ctx.fillStyle = '#eae4d2'; ctx.fillRect(x + 4, 4, 120, h - 8);
      ctx.fillStyle = css(PAL.arcaneDeep);
      ctx.font = 'bold 32px Georgia'; ctx.textAlign = 'left';
      ctx.fillText('¥' + [320, 480, 120, 260][i], x + 14, 42);
      ctx.fillStyle = '#8a8078';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(['POTION', 'TOME', 'HERB', 'BREW'][i], x + 14, 16);
    }
  }, { repeat: [3, 1] });
}

export function texAlchemyCabinet() {
  return canvasTex(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#241a30'; ctx.fillRect(0, 0, w, h);
    const pal = GOODS_PALETTE.potion;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 10; i++) {
      const x = 6 + i * 50, y = 8 + j * 62;
      ctx.fillStyle = pal[(i + j * 2) % pal.length];
      ctx.beginPath(); ctx.roundRect(x + 8, y + 22, 30, 32, 5); ctx.fill();
      ctx.fillRect(x + 16, y + 8, 14, 16);
      ctx.fillStyle = '#8a6a42'; ctx.fillRect(x + 14, y + 4, 18, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x + 11, y + 28, 6, 22);
      ctx.fillStyle = '#1a1424'; ctx.fillRect(x - 2, y + 56, 54, 5);
    }
    ctx.fillStyle = 'rgba(20,14,30,0.3)'; ctx.fillRect(0, 0, w, h);
  });
}

export function texBackDoor() {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = css(PAL.timberDark); ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(8, 10 + i * 60, w - 16, 54);
      ctx.strokeStyle = 'rgba(20,14,10,0.6)'; ctx.lineWidth = 3;
      ctx.strokeRect(8, 10 + i * 60, w - 16, 54);
    }
    ctx.strokeStyle = css(PAL.iron); ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, h); ctx.stroke();
    ctx.strokeStyle = css(PAL.brass); ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = css(PAL.brass);
    ctx.beginPath(); ctx.arc(w - 34, h / 2, 10, 0, TAU); ctx.fill();
    rune(ctx, w / 2, h * 0.5, 58, 'rgba(200,170,110,0.32)', 4);
  });
}

export function texGrate() {
  return canvasTex(128, 64, (ctx, w, h) => {
    ctx.fillStyle = '#3a3640'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#14121a';
    for (let i = 0; i < 6; i++) ctx.fillRect(8 + i * 20, 8, 11, h - 16);
    ctx.strokeStyle = '#565060'; ctx.lineWidth = 3; ctx.strokeRect(1, 1, w - 2, h - 2);
  });
}

export function texGlow(softness = 0.5) {
  return canvasTex(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(softness * 0.5, 'rgba(255,255,255,0.45)');
    g.addColorStop(softness, 'rgba(255,255,255,0.14)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }, { srgb: false });
}

export function texGlassStreak() {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const bands = [[0.05, 0.1, 0.5], [0.32, 0.06, 0.34], [0.55, 0.13, 0.28], [0.78, 0.05, 0.4]];
    for (const [x0, bw, a] of bands) {
      const g = ctx.createLinearGradient(x0 * w, 0, (x0 + bw) * w, h);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, `rgba(255,255,255,${a})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.save(); ctx.rotate(-0.18); ctx.fillRect(x0 * w - 40, -60, bw * w, h * 1.6); ctx.restore();
    }
  }, { srgb: false });
}

export function texScrollPaper() {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#e8dcc0'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(150,130,90,${sr(0.02, 0.09)})`;
      ctx.fillRect(srand() * w, srand() * h, sr(2, 10), 1);
    }
    ctx.strokeStyle = 'rgba(90,70,44,0.5)'; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath(); ctx.moveTo(20, 34 + i * 26);
      ctx.lineTo(20 + sr(60, 200), 34 + i * 26); ctx.stroke();
    }
    rune(ctx, w * 0.5, h * 0.86, 38, 'rgba(90,70,44,0.6)', 3);
  });
}

/* ------------------------------------------------------------------ *
 * 材质
 * ------------------------------------------------------------------ */
let gradientMap = null;
export function getGradientMap() {
  if (!gradientMap) {
    const steps = new Uint8Array([46, 118, 196, 255]);
    gradientMap = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.generateMipmaps = false;
    gradientMap.needsUpdate = true;
  }
  return gradientMap;
}

const matCache = new Map();
function cachedMat(key, make) {
  let m = matCache.get(key);
  if (!m) { m = make(); matCache.set(key, m); }
  return m;
}

export function toon(color, opt = {}) {
  const key = `t|${color}|${opt.map ? opt.map.uuid : ''}|${opt.emissive ?? ''}|${opt.emissiveIntensity ?? ''}|${opt.side ?? ''}|${opt.transparent ? 1 : 0}`;
  return cachedMat(key, () => new THREE.MeshToonMaterial({
    color, gradientMap: getGradientMap(), ...opt,
  }));
}

export function glow(color, intensity = 1.6, unique = false) {
  const make = () => new THREE.MeshBasicMaterial({
    color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: true, fog: true,
  });
  if (unique) return make();
  return cachedMat(`g|${color}|${intensity}`, make);
}

export function litMap(tex, emissiveIntensity = 0.2, opt = {}) {
  const key = `l|${tex.uuid}|${emissiveIntensity}|${opt.side ?? ''}`;
  return cachedMat(key, () => new THREE.MeshToonMaterial({
    map: tex, gradientMap: getGradientMap(),
    emissive: new THREE.Color(0xffffff), emissiveMap: tex, emissiveIntensity, ...opt,
  }));
}

export function glassMat(tint = 0xc9b8ff, opacity = 0.14) {
  return new THREE.MeshPhysicalMaterial({
    color: tint, transparent: true, opacity, roughness: 0.06, metalness: 0,
    side: THREE.DoubleSide, depthWrite: false,
  });
}

export const wetUniforms = { uTime: { value: 0 }, uRipple: { value: 1.0 } };
export function wetMat(color, opt = {}) {
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: opt.roughness ?? 0.16,
    metalness: opt.metalness ?? 0.55,
    envMapIntensity: opt.envMapIntensity ?? 1.0,
    transparent: opt.opacity != null,
    opacity: opt.opacity ?? 1,
    ...(opt.map ? { map: opt.map } : {}),
    depthWrite: opt.depthWrite !== false,
  });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = wetUniforms.uTime;
    shader.uniforms.uRipple = wetUniforms.uRipple;
    shader.vertexShader = 'varying vec3 vWpos;\n' + shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\n vWpos = (modelMatrix * vec4(transformed,1.0)).xyz;'
    );
    shader.fragmentShader = `
      uniform float uTime;
      uniform float uRipple;
      varying vec3 vWpos;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    ` + shader.fragmentShader.replace(
      '#include <normal_fragment_maps>',
      `#include <normal_fragment_maps>
       {
         vec2 uv = vWpos.xz;
         vec2 cell = floor(uv * 1.15);
         float h = h21(cell);
         vec2 cc = (cell + 0.5) / 1.15;
         float d = length(uv - cc);
         float ph = fract(uTime * 0.55 + h);
         float rf = ph * 0.46;
         float ring = sin((d - rf) * 62.0) * exp(-abs(d - rf) * 44.0) * exp(-ph * 3.4) * step(d, rf + 0.02);
         vec2 dir = normalize(uv - cc + vec2(0.0001));
         normal = normalize(normal + vec3(dir.x, 0.0, dir.y) * ring * 1.35 * uRipple * clamp(1.0 - d * 1.2, 0.0, 1.0));
       }`
    );
  };
  m.userData.isWet = true;
  return m;
}

/* ------------------------------------------------------------------ *
 * 描边 + 构件工厂
 * ------------------------------------------------------------------ */
const OUTLINE_VERT = `
  uniform float uWidth;
  void main(){
    vec3 n = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float d = max(-mv.z, 0.001);
    mv.xyz += n * uWidth * (0.55 + d * 0.02);
    gl_Position = projectionMatrix * mv;
  }
`;
const OUTLINE_FRAG = `
  uniform vec3 uColor;
  void main(){ gl_FragColor = vec4(uColor, 1.0); }
`;
const outlineCache = new Map();
export function outlineMatFor(w, color = 0x140f18) {
  const k = w.toFixed(4) + '_' + color;
  if (!outlineCache.has(k)) {
    outlineCache.set(k, new THREE.ShaderMaterial({
      uniforms: { uWidth: { value: w }, uColor: { value: new THREE.Color(color) } },
      vertexShader: OUTLINE_VERT, fragmentShader: OUTLINE_FRAG, side: THREE.BackSide,
    }));
  }
  return outlineCache.get(k);
}

export const noRaycast = (o) => { o.raycast = () => {}; return o; };

export function part(geo, mat, opt = {}) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = opt.shadow !== false;
  m.receiveShadow = opt.shadow !== false;
  g.add(m);
  g.userData.mesh = m;
  if (opt.ol) {
    const o = new THREE.Mesh(geo, outlineMatFor(opt.ol, opt.olColor));
    o.renderOrder = -1;
    o.castShadow = false; o.receiveShadow = false;
    g.add(o);
  }
  return g;
}

const geoCache = new Map();
function geo(key, make) {
  if (!geoCache.has(key)) geoCache.set(key, make());
  return geoCache.get(key);
}
export const boxGeo = (w, h, d) => geo(`b${w}_${h}_${d}`, () => new THREE.BoxGeometry(w, h, d));
export const cylGeo = (rt, rb, h, s = 12) => geo(`c${rt}_${rb}_${h}_${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s));
export const sphGeo = (r, ws = 14, hs = 10) => geo(`s${r}_${ws}_${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
export const planeGeo = (w, h) => geo(`p${w}_${h}`, () => new THREE.PlaneGeometry(w, h));

export function box(parent, w, h, d, mat, x, y, z, opt = {}) {
  const g = part(boxGeo(w, h, d), mat, opt);
  g.position.set(x, y, z);
  if (opt.ry) g.rotation.y = opt.ry;
  if (opt.rx) g.rotation.x = opt.rx;
  if (opt.rz) g.rotation.z = opt.rz;
  if (parent) parent.add(g);
  return g;
}

export function cyl(parent, rt, rb, h, mat, x, y, z, opt = {}) {
  const g = part(cylGeo(rt, rb, h, opt.seg || 12), mat, opt);
  g.position.set(x, y, z);
  if (opt.rx) g.rotation.x = opt.rx;
  if (opt.rz) g.rotation.z = opt.rz;
  if (opt.ry) g.rotation.y = opt.ry;
  if (parent) parent.add(g);
  return g;
}

export function decal(parent, w, h, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(planeGeo(w, h), mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = false; m.receiveShadow = false;
  if (parent) parent.add(m);
  return m;
}

export function lightPanel(parent, w, h, color, x, y, z, opt = {}) {
  return decal(parent, w, h, glow(color, opt.intensity ?? 1.5), x, y, z, opt.rx || 0, opt.ry || 0, opt.rz || 0);
}

const glowTex = { v: null };
export function getGlowTex() { if (!glowTex.v) glowTex.v = texGlow(0.55); return glowTex.v; }
export const reflectionStreaks = [];
export function lightStreak(parent, w, h, color, x, y, z, ry = 0, opacity = 0.5) {
  const m = new THREE.Mesh(planeGeo(w, h), new THREE.MeshBasicMaterial({
    map: getGlowTex(), color: new THREE.Color(color), transparent: true,
    opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: true,
  }));
  m.position.set(x, y, z);
  m.rotation.set(-Math.PI / 2, 0, ry);
  m.renderOrder = 3;
  if (parent) parent.add(m);
  reflectionStreaks.push({ m, base: opacity, seed: srand() * 10 });
  return m;
}

export const billboards = [];
export function halo(parent, size, color, x, y, z, opacity = 0.55) {
  const m = new THREE.Mesh(planeGeo(size, size), new THREE.MeshBasicMaterial({
    map: getGlowTex(), color: new THREE.Color(color), transparent: true,
    opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  }));
  m.renderOrder = 5;
  m.userData.alwaysFace = true;
  m.position.set(x, y, z);
  if (parent) parent.add(m);
  billboards.push(m);
  return m;
}

export function disposeAll(root) {
  root.traverse((o) => {
    if (o.isMesh) {
      o.geometry.dispose?.();
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
      else o.material.dispose?.();
    }
  });
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
