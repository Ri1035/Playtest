# Playtest

把一个网页小项目集合成一个仓库：11 个独立项目各占一个子目录，**各自保留完整的 git 历史**（每个子目录内可 `git log -- <子目录>` 直接读到原始提交）。

> **每个子目录独立安装依赖，互不影响。** 根目录没有 `package.json`、没有 workspaces、没有共享 lockfile，也不会有根级 `node_modules`。进入哪个子目录就在哪里 `npm install`。

## 项目总览

| 子目录 | 来源仓库 | 技术栈 | 安装与构建 | 本地预览端口 | 是否需构建 |
|---|---|---|---|---|---|
| `rainy-magic-street/` | rainy-magic-street | Three.js + esbuild | `npm install` → `node build.mjs` | 8091 | 是（产物 `dist/`） |
| `line-cat/` | line-cat | 原生 HTML/SVG 矢量动画（零依赖） | 无（可选 `python _build.py`） | 8092 | 否（静态） |
| `pop-breaker/` | pop-breaker | Canvas 2D 游戏 + Vite 6 | `npm install` → `npm run build` | 4173（`npm run preview`） | 是（产物 `dist/`） |
| `pop-island/` | pop-island | Canvas 2D 游戏（零依赖、零构建） | 无 | 8093 | 否（静态） |
| `rainy-konbini/` | rainy-konbini | Three.js + esbuild | `npm install` → `node build.mjs` | 8094 | 是（产物 `dist/`） |
| `rainy-convenience-store/` | rainy-convenience-store | Three.js 单文件（零依赖） | 无 | 8095 | 否（静态） |
| `fog-mirror/` | fog-mirror | 原生 JS + Canvas（摄像头交互） | 无 | 8096 | 否（静态） |
| `WebPet/` | WebPet | 原生 JS 抽帧序列动画 | 无 | 8097 | 否（静态） |
| `GO/` | GO | 原生 JS + Node 构建脚本 | `npm install` → `npm run build` | 8098 | 是（产物 `dist/`） |
| `text-rope-effect/` | text-rope-effect | 原生 JS 物理交互（单文件） | 无 | 8099 | 否（静态） |
| `gsap-skills-demo/` | gsap-skills-demo | GSAP + 原生 HTML/CSS | 无 | 8100 | 否（静态） |

端口只是本地建议值，互不冲突即可。

## 快速开始

```bash
# 需要构建的项目（逐个进入，各自独立安装）
cd rainy-magic-street && npm install && node build.mjs
cd ../pop-breaker   && npm install && npm run build
cd ../rainy-konbini && npm install && node build.mjs
cd ../GO            && npm install && npm run build
```

```bash
# 纯静态项目（无依赖，直接起静态服务即可）
cd line-cat && python -m http.server 8092
```

大多数静态子目录的 `index.html` 是自包含单文件，双击即可打开；`fog-mirror/` 与 `WebPet/` 需要摄像头或本地图片资源，建议用静态服务访问。

## 构建验证

各子目录的安装/构建结果、退出码与产物大小见 [BUILD-REPORT.md](BUILD-REPORT.md)。

## 目录约定

- `.gitignore` 只忽略 `node_modules/`、`dist/`、构建缓存等通用产物，不放宽到具体项目。
- 子目录内的 README、LICENSE、构建脚本与 CI 配置均保持原样。
- 备份目录 `backup/`（各来源仓库的 mirror 与 bundle）只在本地，不入库。
