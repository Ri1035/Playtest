# 开发流程

## 环境要求

- Node.js ≥ 18（仅用于运行自检脚本与部署工具）
- 现代浏览器（Chrome / Edge / Firefox / Safari 近两年版本）
- 无需安装项目依赖——**本项目没有 `package.json`**

## 本地开发

```bash
# 启动本地服务器（任选其一）
python -m http.server 8080
npx serve .
```

打开 `http://localhost:8080`。

### 为什么必须用服务器

项目使用原生 ES Module。浏览器对 `file://` 协议下的模块加载执行严格 CORS 限制，直接双击 `index.html` 会得到空白页与 CORS 报错。这是浏览器安全策略，与代码无关。

## 自检

### 逻辑单元测试

```bash
node .devtools/test-logic.cjs
```

覆盖 14 项：岛屿生成的确定性与多样性、开局可行性、建造校验、扣料、生产结算、存档往返、损坏数据降级。

测试通过 `global.localStorage` 垫片在 Node 环境运行，不依赖浏览器。

**预期输出**：

```
PASS  同一种子生成完全相同的岛屿  (484格一致)
...
合计 14 项，通过 14，失败 0
```

退出码：0 表示全部通过。

### 浏览器交互自检

1. 启动本地服务器
2. 访问 `http://localhost:8080/.devtools/test-interaction.html`
3. 页面底部输出 22 项断言结果

覆盖：初始化、工具栏渲染、地形构成、建造扣料、人口变化、HUD 同步、资源采集、连击累积、工具栏切换、悬停响应、存档内容。

页面标题在全部通过时为 `ALL_PASS`。

**注意**：该页面复制了一份 index.html 的 DOM 结构。修改 index.html 结构时需同步更新此页，否则测试会因元素缺失而失败。

### 截图目视验证

**Canvas 绘制改动必须截图确认，不能只看代码。** 网点参数是否合适、配色对比度是否足够、元素是否重叠，这些无法通过代码审查判断。

```bash
# 检视五种建筑的矢量绘制
# 先启动服务器，然后访问 .devtools/preview-sprites.html 截图

# 检视建成后的整体画面
# 访问 .devtools/preview-built.html
```

无头 Edge 命令示例：

```bash
msedge.exe --headless=new --disable-gpu --enable-unsafe-swiftshader \
  --no-first-run --user-data-dir=<临时目录> \
  --virtual-time-budget=8000 \
  --screenshot=<输出路径> --window-size=1200,900 \
  "http://localhost:8080/"
```

**注意事项**：

- `--enable-unsafe-swiftshader` 是软件渲染开关，无头环境缺少 GPU 时必需
- `--virtual-time-budget` 控制等待时长，须足够让模块加载与首帧渲染完成
- 每次使用独立的 `--user-data-dir`，避免状态污染
- 不要加 `--force-device-scale-factor=1`，会导致截图输出 0 字节

## 新增功能的标准流程

1. **确认范围**：只做被要求的改动，不顺手重构
2. **改数据定义**：新数值加到 `game/defs.js`，新绘制加到 `render/sprites.js`
3. **改逻辑**：状态修改加到 `core/state.js` 的导出函数
4. **更新文档**：`DESIGN.md`（若涉及视觉规范）、`docs/ARCHITECTURE.md`（若涉及结构）
5. **自验证**：
   - 跑 `node .devtools/test-logic.cjs`
   - 浏览器交互自检
   - **涉及 Canvas 改动必须截图目视确认**
6. **更新 CHANGELOG.md**
7. **Git 小步提交**
8. **部署并验证线上地址**

## 新增内容的自检清单

新增功能前逐项确认，避免遗漏：

- [ ] 数据定义放在 `defs.js`，不在代码里散落硬编码
- [ ] 颜色从 `palette.js` 导入，没有写字面色值
- [ ] 状态修改经过 `core/state.js` 的导出函数
- [ ] 新增状态字段已加入 `createGame` / `saveGame` / `loadGame`
- [ ] 交互元素有 hover、active、disabled、focus-visible 四态
- [ ] 颜色不是唯一信息载体
- [ ] 有对应的测试用例
- [ ] 注释解释"为什么"而非"做了什么"
- [ ] 无生成工具水印或署名
- [ ] CHANGELOG.md 已更新

## 调试技巧

### 查看运行时错误

```bash
msedge.exe --headless=new --enable-logging=stderr --v=0 \
  --dump-dom <url> 2>&1 | grep CONSOLE
```

控制台错误会以 `[INFO:CONSOLE:行号]` 形式输出。这是排查"页面空白但无报错提示"的首选手段。

### 存档调试

```js
// 在控制台查看当前存档
JSON.parse(localStorage.getItem('pop-island-save-v1'))

// 清除存档
localStorage.removeItem('pop-island-save-v1')
```

### 暴露的调试对象

`main.js` 末尾暴露：

```js
window.__ready = true;
window.__game = { state, renderer, GRID_SIZE, INK, CHATTER };
```

可在控制台直接操作游戏状态：

```js
__game.state.resources.wood = 999   // 无限资源
__game.state.tiles                   // 查看地形数组
__game.renderer.rebake(__game.state) // 手动重新烘焙地形
```

## 性能排查

若帧率下降，按此顺序检查：

1. 是否在地形中引入了逐帧重绘（应烘焙）
2. 网点图案缓存键是否变化（会导致每帧重建 pattern）
3. 建筑数量是否超出预期
4. 特效对象是否堆积未回收（`updateEffects` 是否正常清理）

用浏览器 Performance 面板录制 60 帧，看 Canvas 绘制耗时。