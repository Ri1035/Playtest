# 项目架构

## 技术选型

原生 ES Module + Canvas 2D，**零依赖、零构建**。

### 为什么不用游戏引擎

| 方案 | 评估 |
| --- | --- |
| Phaser / PixiJS | 成熟的精灵与场景管理，但为波普平涂+网点这种**程序化矢量绘制**的玩法带来了不必要的抽象层和体积 |
| 纯 Canvas | 与需求高度契合：本作没有任何位图素材，唯一的图形需求是"每帧按坐标画形状"，这正是 Canvas 的原生能力 |
| SVG DOM | 网点需要 `pattern` + 数百个 `<rect>`，DOM 节点数量会拖垮性能 |

**结论**：本作的图形需求是"少量矢量图形 + 大量重复图案填充"，Canvas 2D 配合离屏图案缓存是最直接的性能与代码复杂度最优解。

### 为什么零构建

Cloudflare Pages 可直接托管源目录。引入打包器意味着：需要 `node_modules`、构建产物目录、`_headers` 路径重写，以及部署失败时的排错成本——而收益仅是语法降级。现代浏览器已全面支持 ES Module。

## 目录结构

```
pop-island/
├── index.html              入口，含完整 DOM 骨架
├── assets/
│   └── style.css           视觉系统（CSS 变量 + 组件）
├── src/
│   ├── main.js             装配层：渲染循环、事件绑定、HUD 刷新
│   ├── core/
│   │   ├── rng.js          确定性随机：mulberry32、值噪声、fBm
│   │   └── state.js        状态容器、存档读写、建造与生产规则
│   ├── game/
│   │   ├── defs.js         数值定义：地形、建筑、资源
│   │   └── island.js       岛屿生成算法
│   ├── render/
│   │   ├── palette.js      调色板（唯一色彩来源）
│   │   ├── patterns.js     Ben-Day 网点与斜线图案系统
│   │   ├── sprites.js      地形与建筑绘制
│   │   ├── effects.js      拟声词气泡、飘字、涟漪
│   │   └── renderer.js     渲染调度与坐标转换
│   └── ui/
│       └── audio.js        WebAudio 程序化音效
├── docs/                   项目文档
└── .devtools/              开发期自检（不参与线上运行）
```

## 分层与依赖方向

```
main.js
  ├── core/state   ──► game/island, game/defs
  ├── game/defs
  ├── render/renderer ──► render/sprites ──► render/patterns ──► render/palette
  │                     └─► render/effects
  └── ui/audio
```

**依赖只能自上而下，禁止反向引用。**

具体约束：

- `render/` 不导入 `core/` 或 `game/` 的状态逻辑（`sprites.js` 仅从 `defs.js` 取建筑元数据）
- `game/` 不感知Canvas 与 DOM
- `core/state.js` 是唯一的状态写入点，其他模块只读
- `palette.js` 是唯一色彩定义处，不在 CSS 或 Canvas 逻辑中重复声明色值

## 关键设计决策

### 1. 地形烘焙为离屏Canvas

地形是静态的（岛屿生成后不再变化）。若每帧重绘484 个格子，每格还要做一次网点填充，开销不可接受。

**方案**：`bakeTerrain()` 把整片地形绘制到离屏 canvas 并缓存，每帧只 `drawImage` 一次。

**收益**：从每帧 484 次填充 + 484 次图案叠加，降到每帧 1 次位图拷贝。

**触发时机**：生成新岛或读取存档时调用 `renderer.rebake(state)`。

### 2. 网点图案模块级缓存

`getDotPattern()` 在离屏 canvas 上烘焙一个小 tile，转为 `CanvasPattern` 后存入 `Map`。

**缓存键必须包含全部视觉参数**（颜色、半径、间距）。若只按颜色缓存，改了半径会导致所有地形共用旧图案——这是一个已发生并修复的 bug。

### 3. 状态的唯一写入口

所有状态修改集中在 `core/state.js` 导出的函数：`placeBuilding`、`tickProduction`、`saveGame`。

**收益**：存档与 HUD 刷新只需挂钩一处，不会出现"某个模块改了状态但忘了持久化"的情况。

### 4. 确定性随机

岛屿生成使用 mulberry32 + 字符串/数字种子，而非 `Math.random()`。

**原因**：存档只存种子与地形数组。若用 `Math.random()`，同一存档重载后的地形校验会失效；确定性随机让"种子 → 地形"成为可复现的纯函数，也是单元测试能验证生成算法的前提。

### 5. 坐标转换集中在 Renderer

`clientToGrid()` 是屏幕坐标 → 格子坐标的唯一实现，处理了 DPR、缩放比与居中偏移三个因素。

**收益**：输入处理只管调用，不重复实现变换逻辑；避免缩放改动时多处遗漏。

## 数据结构

### 地形

```js
tiles: Uint8Array(GRID_SIZE * GRID_SIZE)  // 一维数组，索引 = y * GRID_SIZE + x
```

用一维数组而非嵌套数组，是为了让存档可直接 `Array.from()` / `Uint8Array.from()` 往返，且索引计算只需一次乘法。

### 建筑

```js
buildings: Array(GRID_SIZE * GRID_SIZE)  // 与地形同索引；每格最多一个建筑，null 表示空
building  = { type: string, tileIndex: number, level: number, timer: number }
```

建筑与地形共用同一索引空间，无需坐标转换即可互查。

### 存档

`localStorage['pop-island-save-v1']`，JSON 序列化。`Uint8Array` 需显式转普通数组。

读取时做完整校验（种子类型、数组长度、字段存在性），任一项不符返回 `null` 并开新档——损坏存档不应导致白屏。

## 渲染循环

```
requestAnimationFrame
  ├── tickProduction(dt)   每 2 秒结算一次资源
  ├── updateEffects(dt)    更新拟声词/飘字/涟漪生命周期
  ├── render(state, dt)    blit 烘焙地形 → 悬停高亮 → 建筑 → 特效
  ├── refreshHud()         更新 DOM 数值
  └── 每 20 秒 saveGame()
```

用 `performance.now()` 计算增量时间 `dt`，特效生命周期基于 `dt` 而非帧数，因此在不同刷新率的显示器上速度一致。

## 性能预算

| 项目 | 数量级 |
| --- | --- |
| 每帧位图拷贝 | 1 次 |
| 每帧矢量图形 | ≤ 建筑数 + 特效数（通常 < 100） |
| 每帧 DOM 写入 | 6 个 `textContent`（数值） |
| 主线程长任务 | 无（无同步 XHR、无大数组排序） |

目标：稳定 60fps @ 484 格 + 9 建筑。

## 扩展指引

|需求 | 应改动 |
| --- | --- |
| 新增建筑类型 | `game/defs.js` 加定义 + `render/sprites.js` 加绘制函数 |
| 新增地形 | `game/defs.js` 加枚举与 `TILE_INFO` + `sprites.js` 加 `drawTileDecor` 分支 |
| 新增资源 | `game/defs.js` 加 `RESOURCES` 条目 + HUD 增加卡片 |
| 新增特效 | `render/effects.js` 加类型，实现 `spawn*` 与 `draw*` 并接入 `updateEffects` |
| 调整岛屿尺寸 | `game/island.js` 的 `GRID_SIZE`，注意存档会失效，需同步更新 `STORAGE_KEY` |