/**
 * ground.js — 底座、湿滑街道、石板人行道、符文斑马线、排水、积水、魔法阵地贴
 */
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import {
  PAL, srand, sr, TAU, canvasTex,
  toon, glow, wetMat, box, cyl, decal, lightStreak, texAsphalt, texStoneSlab,
  texGrate, texRuneCircle, sri, spick, planeGeo, part, boxGeo,
} from './lib/core.js';
import { L } from './layout.js';

const css = (h) => '#' + new THREE.Color(h).getHexString();

/** 积水遮罩：亮处=沥青不透明，暗处=镜面透出（积水） */
function texWetMask() {
  return canvasTex(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = 'rgb(214,214,214)'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = srand() * w, y = srand() * h, r = sr(40, 190);
      const v = sri(52, 96);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${v},${v},${v},0.92)`);
      g.addColorStop(0.55, `rgba(${v + 30},${v + 30},${v + 30},0.6)`);
      g.addColorStop(1, 'rgba(200,200,200,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(x, y, r, r * sr(0.5, 1), srand() * TAU, 0, TAU); ctx.fill();
    }
    for (let i = 0; i < 260; i++) {
      const x = srand() * w, y = srand() * h, r = sr(4, 20);
      const v = sri(120, 170);
      ctx.fillStyle = `rgba(${v},${v},${v},${sr(0.25, 0.7)})`;
      ctx.beginPath(); ctx.ellipse(x, y, r, r * sr(0.4, 1.2), srand() * TAU, 0, TAU); ctx.fill();
    }
  }, { srgb: false, aniso: 4 });
}

export function buildGround(scene, runtime) {
  const G = new THREE.Group();
  scene.add(G);

  const matAsphaltTex = texAsphalt();
  const matStone = texStoneSlab(PAL.stone, 5);
  const matStoneWarm = texStoneSlab(0x9a8f86, 4);
  const wetMask = texWetMask();

  /* ---------------- 底座 ---------------- */
  box(G, L.BASE * 2 + 1.6, 1.0, L.BASE * 2 + 1.6, toon(0x171320), 0, -L.BASE_T - 0.4, 0, { ol: 0.09, shadow: false });
  box(G, L.BASE * 2 + 0.5, 1.6, L.BASE * 2 + 0.5, toon(0x221c2e), 0, -L.BASE_T + 0.7, 0, { ol: 0.07, shadow: false });
  const top = new THREE.MeshStandardMaterial({ color: 0x2b2738, roughness: 0.75, metalness: 0.2 });
  box(G, L.BASE * 2, L.BASE_T, L.BASE * 2, top, 0, -L.BASE_T / 2, 0, { ol: 0.06, shadow: false });
  // 台座顶面亮边（模型感）
  box(G, L.BASE * 2 + 0.16, 0.1, L.BASE * 2 + 0.16, toon(0x4a4258), 0, -0.03, 0, { ol: 0, shadow: false });

  /* ---------------- 镜面水膜层 ---------------- */
  const mirror = new Reflector(new THREE.PlaneGeometry(L.BASE * 2, L.BASE * 2), {
    clipBias: 0.0035,
    textureWidth: (runtime && runtime.cfg && runtime.cfg.reflector) || 512,
    textureHeight: (runtime && runtime.cfg && runtime.cfg.reflector) || 512,
    color: 0x6a6478,
  });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.y = L.MIRROR_Y;
  G.add(mirror);

  /* ---------------- 道路（半透明沥青，透出镜面 = 湿滑反光） ---------------- */
  const roadMat = wetMat(0xffffff, {
    map: matAsphaltTex, roughness: 0.14, metalness: 0.5, envMapIntensity: 1.15,
  });
  roadMat.alphaMap = wetMask;
  roadMat.transparent = true;
  roadMat.depthWrite = false;
  roadMat.map.repeat.set(7, 7);

  const addRoad = (r) => {
    const m = new THREE.Mesh(planeGeo(r.x1 - r.x0, r.z1 - r.z0), roadMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set((r.x0 + r.x1) / 2, L.ROAD_Y, (r.z0 + r.z1) / 2);
    m.receiveShadow = true;
    m.renderOrder = 2;
    G.add(m);
    return m;
  };
  addRoad(L.ROAD_S);
  addRoad(L.ROAD_E);

  /* ---------------- 石板人行道 ---------------- */
  const walkTop = toon(PAL.stone, { map: matStone });
  const walkWarm = toon(0x9a8f86, { map: matStoneWarm });
  const walkSide = toon(PAL.curb);

  function sidewalk(r, opt = {}) {
    const w = r.x1 - r.x0, d = r.z1 - r.z0;
    const g = part(boxGeo(w, L.CURB_H, d), opt.warm ? walkWarm : walkTop, { ol: 0.035, shadow: true });
    g.position.set((r.x0 + r.x1) / 2, L.CURB_H / 2, (r.z0 + r.z1) / 2);
    G.add(g);
    for (const side of opt.curbs || []) {
      let cw = w, cd = 0.34, cx = (r.x0 + r.x1) / 2, cz;
      if (side === 'n') cz = r.z0 + 0.17;
      else if (side === 's') cz = r.z1 - 0.17;
      else if (side === 'e') { cd = w; cw = 0.34; cz = (r.z0 + r.z1) / 2; cx = r.x1 - 0.17; }
      else { cd = w; cw = 0.34; cz = (r.z0 + r.z1) / 2; cx = r.x0 + 0.17; }
      const cc = part(boxGeo(cw, L.CURB_H + 0.05, cd), walkSide, { ol: 0.03 });
      cc.position.set(cx, (L.CURB_H + 0.05) / 2, cz);
      G.add(cc);
    }
    return g;
  }

  sidewalk(L.SW_FRONT, { curbs: ['s'] });
  sidewalk(L.SW_EAST, { curbs: ['e'], warm: true });
  sidewalk(L.SW_FAR_S, { curbs: ['n'] });
  sidewalk(L.SW_FAR_E, { curbs: ['w', 'e'] });
  sidewalk({ x0: -21, x1: -12, z0: -2.2, z1: 3 }, { warm: true });   // 店铺西侧小广场
  sidewalk(L.SW_NORTH, { warm: true });                              // 店后通道

  /* 路缘坡道（斑马线处） */
  const rampMat = toon(PAL.stoneDark);
  const addRamp = (x, z, w, d, ry = 0) => {
    const m = part(boxGeo(w, 0.07, d), rampMat, { ol: 0.025 });
    m.position.set(x, L.CURB_H - 0.02, z);
    m.rotation.set(ry ? 0 : -0.16, ry, ry ? -0.16 : 0);
    G.add(m);
  };
  addRamp(10.5, 6.85, 3.4, 0.9);
  addRamp(12.85, 2.4, 0.9, 3.4);

  /* ---------------- 道路标线（石缝 + 符文嵌线） ---------------- */
  const paintMat = wetMat(0xd2cede, { roughness: 0.13, metalness: 0.55 });
  paintMat.transparent = true; paintMat.opacity = 0.9; paintMat.depthWrite = false;
  const lineMat = wetMat(0xc8c2d8, { roughness: 0.16, metalness: 0.5 });
  lineMat.transparent = true; lineMat.opacity = 0.85;
  const paint = (w, d, x, z, ry = 0, mat = paintMat) => {
    const m = new THREE.Mesh(planeGeo(w, d), mat);
    m.rotation.set(-Math.PI / 2, 0, ry);
    m.position.set(x, L.ROAD_Y + 0.012, z);
    m.renderOrder = 4;
    G.add(m);
    return m;
  };
  // 路中虚线
  for (let x = -19; x < 20; x += 3.4) paint(1.7, 0.16, x, (L.ROAD_S.z0 + L.ROAD_S.z1) / 2 - 0.3, 0, lineMat);
  for (let z = -19; z < 5; z += 3.4) paint(0.16, 1.7, 15.7, z, 0, lineMat);
  paint(L.ROAD_S.x1 - L.ROAD_S.x0, 0.14, 0, L.ROAD_S.z0 + 0.5, 0, lineMat);
  // 符文斑马线（横向石条 + 中央符文）
  for (let i = 0; i < 4; i++) {
    paint(0.78, 6.6, 9.4 + i * 1.62, 11.0);
    paint(0.94, 6.6, 9.4 + i * 1.62, 11.0, 0, lineMat);
  }
  for (let i = 0; i < 3; i++) {
    paint(4.1, 0.78, 15.6, 4.2 - i * 1.62);
    paint(4.1, 0.94, 15.6, 4.2 - i * 1.62, 0, lineMat);
  }
  paint(0.42, 7.6, 8.3, 11.0);
  paint(0.42, 5.0, 14.2, 2.6, 0);

  /* 地面魔法阵（街角装饰，会发光） */
  const runeCircleTex = texRuneCircle();
  const runeMat = new THREE.MeshBasicMaterial({
    map: runeCircleTex, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(PAL.arcaneSoft),
  });
  runtime.runeCircles = [];
  for (const [x, z, s, y] of [[9.6, 9.4, 4.2, L.ROAD_Y + 0.02], [-8.6, 5.2, 2.6, L.CURB_H + 0.015], [15.6, 12.4, 3.2, L.ROAD_Y + 0.02]]) {
    const m = new THREE.Mesh(planeGeo(s, s), runeMat.clone());
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.renderOrder = 5;
    G.add(m);
    runtime.runeCircles.push({ m, seed: srand() * 6 });
  }

  /* ---------------- 排水沟 + 井盖 ---------------- */
  const gutterMat = wetMat(0x24222e, { roughness: 0.1, metalness: 0.7 });
  const grateMat = toon(0x3a3644, { map: texGrate() });
  const gA = new THREE.Mesh(planeGeo(L.ROAD_S.x1 - L.ROAD_S.x0, 0.62), gutterMat);
  gA.rotation.x = -Math.PI / 2; gA.position.set(0, L.ROAD_Y + 0.006, L.ROAD_S.z0 + 0.31);
  gA.renderOrder = 3; G.add(gA);
  const gB = new THREE.Mesh(planeGeo(0.62, L.ROAD_E.z1 - L.ROAD_E.z0), gutterMat);
  gB.rotation.x = -Math.PI / 2; gB.position.set(L.ROAD_E.x0 + 0.31, L.ROAD_Y + 0.006, (L.ROAD_E.z0 + L.ROAD_E.z1) / 2);
  gB.renderOrder = 3; G.add(gB);
  for (let x = -18; x <= 18; x += 3.2) {
    const m = new THREE.Mesh(planeGeo(1.5, 0.5), grateMat);
    m.rotation.x = -Math.PI / 2; m.position.set(x, L.ROAD_Y + 0.014, L.ROAD_S.z0 + 0.31);
    m.renderOrder = 4; G.add(m);
  }
  for (let z = -18; z <= 4; z += 3.2) {
    const m = new THREE.Mesh(planeGeo(0.5, 1.5), grateMat);
    m.rotation.x = -Math.PI / 2; m.position.set(L.ROAD_E.x0 + 0.31, L.ROAD_Y + 0.014, z);
    m.renderOrder = 4; G.add(m);
  }
  const manholeMat = wetMat(0x3a3644, { roughness: 0.14, metalness: 0.72 });
  for (const [x, z] of [[-6.5, 11.6], [12.2, 13.4], [16.4, -6.4], [-15.5, 4.4]]) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.62, 20), manholeMat);
    m.rotation.x = -Math.PI / 2; m.position.set(x, L.ROAD_Y + 0.016, z);
    m.renderOrder = 4; G.add(m);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.6, 20), toon(0x565060));
    ring.rotation.x = -Math.PI / 2; ring.position.set(x, L.ROAD_Y + 0.018, z);
    ring.renderOrder = 4; G.add(ring);
  }

  /* ---------------- 石板停车位（扫帚停放区） ---------------- */
  const lot = L.BACKLOT;
  const lotMat = wetMat(0x35313f, { map: matAsphaltTex.clone(), roughness: 0.2, metalness: 0.5 });
  lotMat.map.repeat.set(3, 3); lotMat.map.needsUpdate = true;
  const lotMesh = new THREE.Mesh(planeGeo(lot.x1 - lot.x0, lot.z1 - lot.z0), lotMat);
  lotMesh.rotation.x = -Math.PI / 2;
  lotMesh.position.set((lot.x0 + lot.x1) / 2, 0.05, (lot.z0 + lot.z1) / 2);
  lotMesh.receiveShadow = true;
  G.add(lotMesh);
  // 石板车位 + 符文
  const stallMat = toon(PAL.stone, { map: matStone });
  for (let i = 0; i < 3; i++) {
    const x = -9.4 + i * 3.1;
    const g = part(boxGeo(3.0, 0.05, 0.12), stallMat, { ol: 0 });
    g.position.set(x, 0.07, -13.4); G.add(g);
    const g2 = part(boxGeo(0.12, 0.05, 5.0), stallMat, { ol: 0 });
    g2.position.set(x + 1.5, 0.07, -15.9); G.add(g2);
    const rc = new THREE.Mesh(planeGeo(1.1, 1.1), runeMat.clone());
    rc.rotation.x = -Math.PI / 2;
    rc.position.set(x + 0.75, 0.075, -15.4);
    rc.renderOrder = 5;
    G.add(rc);
  }

  /* ---------------- 积水 ---------------- */
  const puddleMat = wetMat(0x1b1a24, { roughness: 0.05, metalness: 0.85, envMapIntensity: 1.5 });
  puddleMat.transparent = true; puddleMat.opacity = 0.72; puddleMat.depthWrite = false;
  for (const [x, z, rx, rz] of [
    [-8.2, 5.4, 2.6, 1.3], [2.4, 5.1, 2.0, 1.0], [10.6, 4.3, 2.4, 1.5],
    [-2.6, 6.4, 1.6, 0.8], [11.2, -3.4, 2.2, 1.2], [-16.4, 5.6, 2.8, 1.4],
    [-9.6, -12.9, 3.2, 1.6], [4.2, -14.6, 2.6, 1.2], [-13.4, -6.0, 1.8, 1.0],
  ]) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(1, 26), puddleMat);
    m.rotation.x = -Math.PI / 2; m.rotation.z = srand() * TAU;
    m.scale.set(rx, rz, 1);
    m.position.set(x, L.CURB_H + 0.012, z);
    m.renderOrder = 5;
    G.add(m);
  }
  const roadPuddle = wetMat(0x17161f, { roughness: 0.04, metalness: 0.9, envMapIntensity: 1.6 });
  roadPuddle.transparent = true; roadPuddle.opacity = 0.42; roadPuddle.depthWrite = false;
  for (const [x, z, rx, rz] of [[-3.8, 9.4, 4.2, 1.9], [7.5, 12.6, 3.4, 1.6], [16.6, 2.0, 1.7, 3.0], [-12.5, 13.6, 3.0, 1.4]]) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(1, 26), roadPuddle);
    m.rotation.x = -Math.PI / 2; m.rotation.z = srand() * TAU;
    m.scale.set(rx, rz, 1);
    m.position.set(x, L.ROAD_Y + 0.02, z);
    m.renderOrder = 5;
    G.add(m);
  }

  /* ---------------- 湿地面魔法霓虹倒影 ---------------- */
  // 店招牌的紫金倒影
  for (let i = 0; i < 5; i++) {
    lightStreak(G, 2.6 + srand() * 1.4, 9 + srand() * 3, i % 2 ? 0xb08aff : 0xffd88a,
      -9.5 + i * 4.4, L.ROAD_Y + 0.03, 5.6 + srand() * 0.7, sr(-0.1, 0.1), 0.32);
  }
  // 煤气路灯暖光
  lightStreak(G, 2.2, 12, 0xffbb6e, 11.6, L.ROAD_Y + 0.03, 9.6, 0, 0.34);
  lightStreak(G, 2.0, 10, 0xffbb6e, -18.2, L.ROAD_Y + 0.03, 8.4, 0, 0.28);
  // 药剂贩卖机
  lightStreak(G, 2.0, 7, 0xc76bff, -9.9, L.ROAD_Y + 0.03, 6.2, 0, 0.32);
  lightStreak(G, 1.9, 6.4, 0x66d8ff, -6.4, L.ROAD_Y + 0.03, 6.1, 0, 0.26);
  // 人行道上
  lightStreak(G, 3.4, 5.4, 0xffdca8, 0, L.CURB_H + 0.02, 4.1, 0, 0.28);
  lightStreak(G, 2.2, 5.4, 0xb08aff, 11.0, L.CURB_H + 0.02, 0.4, 0, 0.26);
  lightStreak(G, 2.4, 5.0, 0x7fd8ff, -13.0, L.CURB_H + 0.02, -3.0, 0, 0.22);

  runtime.mirror = mirror;
  runtime.wetMask = wetMask;
  return G;
}
