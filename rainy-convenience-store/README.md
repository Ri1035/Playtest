# 雨夜场景集 · 便利店 & 魔法街区

> 单页 Three.js 三渲二微缩 3D 场景：一个页面内置「雨夜便利店」与「雨夜魔法街区」两个街角场景，可一键切换。

![Three.js](https://img.shields.io/badge/-Three.js-000000?logo=threedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-f7df1e?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/-HTML5-e34f26?logo=html5&logoColor=white)
![WebGL](https://img.shields.io/badge/-WebGL-990000?logo=webgl&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-在线体验-F38020?logo=cloudflare&logoColor=white)

## ✨ 项目简介

雨夜场景集是一个纯前端 3D 演示页面。页面通过 CDN 加载 Three.js，用程序化建模拼出两个雨夜街角微缩场景——日式便利店与魔法杂货铺街区，统一采用三渲二卡通渲染与雨夜氛围特效。打开页面即可拖拽环绕观看，无需构建步骤。

## 🚀 特性亮点

| 维度 | 说明 |
| --- | --- |
| 双场景切换 | 一个页面内置两个场景，顶栏一键切换：雨夜便利店 / 雨夜魔法街区 |
| 三渲二卡通渲染 | `MeshToonMaterial` + 4 段渐变贴图，干净的卡通色块 |
| 轨道相机 | OrbitControls：鼠标拖拽旋转视角、滚轮缩放，自由观看街角细节 |
| 雨景氛围 | 全屏雨丝粒子与地面水波纹 / 溅落效果 |
| 程序化建模 | 便利店店面与完整店内陈设、魔法杂货铺街景均为程序化建模 |
| 易读结构 | 单文件 `index.html`，结构简单，适合 Three.js 入门参考 |

## 📖 快速开始

用浏览器直接打开 `index.html` 即可（页面通过 CDN 加载 three.js，需联网）；也可放到任意静态服务器上访问。

## 🌐 在线体验

| 入口 | 地址 |
| --- | --- |
| 在线体验 | https://rainy-convenience-store.pages.dev |
| 源码仓库 | https://github.com/Ri1035/rainy-convenience-store |

## 🧰 技术栈

- Three.js（WebGL）+ OrbitControls
- 原生 HTML / CSS / JavaScript
- 三渲二（MeshToonMaterial）程序化 3D 建模

## 修改记录

> 说明：修改记录仅记录文档维护变更，不计入版本更新。

| 日期 | 修改内容 |
| --- | --- |
| 2026-10-05 | README 精简为项目介绍，补充 topics 标签 |
| 2026-10-05 | README 美化丰富：补充在线体验与参考来源，完善使用说明 |