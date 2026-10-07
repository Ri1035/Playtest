# DEVELOPMENT.md — 项目开发与发布流程

## 本地开发

```bash
npm install
npm run dev        # http://localhost:4174
```

## 变更流程

1. 小步修改，每步独立提交（feat / fix / docs / chore）。
2. 提交前自查：命名语义化、无 AI 水印、无调试钩子、无密钥。
3. 更新 CHANGELOG.md 与 TODO.md。

## 验证

- `npm run build` 必须一次通过、无警告
- `npm run preview` + 浏览器实测核心流程（菜单 → 发球 → 反弹 → 击砖 → 连击 → 过关 → 结束）
- 抽查关键数值：得分与连击倍率符合规则

## 发布

- 合入 `main` 分支即触发 Cloudflare Pages 构建（`npm run build`，产物 `dist/`）
- 发布后访问线上域名验证页面可加载、操作可用
