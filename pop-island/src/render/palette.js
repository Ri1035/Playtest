/**
 * 波普艺术调色板。
 * 规则：纯度优先，只用高饱和原色 + 墨黑 + 纸白，禁止渐变与柔和中间色。
 */

export const INK = '#141414';
export const PAPER = '#fff6e9';

/** 四色印刷基色（cyan / magenta / yellow）与常用扩展色。 */
export const SWATCH = {
  cyan: '#00c2e0',
  cyanDeep: '#0090b0',
  magenta: '#ff2d78',
  magentaDeep: '#c2004f',
  yellow: '#ffd400',
  yellowDeep: '#e0a800',
  green: '#3ddc6b',
  greenDeep: '#1f9c4a',
  orange: '#ff7a1a',
  purple: '#8a4fff',
  pink: '#ff9ecb',
  brown: '#a9713c',
  brownDeep: '#6f4520',
  white: '#ffffff',
  black: INK,
};

/** 地形色：每种地形一个主色 + 一个网点色，形成波普特有的双色叠印。 */
export const TERRAIN_COLORS = {
  water: { base: '#1fa8e0', dot: '#0a5f8f', foam: '#ffffff' },
  sand: { base: '#ffd97a', dot: '#d99a00' },
  grass: { base: '#7fe08a', dot: '#1f8a49' },
  grassAlt: { base: '#a4ec86', dot: '#3f9c3a' },
  forest: { base: '#3ddc6b', dot: '#0f5c2e' },
  rock: { base: '#cfc6e0', dot: '#7a6f96' },
  build: { base: '#fff6e9', dot: '#b9a98c' },
};