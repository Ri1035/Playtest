# PAGE-STRUCTURE

网站页面与组件结构说明。

本项目为单页（`index.html`），DOM 层级如下：

```
<body>
└── div.wrap
    ├── div.stage                         左侧舞台
    │   ├── div.tabs
    │   │   ├── button.tab[data-tab="sit"]    坐姿猫（默认激活）
    │   │   └── button.tab[data-tab="stand"]  站姿猫
    │   └── div.view[data-view="sit"].active      坐姿视图
    │       └── svg.cat-svg
    │           ├── defs
    │           │   └── mask × 6（黑底 rect + .maskdraw 白线路径）
    │           ├── rect 白底
    │           └── g.sway > g.breath
    │               └── g.lyr[.blinkpart] × 6
    │                   └── path（原始 d，fill #111）
    └── aside.panel                       右侧控制面板
        ├── h1 / .sub
        ├── fieldset 图层开关（6 复选框，[data-layer-toggle]）
        ├── fieldset 动画开关（呼吸 / 眨眼）
        ├── fieldset 节奏（#speed 滑块 + #speed-val）
        └── button#replay
```

站姿视图 `div.view[data-view="stand"]` 结构相同，默认无 `.active`（`display:none`）。

## 区块详情

### 标签栏

- 两个胶囊按钮，激活态黑底白字；点击切换视图并按需播放开场。

### 视图与 SVG

- 每个视图独立维护开场状态（`_done`）与循环动画实例（`_loops`）。
- mask 在 `<defs>` 中，初始通过图层组的 `mask` 属性引用；开场结束后移除引用。
- 身体 / 眼睛变换原点记录在视图 `data-body-origin`、`data-eye-origin`。

### 控制面板

- 图层开关：两个视图中同名图层同步显隐。
- 动画开关：呼吸 / 微摆控制 sway、breath 两个循环；眨眼控制随机眨眼调度。
- 速度滑块：实时写入循环 anime 实例速率。
- 重播：复位 sway / breath 后重新播放当前视图开场。

## 响应式

- 宽屏：舞台与面板左右排列。
- 窄屏（约 720px 以下）：纵向堆叠，猫图与面板占满可用宽度。
