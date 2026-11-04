# -*- coding: utf-8 -*-
"""
线稿小猫 · 产物生成器
- 造型严格取自描摹 SVG 的原始 fill 路径（保持黑线质量与 nonzero 缠绕）
- 手绘开场：SVG mask 内白色粗线沿外边缘描边揭示，由 anime.js timeline 驱动，结束后移除 mask
- 循环生命感：外层 sway 微摆 + 中层 breath 呼吸（三层嵌套，transform 互不冲突）
- 随机间隔眨眼：眼睛轮廓 + 瞳孔四层 scaleY
- 坐姿 / 站姿标签切换；图层开关、动画开关、速度、重播
"""
import os
import re

ROOT = r"C:\Users\Mayn\Doubao\chats\2026-10-07\new-chat\cat-vector-animation"
OUT = os.path.join(ROOT, "index.html")
SRC_SIT = os.path.join(ROOT, "assets", "svg", "cat-sitting.svg")     # 坐姿 1283x1489
SRC_STAND = os.path.join(ROOT, "assets", "svg", "cat-standing.svg")  # 站姿 442x442

# 图层：(data-layer, 源 path 序号, mask 用第几子路径(None=整条), 开场起点 ms, 时长 ms)
LAYERS = [
    ("outline", 0, 0,       0, 1500),
    ("eye-r",   1, 0,    1050,  700),
    ("eye-l",   2, 0,    1050,  700),
    ("pupil-r", 4, None, 1300,  550),
    ("pupil-l", 5, None, 1300,  550),
    ("mouth",   3, None, 1500,  550),
]
BLINK_LAYERS = ("eye-r", "eye-l", "pupil-r", "pupil-l")


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def split_subpaths(d):
    subs, cur = [], None
    for m in re.finditer(r"([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)", d):
        cmd, args = m.group(1), m.group(2)
        if cmd in ("M", "m"):
            if cur is not None:
                subs.append(cur)
            cur = [cmd, args]
        else:
            cur[1] += cmd + args
    if cur is not None:
        subs.append(cur)
    return subs


def absolutize(subs):
    out, origin = [], None
    for cmd, body in subs:
        m = re.match(r"\s*([\-\d.]+)[,\s]+([\-\d.]+)", body)
        if not m:
            m = re.match(r"\s*(-?[\d.]+)(-?[\d.]+)", body)
        dx, dy = float(m.group(1)), float(m.group(2))
        if cmd == "M":
            origin = (dx, dy)
            out.append("M" + body)
        else:
            x, y = origin[0] + dx, origin[1] + dy
            origin = (x, y)
            out.append("M " + repr(x) + " " + repr(y) + body[m.end():])
    return out


def parse_svg(path):
    svg = read(path)
    vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
    ds = re.findall(r'<path d="([^"]+)"', svg)
    abs_subs = [absolutize(split_subpaths(d)) for d in ds]
    return vb, ds, abs_subs


def build_view(key, path, mask_w, eye_origin, body_origin, active):
    vb, ds, abs_subs = parse_svg(path)
    W, H = vb.split()[2], vb.split()[3]
    label = "坐姿小猫" if key == "sit" else "站姿小猫"
    p = []
    p.append('<div class="view%s" data-view="%s" data-eye-origin="%s" data-body-origin="%s">'
             % (" active" if active else "", key, eye_origin, body_origin))
    p.append('<svg class="cat-svg" viewBox="%s" style="--mask-w:%s" role="img" aria-label="%s">'
             % (vb, mask_w, label))
    # defs：每图层一个 mask（黑底 + 白色粗线；clipPath 在 Chrome 动画期失效，故用 mask）
    p.append("<defs>")
    for name, pi, sub_i, start, dur in LAYERS:
        mid = "mask-%s-%s" % (key, name)
        cd = ds[pi] if sub_i is None else abs_subs[pi][sub_i]
        p.append('<mask id="%s"><rect x="0" y="0" width="%s" height="%s" fill="#000"/>'
                 '<path class="maskdraw" data-start="%d" data-dur="%d" d="%s"/></mask>'
                 % (mid, W, H, start, dur, cd))
    p.append("</defs>")
    p.append('<rect x="0" y="0" width="%s" height="%s" fill="#ffffff"/>' % (W, H))
    # 三层：sway（微摆） > breath（呼吸） > 各图层
    p.append('<g class="sway"><g class="breath">')
    for name, pi, sub_i, start, dur in LAYERS:
        mid = "mask-%s-%s" % (key, name)
        blink = " blinkpart" if name in BLINK_LAYERS else ""
        p.append('<g class="lyr%s" data-layer="%s" data-mask="url(#%s)" mask="url(#%s)">'
                 '<path d="%s" fill="#111"/></g>'
                 % (blink, name, mid, mid, ds[pi]))
    p.append("</g></g></svg></div>")
    return "\n".join(p)


view_sit = build_view("sit", SRC_SIT, "180", "641px 540px", "641px 1430px", True)
view_stand = build_view("stand", SRC_STAND, "56", "221px 142px", "221px 420px", False)

HTML = r'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>线稿小猫 · SVG 矢量动画</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4 10 L3 3 L9 7' fill='none' stroke='%23111' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M20 10 L21 3 L15 7' fill='none' stroke='%23111' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M4 10 C4 17 8 21 12 21 C16 21 20 17 20 10 Z' fill='none' stroke='%23111' stroke-width='1.8'/%3E%3Ccircle cx='9.5' cy='12.5' r='1.4' fill='%23111'/%3E%3Ccircle cx='14.5' cy='12.5' r='1.4' fill='%23111'/%3E%3Cpath d='M10 16 Q12 17.5 14 16' fill='none' stroke='%23111' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif;
  background: #fff; color: #222; min-height: 100vh;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.wrap { display: flex; gap: 24px; align-items: center; justify-content: center; flex-wrap: wrap; max-width: 920px; }
.tabs { display: flex; gap: 8px; width: 100%; justify-content: center; margin-bottom: 2px; }
.tab {
  padding: 7px 20px; border: 1px solid #ccc; border-radius: 999px; background: #fff;
  font-size: 13px; cursor: pointer; color: #555; transition: all .18s ease;
  min-height: 40px;
}
.tab.active { background: #111; border-color: #111; color: #fff; }
.tab:focus-visible, .btn:focus-visible, input:focus-visible { outline: 2px solid #111; outline-offset: 2px; }
.stage { background: #fff; border: 1px solid #ececec; border-radius: 16px; padding: 14px; }
.cat-svg { width: min(72vw, 460px); height: auto; display: block; }
.view { display: none; } .view.active { display: block; }
.panel {
  width: 276px; background: #fff; border: 1px solid #ececec; border-radius: 16px;
  padding: 18px 18px 14px; font-size: 14px; line-height: 1.6;
}
.panel h1 { font-size: 17px; font-weight: 700; letter-spacing: .5px; margin-bottom: 2px; }
.panel .sub { font-size: 13px; color: #888; margin-bottom: 14px; }
.panel fieldset { border: 1px solid #ececec; border-radius: 10px; padding: 10px 12px 12px; margin-bottom: 12px; }
.panel legend { font-size: 11px; font-weight: 600; color: #666; padding: 0 6px; letter-spacing: 1px; }
.row { display: flex; align-items: center; gap: 9px; padding: 5px 0; }
.row input[type="checkbox"] { width: 20px; height: 20px; accent-color: #111; cursor: pointer; }
.row label { cursor: pointer; user-select: none; min-height: 30px; display: inline-flex; align-items: center; }
.speed-row { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.speed-row input[type="range"] { flex: 1; accent-color: #111; height: 24px; }
.speed-row .val { width: 42px; text-align: right; font-variant-numeric: tabular-nums; color: #444; }
.speed-row .cap { font-size: 12px; color: #888; }
.btn {
  width: 100%; padding: 10px 0; border: 1px solid #111; border-radius: 8px; background: #fff;
  color: #111; font-size: 13px; font-weight: 600; cursor: pointer; min-height: 44px;
  transition: background .18s ease, color .18s ease;
}
.btn:hover { background: #111; color: #fff; }
.btn:active { transform: scale(.98); }

/* 图层关闭 */
.off { display: none !important; }

/* 变换参考统一按 viewBox 用户坐标 */
.sway, .breath, .blinkpart { transform-box: view-box; }

/* 手绘开场 mask 内白色粗线（anime.js 逐帧驱动 dashoffset） */
.maskdraw {
  fill: none; stroke: #fff; stroke-width: var(--mask-w);
  stroke-linecap: round; stroke-linejoin: round;
}
</style>
</head>
<body>
<div class="wrap">

  <div class="stage">
    <div class="tabs">
      <button class="tab active" data-tab="sit" type="button">坐姿猫</button>
      <button class="tab" data-tab="stand" type="button">站姿猫</button>
    </div>
    __VIEWS__
  </div>

  <aside class="panel">
    <h1>线稿小猫</h1>
    <div class="sub">SVG 矢量动画 · 分层可编辑</div>

    <fieldset>
      <legend>图层开关</legend>
      <div class="row"><input type="checkbox" id="ly-outline" checked data-layer-toggle="outline"><label for="ly-outline">轮廓</label></div>
      <div class="row"><input type="checkbox" id="ly-eye-r" checked data-layer-toggle="eye-r"><label for="ly-eye-r">右眼</label></div>
      <div class="row"><input type="checkbox" id="ly-eye-l" checked data-layer-toggle="eye-l"><label for="ly-eye-l">左眼</label></div>
      <div class="row"><input type="checkbox" id="ly-mouth" checked data-layer-toggle="mouth"><label for="ly-mouth">嘴巴</label></div>
      <div class="row"><input type="checkbox" id="ly-pupil-r" checked data-layer-toggle="pupil-r"><label for="ly-pupil-r">右瞳孔</label></div>
      <div class="row"><input type="checkbox" id="ly-pupil-l" checked data-layer-toggle="pupil-l"><label for="ly-pupil-l">左瞳孔</label></div>
    </fieldset>

    <fieldset>
      <legend>动画开关</legend>
      <div class="row"><input type="checkbox" id="an-breath" checked data-anim="breath"><label for="an-breath">呼吸 / 微摆</label></div>
      <div class="row"><input type="checkbox" id="an-blink" checked data-anim="blink"><label for="an-blink">眨眼</label></div>
    </fieldset>

    <fieldset>
      <legend>节奏</legend>
      <div class="speed-row">
        <span class="cap">慢</span>
        <input type="range" id="speed" min="0.5" max="2" step="0.1" value="1" aria-label="动画速度">
        <span class="cap">快</span>
        <span class="val" id="speed-val">1.0x</span>
      </div>
    </fieldset>

    <button class="btn" id="replay" type="button">重播手绘描边</button>
  </aside>

</div>

<script src="assets/vendor/anime.min.js"></script>
<script>
(function () {
  var hasAnime = typeof window.anime !== 'undefined';
  var reduceMotion = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var views = Array.prototype.slice.call(document.querySelectorAll('.view'));

  /* ===== mask 挂载 / 移除 ===== */
  function attachMasks(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll('[data-mask]'), function (g) {
      g.setAttribute('mask', g.dataset.mask);
    });
  }
  function detachMasks(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll('[data-mask]'), function (g) {
      g.removeAttribute('mask');
    });
  }

  /* ===== 随机间隔眨眼 ===== */
  function scheduleBlink(scope) {
    if (!scope._loopsStarted) return;
    clearTimeout(scope._blinkTimer);
    var sp = scope._speed || 1;
    var gap = (2000 + Math.random() * 3400) / sp;
    scope._blinkTimer = setTimeout(function () {
      if (scope._blinkOn && !reduceMotion && hasAnime) {
        anime({
          targets: scope.querySelectorAll('.blinkpart'),
          scaleY: [1, 0.05, 1],
          duration: 250 / sp,
          easing: 'easeInOutQuad',
          transformOrigin: scope.dataset.eyeOrigin,
          complete: function () { scheduleBlink(scope); }
        });
      } else {
        scheduleBlink(scope);
      }
    }, gap);
  }

  /* ===== 循环生命感：微摆 + 呼吸 ===== */
  function startLoops(scope) {
    if (scope._loopsStarted) return;
    scope._loopsStarted = true;
    if (!hasAnime || reduceMotion) {
      scope._breathOn = false;
      scope._blinkOn = false;
      return;
    }
    var bodyOrigin = scope.dataset.bodyOrigin;
    scope._loops = [
      anime({
        targets: scope.querySelector('.sway'),
        rotate: [-0.4, 0.4], duration: 5200,
        easing: 'easeInOutSine', direction: 'alternate', loop: true,
        transformOrigin: bodyOrigin
      }),
      anime({
        targets: scope.querySelector('.breath'),
        scale: [1, 1.024], duration: 3400,
        easing: 'easeInOutSine', direction: 'alternate', loop: true,
        transformOrigin: bodyOrigin
      })
    ];
    scope._loops.forEach(function (l) { l.speed = scope._speed || 1; });
    scope._breathOn = true;
    scope._blinkOn = true;
    scheduleBlink(scope);
  }

  /* ===== 手绘描边开场（anime timeline 驱动 mask） ===== */
  function startIntro(scope) {
    clearTimeout(scope._introTimer);
    if (scope._intro) { scope._intro.pause(); scope._intro = null; }
    if (!hasAnime || reduceMotion) {
      detachMasks(scope);
      scope._done = true;
      startLoops(scope);
      return;
    }
    attachMasks(scope);
    var tl = anime.timeline({
      easing: 'easeOutQuart',
      complete: function () {
        detachMasks(scope);
        scope._done = true;
        startLoops(scope);
      }
    });
    Array.prototype.forEach.call(scope.querySelectorAll('.maskdraw'), function (p) {
      var len = 800;
      try { len = p.getTotalLength(); } catch (e) {}
      anime.set(p, { strokeDasharray: [len, len], strokeDashoffset: len });
      tl.add({
        targets: p,
        strokeDashoffset: [len, 0],
        duration: parseInt(p.dataset.dur, 10),
        easing: 'easeOutQuart'
      }, parseInt(p.dataset.start, 10));
    });
    scope._intro = tl;
  }

  /* 初始视图开场 */
  views.forEach(function (v) { if (v.classList.contains('active')) startIntro(v); });

  /* ===== 标签切换 ===== */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.toggle('active', x === t); });
      var key = t.dataset.tab;
      views.forEach(function (v) { v.classList.toggle('active', v.dataset.view === key); });
      var target = views.filter(function (v) { return v.dataset.view === key; })[0];
      if (!target._done) startIntro(target);
    });
  });

  /* ===== 图层开关（两视图同步） ===== */
  Array.prototype.forEach.call(document.querySelectorAll('[data-layer-toggle]'), function (cb) {
    cb.addEventListener('change', function () {
      views.forEach(function (v) {
        var g = v.querySelector('.lyr[data-layer="' + cb.dataset.layerToggle + '"]');
        if (g) g.classList.toggle('off', !cb.checked);
      });
    });
  });

  /* ===== 呼吸 / 微摆开关 ===== */
  document.getElementById('an-breath').addEventListener('change', function () {
    var on = this.checked;
    views.forEach(function (v) {
      v._breathOn = on;
      if (!v._loops) return;
      if (on) {
        v._loops.forEach(function (l) { l.play(); });
      } else {
        v._loops.forEach(function (l) { l.pause(); });
        anime.set(v.querySelector('.sway'), { rotate: 0 });
        anime.set(v.querySelector('.breath'), { scale: 1 });
      }
    });
  });

  /* ===== 眨眼开关 ===== */
  document.getElementById('an-blink').addEventListener('change', function () {
    var on = this.checked;
    views.forEach(function (v) {
      v._blinkOn = on;
      clearTimeout(v._blinkTimer);
      if (!on) {
        if (hasAnime) anime.set(v.querySelectorAll('.blinkpart'), { scaleY: 1 });
      } else {
        scheduleBlink(v);
      }
    });
  });

  /* ===== 速度 ===== */
  var speedEl = document.getElementById('speed');
  var speedVal = document.getElementById('speed-val');
  speedEl.addEventListener('input', function () {
    var v = parseFloat(speedEl.value);
    speedVal.textContent = v.toFixed(1) + 'x';
    views.forEach(function (sc) {
      sc._speed = v;
      if (sc._loops) sc._loops.forEach(function (l) { l.speed = v; });
    });
  });

  /* ===== 重播 ===== */
  document.getElementById('replay').addEventListener('click', function () {
    var current = views.filter(function (v) { return v.classList.contains('active'); })[0];
    current._done = false;
    if (hasAnime) {
      anime.set(current.querySelector('.sway'), { rotate: 0 });
      anime.set(current.querySelector('.breath'), { scale: 1 });
    }
    startIntro(current);
  });
})();
</script>
</body>
</html>
'''

HTML = HTML.replace("__VIEWS__", view_sit + "\n    " + view_stand)
with open(OUT, "w", encoding="utf-8") as f:
    f.write(HTML)

# 移除上一版单文件交付物（项目化后统一入口 index.html）
legacy = os.path.join(ROOT, "线稿小猫矢量动画.html")
if os.path.exists(legacy):
    os.remove(legacy)
print("written:", OUT)
