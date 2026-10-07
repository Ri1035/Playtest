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

## 部署方式（直传，备用）

1. 创建页 → Upload your static files。
2. 上传本地 `dist/` 目录内容。
3. 无 Git 自动构建，仅作应急。

## 验证

- 访问 `https://pop-breaker.pages.dev`（以实际分配域名为准）。
- 页面加载、菜单、发球、击砖、过关流程可用。
