# CHANGELOG.md — 版本更新记录

## [0.1.0] - 2026-10-07

- feat: 波普打砖块核心玩法（挡板 / 球 / 砖块物理、碰撞反弹）
- feat: 6 组关卡图案（星星排、金字塔、大星、棋盘、拱门、花心）+ 5 套波普配色轮换
- feat: 连击倍率系统（1.5s 窗口，连续击碎翻倍加分）
- feat: 三种道具（加宽挡板 / 三球 / 减速）
- feat: WebAudio 合成音效（反弹、击砖、爆裂、道具、过关、结束）
- feat: 生命 / 计分 / 最高分（localStorage）与暂停、静音
- feat: 粒子爆裂与漫画拟声飘字
- docs: 文档体系（AGENTS / README / DESIGN / CHANGELOG / TODO / docs/*）
- chore: Vite 脚手架与构建配置

## [0.1.1] - 2026-10-07

- chore: 新增单文件构建脚本（scripts/inline-single.mjs，内联 CSS/JS/favicon）
- deploy: Cloudflare Pages 直传部署（pop-breaker-cm3.pages.dev，ZIP 载荷方案）并验证线上可玩
