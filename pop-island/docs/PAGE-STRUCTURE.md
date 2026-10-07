# 页面结构说明

单页应用，仅一个 HTML 页面。以下自上而下说明结构与职责。

## 整体布局

```
┌─────────────────────────────────────┐
│  masthead标题区                │
├─────────────────────────────────────┤
│  hud        资源与状态条             │
├─────────────────────────────────────┤
│  stage      游戏画布                │
├─────────────────────────────────────┤
│  hint       事件提示                │
├─────────────────────────────────────┤
│  toolbar-wrap  建造工具栏            │
├─────────────────────────────────────┤
│  foot       音效开关 / 重开 / 版权   │
└─────────────────────────────────────┘
```

外层 `.app` 负责最大宽度约束（1080px）与纵向flex 布局；`body::before` 提供全屏网点底纹。

## masthead — 标题区

```html
<header class="masthead">
  <h1 class="logo">
    <span class="logo-pop">POP</span>
    <span class="logo-island">ISLAND</span>
  </h1>
  <p class="tagline">印刷出来的岛屿 · 网点与拟声词</p>
</header>
```

**设计意图**：两个色块并置（洋红 + 青），整体旋转 `-2deg`，硬投影。是典型的丝网印刷标签排版。

`.tagline` 使用反色（墨黑底 + 纸白字），形成视觉停顿。

## hud — 资源与状态条

```html
<section class="hud">
  <div class="res-card res-wood">
    <span class="res-icon">🪵</span>
    <span class="res-label">木材</span>
    <span class="res-value" id="res-wood">0</span>
  </div>
  <!-- res-stone / res-crystal 同构 -->
  <div class="stat"><span class="stat-label">人口</span><span class="stat-value" id="stat-pop">1</span></div>
  <div class="stat"><span class="stat-label">建筑</span><span class="stat-value" id="stat-buildings">0</span></div>
  <div class="stat"><span class="stat-label">连击</span><span class="stat-value" id="stat-combo">-</span></div>
</section>
```

**两类卡片的区别**：

| 类型 | 用途 | 样式 |
| --- | --- | --- |
| `.res-card` | 三种可采集资源 | 各自的浅色底（米黄 / 淡紫 / 淡粉） |
| `.stat` | 派生指标（人口/建筑/连击） | 统一绿底 |

数值用 `textContent` 更新，由 `refreshHud()` 每帧调用。**这些是纯文本节点，不使用 innerHTML**。

## stage — 游戏画布

```html
<main class="stage">
  <canvas id="board" aria-label="波普小岛游戏画面"></canvas>
</main>
```

画布本身不含任何子元素，所有内容由 Canvas 2D API 绘制。

**尺寸策略**：`width: 100%`，高度 `min(60vh, 520px)`。实际位图尺寸按 `devicePixelRatio`（上限 2）放大以保证高清，再通过 `ctx.setTransform` 缩回 CSS 尺寸。

**缩放计算**（`Renderer.resize()`）：

```
scale = min(可用宽 / 棋盘像素, 可用高 / 棋盘像素, 1.35) * 0.94
```

- 上限 1.35 防止大屏上格子过大而显得幼稚
- `* 0.94` 留出边距，避免岛屿贴边
- 下限 0.4 防止小屏下不可读

## hint — 事件提示

```html
<p class="hint" id="hint" role="status" aria-live="polite">欢迎登岛！</p>
```

所有游戏事件（建造成功、材料不足、点击海洋、切换建筑）都通过 `say()` 更新此处文本。

**无障碍**：`role="status"` + `aria-live="polite"` 使屏幕阅读器自动播报变化，不会打断用户。

## toolbar-wrap — 建造工具栏

```html
<section class="toolbar-wrap">
  <h2 class="toolbar-title">建造</h2>
  <div class="toolbar" id="toolbar"></div>
</section>
```

工具栏**在运行时由 JS 生成**（`buildToolbar()`），数据源是 `BUILDINGS` 常量。新增建筑只需改数据定义，UI 自动同步。

每个按钮结构：

```html
<button class="build-btn" data-type="HOUSE">
  <span class="btn-emoji">🏠</span>
  <span class="btn-name">波普小屋</span>
  <span class="btn-cost">🪵4 🪨2</span>
</button>
```

**三种状态**：

| 状态 | 类名 | 视觉 |
| --- | --- | --- |
| 默认 | — | 青底、洋红 hover |
| 选中 | `.active` | 洋红底白字 + 更大位移 |
| 材料不足 | `.unaffordable` | 灰底灰字（仅当前选中项） |

`title` 属性提供建筑描述作为原生 tooltip。

## foot — 页脚

```html
<footer class="foot">
  <button type="button" id="btn-sound">🔊 音效开</button>
  <button type="button" id="btn-reset">🏝️ 换一座岛</button>
  <span class="credit">波普小岛 · 纯 Canvas 绘制</span>
</footer>
```

**换岛按钮**属于不可逆操作（清除存档并重新生成），因此在 `main.js` 中用 `window.confirm` 二次确认。这符合 `AGENTS.md` 中"不可逆操作先询问"的要求。

`.credit` 说明技术实现方式，不含任何生成工具署名。

## 画布内的可视元素

以下元素不在 DOM 中，全部由 Canvas 绘制：

| 元素 | 实现位置 | 绘制时机 |
| --- | --- | --- |
| 地形与网点 | `bakeTerrain()` | 烘焙一次，每帧 blit |
| 建筑 | `drawBuilding()` | 每帧 |
| 悬停高亮 | `drawHover()` | 每帧（仅鼠标在画布上时） |
| 拟声词气泡 | `drawBurst()` | 特效生命周期内 |
| 资源飘字 | `drawFloater()` | 特效生命周期内 |
| 水面涟漪 | `drawRipple()` | 特效生命周期内 |

**悬停反馈的双态设计**：

- 可建造 → 青色虚线框
- 不可建造 → 洋红虚线框 + 格内洋红叉号

不依赖颜色单独传达信息（叉号是形状线索），满足 `DESIGN.md` 的无障碍要求。