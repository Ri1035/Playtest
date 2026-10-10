# 线稿小猫 · Line Cat

纯白底、黑线、无阴影的线稿小猫矢量动画。造型直接取自描摹 SVG，动画元素分层，方便后续编辑修改。

## 特性

- 两个造型：坐姿歪头猫（含心形大尾巴）、站姿猫，标签切换。
- 手绘描边开场：线条沿路径逐段画出。
- 循环生命感动画：轻微呼吸、身体微摆、随机间隔慢眨眼。
- 六个语义图层可独立开关：轮廓、右眼、左眼、嘴巴、右瞳孔、左瞳孔。
- 控制面板：图层开关、动画开关、0.5–2x 速度、重播描边。
- 单页静态站点，无框架、无构建步骤；尊重系统“减少动态效果”设置。

## 在线演示

生产地址：<https://line-cat.pages.dev>

## 快速开始

直接用浏览器打开 `index.html` 即可；也可在项目根目录启动任意静态服务器后访问，例如：

```bash
python -m http.server 8000
```

## 技术栈

- 原生 HTML / CSS / JavaScript，内联 SVG。
- [anime.js](https://animejs.com/) v3.2.2（本地 vendored 于 `assets/vendor/`，MIT 许可证）。
- Python 标准库编写的产物生成器（开发工具，非运行时依赖）。

## 目录结构

```
.
├── index.html            # 页面入口（由生成器产出）
├── assets/
│   ├── svg/              # 描摹 SVG 源文件（造型依据 / 存档）
│   └── vendor/           # 第三方库（anime.min.js）
├── AGENTS.md             # 协作与开发规范
├── DESIGN.md             # 视觉与交互设计规范
├── CHANGELOG.md          # 版本记录
├── TODO.md               # 开发计划与进度
└── docs/                 # 深入文档（定位、架构、流程、部署等）
```

## 文档索引

- [项目定位与功能范围](docs/PROJECT-SPEC.md)
- [架构与目录说明](docs/ARCHITECTURE.md)
- [组件开发规范](docs/COMPONENT-GUIDELINES.md)
- [页面结构](docs/PAGE-STRUCTURE.md)
- [开发流程](docs/DEVELOPMENT.md)
- [构建、校验与分发](docs/REGISTRY.md)
- [部署说明](docs/DEPLOYMENT.md)

## 许可证

[MIT](LICENSE)
