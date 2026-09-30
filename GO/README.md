# GO — Chaldea Security Organization Emblem Animation

将 Chaldea Security Organization 徽章 SVG（`chaldea.svg`，1512×2700）转换为**网页可运行的代码动画**：单文件 HTML、零外部依赖、原生 CSS + Web Animations API，科技风 HUD 视觉（深底 + 青色网格 + 扫描线 + 四角 HUD + 星环 + 光晕）。

> 纯浏览器动画（非视频、非大文件），打开页面即自动播放入场动画，支持暂停 / 重播，`?static=1` 或系统"减少动态效果"时自动降级为静态展示。

## 动效设计（当前版 v7）

| 元素 | 动效 |
| --- | --- |
| 橄榄枝环 `#olive` | 以中心点为锚向外延展（scale 0.02→1 + 轻微回旋，680ms 指数缓动） |
| 月牙 `#crescent` | 由小变大浮现（scale 0.25→1，延迟 220ms） |
| 标题点阵 `#letter-0..9` | 自左往右逐个显现（translateX(-9px)→0，间隔 85ms） |
| 背景/光晕/星点 | 淡入 + 轻量呼吸/闪烁氛围 |
| 控制 | 暂停/恢复、重播；`prefers-reduced-motion: reduce` 与 `?static=1` 走静态兜底 |

## 技术要点

- **分层**：SVG 12 个元素全部独立 id（`bg-sheet` 背景镂空路径、`olive` 橄榄枝、`crescent` 月牙、`letter-0..9` 点阵字母），可指定单元素改样式/动画。
- **关键坑**：WAAPI transform 动画会覆盖 path 自身的 `transform` 属性 —— 平移已移到外层 `<g>`，CSS 设 `transform-box: fill-box; transform-origin: center`。
- 单文件自包含：CSS/JS 全内联、favicon 为内联 SVG、字体系统回退栈。

## 版本历史（版本管理 / 变更日志）

| 版本 | 内容 | 产物 |
| --- | --- | --- |
| v1 | 初始版：象牙白徽章。误删背景镂空路径，枝叶/文字缺失 | `versions/v1.html` |
| v2 | 科技风重做 + 完整还原 12 条 SVG 路径（青色镂空背景、网格、扫描线、四角 HUD、光晕、星环） | 截图 `_shots/tech_static.jpg` |
| v3 | 科技风 + 循环动效：橄榄枝 40s 环绕旋转、月牙呼吸脉动、标题逐字点亮 | 截图 `_shots/v3_anim.jpg` |
| v5 | 改回自然显现：橄榄枝中心延展、月牙由小变大、标题自左往右，一次性入场 | `versions/v5.html` · 交付 https://aka.doubaocdn.com/s/uHx5AkGTLv |
| v6 | 循环自动重播 + 月牙 mask 挖空为空心环 | `versions/v6.html` · 交付 https://aka.doubaocdn.com/s/40au4PNQM2 |
| v7 | 按用户要求恢复 v5 的一次性自然显现（当前交付版，v5 与 v7 内容一致） | `chaldea-animation.html` · `versions/v7.html` · 交付 https://aka.doubaocdn.com/s/pWl1gwHFvC |

> 每次迭代均在交付前完成 playwright 动画状态验证（入场时序、暂停/恢复/重播、无 JS 错误）与 `shot.py` 静态 lint（无 console 错误、无横向溢出）。

## 目录结构

```
GO/
├── chaldea-animation.html   # 最新版（v7）
├── versions/                # 历史版本归档（v1 / v5 / v6 / v7）
├── scripts/build.js         # npm run build：拷贝最新版到 dist/index.html
├── package.json
└── README.md
```

## 构建与部署

- 本地构建：`npm run build` → 产物目录 `dist/`（`dist/index.html` 为最新版）。
- 部署：Cloudflare Pages（项目名 `go`，生产分支 `main`），`dist/` 目录直接上传部署；GitHub `main` 分支为源码托管。
- 线上地址：GitHub `https://github.com/Ri1035/GO` · Pages `https://go-3nr.pages.dev`（最近部署 `https://8b2ba671.go-3nr.pages.dev`）。

## 运行

直接浏览器打开 `chaldea-animation.html`（或 `dist/index.html`）即可；无需构建、无外部依赖。
