# REGISTRY.md — 组件构建、校验与分发说明

## 构建

```bash
npm run build   # Vite 输出 dist/
```

## 校验清单（发布前逐项）

- [ ] `npm run build` 成功、无 warning
- [ ] `dist/` 内无外链资源、无水印关键词
- [ ] 源码与产物中无 token / 密钥
- [ ] 浏览器实测玩法闭环通过
- [ ] CHANGELOG.md 已更新

## 分发

- 源码：GitHub 公开仓库（默认公开）
- 线上：Cloudflare Pages（`dist/` 目录）
