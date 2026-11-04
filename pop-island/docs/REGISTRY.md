# 构建与分发说明

## 构建模型

**本项目没有构建步骤。**

Cloudflare Pages 直接托管源目录即可运行。原因：使用原生 ES Module，浏览器原生支持；无TypeScript、无 JSX、无 CSS 预处理器、无第三方依赖。

| 常规项目 | 本项目 |
| --- | --- |
| `npm install` | 不需要 |
| `npm run build` | 不需要 |
| `dist/` 产物目录 | 不需要，源目录即产物 |
| 依赖版本锁定 | 不需要 |

## 文件清单

部署时需要上传的文件：

```
index.html
assets/style.css
src/main.js
src/core/rng.js
src/core/state.js
src/game/defs.js
src/game/island.js
src/render/palette.js
src/render/patterns.js
src/render/sprites.js
src/render/effects.js
src/render/renderer.js
src/ui/audio.js
```

**不需要上传**：`.devtools/`（开发期自检）、`docs/` 与根目录 Markdown（仅仓库内查阅）。

## 校验清单

部署前逐项确认：

- [ ] `node .devtools/test-logic.cjs` 全部通过
- [ ] 浏览器交互自检 22 项通过
- [ ] 本地服务器下游戏可正常游玩
- [ ] 控制台无报错
- [ ] 首屏加载体积符合预算（见下）

## 体积预算

| 指标 | 预算 | 实测 |
| --- | --- | --- |
| 传输体积（gzip） | < 30 KB | 约 14 KB |
| 文件数 | < 15 | 13 |
| 运行时依赖 | 0 | 0 |
| 二进制素材 | 0 | 0 |

体积控制手段：

- 无外部字体（使用系统字体栈）
- 无图片资源（全部 Canvas 绘制）
- 无音频文件（WebAudio 合成）
- 注释保留（源码可读性优先于极限压缩，gzip 后差异极小）

## 部署方式

见 `docs/DEPLOYMENT.md`。三种方式按推荐度排列：

1. **Cloudflare Pages Git 集成**（推荐）——push 即自动构建
2. **wrangler CLI 直接上传** —— 一条命令发布
3. **Dashboard 手动拖拽** —— 适合低频发布

## 版本与缓存

`assets/style.css` 与 `src/*.js` 均无 hash 后缀，因此**不能配置长期不可变缓存**。若发布后用户看到旧版本：

- 检查 Cloudflare 是否启用了缓存规则
- 参考 `assets/_headers` 中的缓存配置

## 分发形态

| 形态 | 适用 | 说明 |
| --- | --- | --- |
| Cloudflare Pages | 线上 | 默认形态 |
| 本地静态服务器 | 开发 | 需HTTP 协议，ES Module 不支持 `file://` |
| 单文件打包 | 离线分享 | 当前未实现。需将全部 CSS/JS 内联为单个 HTML |

如需单文件版本供离线分享，需额外编写内联脚本。此需求尚未列入计划，见 `TODO.md`。