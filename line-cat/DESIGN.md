# DESIGN.md

官网视觉风格、布局与交互设计规范。

## 设计原则

- **极简线稿**：纯白底、黑色线条、无阴影、无渐变、无装饰性元素。
- **造型忠实**：一切造型取自描摹 SVG 的原始路径，不手工臆造。
- **安静的生命感**：动效只用于让角色“活着”，幅度克制，不炫技。
- **可编辑优先**：动画元素按语义分层，每层可独立开关与修改。

## 色彩

| Token | 值 | 用途 |
| --- | --- | --- |
| `--color-bg` | `#ffffff` | 页面与舞台底色 |
| `--color-ink` | `#111111` | 线条与填充（黑线） |
| `--color-line` | `#ececec` | 卡片边框、分隔 |
| `--color-muted` | `#888888` | 辅助说明文字 |

不使用彩色强调；选中态以黑底白字反白呈现。

## 线条

- 黑线为 fill 形状，由“外剪影 + 反向缠绕内挖空”通过 `fill-rule: nonzero` 形成条带。
- 不额外描边、不加投影；保持描摹路径的原始粗细与曲线质量。

## 布局

- 桌面端：左侧舞台（标签 + 猫），右侧控制面板，水平排列、居中。
- 移动端：舞台与面板纵向堆叠，单列。
- 猫图尺寸 `width: min(72vw, 460px)`，高度按 viewBox 自适应。
- 卡片圆角 16px，1px `#ececec` 边框，无阴影。
- 断点：窄于约 720px 时自动堆叠为单列。

## 字体

- 系统无衬线字体栈：`-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif`。
- 面板标题 17px / 正文 14px / 图例行 11px；数字使用 `font-variant-numeric: tabular-nums`。

## 动效规范

| 动画 | 参数 | 缓动 |
| --- | --- | --- |
| 描边开场 · 轮廓 | 起点 0ms，时长 1500ms | easeOutQuart |
| 描边开场 · 眼睛 | 起点 1050ms，时长 700ms | easeOutQuart |
| 描边开场 · 瞳孔 | 起点 1300ms，时长 550ms | easeOutQuart |
| 描边开场 · 嘴巴 | 起点 1500ms，时长 550ms | easeOutQuart |
| 呼吸 | 缩放 1 → 1.024，3.4s，往返循环 | easeInOutSine |
| 身体微摆 | 旋转 -0.4° → 0.4°，5.2s，往返循环 | easeInOutSine |
| 眨眼 | scaleY 1 → 0.05 → 1，约 250ms | easeInOutQuad |
| 眨眼间隔 | 随机 2.0–5.4s | — |

- 描边开场通过 SVG mask 实现：mask 内白色粗线沿外边缘路径描边揭示下层；开场结束后移除 mask，释放完整形状。
- 变换三层嵌套：`sway`（旋转）> `breath`（缩放）> 部件（眨眼 scaleY），避免同一元素 transform 相互覆盖。
- transform 参考统一 `transform-box: view-box`，原点按 viewBox 用户坐标：
  - 坐姿：身体原点 `641px 1430px`，眼睛原点 `641px 540px`。
  - 站姿：身体原点 `221px 420px`，眼睛原点 `221px 142px`。

## 交互

- 标签切换即时显示对应造型；未播放开场的视图在切入时才播放。
- 图层与动画开关即时反馈；速度滑块实时改变循环动画速率。
- 按钮具备 hover 反白、active 微缩反馈；无死按钮（每个可点元素都有真实行为）。

## 无障碍

- 系统开启 `prefers-reduced-motion` 时：描边直接完整呈现，循环动画全部停止。
- 键盘可达，`:focus-visible` 显示 2px 黑色轮廓。
- 触控目标不小于 44×44px；复选框 20px。
- SVG 带 `role="img"` 与描述性 `aria-label`。
