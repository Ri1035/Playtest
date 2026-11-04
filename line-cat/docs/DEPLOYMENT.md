# DEPLOYMENT

Cloudflare Pages 部署说明。

## 项目设置

| 项 | 值 |
| --- | --- |
| 平台 | Cloudflare Pages |
| 框架预设 | 无（None） |
| 构建命令 | 无（静态站点，无需构建） |
| 输出目录 | 项目根目录（`/`） |
| 入口 | `index.html` |

站点为纯静态文件，`assets/` 随站点一起发布；`assets/svg/` 为源文件存档，不影响运行。

生产地址：<https://line-cat.pages.dev>

## 方式一：Wrangler CLI（推荐，直接部署）

需要 Node.js 与 wrangler。凭据通过环境变量注入，**不要写入仓库**：

PowerShell：

```powershell
$env:CLOUDFLARE_API_TOKEN = "<你的 API Token>"
npx wrangler pages project create line-cat --production-branch main
npx wrangler pages deploy . --project-name=line-cat --branch=main
```

- Token 需具备 Pages 编辑权限（Account → Cloudflare Pages → Edit）。
- 部署完成后命令输出可访问的 Pages 地址。
- 后续更新重复执行 `wrangler pages deploy` 即可，每次生成一个版本，可在面板回滚。

## 方式二：Git 集成（推送自动部署）

1. 在 Cloudflare 控制台 Pages 中选择“连接到 Git”，授权并选择 GitHub 仓库。
2. 按上表设置（无构建命令、根目录发布）。
3. 保存后每次向 `main` 推送即自动部署；预览分支生成预览地址。

> 该方式需在控制台完成一次 GitHub App 授权，无法仅用 API 绕过。

## 环境变量与密钥

- 本项目运行时无需任何环境变量或密钥。
- 部署用 Token 仅保存在本地 / CI 的安全环境变量中，禁止提交到公开仓库。

## 验证与回滚

- 部署后打开 Pages 地址，核对造型、开场与循环动画、控制台错误。
- 出现问题时：在 Pages 项目的 Deployments 中回滚到上一版本，或重新部署旧提交。

## 自定义域名（可选）

在 Pages 项目 → Custom domains 中添加域名并按提示配置 DNS；默认 `*.pages.dev` 地址可直接使用。
