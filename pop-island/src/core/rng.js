/**
 * 确定性随机数工具。
 * 岛屿生成依赖固定种子，保证同一存档可复现同一座岛。
 */

/** mulberry32：轻量确定性伪随机数发生器。 */
export function createRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 把任意字符串映射为 32 位种子。 */
export function hashSeed(text) {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

/** 经典 2D 值噪声，输出 0..1，用于地形起伏。 */
export function createValueNoise(rng) {
  const SIZE = 256;
  const table = new Float32Array(SIZE * SIZE);
  for (let i = 0; i < table.length; i += 1) {
    table[i] = rng();
  }
  const at = (x, y) => table[(y & 255) * SIZE + (x & 255)];
  const smooth = (t) => t * t * (3 - 2 * t);

  return function noise(x, y) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const tx = smooth(x - x0);
    const ty = smooth(y - y0);
    const top = at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx;
    const bottom = at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx;
    return top * (1 - ty) + bottom * ty;
  };
}

/** 分形叠加噪声，octaves 越多细节越丰富。 */
export function createFbm(rng, octaves = 4, persistence = 0.5) {
  const noise = createValueNoise(rng);
  return function fbm(x, y) {
    let amplitude = 1;
    let frequency = 1;
    let sum = 0;
    let norm = 0;
    for (let i = 0; i < octaves; i += 1) {
      sum += noise(x * frequency, y * frequency) * amplitude;
      norm += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return sum / norm;
  };
}

/** 从数组中按权重取一个元素。 */
export function weightedPick(rng, entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.value;
  }
  return entries[entries.length - 1].value;
}