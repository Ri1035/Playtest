# DEPLOYMENT.md — 部署说明

## 目标

- 仓库：GitHub（公开，默认）
- 平台：Cloudflare Pages
- 构建命令：`npm run build`
- 产物目录：`dist`

## 部署方式（Git 连接，推荐）

1. 在 Cloudflare 控制台「Workers 和 Pages → 创建 → 连接 Git 仓库」。
2. 选择仓库 `pop-breaker`，框架预设 Vite，构建命令 `npm run build`，输出目录 `dist`，生产分支 `main`。
3. 保存并部署；合入 `main` 后自动重新构建。

## 部署方式（Git URL 克隆公共存储库）

1. 创建页 → Continue with GitHub → 通过 Git URL 克隆公共存储库。
2. 输入 `https://github.com/Ri1035/pop-breaker.git`（仓库必须为公开）。
3. 配置构建参数同上。

## 部署方式（直传，当前线上使用的方案）

> 注：本账号的「Git 连接」通道对 pop-breaker/pop-island 均报「未找到存储库」，OAuth 仓库列表加载失败；且聊天粘贴的 CF token 被脱敏无效。当前线上站点采用「ZIP 直传」成功部署。

1. 构建并生成单文件载荷：
   - `npm run build`（Vite 产物到 `dist/`）
   - `node scripts/inline-single.mjs`（输出 `dist/index.single.html` 与 `dist-single/index.html`）
2. 将 `dist-single/index.html` 单独打包为 `deploy.zip`（压缩包根目录须直接包含 `index.html`，不得有外层目录）。
3. Cloudflare 控制台 → Workers 和 Pages → pop-breaker → 部署 → 创建部署 → 上传 `deploy.zip`（widget 会解析 ZIP 内文件树）。
4. 确认文件列表中 `index.html` 存在后点击「保存并部署」。
5. 等待部署完成，访问 `https://pop-breaker-cm3.pages.dev` 验证。

要点：单文件直传（非 ZIP）会把文件映射到 `/` 而非 `/index.html`，导致线上 404；必须走 ZIP 或文件夹上传以保留路径。

## 验证

- 访问 `https://pop-breaker-cm3.pages.dev`（当前生产域名，2026-10-07 已实测 200 且可玩）。
- 页面加载、菜单、发球、击砖、过关流程可用。
