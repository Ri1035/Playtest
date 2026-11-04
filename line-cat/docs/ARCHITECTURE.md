# ARCHITECTURE

项目架构、目录结构与数据组织方式。

## 总体架构

纯静态单页站点，无构建、无后端：

```
浏览器
  └── index.html
        ├── 内联 SVG（两个视图：坐姿 / 站姿）
        │     ├── defs：每图层一个 <mask>
        │     └── 内容：sway > breath > 六个图层组
        ├── assets/vendor/anime.min.js（动画引擎）
        └── 内联 <script>：状态与交互逻辑
```

- 动画由 anime.js（rAF + inline style / attribute）驱动。
- 视图状态直接挂在对应 DOM 元素上（`_done`、`_loops`、`_speed` 等），无全局状态库。

## 目录结构

```
.
├── index.html              # 页面入口（生成器产物，勿手改）
├── assets/
│   ├── svg/
│   │   ├── cat-sitting.svg # 坐姿描摹源（造型依据 / 存档）
│   │   └── cat-standing.svg# 站姿描摹源
│   └── vendor/
│       └── anime.min.js    # anime.js v3.2.2（MIT）
├── docs/                   # 深入文档
├── AGENTS.md / DESIGN.md / README.md / CHANGELOG.md / TODO.md / LICENSE
└── _build.py               # 产物生成器（开发工具）
```

以 `_` 开头的侦查 / 检查脚本与页面、`_shots/`、`_backup/` 均为开发中间产物，被 `.gitignore` 忽略，不参与发布。

## SVG 黑线构成机制

每个描摹 SVG 由 6 条 path 组成，黑线依赖 `fill-rule: nonzero` 缠绕：

- 轮廓 path 的第一个子路径是完整**外剪影**（正向，fill 黑）；第二个子路径是略小一圈的**反向内挖空**。二者叠加只保留中间条带，即视觉黑线。
- 眼睛 path 为外环 + 反向内环，形成眼睛圆圈；瞳孔是独立实心 fill 圆。
- 子路径解析：描摹文件中后续子路径以相对 `m` 给出，生成器将其换算为绝对坐标（兼容逗号、空格、负号连写三种形式）。

## 图层与变换嵌套

六个语义图层：`outline`、`eye-r`、`eye-l`、`mouth`、`pupil-r`、`pupil-l`。

变换按三层嵌套，各自独立、互不覆盖 transform：

```
<g class="sway">      rotate（身体微摆）
  <g class="breath">  scale（呼吸）
    <g class="lyr">            轮廓 / 嘴巴
    <g class="lyr blinkpart">  眼睛 / 瞳孔（scaleY 眨眼）
```

## 描边开场机制

fill 形状无法直接用 stroke-dashoffset 描边，且 **clipPath 在 Chromium / Edge 动画期间不实时重算裁剪区**（已验证 CSS、WAAPI、rAF 均失效），故采用 SVG **mask**：

```
<mask id="mask-…">
  <rect fill="#000">                         黑底（不显示）
  <path class="maskdraw" stroke="#fff" …>    白色粗线沿外边缘路径
</mask>
```

- 白色粗线宽度覆盖该部位最粗 fill 条带（坐姿 180、站姿 56）。
- anime timeline 逐图层动画 `stroke-dashoffset`（全长 → 0），mask 实时重算。
- 开场结束后移除所有 mask，释放完整形状供循环动画自由变换。

## 循环动画

- 呼吸 / 微摆：anime 往返无限循环，作用于 breath / sway 组。
- 眨眼：setTimeout 链按随机间隔触发单次 anime（眼睛四层 scaleY）。
- 速度：滑块值写入 anime 实例的 `speed`；眨眼时长与间隔同步缩放。

## 降级策略

- anime.js 加载失败：mask 直接移除、造型完整静态显示，图层开关仍可用。
- `prefers-reduced-motion`：开场直接完整、循环全部停止。
