// ===== 关卡图案、砖块类型与配色 =====

// 砖块类型：单字符代号 → { hp, score }
export const BRICK_TYPES = {
  s: { hp: 1, score: 10 }, // 星星
  d: { hp: 1, score: 10 }, // 甜甜圈
  l: { hp: 1, score: 10 }, // 嘴唇
  c: { hp: 1, score: 10 }, // 樱桃
  b: { hp: 1, score: 10 }, // 香蕉
  f: { hp: 1, score: 10 }, // 花
  o: { hp: 1, score: 10 }, // 汽水罐
  h: { hp: 2, score: 30 }, // 钻石（2 击）
};

export const COL_COUNT = 15;
export const ROW_COUNT_MAX = 15;
export const CELL_W = 56;
export const CELL_H = 24;
export const CELL_GAP = 4;
export const BRICK_TOP = 76;

// 每关配色：背景渐变色 + 砖块色板（按行循环取色）+ 弹幕文字色
export const PALETTES = [
  { name: '经典红黄蓝', bgTop: '#fff3c4', bgBottom: '#ffd60a', bricks: ['#ff3b30', '#00c2ff', '#ffd60a', '#00f5d4'], pop: '#ff3b30' },
  { name: '粉蓝泡泡', bgTop: '#ffe0f0', bgBottom: '#ff8ad8', bricks: ['#ff2d95', '#00c2ff', '#00f5d4', '#ffd60a'], pop: '#ff2d95' },
  { name: '紫绿派对', bgTop: '#e8e0ff', bgBottom: '#b388ff', bricks: ['#7c4dff', '#00e676', '#ffe600', '#00c2ff'], pop: '#7c4dff' },
  { name: '霓虹柑橘', bgTop: '#fff0d6', bgBottom: '#ffb020', bricks: ['#ff5714', '#00e676', '#00c2ff', '#ff3b30'], pop: '#ff5714' },
  { name: '黑白金章', bgTop: '#f5f5f0', bgBottom: '#ffe08a', bricks: ['#111111', '#ff3b30', '#ffd60a', '#00c2ff'], pop: '#111111' },
];

// 关卡图案：每行 15 个字符（. 为空位），字符含义见 BRICK_TYPES
export const LEVELS = [
  {
    name: '开场星星',
    speedMul: 1.0,
    rows: [
      'sssssssssssssss',
      'ddddddddddddddd',
      'sssssssssssssss',
      'ddddddddddddddd',
      'sssssssssssssss',
    ],
  },
  {
    name: '经典金字塔',
    speedMul: 1.05,
    rows: [
      '.......s.......',
      '......ddd......',
      '.....sssss.....',
      '....ddddddd....',
      '...sssssssss...',
      '..ddddddddddd..',
      '.sssssssssssss.',
    ],
  },
  {
    name: '超级大星',
    speedMul: 1.1,
    rows: [
      '.......h.......',
      '......sss......',
      '.....sssss.....',
      '....sssssss....',
      '...sssssssss...',
      '..sssssssssss..',
      '.sssssssssssss.',
      'sssssssssssssss',
      '.sssssssssssss.',
      '..sssssssssss..',
      '...sssssssss...',
      '....sssssss....',
      '.....sssss.....',
      '......sss......',
      '.......h.......',
    ],
  },
  {
    name: '棋盘摇滚',
    speedMul: 1.12,
    rows: [
      'lclclclclclclcl',
      'clclclclclclclc',
      'bdbdbdbdbdbdbdb',
      'dbdbdbdbdbdbdbd',
      'hchchchchchchch',
      'chchchchchchchc',
    ],
  },
  {
    name: '拱门波浪',
    speedMul: 1.18,
    rows: [
      '..ccccccccccc..',
      '.ccccccccccccc.',
      'ooooooooooooooo',
      '....fffffff....',
      '...fffffffff...',
      '..fffffffffff..',
      '..ffhfffffhff..',
    ],
  },
  {
    name: '怒放花心',
    speedMul: 1.22,
    rows: [
      'hhh...sss...hhh',
      '.hhh..s.s..hhh.',
      '..hh..sss..hh..',
      '.....sssss.....',
      '....sssssss....',
      '...sffffffs...',
      '..sffffffffs...',
      '..fffffffffff..',
      '...fffffffff...',
      '....fffffff....',
      '.....fffff.....',
    ],
  },
];

// 第 6 关之后循环图案，速度与道具概率随轮次提升
export function levelConfig(index) {
  const round = Math.floor(index / LEVELS.length);
  const def = LEVELS[index % LEVELS.length];
  return {
    ...def,
    speedMul: Math.min(1.6, def.speedMul + round * 0.08),
    powerChance: Math.min(0.28, 0.16 + round * 0.02),
    palette: PALETTES[index % PALETTES.length],
  };
}
