# PAGE-STRUCTURE.md — 页面与场景结构说明

本游戏为**单页应用**：一个 Canvas 游戏画面 + 三个 DOM 覆盖层（主菜单 / 暂停 / 特效遮罩），无路由跳转。

## 页面总览

```
index.html
└── #game-wrap（全屏容器）
    ├── #game-canvas          游戏画面（Canvas，z 0）
    ├── #hud                  游戏内 HUD（z 1，仅 playing 显示）
    │   ├── #score-box        左上：分数 + 最高分
    │   ├── #combo-box        顶部居中：连击徽章（≥2 连击时显示）
    │   ├── #paint-box        底部居中：涂色进度条 + 等级
    │   └── #mute-btn         右上：音效开关
    ├── #menu-screen          主菜单（z 10）
    ├── #pause-screen         暂停面板（z 20，hidden 默认）
    ├── #level-flash          升级遮罩（z 30，动画后隐藏）
    └── #hit-flash            受击遮罩（z 29，动画后隐藏）
```

## 场景状态与显示关系

| 游戏状态 | Canvas | HUD | 主菜单 | 暂停 | 特效遮罩 |
| --- | --- | --- | --- | --- | --- |
| menu | 渲染岛屿漫游 | 隐藏 | 显示 | 隐藏 | - |
| playing | 渲染玩法 | 显示 | 隐藏 | 隐藏 | 按需 |
| paused | 定格渲染 | 显示 | 隐藏 | 显示 | - |

- 主菜单状态下 Canvas 持续渲染岛屿与海鸥漫游作为背景氛围，菜单为半透明网点的黄色底遮罩。
- 暂停时主循环停止 `update()` 的游戏逻辑，但渲染继续（画面定格），暂停面板浮于其上。

## 状态切换入口

| 动作 | 触发 | 处理 |
| --- | --- | --- |
| 开始游戏 | 主菜单"开始游戏"按钮 | `sound.unlock()` → `game.start()` → 隐藏菜单 |
| 暂停 | P / Esc / 失焦 / 页面隐藏 | `game.pause()` |
| 继续 | 暂停面板"继续" / P / Esc | `game.resume()` |
| 重开 | 暂停面板"重新开始" | `game.restart()` |
| 音效 | 右上按钮 | `sound.toggleMute()` 并同步按钮文案 |

## HUD 更新契约

- `engine.updateHUD()` 每帧同步 DOM：分数（仅变化时写）、连击（仅变化时写）、连击倒计时条宽度、涂色条宽度、等级文本。
- 最高分同时写入 localStorage（超过即写）并在主菜单显示。

## 响应式

- 容器为 `position: fixed; inset: 0`，Canvas 100% 铺满；DPR 上限 2。
- 窄屏（≤640px）下 HUD 字号与按钮内边距按媒体查询缩小。
- 触屏摇杆按下位置即基座位置，避开 HUD 区域（HUD 不拦截指针事件，摇杆仅响应 touch 指针）。
