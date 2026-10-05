# 喵喵跟随 · Cat Follow

> 抽帧序列动画 + 鼠标跟随互动页面：移动鼠标，一只小猫会一路小跑跟着你；点击它，它会跳一下。

![JavaScript](https://img.shields.io/badge/-JavaScript-f7df1e?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/-HTML5-e34f26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/-CSS3-1572b6?logo=css3&logoColor=white)
![Canvas](https://img.shields.io/badge/-Canvas-2D-2d2d2d)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-在线体验-F38020?logo=cloudflare&logoColor=white)

## ✨ 项目简介

喵喵跟随是一个纯前端 Canvas 互动小页面。页面加载一组抽帧序列精灵图，渲染出一只会小跑的小猫：小猫会跟随鼠标 / 触摸位置移动，点击小猫还会触发跳跃。侧边设置面板可调节跟随灵敏度、大小、影子与残影，适合作为前端交互动效的轻量示例，也适合直接改造成属于自己的「桌面小宠物」。

## 🚀 特性亮点

| 维度 | 说明 |
| --- | --- |
| 抽帧序列动画 | 小猫随跟随状态切换小跑动画，流畅自然 |
| 鼠标 / 触摸跟随 | 小猫朝光标方向一路小跑，支持移动端触屏 |
| 点击互动 | 点击小猫触发跳跃动作，增加「活物感」 |
| 实时调节 | 侧边设置面板：跟随灵敏度、小猫大小、落地影子、运动残影随时调节 |
| 加载进度 | 加载页实时显示抽帧序列加载进度 |

## 📖 快速开始

用浏览器直接打开 `index.html` 即可；也可放到任意静态服务器上访问（如 `python3 -m http.server`）。

> 跟随灵敏度、动画帧等关键参数都在代码顶部的配置区，想改行为直接读源码调整即可（详细实现见源码）。

## 🌐 在线体验

| 入口 | 地址 |
| --- | --- |
| 在线体验 | https://webpet-eyv.pages.dev |
| 源码仓库 | https://github.com/Ri1035/WebPet |

## 🧰 技术栈

- 原生 HTML / CSS / JavaScript
- Canvas 2D 渲染
- 抽帧序列（精灵图帧动画）

## 📁 项目结构

| 路径 | 说明 |
| --- | --- |
| `index.html` | 页面入口与主逻辑 |
| `frames/` | 抽帧序列精灵图素材 |
| `app.js` / `styles.css` | 逻辑与样式分离 |

## 修改记录

> 说明：修改记录仅记录文档维护变更，不计入版本更新。

| 日期 | 修改内容 |
| --- | --- |
| 2026-10-05 | README 精简为项目介绍，补充 topics 标签 |
| 2026-10-05 | README 美化丰富：补充在线体验与参考来源，完善使用说明 |
