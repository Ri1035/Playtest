# REGISTRY

构建、校验与分发说明。

## 构建模型

本项目是纯静态站点，**无编译 / 打包 registry**：

- 无 npm 构建脚本、无 bundle 产物。
- “构建”仅指运行 `python _build.py`，将描摹 SVG 与模板组装为 `index.html`。
- 第三方库以源码形式 vendored，不经过包管理器安装。

## 生成器输入 / 输出

| 项 | 内容 |
| --- | --- |
| 输入 | `assets/svg/cat-sitting.svg`、`assets/svg/cat-standing.svg` |
| 模板 | `_build.py` 内 HTML / CSS / JS 模板 |
| 输出 | `index.html` |
| 运行时依赖 | `assets/vendor/anime.min.js` |

## 校验清单

发布前逐项确认：

1. `index.html` 由最新源生成，且为唯一页面入口。
2. 控制台无错误；无外部资源加载失败。
3. 桌面与移动截图：造型完整、无溢出 / 裁切。
4. 描边开场中途帧正确（线条逐段出现），终态完整。
5. 图层 / 动画开关、速度、重播均有真实反馈。
6. reduced-motion 下直接完整、循环停止。
7. 无 AI 水印、无署名痕迹、无凭据 / 私有信息。

## 分发渠道

- **源代码**：GitHub 公开仓库，小步提交、版本标签。
- **在线访问**：Cloudflare Pages（见 DEPLOYMENT.md）。
- 版本号 `vX.Y`，次版本逢 10 进 1；发布对应 Git tag 与 CHANGELOG 条目。

## 不发布的内容

以下为开发中间产物，被 `.gitignore` 忽略，不进入仓库与部署：

- `_*.py`、`_*.html`、`_*.txt`（侦查 / 检查脚本与页面）。
- `_shots/`（自检截图）、`_backup/`（旧版本备份）。
- `node_modules/`、`.wrangler/` 等本地工具目录。
