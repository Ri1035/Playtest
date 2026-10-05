# GO — Chaldea Security Organization Emblem Animation

> 将 Chaldea Security Organization 徽章 SVG 转换为网页可运行的代码动画：单文件 HTML、零外部依赖、原生 CSS + Web Animations API，科技风 HUD 视觉。

![HTML5](https://img.shields.io/badge/-HTML5-e34f26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/-CSS3-1572b6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-f7df1e?logo=javascript&logoColor=black)
![SVG](https://img.shields.io/badge/-SVG-ffb13b?logo=svg&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-在线体验-F38020?logo=cloudflare&logoColor=white)

## ✨ 项目简介

把 Chaldea Security Organization 徽章 SVG（1512×2700）做成纯浏览器代码动画（非视频、非大文件）。打开页面即自动播放入场动画，支持暂停 / 重播；深底 + 青色网格 + 扫描线 + 四角 HUD + 星环 + 光晕的科技风视觉，`?static=1` 或系统开启「减少动态效果」时自动降级为静态展示。

## 🚀 特性亮点

| 维度 | 说明 |
| --- | --- |
| 徽章动画 | 橄榄枝环以中心点为锚向外延展，月牙由小变大浮现，标题点阵自左往右逐个点亮 |
| 氛围背景 | 背景 / 光晕 / 星点淡入并带轻量呼吸、闪烁氛围 |
| 播放控制 | 暂停 / 恢复、重播；尊重系统「减少动态效果」并提供 `?static=1` 静态兜底 |
| 可定制 | SVG 各元素独立 id，可单独指定某元素的样式与动画 |

## 📖 快速开始

无需构建、无外部依赖，直接用浏览器打开 `chaldea-animation.html`（或 `dist/index.html`）即可。

本地构建（把最新版拷到 `dist/index.html`）：

```bash
npm run build
```

## 🌐 在线体验

| 入口 | 地址 |
| --- | --- |
| 在线体验 | https://go-3nr.pages.dev |
| 源码仓库 | https://github.com/Ri1035/GO |

## 🧰 技术栈

- 单文件 HTML：CSS / JS 全部内联，favicon 为内联 SVG
- 原生 CSS 动画 + Web Animations API（WAAPI）
- 零外部依赖，字体走系统回退栈

## 🙏 参考与致谢

- Fate/Grand Order（FGO）游戏中的 Chaldea Security Organization（迦勒底安全机构）徽章 SVG 素材 —— 本项目动画的素材原型

> 详细实现见源码，本文不做展开。

## 修改记录

> 说明：修改记录仅记录文档维护变更，不计入版本更新。

| 日期 | 修改内容 |
| --- | --- |
| 2026-10-05 | README 精简为项目介绍，补充 topics 标签 |
| 2026-10-05 | README 美化丰富：补充在线体验与参考来源，完善使用说明 |
