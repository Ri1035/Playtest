# GSAP Skills 演示站

> GSAP（GreenSock Animation Platform）官方 AI Skills 库的镜像仓库，附带一个精致的动画演示首页。

![HTML5](https://img.shields.io/badge/-HTML5-e34f26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/-CSS3-1572b6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-f7df1e?logo=javascript&logoColor=black)
![GSAP](https://img.shields.io/badge/-GSAP-88ce02)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 项目简介

本仓库是 GSAP 官方 Agent Skills 文档库的镜像，附带一个深色主题的动画演示首页。演示首页由 GSAP 驱动，包含 hero 入场编排、技能清单滚动揭示，以及四个可交互的现场实验（Tween / Stagger / Timeline / ScrollTrigger scrub）。

## 🚀 特性亮点

| 路径 | 说明 |
| --- | --- |
| `index.html` | GSAP 动画演示首页（hero 入场编排、滚动揭示、四个可交互动画实验） |
| `skills/` | 官方 Agent Skills 文档（核心 API、时间线、滚动触发、插件、React、性能、框架） |
| `examples/` | 官方最小参考示例（vanilla / React / Vue / Nuxt） |

## 📖 快速开始

纯静态站点，无构建流程。用任意静态服务器预览即可：

```bash
python3 -m http.server 8080
# 打开 http://localhost:8080
```

## 🧰 技术栈

- 纯静态站点（Cloudflare Pages 构建命令为 None，合入 main 后自动发布）
- GSAP 3.12.5 + ScrollTrigger（jsDelivr CDN）
- 原生 HTML / CSS / JavaScript
- 许可证：MIT（与上游一致）

## 🙏 参考与致谢

- [greensock/gsap-skills](https://github.com/greensock/gsap-skills) —— GSAP 官方 Agent Skills 文档库上游仓库，本仓库为其镜像（MIT，与上游一致）

> 详细实现见源码，本文不做展开。

## 修改记录

> 说明：修改记录仅记录文档维护变更，不计入版本更新。

| 日期 | 修改内容 |
| --- | --- |
| 2026-10-05 | README 精简为项目介绍，补充 topics 标签 |
| 2026-10-05 | README 美化丰富：补充在线体验与参考来源，完善使用说明 |
