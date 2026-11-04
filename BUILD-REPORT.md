# BUILD-REPORT

构建验证时间：2026-11-04（Windows，Node v24.20.0，npm 11.19.0，Python 3.12.10）
工作区：`playtest/`；每个子目录独立执行，未使用根级依赖或共享 lockfile。

| 子目录 | 命令 | 退出码 | 结果 | 产物大小 | 备注 |
|---|---|---|---|---|---|
| `rainy-magic-street/` | `npm install`（--no-audit --no-fund）/ `node build.mjs` | 0 / 0 | 通过 | `dist/` 631,865 B（617 KB）；单文件 `index.html` 631,710 B | esbuild 打包；npm 11 提示 esbuild postinstall 未授权（allowScripts），不影响构建 |
| `line-cat/` | 静态校验：`python -m http.server 8090` + GET `/line-cat/index.html` | 0 / HTTP 200 | 通过（静态） | index.html 38.7 KB | 无 package.json；本地引用 1 条，缺失 0 |
| `pop-breaker/` | `npm install` / `npm run build`（vite build） | 0 / 0 | 通过 | `dist/` 26,388 B（25.8 KB） | Vite 6.4.4，产物 index.html + assets/*.js/*.css |
| `pop-island/` | 静态校验 HTTP GET | HTTP 200 | 通过（静态） | index.html 2.4 KB | 零依赖、零构建；本地引用 2 条，缺失 0 |
| `rainy-konbini/` | `npm install` / `node build.mjs` | 0 / 0 | 通过 | `dist/` 637,598 B（623 KB）；单文件 `index.html` 622.5 KB | 同 rainy-magic-street，esbuild 打包 |
| `rainy-convenience-store/` | 静态校验 HTTP GET | HTTP 200 | 通过（静态） | index.html 63.1 KB | 单文件自包含（three.js 内联），本地引用 0 |
| `fog-mirror/` | 静态校验 HTTP GET | HTTP 200 | 通过（静态） | index.html 67.2 KB | 需摄像头权限；本地引用 1 条，缺失 0 |
| `WebPet/` | 静态校验 HTTP GET | HTTP 200 | 通过（静态） | index.html 2.5 KB | 抽帧图在 `frames/`；本地引用 3 条，缺失 0 |
| `GO/` | `npm install` / `npm run build`（node scripts/build.js） | 0 / 0 | 通过 | `dist/` 120,106 B（117 KB） | 构建输出 dist/index.html，与仓库内已有产物一致（无 diff） |
| `text-rope-effect/` | 静态校验 HTTP GET | HTTP 200 | 通过（静态） | index.html 16.4 KB | 单文件自包含，本地引用 0 |
| `gsap-skills-demo/` | 静态校验 HTTP GET | HTTP 200 | 通过（静态） | index.html 27.3 KB | 多页（index.html + skills.html）；本地引用 3 条，缺失 0 |

## 汇总

- 有 `package.json` 并实际执行构建：4 个（rainy-magic-street、pop-breaker、rainy-konbini、GO），全部退出码 0。
- 纯静态校验：7 个（line-cat、pop-island、rainy-convenience-store、fog-mirror、WebPet、text-rope-effect、gsap-skills-demo），全部 `index.html` 存在、本地引用无缺失、静态服务返回 HTTP 200。
- 构建失败：0。
- 未改动任何业务代码；构建后仅 lockfile 因 npm 版本差异出现变更，已还原，`GO/` 新增的 package-lock.json 已删除。
- 未使用 `--squash`，各子目录历史条数见下方历史核对表（详见最终汇报）。
