/**
 * 地形与资源定义。
 * 数据与表现分离：这里只描述"是什么"，具体怎么画由 render/sprites.js 决定。
 */

export const TILE = {
  DEEP_WATER: 0,
  SHALLOW: 1,
  SAND: 2,
  GRASS: 3,
  FOREST: 4,
  ROCK: 5,
  BUILDABLE: 6,
};

/** 哪些地形可以建造 / 产出。 */
export const TILE_INFO = {
  [TILE.DEEP_WATER]: { name: '深海', buildable: false, walkable: false },
  [TILE.SHALLOW]: { name: '浅滩', buildable: false, walkable: false },
  [TILE.SAND]: { name: '沙滩', buildable: false, walkable: true },
  [TILE.GRASS]: { name: '草地', buildable: true, walkable: true },
  [TILE.FOREST]: { name: '森林', buildable: false, walkable: true, yields: 'wood' },
  [TILE.ROCK]: { name: '岩地', buildable: false, walkable: true, yields: 'stone' },
  [TILE.BUILDABLE]: { name: '空地', buildable: true, walkable: true },
};

/** 建筑定义。cost 为建造消耗，produce 为每轮产出。 */
export const BUILDINGS = {
  HOUSE: {
    id: 'HOUSE',
    name: '波普小屋',
    cost: { wood: 4, stone: 2 },
    produce: { wood: 1 },
    emoji: '🏠',
    desc: '基础住所，向阳的立面永远刷成柠檬黄。',
  },
  MILL: {
    id: 'MILL',
    name: '风车工坊',
    cost: { wood: 8, stone: 4 },
    produce: { wood: 3 },
    emoji: '🌬️',
    desc: '四片红白条纹叶片，晴天转得格外起劲。',
  },
  QUARRY: {
    id: 'QUARRY',
    name: '采石场',
    cost: { wood: 6, stone: 2 },
    produce: { stone: 3 },
    emoji: '⛏️',
    desc: '把整座岛屿的骨架敲成碎石。',
  },
  REFINERY: {
    id: 'REFINERY',
    name: '炼色厂',
    cost: { wood: 10, stone: 10 },
    produce: { crystal: 2 },
    emoji: '🧪',
    desc: '用洋红与青调出这岛上最不正经的颜料。',
  },
  TOWER: {
    id: 'TOWER',
    name: '波普灯塔',
    cost: { wood: 6, stone: 8, crystal: 2 },
    produce: { crystal: 3 },
    emoji: '🗼',
    desc: '每隔 15 秒向下一次"灵感雨"。',
  },
};

/** 资源定义。 */
export const RESOURCES = {
  wood: { name: '木材', color: '#a9713c', icon: '🪵' },
  stone: { name: '石料', color: '#8b8299', icon: '🪨' },
  crystal: { name: '晶石', color: '#ff2d78', icon: '💎' },
};

/** 岛上居民的一句台词，用于事件气泡。 */
export const CHATTER = [
  '这网点印刷的浪花，绝了！',
  '我要把这份色卡裱起来！',
  '再点一次，我给你表演个后空翻！',
  '听说顶层的奖金是三倍的！',
  '这格子的墨也太实了吧！',
  'POW! 直接把产量打上去了！',
  '别停手，节拍正合适！',
];