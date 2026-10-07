# DEVELOPMENT.md — 项目开发与组件发布流程

## 开发流程

1. **认领任务**：在 TODO.md 登记"进行中"。
2. **检索先行**：陌生能力先检索开源方案 / 免费资源 / skills，1-2 轮为限；简单任务直接开工。
3. **小步实现**：一次只做一个可验证的增量，禁止一次大爆炸改动。
4. **本地验证**：
   ```bash
   npm run dev        # 开发服务器
   npm run build      # 生产构建
   npm run preview    # 预览构建产物（验证产物而非源码）
   ```
5. **提交**：按 AGENTS.md 的 Conventional Commits 规范小步提交，作者邮箱 `koka2996978242@outlook.com`。
6. **更新记录**：面向用户的改动同步更新 CHANGELOG.md 与 TODO.md。

## 新增一个收集元素的完整流程

1. 在 `sprites.js` 新增绘制函数（遵守 COMPONENT-GUIDELINES 精灵规范）。
2. 在 `ITEMS` 注册表登记：`r / worth / color / draw`。
3. 本地运行确认生成、收集、得分、粒子、飘字全部正常。
4. 更新 REGISTRY.md 资源清单。
5. 提交（`feat: 新增 xxx 元素`）+ 更新 CHANGELOG.md。

## 发布流程

1. 本地 `npm run build` 通过。
2. 合入 `main` 分支并推送 GitHub。
3. Cloudflare Pages 检测到 `main` 更新后自动构建部署（配置见 DEPLOYMENT.md）。
4. 线上验证：打开 pages.dev 地址，确认资源加载与首局可玩。

## 验证清单（每次改动必查）

- [ ] `npm run build` 无错误无警告
- [ ] 桌面：菜单 → 开始 → 移动 → 收集 → 连击 → 升级 → 暂停/恢复
- [ ] 移动端（DevTools 模拟或真机）：摇杆拖动正常、无滚动穿透
- [ ] 无控制台报错
- [ ] 无密钥硬编码、无 AI 水印

## 分支策略

- `main`：唯一长期分支，始终保持可部署。
- 功能开发使用 `feat/xxx` 短生命周期分支，合并后删除。
- 禁止直接向 `main` 推送未验证代码。
