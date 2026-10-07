# PAGE-STRUCTURE.md — 页面结构说明

## index.html 结构

- `#game`：960×640 Canvas，承载全部游戏画面
- `#hud`：游戏内悬浮 HUD
  - 得分、连击徽章、关卡、生命（心形 SVG）、最高分、暂停 / 静音按钮
- `#menu`：开始菜单（LOGO、开始按钮、操作提示、最高分）
- `#gameover`：结束屏（GAME OVER、最终得分、新纪录提示、再来一局 / 返回菜单）

## 视图切换

- `main.js` 的 `ui.showPlay / showMenu / showGameOver / showPause` 负责显隐
- 屏幕层（`.screen`）为绝对定位遮罩，覆盖在画布之上

## 画布层内容（engine.render）

1. 背景（渐变 + 半调网点 + 旋转星星剪影）
2. 砖块
3. 道具胶囊
4. 挡板（油漆滚筒造型）
5. 球（旋转五角星）
6. 粒子爆裂 / 得分飘字
7. 暂停遮罩
