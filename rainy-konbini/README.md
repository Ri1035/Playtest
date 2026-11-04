# 雨夜便利店 · 街角微缩场景

> 单文件、可双击打开的 Three.js 三维微缩景观：日式便利店街角，雨夜，三渲二（卡通渲染）。

![Three.js](https://img.shields.io/badge/-Three.js-000000?logo=threedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-f7df1e?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/-HTML5-e34f26?logo=html5&logoColor=white)
![WebGL](https://img.shields.io/badge/-WebGL-990000?logo=webgl&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-在线体验-F38020?logo=cloudflare&logoColor=white)

## ✨ 项目简介

雨夜便利店是一个完全在浏览器中运行的 3D 微缩街景页面。场景以日式便利店街角为原型，通过三渲二卡通渲染、湿滑积水路面、雨夜灯光氛围还原出一个安静的雨夜街角。页面无任何 UI 元素，打开后即可自由环绕观看，适合作为前端 WebGL / 程序化建模的演示作品。

## 🚀 特性亮点

| 维度 | 说明 |
| --- | --- |
| 三渲二卡通渲染 | `MeshToonMaterial` + 4 段渐变贴图，配合反向描边勾勒干净的卡通轮廓 |
| 自由观看 | 拖拽旋转、滚轮缩放、右键 / 双指平移，全程无 UI 干扰 |
| 湿滑路面 | 镜面反射层叠加半透明沥青，呈现雨夜积水反光 |
| 光影对比 | 店内暖光陈设与室外冷调雨夜形成明暗、色温对比 |
| 雨丝粒子 | GPU 实例化雨丝与溅落效果，雨区自动避让店铺与雨棚 |
| 后期处理 | Bloom 辉光、冷调调色与暗角，ACES 色调映射 |
| 自适应画质 | 帧率不足时自动降采样 / 降级，低端显卡也能流畅观看 |
| 自包含单文件 | `index.html`（three.js 已内联），双击即可在浏览器打开 |

## 📖 快速开始

直接用浏览器打开 `index.html` 即可。

如需重新构建（生成单文件版与拆分部署版）：

```bash
npm install
node build.mjs
```

## 🌐 在线体验

| 入口 | 地址 |
| --- | --- |
| 在线体验 | https://rainy-konbini.pages.dev |
| 源码仓库 | https://github.com/Ri1035/rainy-konbini |

## 🧰 技术栈

- Three.js / WebGL
- 原生 ES Modules（程序化建模、Canvas 贴图、后期处理）
- Node.js 构建脚本

## 修改记录

> 说明：修改记录仅记录文档维护变更，不计入版本更新。

| 日期 | 修改内容 |
| --- | --- |
| 2026-10-05 | README 精简为项目介绍，补充 topics 标签 |
| 2026-10-05 | README 美化丰富：补充在线体验与参考来源，完善使用说明 |