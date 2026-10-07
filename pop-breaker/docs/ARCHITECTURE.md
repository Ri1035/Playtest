# ARCHITECTURE.md — 项目架构、目录结构与数据组织

## 目录结构

```
pop-breaker/
├── index.html            # 入口页（画布 + HUD + 菜单 / 结束屏）
├── package.json
├── vite.config.js
├── AGENTS.md / README.md / DESIGN.md / CHANGELOG.md / TODO.md
├── public/favicon.svg
├── docs/                 # 项目文档（下沉）
└── src/
    ├── main.js           # 启动、DOM 桥接、画布适配
    ├── styles.css        # 波普风全局样式
    └── game/
        ├── engine.js     # 状态机、物理、连击、道具、渲染调度
        ├── sprites.js    # 全部程序化绘制函数
        ├── levels.js     # 砖块类型、关卡图案、配色
        └── audio.js      # WebAudio 合成音效
```

## 数据流

- `main.js` 构造 `Engine` 并注入 UI 桥（更新 HUD / 切换屏）。
- `Engine` 持有唯一游戏状态（`state / score / lives / level / balls / bricks / powerups / particles / popups`）。
- 每帧 `loop() → update(dt) → render()`；`update` 只改状态，`render` 只读状态。
- `levels.js` 提供纯数据（图案字符矩阵 → 砖块列表），`sprites.js` 无状态纯函数。

## 状态机

`menu → playing ⇄ paused → gameover → (start) playing`

## 数据组织

- 最高分：`localStorage['pop-breaker-best']`
- 砖块类型由单字符代号（s/d/l/c/b/f/o/h）定义，关卡特写为 15 字符行字符串
