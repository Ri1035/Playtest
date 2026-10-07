# POP ISLAND · 波普岛

波普艺术风格的 Web 2D 小岛收集小游戏：在波普风小岛上移动收集元素、连击得分、躲避海鸥，把整座岛涂满颜色。

- 在线试玩：https://pop-island.pages.dev
- 仓库地址：https://github.com/Ri1035/pop-island

## 技术栈

- 原生 JavaScript（ES Modules）+ Canvas 2D，程序化绘制全部波普风素材，零运行时依赖
- WebAudio 合成音效，零音频素材
- Vite 5 构建，Cloudflare Pages 部署

## 快速开始

```bash
npm install
npm run dev      # 本地开发
npm run build    # 生产构建，产物在 dist/
npm run preview  # 本地预览构建产物
```

## 玩法

- 移动：WASD / 方向键（触屏拖动摇杆）
- 收集波普元素（星星、樱桃、香蕉、嘴唇、甜甜圈等）得分并填充涂色条
- 3.5 秒内连续收集触发连击，倍率最高 x5
- 躲避海鸥；被撞到会重置连击
- 涂色条满后升级，岛屿切换波普配色并提速
- 稀有道具：磁铁（吸引元素）、冰冻（冻结海鸥）

## 目录结构

```
├── AGENTS.md            # 项目协作与代码开发规范
├── README.md            # 项目简介（本文件）
├── DESIGN.md            # 波普视觉与交互设计规范
├── CHANGELOG.md         # 版本更新记录
├── TODO.md              # 开发计划与进度
├── docs/                # 下沉文档（详见各文件）
├── public/              # 静态资源
└── src/
    ├── main.js          # 入口
    ├── styles.css       # 全局波普样式
    └── game/            # 游戏核心模块
```

详细设计、架构与部署说明见 `docs/` 目录。

## License

MIT License，见 [LICENSE](./LICENSE)。
