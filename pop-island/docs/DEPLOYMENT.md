# 部署说明

代码托管 GitHub，站点托管 Cloudflare Pages。本项目为纯静态站点，无构建步骤。

## 前置条件

- GitHub 仓库（已创建）
- Cloudflare 账号与 API Token
- Node.js ≥ 18（仅 CLI 工具需要）

---

## 方式 A：Cloudflare Pages Git 集成（推荐）

**优势**：push 到 main 自动构建部署，无需本地运行任何命令。这是唯一"一次配置、永久生效"的方案。

### 配置步骤

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选择 `pop-island` 仓库 → 授权
3. 填写构建设置：

| 配置项 | 值 |
| --- | --- |
| Framework preset | None |
| Build command | *（留空）* |
| Build output directory | `/` |
| Root directory | `/` |

> **关键**：Build command 必须留空。填 `npm run build` 会失败——本项目没有构建步骤。
> Build output directory 填 `/` 表示直接以仓库根目录作为站点根。

4. 点击 **Save and Deploy**

### 首次部署后

在 **Settings → Functions & Bindings → Headers** 中添加两条规则优化缓存：

| 匹配 | 操作 | 值 |
| --- | --- | --- |
| `/assets/*` | Cache-Control | `public, max-age=3600` |
| `/src/*` | Cache-Control | `public, max-age=3600` |

不要设 `immutable`——文件名无内容 hash，设了会导致用户长期拿到旧版本。

### 验证

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://<project>.pages.dev/
```

返回 `200` 后，在浏览器打开该地址确认游戏可玩。

---

## 方式 B：wrangler CLI 直接上传

适合不想接Git 集成时的快速发布。

### 认证

Token 通过环境变量传入，**绝不写入任何文件**：

```bash
export CLOUDFLARE_API_TOKEN=<token>
export CLOUDFLARE_ACCOUNT_ID=<account-id>
```

> **Token 类型说明**：以 `cfat_` 开头的账户级 Token 调用 `/user/tokens/verify` 会返回 `Invalid API Token`，这是正常现象——该接口只支持用户级 Token。直接用 `cfat_` Token 调用 `/accounts` 与 Pages 接口即可。
>
> 泄露风险提示：若 Token 曾出现在对话、截图或日志中，**发布完成后应立即在 Cloudflare 控制台吊销并重新生成**。

### 创建项目（仅首次）

```bash
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST -d '{"name":"pop-island","production_branch":"main"}' \
  https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects
```

### 上传

```bash
CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<id> CI=1 WRANGLER_SEND_METRICS=false \
  npx --yes wrangler@3 pages deploy . \
  --project-name=pop-island \
  --branch=main \
  --commit-dirty=true \
  --exclude=".devtools/*" --exclude="docs/*" --exclude="*.md" --exclude=".git/*"
```

> **上传根目录为 `.`**：本项目无构建产物，源目录即站点内容。务必用 `--exclude` 排除 `.devtools/`、`.git/` 与 Markdown 文档。

---

## 方式 C：Dashboard 手动上传

1. 先在本地打包待上传文件：
   ```bash
   # 复制源文件到临时目录，排除开发期内容
   mkdir -p /tmp/pop-deploy
   cp index.html /tmp/pop-deploy/
   cp -r assets src /tmp/pop-deploy/
   ```
2. Cloudflare Dashboard → Workers & Pages → `pop-island` → **Create a new deployment**
3. 上传 `/tmp/pop-deploy` 的内容

---

## 常见问题

### 部署后页面空白

**排查顺序**：

1. 浏览器控制台是否有 CORS 错误 → 若是，说明用了 `file://` 打开，需通过 HTTP 访问
2. 开发者工具 Network 面板确认 `.js` 返回 `200` 且 MIME 为 `text/javascript` 或 `application/javascript`
3. 确认上传的文件包含 `src/` 目录（Dashboard 拖拽时容易漏掉子目录）

### 部署后仍是旧版本

浏览器或 CDN 缓存。处理：

- Cloudflare Dashboard → Caching → Purge Everything
- 本地强制刷新（Ctrl+Shift+R）

### 上传成功但域名 404

检查 `production_branch` 设置与上传时的 `--branch` 参数是否一致。用 `--branch=main` 上传时，`main` 才会被视为生产分支。

### GitHub push 失败（国内网络）

常见原因与对策详见 `github-cfpages-deploy` 技能文档，核心三点：

1. **hosts 劫持**——用 `--resolve` 强制指向真实 IP，不要修改 hosts 文件
2. **加速器冲突**——Steam++ / Watt Toolkit 运行时经其访问 GitHub 可能瞬间失败
3. **沙箱进程限制**——若 `git push` 被环境拦截，改用 Git Data API 直接推送

> 注意：Git Data API 生成的提交历史与本地 git 是两条平行线（对象 hash 含 parent 与时间戳，无法构造一致）。这种情况需在本地执行 `git fetch origin && git reset --hard origin/main` 合一。

---

## 发布前检查清单

- [ ] `node .devtools/test-logic.cjs` 全部通过
- [ ] 浏览器交互自检通过
- [ ] 线上地址可访问且游戏可玩
- [ ] 线上地址控制台无报错
- [ ] 移动端宽度下布局不溢出
- [ ] `.devtools/` 与文档未被上传
- [ ] CHANGELOG.md 已更新
- [ ] 已在控制台吊销并轮换过暴露过的 Token