# DEPLOYMENT.md — 部署说明

## 部署架构

```
GitHub (Ri1035/pop-island, main 分支)
        │  push
        ▼
Cloudflare Pages（项目 pop-island，生产分支 main）
        │  git 集成自动构建
        ▼
https://pop-island.pages.dev
```

构建命令：`npm run build`；产物目录：`dist`。

## 首次部署（人工步骤，一次性）

### 1. 准备 GitHub 仓库

```bash
# 本仓库已配置远程
git remote -v   # origin -> https://github.com/Ri1035/pop-island.git
git push -u origin main
```

### 2. 创建 Cloudflare Pages 项目（Git 集成方式，推荐）

1. Cloudflare 控制台 → Workers & Pages → Create → Pages → Connect to Git。
2. 授权 GitHub，选择 `Ri1035/pop-island` 仓库。
3. 构建设置：
   - Framework preset：`Vite`
   - Build command：`npm run build`
   - Build output directory：`dist`
4. 生产分支设为 `main`，保存后首次部署自动触发。

### 3. 命令行直传部署（替代方案）

需要 `CLOUDFLARE_API_TOKEN`（Pages 权限）环境变量，且不写入任何文件：

```powershell
$env:CLOUDFLARE_API_TOKEN = "<你的 Pages token>"
npm run build
npx wrangler pages project create pop-island --production-branch main   # 仅首次
npx wrangler pages deploy dist --project-name pop-island
```

## 密钥管理规范（强制）

- token 只通过环境变量注入，**禁止**写入代码、文档、`.env` 文件或提交记录。
- `.gitignore` 已排除 `.env*` 与 `.wrangler/`。
- 任何 token 若曾出现在聊天或日志中，建议在对应平台轮换后重新生成。

## 更新部署

合入 `main` 即自动部署。本地先验证：

```bash
npm run build && npm run preview
```

## 回滚

- Cloudflare Pages 控制台 → Deployments → 选择历史版本 → Rollback to this deployment。

## 域名（可选）

如需绑定自定义域名：Cloudflare Pages 项目 → Custom domains → 添加并配置 DNS 记录。

## 部署验证清单

- [ ] `https://pop-island.pages.dev` 可访问，首屏无资源 404
- [ ] 控制台无报错，开局 → 移动 → 收集 → 升级 全流程可玩
- [ ] 移动端视口下布局正常
