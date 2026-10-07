# REGISTRY.md — 资源注册表、构建校验与分发说明

本文件是游戏内所有程序化资源的登记清单，新增 / 修改资源时必须同步维护。

## 调色板（`sprites.js` → `PALETTES`）

| 索引 | 名称 | 海面 | 沙滩 | 草地 | 角色身体 | 主题 |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Classic | `#2B7AFF` | `#FFC93C` | `#2A9D4E` | `#FF3B30` | 经典红黄蓝 |
| 1 | Lagoon | `#00B4C8` | `#FF9F1C` | `#0FA958` | `#E71D36` | 蓝绿橙 |
| 2 | Grape | `#8338EC` | `#FFD166` | `#06D6A0` | `#EF476F` | 紫粉绿 |
| 3 | Noir | `#2B2B2B` | `#F4F1DE` | `#6A994E` | `#FF3B30` | 黑白金 |

槽位契约（每套必填 10 项）：`sea / seaDot / sand / sandLight / grass / grassDot / body / hair / face / accent`。

## 分值元素（`sprites.js` → `ITEMS`）

| id | 半径 | 基础分 | 飘字色 | 说明 |
| --- | --- | --- | --- | --- |
| star | 22 | 10 | `#FFD166` | 五角星 |
| cherry | 20 | 10 | `#EF476F` | 樱桃 |
| banana | 20 | 10 | `#FFD166` | 香蕉 |
| lips | 20 | 10 | `#EF476F` | 嘴唇 |
| flower | 22 | 10 | `#F78C6B` | 花朵 |
| soda | 22 | 15 | `#E8E8E8` | 汽水罐（POP） |
| donut | 20 | 15 | `#F9A8D4` | 甜甜圈 |
| cone | 20 | 15 | `#F4A261` | 冰淇淋 |

## 道具（`sprites.js` → `POWERUPS`）

| id | 半径 | 持续 | 效果 |
| --- | --- | --- | --- |
| magnet | 24 | 5s | 吸附 190px 内元素 |
| freeze | 24 | 4s | 全场海鸥冻结 |

生成权重：磁铁 5% / 冰冻 5% / 普通元素 90%。

## 静态装饰（`world.js` → `makeDecorations`）

| 类型 | 数量 | 绘制函数 | 半径区间 |
| --- | --- | --- | --- |
| palm | 9 | `drawPalm` | 0.8-1.3 |
| flower | 16 | `drawFlowerDecor` | 0.8-1.3 |
| rock | 7 | `drawRock` | 0.8-1.3 |
| can | 5 | `drawCanDecor` | 0.8-1.3 |

## 音效（`audio.js` → SoundManager）

| 方法 | 触发 | 合成方式 |
| --- | --- | --- |
| pop | 收集 | 方波，音高随连击上升 |
| hit | 受击 | 锯齿波滑降 + 噪声 |
| level | 升级 | 4 音上行琶音 |
| power | 道具 | 双音上行 |

## 构建校验

- 构建：`npm run build`，产物在 `dist/`。
- 静态校验：产物无外部网络资源引用（`grep -r "http" dist/` 仅允许页面自身路径），保证离线可玩。
- 数据校验：`ITEMS` / `POWERUPS` / `PALETTES` 新增条目必须同时提供全部契约字段，缺失即视为未完成（评审拒绝）。

## 分发说明

- 全部资源随仓库分发，无 CDN 依赖。
- 新增资源文件（如未来的位图素材）放入 `public/`，由 Vite 原样拷贝进 `dist/`。
- 仓库分发校验：`npm ci && npm run build` 全新环境可复现。
