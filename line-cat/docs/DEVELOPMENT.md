# DEVELOPMENT

项目开发与发布流程。

## 环境要求

- 任意现代浏览器（Chromium / Edge、Firefox、Safari）。
- Python 3（仅运行生成器 / 自检时需要，使用标准库）。
- Git（版本管理）。

## 首次准备

```bash
git clone <仓库地址>
cd <仓库目录>
```

本项目无依赖安装步骤：anime.js 已 vendored 于 `assets/vendor/`。

## 产物生成

`index.html` 由 `_build.py` 生成，**不要直接手改 `index.html`**：

```bash
python _build.py
```

生成器读取 `assets/svg/` 下两个描摹源，解析路径与子路径，组装 mask、分层结构与脚本，输出 `index.html`。

## 常见改动流程

- 更换 / 更新造型：替换 `assets/svg/` 中对应 SVG（保持 viewBox 与 path 结构约定），重跑生成器。
- 调整开场时间编排或循环参数：修改 `_build.py` 中 `LAYERS` 与循环动画参数，重跑生成器。
- 修改样式与布局：修改 `_build.py` 中 CSS 模板，重跑生成器。

## 自验证

交付前运行页面自检脚本（产出桌面与移动截图）：

```bash
python <html-skill>/scripts/shot.py index.html
```

核对：控制台无错误、桌面与移动端布局完整、开场中途帧与终态正确、reduced-motion 兜底有效。
脚本不可用时，可手动在浏览器打开核对，但需如实说明验证方式。

## 提交与发布

1. 小步提交，提交信息带类型前缀（见 AGENTS.md）。
2. 更新 `CHANGELOG.md` 与 `TODO.md`。
3. 推送到 GitHub。
4. 按 DEPLOYMENT.md 部署到 Cloudflare Pages。

## 分支约定

- `main` 保持可发布状态。
- 较大改动可在功能分支进行，完成后合并回 `main`。
