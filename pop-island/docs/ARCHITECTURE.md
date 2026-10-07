# ARCHITECTURE.md — 项目架构、目录结构与数据组织

## 技术选型

- **原生 JS（ES Modules）+ Canvas 2D**：无框架、无运行时依赖，产物小、启动快、离线可靠。
- **Vite 5**：开发服务器（HMR）、生产构建（Rollup）、静态资源处理。
- **WebAudio**：程序化合成音效，无音频素材文件。

选型理由：波普视觉全部可用 Canvas 矢量绘制程序化生成，不需要位图素材管线；框架层不提供额外收益，反而增加产物体积与维护面。

## 目录结构

```
pop-island/
├── index.html            # 单页壳（菜单/暂停/HUD 均为 DOM 覆盖层）
├── vite.config.js        # base './'，outDir dist
├── package.json
├── AGENTS.md             # 协作与开发规范
├── README.md             # 项目简介
├── DESIGN.md             # 视觉设计规范
├── CHANGELOG.md          # 版本记录
├── TODO.md               # 计划与进度
├── docs/                 # 下沉文档
├── public/favicon.svg    # 站点图标
└── src/
    ├── main.js           # 入口：DOM 装配、UI 事件、兼容兜底
    ├── styles.css        # 波普全局样式（HUD/菜单/遮罩）
    └── game/
        ├── engine.js     # 游戏引擎：主循环/状态机/输入/相机/碰撞/生成/渲染
        ├── sprites.js    # 精灵绘制库 + 调色板 + 元素/道具注册表
        ├── entities.js   # 实体类（Player/Item/Gull/Particle/Popup）
        ├── world.js      # 世界尺寸/岛屿形状/落点/装饰生成
        └── audio.js      # WebAudio 合成音效
```

## 模块职责与依赖方向

```
main.js → engine.js → world.js / sprites.js / entities.js / audio.js
main.js → audio.js（解锁音频、静音切换）
```

- `sprites.js` 与 `world.js` 无任何内部依赖（纯函数/常量）。
- `entities.js` 依赖 `sprites.js` 的注册表读取半径。
- `engine.js` 是唯一持有游戏状态（分数、连击、关卡、实体数组）的模块。
- DOM 只被 `main.js` 与 `engine.js`（经 `ui` 接口）访问；引擎不直接查询 DOM 元素，全部通过注入的 `ui` 对象。

## 核心数据结构

```js
// 引擎状态
state: 'menu' | 'playing' | 'paused'
level, score, combo, comboTimer, paint, paintMax, best
player: Player { x, y, r, dir, invUntil, magnetUntil }
items: Item[]   // 分值元素 + 道具（isPower 区分）
gulls: Gull[]
particles: Particle[]   // 一次性特效
popups: Popup[]         // 飘字
paletteIndex            // 当前调色板
```

## 渲染管线

1. 每帧 `requestAnimationFrame` → `update(dt)`（dt 上限 0.05s 防物理爆炸）→ `render()`。
2. `render()`：DPR 变换 → 世界变换（相机 + 震动偏移）→ 依次绘制：
   海面离屏层（`seaLayer`，2400×1800）→ 岛屿离屏层（`islandLayer`）→ 收集物 → 海鸥 → 玩家 → 粒子 → 飘字 → 屏幕空间摇杆。
3. **离屏缓存**：海面与岛屿层在 `buildLayers()` 中一次绘制完成（仅调色板/等级变化时重建），动态实体每帧重绘。这是低端设备流畅的关键。

## 坐标系统

- 世界坐标：2400×1800，岛屿中心 (1200, 900)。
- 相机：视口 = Canvas CSS 尺寸，lerp 跟随玩家，clamp 到世界边界。
- 屏幕坐标（摇杆/UI）：Canvas CSS 像素，与 DPR 无关。

## 数据组织

- **数值配置**：玩法数值集中在 `engine.js` 常量与 `PROJECT-SPEC.md`；视觉配置集中在 `sprites.js` 的 `PALETTES`。
- **持久化**：仅两项 localStorage：`popIslandBest`（最高分）、`popIslandMuted`（静音）。
- **无服务端**：不发送任何网络请求（字体/图片/接口均无）。
