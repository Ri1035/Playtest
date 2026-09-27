# GSAP Skills 演示站

GSAP（GreenSock Animation Platform）官方 AI Skills 库的镜像仓库，附带一个精致的动画演示首页。

## 这是什么

- `index.html`：GSAP 动画演示站。深色主题，包含 hero 入场编排、技能清单滚动揭示，以及四个可交互的现场实验（Tween / Stagger / Timeline / ScrollTrigger scrub），全部由 GSAP 3.12.5 驱动。
- `skills/`：官方 Agent Skills 文档（核心 API、时间线、滚动触发、插件、React、性能、框架）。
- `examples/`：官方最小参考示例（vanilla / React / Vue / Nuxt）。
- 官方仓库：https://github.com/greensock/gsap-skills

## 在线演示

部署于 Cloudflare Pages，合入 main 后自动发布。

## 技术栈

- 纯静态站点，无构建流程（Cloudflare Pages 构建命令为 None）
- GSAP 3.12.5 + ScrollTrigger（jsDelivr CDN）
- 原生 HTML / CSS / JavaScript

## 本地预览

```bash
# 任意静态服务器即可，例如：
python3 -m http.server 8080
# 打开 http://localhost:8080
```

## 目录结构

```
gsap-skills-demo/
  index.html       # 演示首页
  skills/          # 官方技能文档
  examples/        # 官方示例工程
  assets/          # 官方图标与 Logo
  LICENSE          # MIT
```

## 许可

MIT License（与上游一致）。GSAP 100% 免费，含全部插件。
