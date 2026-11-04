# POP BREAKER · 波普打砖块

以波普艺术为设计理念的 Web 2D 打砖块街机游戏：高饱和撞色、半调网点、粗描边与漫画拟声词，全部视觉素材由 Canvas 程序化绘制，零外部资源。

## 技术栈

- Vite 6 + 原生 JavaScript（ES Modules）
- Canvas 2D 程序化渲染
- WebAudio 合成音效（无音频文件）

## 快速开始

```bash
npm install     # 安装依赖
npm run dev     # 本地开发（http://localhost:4174）
npm run build   # 构建产物到 dist/
npm run preview # 预览构建产物
```

## 玩法

- 移动挡板反弹星星球，击碎波普砖块得分
- 连续击碎砖块触发连击倍率；吃道具（加宽 / 三球 / 减速）
- 每关更换砖块图案与配色，速度递增

## 部署

GitHub 管理仓库 + Cloudflare Pages（构建命令 `npm run build`，产物目录 `dist`）。
