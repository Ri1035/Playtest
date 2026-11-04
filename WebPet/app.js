/* 喵喵跟随 —— 抽帧序列 + 弹簧跟随鼠标
 * 纯原生 JS，无第三方依赖（可离线运行）
 */
(() => {
  'use strict';

  const M = window.CAT_FRAMES;
  const FPS = 24;

  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const loader = document.getElementById('loader');
  const bar = document.getElementById('bar');
  const loaderText = document.getElementById('loaderText');
  const hint = document.getElementById('hint');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- 参数 ---------------- */
  const params = {
    stiff: 0.12,   // 跟随灵敏度（弹簧刚度）
    damping: 0.76, // 阻尼
    scale: 1,      // 显示尺寸倍率
    shadow: true,
    trail: true,
  };

  /* ---------------- 状态 ---------------- */
  const IMAGES = new Array(M.count);
  let loadedCount = 0;
  let ready = false;

  let W = 0, H = 0, dpr = 1;
  let baseSize = 300;
  let dispW = 0, dispH = 0;

  const pointer = { x: 0, y: 0, has: false };
  const cat = { x: 0, y: 0, vx: 0, vy: 0, rot: 0 };
  const ghosts = [];
  const particles = [];

  let animTime = 0;
  let frameIdx = 0;
  let hopT = -1;
  let bobT = 0;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const ease = (cur, target, k) => cur + (target - cur) * k;

  /* ---------------- 尺寸 ---------------- */
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    baseSize = clamp(Math.min(W, H) * 0.34, 168, 400);
    dispW = baseSize * params.scale;
    dispH = dispW * (M.h / M.w);

    if (!pointer.has) {
      pointer.x = W / 2;
      pointer.y = H / 2;
      cat.x = W / 2;
      cat.y = H / 2;
    }
  }

  /* ---------------- 预加载 ---------------- */
  function preload() {
    M.files.forEach((src, i) => {
      const img = new Image();
      const done = () => {
        loadedCount++;
        const p = Math.round((loadedCount / M.count) * 100);
        bar.style.width = p + '%';
        loaderText.textContent = '正在抽帧加载 ' + p + '%';
        if (loadedCount >= M.count) {
          ready = true;
          loader.classList.add('is-hidden');
        }
      };
      img.onload = done;
      img.onerror = done;
      img.src = src;
      IMAGES[i] = img;
    });
  }

  /* ---------------- 指针事件 ---------------- */
  function move(x, y) {
    pointer.x = x;
    pointer.y = y;
    if (!pointer.has) {
      pointer.has = true;
      hint.classList.add('is-hidden');
    }
  }

  window.addEventListener('pointermove', (e) => move(e.clientX, e.clientY), { passive: true });
  window.addEventListener('pointerdown', (e) => { move(e.clientX, e.clientY); hop(e.clientX, e.clientY); });
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (t) move(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (t) { move(t.clientX, t.clientY); hop(t.clientX, t.clientY); }
  }, { passive: true });

  function hop(x, y) {
    hopT = 0;
    if (reduce) return;
    const n = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.3;
      const sp = 1.5 + Math.random() * 2.4;
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0,
        max: 0.7 + Math.random() * 0.5,
        size: 9 + Math.random() * 10,
        rot: (Math.random() - 0.5) * 0.9,
        vr: (Math.random() - 0.5) * 5,
        color: Math.random() < 0.55 ? '#ff5a3c' : '#ff9e8a',
      });
    }
  }

  /* ---------------- 绘制 ---------------- */
  function sprite(cx, cy, rot, sx, sy) {
    const img = IMAGES[frameIdx];
    if (!img || !img.complete || !img.naturalWidth) return;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.scale(sx, sy);
    ctx.drawImage(img, -dispW / 2, -dispH / 2, dispW, dispH);
    ctx.restore();
  }

  function shadow(cx, cy, lift) {
    const rx = dispW * 0.4;
    const ry = dispH * 0.075;
    const a = 0.2 * (1 - Math.min(lift / 70, 0.72));
    if (a <= 0.002) return;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    g.addColorStop(0, 'rgba(126,74,58,' + a.toFixed(3) + ')');
    g.addColorStop(0.55, 'rgba(126,74,58,' + (a * 0.42).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(126,74,58,0)');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function heart(x, y, s, rot, color, alpha) {
    const k = s / 16;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 4 * k);
    ctx.bezierCurveTo(0, 0, -8 * k, -2 * k, -8 * k, -6 * k);
    ctx.bezierCurveTo(-8 * k, -11 * k, -2 * k, -12 * k, 0, -7 * k);
    ctx.bezierCurveTo(2 * k, -12 * k, 8 * k, -11 * k, 8 * k, -6 * k);
    ctx.bezierCurveTo(8 * k, -2 * k, 0, 0, 0, 4 * k);
    ctx.fill();
    ctx.restore();
  }

  /* ---------------- 主循环 ---------------- */
  let last = performance.now();

  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    ctx.clearRect(0, 0, W, H);

    if (ready) {
      const speedNow = Math.hypot(cat.vx, cat.vy);

      // 帧推进（跑动时略快，显得兴奋）
      animTime += dt * (1 + Math.min(speedNow / 90, 0.7));
      frameIdx = Math.floor(animTime * FPS) % M.count;

      // 跟随目标：夹取到可视范围内
      const tx = W <= dispW ? W / 2 : clamp(pointer.x, dispW / 2 + 6, W - dispW / 2 - 6);
      const ty = H <= dispH ? H / 2 : clamp(pointer.y, dispH / 2 + 6, H - dispH / 2 - 6);

      // 定步长弹簧积分，保证不同刷新率下手感一致
      const steps = Math.min(Math.max(Math.round(dt * 60), 1), 4);
      for (let i = 0; i < steps; i++) {
        cat.vx += (tx - cat.x) * params.stiff;
        cat.vy += (ty - cat.y) * params.stiff;
        cat.vx *= params.damping;
        cat.vy *= params.damping;
        cat.x += cat.vx;
        cat.y += cat.vy;
      }

      const speed = Math.hypot(cat.vx, cat.vy);

      // 倾斜：朝运动方向压身
      const targetRot = clamp(cat.vx * 0.012, -0.3, 0.3);
      cat.rot = ease(cat.rot, targetRot, Math.min(1, dt * 12));

      // 呼吸 + 跳跃
      bobT += dt;
      const bob = reduce ? 0 : Math.sin(bobT * 2.4) * 3.4;
      let lift = 0, hopSquash = 0;
      if (hopT >= 0) {
        hopT += dt;
        const DUR = 0.62;
        if (hopT >= DUR) {
          hopT = -1;
        } else {
          const p = hopT / DUR;
          lift = Math.sin(p * Math.PI) * 44;
          hopSquash = Math.sin(p * Math.PI) * 0.1;
        }
      }

      // 速度带来的挤压拉伸
      const stretch = clamp(speed * 0.007, 0, 0.17);
      const sx = (1 + stretch * 0.5) * (1 + hopSquash * 0.5);
      const sy = (1 - stretch * 0.5) * (1 - hopSquash * 0.5);

      // 残影
      if (params.trail && !reduce && speed > 6) {
        ghosts.unshift({ x: cat.x, y: cat.y, rot: cat.rot });
      } else if (ghosts.length) {
        ghosts.pop();
      }
      if (ghosts.length > 7) ghosts.length = 7;

      // —— 绘制 ——
      if (params.shadow) shadow(cat.x, cat.y + dispH * 0.44 + bob, lift + Math.abs(bob));

      if (ghosts.length > 1) {
        for (let i = ghosts.length - 1; i >= 1; i--) {
          const g = ghosts[i];
          ctx.globalAlpha = 0.1 * (1 - i / ghosts.length);
          sprite(g.x, g.y, g.rot, sx, sy);
        }
        ctx.globalAlpha = 1;
      }

      sprite(cat.x, cat.y + bob - lift, cat.rot, sx, sy);
    }

    // 粒子（点击爱心）
    const k = dt * 60;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      if (p.life >= p.max) { particles.splice(i, 1); continue; }
      p.vy += 0.32 * k;
      p.vx *= 0.985;
      p.vy *= 0.995;
      p.x += p.vx * k;
      p.y += p.vy * k;
      p.rot += p.vr * dt;
      heart(p.x, p.y, p.size, p.rot, p.color, (1 - p.life / p.max) * 0.92);
    }

    requestAnimationFrame(loop);
  }

  /* ---------------- 控件 ---------------- */
  const panel = document.getElementById('panel');
  const panelToggle = document.getElementById('panelToggle');
  panelToggle.addEventListener('click', () => {
    const open = panel.classList.toggle('is-open');
    panelToggle.setAttribute('aria-expanded', String(open));
  });

  const rStiff = document.getElementById('rStiff');
  rStiff.addEventListener('input', () => { params.stiff = +rStiff.value / 100; });

  const rScale = document.getElementById('rScale');
  rScale.addEventListener('input', () => {
    params.scale = +rScale.value / 100;
    dispW = baseSize * params.scale;
    dispH = dispW * (M.h / M.w);
  });

  document.getElementById('cShadow').addEventListener('change', (e) => { params.shadow = e.target.checked; });
  document.getElementById('cTrail').addEventListener('change', (e) => { params.trail = e.target.checked; });

  /* ---------------- 启动 ---------------- */
  window.addEventListener('resize', resize);
  resize();
  preload();
  requestAnimationFrame(loop);
})();
