# 雨夜魔法街区 · 街角微缩场景

> 单文件、可双击打开的 Three.js 三维微缩景观：日式魔法街区街角，复古魔法杂货铺 + 法师塔，雨夜，三渲二（卡通渲染）。

![Three.js](https://img.shields.io/badge/-Three.js-000000?logo=threedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-f7df1e?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/-HTML5-e34f26?logo=html5&logoColor=white)
![WebGL](https://img.shields.io/badge/-WebGL-990000?logo=webgl&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-在线体验-F38020?logo=cloudflare&logoColor=white)

## ✨ 项目简介

雨夜魔法街区是一个完全在浏览器中运行的 3D 微缩街景页面。场景以日式魔法街区街角为原型，包含复古魔法杂货铺、炼金师宅邸与法师塔，通过三渲二卡通渲染与魔法氛围光效呈现雨夜中的奇幻街角。页面无任何 UI 元素，打开后即可自由环绕观看。

## 🚀 特性亮点

| 维度 | 说明 |
| --- | --- |
| 三渲二卡通渲染 | `MeshToonMaterial` + 4 段渐变贴图，反向描边勾勒卡通轮廓 |
| 自由观看 | 拖拽旋转、滚轮缩放、右键 / 双指平移，全程无 UI 干扰 |
| 橱窗透视 | 彩色玻璃橱窗半透明透视：药剂货架、水晶球陈列柜、炼金坩埚等店内陈设清晰可见 |
| 魔法氛围光效 | 发光符文招牌、漂浮烛火、导灵电线等 |
| 雨景反射 | 湿滑路面镜面反射叠加魔法霓虹倒影 |
| 粒子系统 | GPU 实例化雨丝，另有向上飘浮的魔法浮游光尘层 |
| 性能优化 | 静态几何合并与自适应画质阶梯，低端显卡流畅运行 |
| 自包含单文件 | `index.html`（three.js 已内联），双击即可打开 |

## 📖 快速开始

直接用浏览器打开 `index.html` 即可。

如需重新构建：

```bash
npm install
node build.mjs
```

## 🌐 在线体验

| 入口 | 地址 |
| --- | --- |
| 在线体验 | https://rainy-magic-street.pages.dev |
| 源码仓库 | https://github.com/Ri1035/rainy-magic-street |

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