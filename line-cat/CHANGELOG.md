# CHANGELOG

本项目版本记录。版本格式 `vX.Y`，次版本逢 10 进 1。

## v1.0 — 2026-10-10

首个公开版本。

- 两个造型：坐姿歪头猫（含心形大尾巴）、站姿猫，标签切换。
- 手绘描边开场：基于 SVG mask，由 anime.js timeline 驱动，线条沿路径逐段画出。
- 循环生命感动画：呼吸（缩放）、身体微摆（旋转）、随机间隔慢眨眼。
- 六个语义图层独立开关；动画开关、0.5–2x 速度滑块、重播描边。
- 纯白底、黑线、无阴影；响应式布局，桌面与移动端适配。
- 尊重 `prefers-reduced-motion`；键盘可达。
- 建立项目文档：AGENTS / DESIGN / README / TODO 与 `docs/` 系列。
- 仓库经 GitHub 管理，Cloudflare Pages 部署。
- 在线演示：<https://line-cat.pages.dev>
