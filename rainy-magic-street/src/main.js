/**
 * main.js — 渲染器 / 相机 / 轨道控制 / 灯光 / 后期 / 主循环
 * 雨夜魔法街区 · 街角微缩场景
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { wetUniforms, clamp, lerp, reflectionStreaks, billboards, PAL, TAU, srand, sr } from './lib/core.js';
import { mergeStatic } from './lib/optimize.js';
import { makeRainLayer, makeSky, buildEnvironment } from './lib/atmos.js';
import { buildGround } from './ground.js';
import { buildStore } from './store.js';
import { buildProps } from './props.js';
import { buildNeighbors } from './neighbors.js';
import { L, inRect } from './layout.js';

/* ------------------------------------------------------------------ *
 * 渲染器 + 显卡档位
 * ------------------------------------------------------------------ */
const canvasHost = document.getElementById('scene') || document.body;
const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: 'high-performance',
  stencil: false,
});

function detectTier() {
  try {
    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const s = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) || '');
    const low = /GT ?(710|720|730|620|630|640|220|520|525)|Intel.*(HD Graphics ([2-5]\d{3}|600)|UHD Graphics (600|605))|SwiftShader|llvmpipe|Software|Mali|Adreno|PowerVR|VideoCore/i.test(s);
    const high = /RTX|Radeon RX|GTX ?(9|10|16|20|30|40)\d0|Apple M\d|Iris Xe|Vega \d/i.test(s);
    return { str: s, level: low ? 0 : (high ? 2 : 1) };
  } catch (e) {
    return { str: 'unknown', level: 1 };
  }
}
const TIER = detectTier();
const TIER_CFG = [
  { pr: 1.0, prMin: 0.72, samples: 0, reflector: 256, mirrorEvery: 6, bloomScale: 0.45, rain: 2000, splash: 400, mote: 180, shadowSize: 1024, budget: 1.35e6, shadows: false },
  { pr: 1.4, prMin: 0.85, samples: 2, reflector: 512, mirrorEvery: 2, bloomScale: 0.8, rain: 3000, splash: 700, mote: 340, shadowSize: 1536, budget: 4.0e6, shadows: true },
  { pr: 1.75, prMin: 1.0, samples: 4, reflector: 1024, mirrorEvery: 1, bloomScale: 1.0, rain: 4600, splash: 1100, mote: 460, shadowSize: 2048, budget: 1e9, shadows: true },
][TIER.level];
const CFG = TIER_CFG;

function budgetRatio() {
  const px = window.innerWidth * window.innerHeight;
  return px > CFG.budget ? Math.sqrt(CFG.budget / px) : 1;
}
let curPixelRatio = Math.min(window.devicePixelRatio || 1, CFG.pr) * budgetRatio();
renderer.setPixelRatio(curPixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = CFG.shadows !== false;
renderer.shadowMap.type = CFG.samples > 0 ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.26;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.info.autoReset = false;
canvasHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1a1428, 0.0065);

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.3, 500);
const HOME = { az: 0.8, el: 0.5, dist: 96 };
const target = new THREE.Vector3(-0.6, 4.6, -0.6);
function placeCamera(az, el, dist) {
  const r = dist * Math.cos(el);
  camera.position.set(
    target.x + Math.sin(az) * r,
    target.y + Math.sin(el) * dist,
    target.z + Math.cos(az) * r,
  );
  camera.lookAt(target);
}
placeCamera(HOME.az, HOME.el, HOME.dist);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(target);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.rotateSpeed = 0.85;
controls.zoomSpeed = 0.9;
controls.panSpeed = 0.7;
controls.minDistance = 10;
controls.maxDistance = 190;
controls.maxPolarAngle = 1.5;
controls.enablePan = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.18;
controls.screenSpacePanning = false;
let resumeTimer = 0;
controls.addEventListener('start', () => { controls.autoRotate = false; });
controls.addEventListener('end', () => { resumeTimer = 4.0; });

/* ------------------------------------------------------------------ *
 * 天空（紫夜）+ 灯光
 * ------------------------------------------------------------------ */
const runtime = { cfg: CFG };
const T = { start: performance.now(), marks: {} };
const t0Mark = (k) => { T.marks[k] = +(performance.now() - T.start).toFixed(0); };
t0Mark('start');

const sky = makeSky();
sky.userData.isSky = true;
// 紫夜配色（云层与地平线都压成魔法紫）
sky.userData.uniforms.cTop.value.setHex(0x0a0618);
sky.userData.uniforms.cMid.value.setHex(0x1a1230);
sky.userData.uniforms.cHorizon.value.setHex(0x2e2450);
sky.userData.uniforms.cGlow.value.setHex(0x6a4a94);
scene.add(sky);

const hemi = new THREE.HemisphereLight(0x3f2e70, 0x1a1230, 1.05);
scene.add(hemi);

const moon = new THREE.DirectionalLight(0xa08cd8, 1.35);
moon.position.set(-42, 58, -30);
moon.castShadow = CFG.shadows !== false;
moon.shadow.mapSize.set(CFG.shadowSize, CFG.shadowSize);
moon.shadow.camera.left = -26;
moon.shadow.camera.right = 26;
moon.shadow.camera.top = 26;
moon.shadow.camera.bottom = -26;
moon.shadow.camera.near = 20;
moon.shadow.camera.far = 130;
moon.shadow.camera.updateProjectionMatrix();
moon.shadow.bias = -0.0004;
moon.shadow.normalBias = 0.008;
scene.add(moon);
scene.add(moon.target);
moon.target.position.set(-2, 0, -2);

const fill = new THREE.DirectionalLight(0x6a5a9a, 0.28);
fill.position.set(30, 22, 40);
scene.add(fill);

/* ------------------------------------------------------------------ *
 * 场景内容
 * ------------------------------------------------------------------ */
buildGround(scene, runtime);
buildStore(scene, runtime);
buildProps(scene, runtime);
buildNeighbors(scene, runtime);

/* ---------------- 静态几何合并 ---------------- */
if (runtime.mirror) {
  runtime.mirror.userData.noMerge = true;
  let mirrorTick = 0;
  const origOBR = runtime.mirror.onBeforeRender;
  const every = Math.max(1, CFG.mirrorEvery || 1);
  runtime.mirror.onBeforeRender = function (r, s, c) {
    mirrorTick++;
    if (mirrorTick % every === 0) origOBR.call(this, r, s, c);
  };
}
sky.userData.noMerge = true;
scene.updateMatrixWorld(true);
runtime.mergeInfo = mergeStatic(scene);
t0Mark('merged');

/* ---------------- 雨 ---------------- */
const dryBox = [L.STORE.x0 - 0.35, L.STORE.x1 + 0.35, L.STORE.z0 - 0.35, L.STORE.z1 + 2.1];
function floorAt(x, z) {
  const S = L;
  if (inRect(S.SW_FRONT, x, z) || inRect(S.SW_EAST, x, z) || inRect(S.SW_FAR_S, x, z) ||
    inRect(S.SW_FAR_E, x, z) || inRect(S.SW_NORTH, x, z) || (x > -21 && x < -12 && z > -2.2 && z < 3)) return S.CURB_H + 0.005;
  if (inRect(S.BACKLOT, x, z)) return 0.06;
  if (inRect(S.ALLEY, x, z)) return 0.06;
  return S.ROAD_Y + 0.01;
}
const rain = makeRainLayer({
  count: CFG.rain, area: 20.6, height: 17, slant: [0.15, 0.05], speed: 21, spread: 11,
  width: 0.016, length: 1.8, alpha: 0.17, color: 0xd0c8f4, dry: dryBox, floorFn: floorAt,
});
scene.add(rain);
const splash = makeRainLayer({
  count: CFG.splash, area: 20.6, height: 1, slant: [0.1, 0.04], speed: 1, spread: 4,
  width: 0.018, length: 0.24, alpha: 0.14, color: 0xe4dcff, dry: dryBox, mode: 'splash', floorFn: floorAt,
});
scene.add(splash);
runtime.rain = rain;
runtime.splash = splash;

/* ---------------- 魔法浮游光尘（向上飘的发光微粒） ---------------- */
function makeMotes(count) {
  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute('position', base.attributes.position);
  geo.setAttribute('uv', base.attributes.uv);
  const seed = new Float32Array(count * 3);
  const param = new Float32Array(count * 3);
  const tint = new Float32Array(count * 3);
  const cols = [[0.72, 0.55, 1.0], [0.35, 0.8, 1.0], [1.0, 0.72, 0.4], [1.0, 0.5, 0.8], [0.5, 1.0, 0.7]];
  for (let i = 0; i < count; i++) {
    seed[i * 3] = (srand() * 2 - 1) * 20;
    seed[i * 3 + 1] = srand();
    seed[i * 3 + 2] = (srand() * 2 - 1) * 20;
    param[i * 3] = sr(0.25, 0.85);          // 上升速度
    param[i * 3 + 1] = sr(0.03, 0.075);     // 尺寸
    param[i * 3 + 2] = srand() * TAU;       // 相位
    const c = cols[Math.floor(srand() * cols.length)];
    tint[i * 3] = c[0]; tint[i * 3 + 1] = c[1]; tint[i * 3 + 2] = c[2];
  }
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 3));
  geo.setAttribute('aParam', new THREE.InstancedBufferAttribute(param, 3));
  geo.setAttribute('aTint', new THREE.InstancedBufferAttribute(tint, 3));
  geo.instanceCount = count;
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);
  base.dispose();

  const uniforms = {
    uTime: { value: 0 },
    uHeight: { value: 9 },
    uDry: { value: new THREE.Vector4(dryBox[0], dryBox[1], dryBox[2], dryBox[3]) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 aSeed;
      attribute vec3 aParam;
      attribute vec3 aTint;
      uniform float uTime, uHeight;
      varying float vAlpha;
      varying vec3 vTint;
      varying vec3 vWorld;
      void main(){
        float ph = aParam.z;
        float life = fract(aSeed.y + uTime * aParam.x * 0.11);
        float y = 0.4 + life * uHeight;
        float sway = sin(uTime * 0.7 + ph) * 0.5;
        vec3 center = vec3(aSeed.x + sway, y, aSeed.z + cos(uTime * 0.55 + ph) * 0.5);
        vWorld = center;
        vAlpha = smoothstep(0.0, 0.15, life) * (1.0 - smoothstep(0.6, 1.0, life));
        vTint = aTint;
        vec4 mv = modelViewMatrix * vec4(center, 1.0);
        vec2 perp = normalize(vec2(0.0, 1.0));
        mv.xy += (perp * position.x + vec2(-perp.y, perp.x) * position.y) * aParam.y;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec4 uDry;
      varying float vAlpha;
      varying vec3 vTint;
      varying vec3 vWorld;
      void main(){
        if (vWorld.x > uDry.x && vWorld.x < uDry.y && vWorld.z > uDry.z && vWorld.z < uDry.w) discard;
        gl_FragColor = vec4(vTint * 1.5, vAlpha * 0.5);
      }
    `,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  mesh.userData.uniforms = uniforms;
  return mesh;
}
const motes = makeMotes(CFG.mote);
scene.add(motes);
runtime.motes = motes;

/* ---------------- 环境反射捕捉（一次性） ---------------- */
function captureEnvironment() {
  const stash = [];
  for (const o of [runtime.mirror, rain, splash, motes]) { if (o) { stash.push([o, o.visible]); o.visible = false; } }
  const proxy = [];
  scene.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    const m = o.material;
    if (Array.isArray(m)) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const emissiveish = m.isMeshBasicMaterial || m.emissiveMap ||
      (m.emissive && (m.emissive.r + m.emissive.g + m.emissive.b) > 0.2);
    const topY = o.geometry.boundingBox.max.y;
    if (!emissiveish && topY < 5.0) { proxy.push(o); o.visible = false; }
  });
  try {
    const env = buildEnvironment(renderer, scene, { position: new THREE.Vector3(0, 9, 0), size: 96 });
    scene.environment = env;
    scene.environmentIntensity = 0.9;
  } catch (e) {
    console.warn('environment capture failed', e);
  }
  for (const o of proxy) o.visible = true;
  for (const [o, v] of stash) o.visible = v;
}

/* ------------------------------------------------------------------ *
 * 后期
 * ------------------------------------------------------------------ */
const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
const rt = new THREE.WebGLRenderTarget(size.x, size.y, {
  samples: CFG.samples, type: THREE.HalfFloatType, colorSpace: THREE.LinearSRGBColorSpace,
});
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(size.x * CFG.bloomScale, size.y * CFG.bloomScale), 0.46, 0.6, 0.78);
composer.addPass(bloom);

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uVignette: { value: 0.88 },
    uSaturation: { value: 1.12 },
    uContrast: { value: 1.06 },
    uLift: { value: new THREE.Color(0x140a26) },
    uLiftAmt: { value: 0.07 },
    uWarm: { value: new THREE.Color(0xffe4c4) },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uVignette, uSaturation, uContrast, uLiftAmt;
    uniform vec3 uLift, uWarm;
    varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 col = c.rgb;
      col = (col - 0.5) * uContrast + 0.5;
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(l), col, uSaturation);
      col += uLift * uLiftAmt * (1.0 - smoothstep(0.0, 0.35, l));
      col *= mix(vec3(1.0), uWarm, smoothstep(0.55, 1.0, l) * 0.32);
      vec2 d = vUv - 0.5;
      col *= clamp(1.0 - dot(d, d) * uVignette, 0.0, 1.0);
      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }
  `,
};
composer.addPass(new ShaderPass(GradeShader));
composer.addPass(new OutputPass());

/* ------------------------------------------------------------------ *
 * 交互 / 循环
 * ------------------------------------------------------------------ */
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  if (perfStep === 0) {
    const want = Math.min(window.devicePixelRatio || 1, CFG.pr) * budgetRatio();
    if (Math.abs(want - curPixelRatio) > 0.02) { curPixelRatio = want; renderer.setPixelRatio(curPixelRatio); }
  }
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  const pr = renderer.getPixelRatio();
  bloom.setSize(Math.round(w * pr * CFG.bloomScale), Math.round(h * pr * CFG.bloomScale));
}
window.addEventListener('resize', resize);

const clock = new THREE.Clock();
let introT = 0;
let perfFrames = 0, perfAcc = 0, perfStep = 0, perfWarm = false;
let fpsAvg = 0;
const frameMs = [];

window.__perf = () => ({
  fps: +fpsAvg.toFixed(1),
  tier: TIER,
  pixelRatio: +curPixelRatio.toFixed(2),
  perfStep,
  calls: renderer.info.render.calls,
  triangles: renderer.info.render.triangles,
  programs: renderer.info.programs ? renderer.info.programs.length : -1,
  geometries: renderer.info.memory.geometries,
  textures: renderer.info.memory.textures,
  merge: runtime.mergeInfo ? { buckets: runtime.mergeInfo.buckets, from: runtime.mergeInfo.mergedMeshes, verts: runtime.mergeInfo.verts, pruned: runtime.mergeInfo.pruned } : null,
  marks: T.marks,
  frameMs: frameMs.slice(-120).sort((a, b) => a - b),
  renderer: (() => {
    try {
      const gl = renderer.getContext();
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      return dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'n/a';
    } catch (e) { return 'err'; }
  })(),
});
window.__resetPerf = () => { frameMs.length = 0; perfFrames = 0; perfAcc = 0; fpsAvg = 0; };

const streakList = reflectionStreaks;

function frame() {
  if (document.hidden) { requestAnimationFrame(frame); return; }
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  frameMs.push(dt * 1000);
  if (frameMs.length > 200) frameMs.shift();

  // 自适应画质
  perfFrames++; perfAcc += dt;
  if (T.marks.env && t > 3.0) perfWarm = true;
  if (perfFrames >= 90) {
    fpsAvg = perfFrames / perfAcc;
    if (!perfWarm) {
      perfFrames = 0; perfAcc = 0;
    } else if (fpsAvg < 42) {
      if (curPixelRatio > CFG.prMin + 0.01) {
        curPixelRatio = Math.max(CFG.prMin, curPixelRatio - 0.25);
        renderer.setPixelRatio(curPixelRatio);
        resize();
        perfStep = Math.max(perfStep, 1);
      } else if (perfStep < 2) {
        perfStep = 2;
        bloom.setSize(Math.round(window.innerWidth * curPixelRatio * 0.4), Math.round(window.innerHeight * curPixelRatio * 0.4));
      } else if (perfStep === 2) {
        perfStep = 3;
        if (runtime.mirror) runtime.mirror.visible = false;
      } else if (perfStep === 3) {
        perfStep = 4;
        rain.geometry.instanceCount = Math.max(600, Math.round(rain.geometry.instanceCount * 0.55));
        splash.geometry.instanceCount = Math.max(200, Math.round(splash.geometry.instanceCount * 0.5));
        motes.geometry.instanceCount = Math.max(80, Math.round(motes.geometry.instanceCount * 0.6));
      } else if (perfStep === 4) {
        perfStep = 5;
        bloom.enabled = false;
      }
      perfFrames = 0; perfAcc = 0;
    } else if (fpsAvg > 56 && (perfStep > 0 || curPixelRatio < Math.min(window.devicePixelRatio || 1, CFG.pr) - 0.01)) {
      if (curPixelRatio < Math.min(window.devicePixelRatio || 1, CFG.pr) - 0.01) {
        curPixelRatio = Math.min(CFG.pr, curPixelRatio + 0.15);
        renderer.setPixelRatio(curPixelRatio);
        resize();
      } else if (perfStep === 2) {
        perfStep = 1;
        bloom.setSize(Math.round(window.innerWidth * curPixelRatio * 0.75), Math.round(window.innerHeight * curPixelRatio * 0.75));
      } else if (perfStep === 3) {
        perfStep = 2;
        if (runtime.mirror) runtime.mirror.visible = true;
      } else if (perfStep >= 4) {
        perfStep = 3;
        rain.geometry.instanceCount = CFG.rain;
        splash.geometry.instanceCount = CFG.splash;
        motes.geometry.instanceCount = CFG.mote;
        bloom.enabled = true;
      }
      perfFrames = 0; perfAcc = 0;
    } else { perfFrames = 0; perfAcc = 0; }
  }

  // 相机开场推进
  if (introT < 1) {
    introT = Math.min(1, introT + dt / 2.2);
    const e = 1 - Math.pow(1 - introT, 3);
    if (!controls.userInteracted) {
      placeCamera(HOME.az, HOME.el + (1 - e) * 0.06, lerp(HOME.dist * 1.42, HOME.dist, e));
    }
  }
  if (resumeTimer > 0) {
    resumeTimer -= dt;
    if (resumeTimer <= 0) controls.autoRotate = true;
  }
  controls.update();
  controls.target.x = clamp(controls.target.x, -12, 12);
  controls.target.z = clamp(controls.target.z, -12, 12);
  controls.target.y = clamp(controls.target.y, 1.5, 20);

  // 时间 uniform
  wetUniforms.uTime.value = t;
  sky.userData.uniforms.uTime.value = t;
  rain.userData.uniforms.uTime.value = t;
  splash.userData.uniforms.uTime.value = t;
  motes.userData.uniforms.uTime.value = t;

  // 湿地反光条轻微晃动
  for (let i = 0; i < streakList.length; i++) {
    const s = streakList[i];
    s.m.scale.x = 1 + Math.sin(t * 1.6 + s.seed) * 0.06;
    s.m.material.opacity = s.base * (0.88 + Math.sin(t * 2.3 + s.seed * 2.0) * 0.12);
  }

  // 灯珠光晕朝向相机
  for (let i = 0; i < billboards.length; i++) {
    const b = billboards[i];
    if (b.visible) b.lookAt(camera.position);
  }

  // 漂浮烛火：上下起伏 + 呼吸
  if (runtime.floatCandles) {
    for (const c of runtime.floatCandles) {
      c.g.position.y = c.y0 + Math.sin(t * c.spd + c.ph) * c.amp;
      c.g.rotation.y = t * 0.3 + c.ph;
    }
  }
  // 魔法水晶：缓慢自转 + 脉动
  if (runtime.crystals) {
    for (const cr of runtime.crystals) {
      cr.rotation.y = t * 0.6;
      cr.rotation.x = Math.sin(t * 0.5) * 0.2;
      if (cr.material && cr.material.color) {
        const k = 1 + Math.sin(t * 1.4) * 0.18;
        cr.material.color.copy(cr.userData.baseColor || cr.material.color);
        if (!cr.userData.baseColor) cr.userData.baseColor = cr.material.color.clone();
        cr.material.color.copy(cr.userData.baseColor).multiplyScalar(k);
      }
    }
  }
  // 魔法阵：明暗呼吸
  if (runtime.runeCircles) {
    for (const r of runtime.runeCircles) {
      if (r.m.material) r.m.material.opacity = (r.m.material.opacity ?? 0.5) * 0 + (0.34 + Math.sin(t * 0.9 + r.seed) * 0.16);
      if (r.m.material && r.m.material.opacity !== undefined) r.m.material.opacity = 0.34 + Math.sin(t * 0.9 + r.seed) * 0.16;
    }
  }
  // 坩埚气泡上浮
  if (runtime.cauldronBubbles) {
    for (const b of runtime.cauldronBubbles) {
      const d = b.userData;
      const life = (t * 0.5 + d.ph) % 1;
      b.position.set(Math.cos(d.a) * d.r, d.y0 + life * 0.34, Math.sin(d.a) * d.r);
      b.scale.setScalar(0.6 + life * 0.9);
      b.material.color.setHex(0x86efac).multiplyScalar(0.8 + life * 0.8);
    }
  }
  // 屋顶符文环旋转
  if (runtime.runeRing) {
    runtime.runeRing.rotation.z = t * 0.5;
  }
  // 小巷壁灯闪烁
  if (runtime.flickerLights) {
    for (const fl of runtime.flickerLights) {
      const n = Math.sin(t * 11.3) * Math.sin(t * 3.7) * Math.sin(t * 27.1);
      const on = n > -0.25 ? 1 : 0.25 + Math.abs(n) * 0.6;
      fl.light.intensity = 14 * on;
      if (fl.mesh) fl.mesh.material.color.setScalar(1.2 * on);
    }
  }

  bloom.strength = 0.46 + Math.sin(t * 0.7) * 0.016;

  renderer.info.reset();
  composer.render();
  requestAnimationFrame(frame);
}

// 调试用视角接口（无 UI）
window.__view = (az, el, dist) => {
  controls.autoRotate = false;
  controls.userInteracted = true;
  introT = 1;
  placeCamera(az, el, dist);
  controls.target.copy(target);
  controls.update();
  camera.updateProjectionMatrix();
};
window.__home = () => window.__view(HOME.az, HOME.el, HOME.dist);
window.__scene = scene; window.__renderer = renderer; window.__camera = camera;

renderer.domElement.addEventListener('pointerdown', () => { controls.userInteracted = true; });
renderer.domElement.addEventListener('wheel', () => { controls.userInteracted = true; }, { passive: true });

/* ------------------------------------------------------------------ *
 * 启动流程：并行编译着色器 → 捕捉环境反射 → 开画
 * ------------------------------------------------------------------ */
async function boot() {
  try {
    if (renderer.compileAsync) await renderer.compileAsync(scene, camera);
    else renderer.compile(scene, camera);
  } catch (e) { /* 个别驱动不支持并行编译 */ }
  t0Mark('compiled');

  captureEnvironment();
  t0Mark('env');

  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  frame();
  requestAnimationFrame(() => { document.body.classList.add('ready'); window.__ready = true; });
}
boot();
