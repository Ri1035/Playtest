# 雾镜 · Fog Mirror

> 摄像头实时画面作为镜底，上方覆盖一层可擦除的动态雾层 —— 对着起雾的镜子用手指或鼠标写下想说的话。

![JavaScript](https://img.shields.io/badge/-JavaScript-f7df1e?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/-HTML5-e34f26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/-CSS3-1572b6?logo=css3&logoColor=white)
![Canvas](https://img.shields.io/badge/-Canvas-2D-2d2d2d)
![MediaPipe](https://img.shields.io/badge/-MediaPipe-00979d?logo=mediapipe&logoColor=white)

## ✨ 项目简介

雾镜是一个完全在浏览器运行的互动页面：摄像头实时画面充当镜子，表面盖着一层半透明白雾。用手指或鼠标擦雾即可露出下方镜中画面，也能在雾上手写、贴图、落字。除手势/面部识别所需的 MediaPipe 外无任何框架，UI 资源全部内联，可部署到任意静态托管平台。

## 🚀 特性亮点

| 维度 | 说明 |
| --- | --- |
| 镜底 + 雾层 | 摄像头实时镜像画面作镜底，覆盖 AI 生成的冬季凝雾层（软边羽化笔刷可擦） |
| 雾效模式 | 静态雾（凝雾膜静止附着）/ 动态雾（云絮随指针惯性流动） |
| 擦痕保留 | 擦除后永久保留，呼气识别不再覆盖；只有「清除」会重新起雾 |
| 手写工具 | 拖动留下毛笔感墨迹（速度越快笔画越细） |
| 图形 / 文字 | 心形 / 星星 / 问号 / 笑脸一键落笔；文字以衬线艺术字 + 冷调渐变 + 辉光印在雾上 |
| 手势擦除 | MediaPipe HandLandmarker 取指尖位置，隔空擦雾 |
| 呼气识别 | FaceLandmarker 面部表情系数 + 麦克风气流双通道判定，仅识别提示 |
| 清除与导出 | 一键清除雾面（从四周缓缓覆回）、合成「镜面 + 雾 + 墨迹」导出 JPG |
| 降级演示 | 未授权摄像头或非 HTTPS 时自动切到演示模式，交互仍可完整体验 |

## 📖 快速开始

本地用任意静态服务器启动（`localhost` 属浏览器安全上下文，无需 HTTPS 即可调用摄像头）：

```bash
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080/index.html
```

线上部署需 HTTPS（摄像头 API 要求），把整个目录放到任意支持 HTTPS 的静态托管（GitHub Pages / Cloudflare Pages / Vercel 等）即可。

快捷键：`C` 清除雾面、`S` 保存、`H` 收起控制栏、`1`/`2` 切换雾模式、`[`/`]` 调笔刷、`Esc` 关闭弹层。

## 🧰 技术栈

- 原生 HTML + CSS + JavaScript（两层 Canvas 叠加合成）
- MediaPipe Tasks Vision（HandLandmarker / FaceLandmarker，Apache-2.0），模型与 WASM 已离线内置
- Web Audio AnalyserNode 做吹气检测
- AI 生成的冬季窗户凝雾照片作为雾密度素材（`assets/fog-real.webp`）

## ❓ 常见问题

- **线上部署黑屏 / 调不起摄像头？** 摄像头 API 要求 HTTPS（localhost 除外），线上托管必须是 HTTPS；未授权摄像头时会自动进入演示模式。

## 🙏 参考与致谢

- MediaPipe（`@mediapipe/tasks-vision`，Apache-2.0）—— 手部 / 面部关键点检测（模型与 WASM 本地内置，CDN 回退）

> 三层 Canvas 合成与手势判定的详细实现见源码，本文不做展开。

## 修改记录

> 说明：修改记录仅记录文档维护变更，不计入版本更新。

| 日期 | 修改内容 |
| --- | --- |
| 2026-10-06 | 雾素材改为 AI 生成的冬季凝雾；擦痕永久保留、不再自动复雾；去掉画笔发光高亮 |
| 2026-10-05 | README 精简为项目介绍，补充 topics 标签 |
| 2026-10-05 | README 美化丰富：补充在线体验与参考来源，完善使用说明 |
