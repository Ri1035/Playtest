/**
 * props.js — 魔法街角道具：药剂贩卖机、飞天扫帚、煤气路灯、魔法电线杆与导灵电线、
 *            复古路牌、石护栏、雕花垃圾桶、雨伞架、悬赏栏、凸面占卜镜、漂浮烛火、药草盆栽、散落卷轴
 */
import * as THREE from 'three';
import {
  PAL, TAU, srand, sr, sri, spick, box, cyl, decal, part, boxGeo, cylGeo, sphGeo,
  toon, glow, litMap, wetMat, canvasTex, halo, lightStreak, planeGeo, texVending,
  texVendingSide, texRoadSign, texParkSign, texBoard, texCaution, texGoods,
  texRuneCircle, texScrollPaper,
} from './lib/core.js';
import { L } from './layout.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

function link(parent, a, b, r, mat, ol = 0) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const g = part(cylGeo(r, r, len, 8), mat, { ol, shadow: true });
  g.position.copy(a).add(b).multiplyScalar(0.5);
  g.userData.mesh.quaternion.setFromUnitVectors(V3(0, 1, 0), dir.normalize());
  parent.add(g);
  return g;
}

export function buildProps(scene, runtime) {
  const G = new THREE.Group();
  scene.add(G);

  const matIron = toon(PAL.iron);
  const matMetal = toon(PAL.metal);
  const matBrass = toon(PAL.brass);
  const matBrassDark = toon(PAL.brassDark);
  const matStone = toon(PAL.stone, { map: texStoneWallSmall() });
  const matStoneDark = toon(PAL.stoneDark);
  const matWood = toon(PAL.wood);
  const matWoodDark = toon(PAL.woodDark);
  const matRubber = toon(0x201c28);
  const matAmber = toon(0x8a5a2c);

  function texStoneWallSmall() {
    const cnv = document.createElement('canvas');
    cnv.width = 256; cnv.height = 256;
    const ctx = cnv.getContext('2d');
    ctx.fillStyle = '#7d7982'; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const c = new THREE.Color('#9a969e').offsetHSL(0, sr(-0.03, 0.03), sr(-0.09, 0.09));
      ctx.fillStyle = '#' + c.getHexString();
      ctx.beginPath(); ctx.roundRect(i * 64 + 3, j * 64 + 3, 58, 58, sr(3, 8)); ctx.fill();
    }
    const t = new THREE.CanvasTexture(cnv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(2, 2);
    return t;
  }

  /* ================= 药剂自动贩卖机 ================= */
  function vending(x, z, ry) {
    const grp = new THREE.Group();
    const w = 1.14, h = 1.94, d = 0.8;
    grp.add(part(boxGeo(w, h, d), toon(0x2f2540), { ol: 0.05 }));
    const face = new THREE.Mesh(planeGeo(w - 0.06, h - 0.06), new THREE.MeshBasicMaterial({ map: texVending() }));
    face.position.set(0, 0.02, d / 2 + 0.012);
    grp.add(face);
    const sideMat = toon(0x322844, { map: texVendingSide() });
    for (const s of [1, -1]) {
      const sm = new THREE.Mesh(planeGeo(d - 0.04, h - 0.1), sideMat);
      sm.position.set(s * (w / 2 + 0.011), 0, 0);
      sm.rotation.y = s * Math.PI / 2;
      grp.add(sm);
    }
    const roof = part(boxGeo(w + 0.1, 0.12, d + 0.1), matBrassDark, { ol: 0.03, shadow: false });
    roof.position.set(0, h / 2 + 0.06, 0);
    grp.add(roof);
    const base = part(boxGeo(w + 0.04, 0.12, d + 0.04), matIron, { ol: 0.03, shadow: false });
    base.position.set(0, -h / 2 - 0.04, 0);
    grp.add(base);
    const slot = part(boxGeo(0.62, 0.24, 0.07), matIron, { ol: 0.02, shadow: false });
    slot.position.set(0, -0.62, d / 2 + 0.02);
    grp.add(slot);
    halo(grp, 1.0, 0xc07aff, 0, h / 2 - 0.02, d / 2 + 0.16, 0.2);
    grp.add(halo(grp, 0.9, 0x66d8ff, 0, -0.3, d / 2 + 0.14, 0.14));
    grp.position.set(x, 1.94 / 2 + 0.34, z);
    grp.rotation.y = ry || 0;
    G.add(grp);
    if (!runtime._vmLight) {
      const vl = new THREE.PointLight(0xc79aff, 13, 9, 2);
      vl.position.set(x - 0.65, 1.5, z + 1.0);
      G.add(vl);
      runtime._vmLight = vl;
    }
    lightStreak(G, 2.0, 7, 0xc76bff, x, L.ROAD_Y + 0.03, z + 1.2, 0, 0.3);
    return grp;
  }
  vending(-9.8, 4.9, 0);
  vending(-8.5, 4.9, 0);

  // 空瓶回收箱（铜制）
  const recBin = new THREE.Group();
  recBin.add(part(boxGeo(0.66, 0.86, 0.66), matBrassDark, { ol: 0.04 }));
  const rl = part(boxGeo(0.72, 0.1, 0.72), matBrass, { ol: 0.03, shadow: false });
  rl.position.y = 0.47; recBin.add(rl);
  const rHole = new THREE.Mesh(new THREE.CircleGeometry(0.13, 14), matIron);
  rHole.rotation.x = -Math.PI / 2; rHole.position.y = 0.52; recBin.add(rHole);
  recBin.position.set(-7.2, 0.34 + 0.43, 4.9);
  G.add(recBin);

  /* ================= 飞天扫帚（停靠在店前 + 停车位） ================= */
  function broom(x, z, ry, lean = 0.1, flying = false) {
    const grp = new THREE.Group();
    const shaft = part(cylGeo(0.035, 0.045, 1.9, 8), matWood, { ol: 0.03 });
    shaft.rotation.z = Math.PI / 2;
    grp.add(shaft);
    // 扫帚头（扎成束的树枝）
    const head = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU;
      const twig = part(cylGeo(0.018, 0.03, 0.62, 5), toon(spick([0x8a6a3a, 0x7a5a30, 0x9a7a44])), { ol: 0.02 });
      twig.position.set(-0.95, Math.cos(a) * 0.09, Math.sin(a) * 0.09);
      twig.rotation.set(Math.sin(a) * 0.22, 0, Math.PI / 2 + sr(-0.1, 0.1));
      head.add(twig);
    }
    head.add(part(cylGeo(0.11, 0.13, 0.16, 10), matBrass, { ol: 0.03 }));
    head.position.set(0, 0, 0);
    head.children[head.children.length - 1].position.set(-0.72, 0, 0);
    head.children[head.children.length - 1].rotation.z = Math.PI / 2;
    grp.add(head);
    // 把手装饰 + 魔法光
    const knob = new THREE.Mesh(sphGeo(0.07, 10, 8), matBrass);
    knob.position.set(0.96, 0, 0);
    grp.add(knob);
    const spark = new THREE.Mesh(sphGeo(0.055, 10, 8), glow(PAL.arcaneSoft, 1.2));
    spark.position.set(-0.5, 0.02, 0);
    grp.add(spark);
    halo(grp, 0.9, 0xb08aff, -0.5, 0, 0, 0.24);
    grp.position.set(x, flying ? 1.25 : 0.42, z);
    grp.rotation.set(0, ry, lean);
    G.add(grp);
    return grp;
  }
  // 靠在店门口的三把
  broom(-6.0, 4.3, Math.PI * 0.08, 0.24);
  broom(-5.1, 4.4, Math.PI * 0.03, 0.2);
  broom(-4.2, 4.3, -Math.PI * 0.05, 0.26);
  // 停车位里的两把（一把漂浮）
  broom(-8.6, -15.2, 0.1, 0.05, true);
  broom(-5.5, -13.6, Math.PI * 0.5, 0.06, true);
  broom(11.6, -6.4, Math.PI / 2, 0.08);
  broom(-9.9, -12.6, 0.3, 0.1);
  // 扫帚停车位标线
  const bikeLine = matStoneDark;
  for (let i = 0; i < 4; i++) {
    const g = part(boxGeo(1.6, 0.04, 0.08), bikeLine, { ol: 0 });
    g.position.set(-6.9 + i * 1.0, 0.36, 5.0);
    G.add(g);
  }

  /* ================= 煤气路灯（复古铸铁 + 暖光） ================= */
  function gasLamp(x, z, ry, h = 4.6, on = true) {
    const grp = new THREE.Group();
    cyl(grp, 0.24, 0.3, 0.42, matIron, 0, 0.21, 0, { seg: 12, ol: 0.04 });
    cyl(grp, 0.09, 0.13, h, matIron, 0, h / 2 + 0.36, 0, { seg: 12, ol: 0.03 });
    // 装饰环
    for (const y of [1.1, h * 0.62]) {
      cyl(grp, 0.13, 0.13, 0.1, matBrassDark, 0, y, 0, { seg: 12, ol: 0.02, shadow: false });
    }
    // 灯头（六角灯笼）
    const head = new THREE.Group();
    head.add(part(cylGeo(0.26, 0.34, 0.52, 6), matIron, { ol: 0.03 }));
    const glassL = new THREE.Mesh(cylGeo(0.24, 0.3, 0.46, 6), glow(0xffc27a, on ? 1.25 : 0.2));
    head.add(glassL);
    head.add(part(cylGeo(0.03, 0.36, 0.24, 6), matIron, { ol: 0.02, shadow: false }).translateY(0.34));
    head.add(part(cylGeo(0.08, 0.08, 0.1, 6), matBrass, { ol: 0.02, shadow: false }).translateY(-0.3));
    head.children[head.children.length - 1].position.y = -0.3;
    head.position.set(0, h + 0.85, 0);
    grp.add(head);
    if (on) {
      grp.add(halo(grp, 1.7, 0xffd9a0, 0, h + 0.85, 0, 0.3));
      grp.add(halo(grp, 4.2, 0xffab5a, 0, h + 0.85, 0, 0.16));
    }
    // 灯柱上的小符文牌
    const plate = new THREE.Mesh(planeGeo(0.22, 0.28), new THREE.MeshBasicMaterial({
      map: texRuneCircle(), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(PAL.goldBright),
    }));
    plate.position.set(0, 2.1, 0.1);
    grp.add(plate);
    grp.position.set(x, 0.34, z);
    grp.rotation.y = ry || 0;
    G.add(grp);
    if (on) {
      const pl = new THREE.PointLight(0xffc27a, 72, 15, 2);
      pl.position.set(x, 0.34 + h + 0.8, z);
      G.add(pl);
      runtime.streetLights = runtime.streetLights || [];
      runtime.streetLights.push(pl);
    }
    return grp;
  }
  gasLamp(11.9, 6.3, Math.PI * 0.92, 4.6, true);
  gasLamp(19.4, 6.3, Math.PI, 4.4, true);
  gasLamp(-18.6, 6.4, 0.1, 4.4, false);
  gasLamp(9.6, -10.4, -0.4, 4.2, true);

  /* ================= 魔法电线杆 + 导灵电线 ================= */
  const poles = [];
  function magicPole(x, z, h = 6.2, ry = 0) {
    const grp = new THREE.Group();
    // 螺旋石柱
    cyl(grp, 0.14, 0.22, h, matStone, 0, h / 2 + 0.24, 0, { seg: 10, ol: 0.04 });
    for (let i = 0; i < 7; i++) {
      const a = i * 1.1;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24 - i * 0.012, 0.028, 6, 16), matStoneDark);
      ring.rotation.x = Math.PI / 2 + Math.sin(a) * 0.3;
      ring.position.set(0, 1.0 + i * 0.7, 0);
      grp.add(ring);
    }
    // 顶端的水晶
    const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), glow(PAL.mana, 0.95));
    cristal.position.set(0, h + 0.62, 0);
    grp.add(cristal);
    halo(grp, 2.6, 0x6fd8ff, 0, h + 0.62, 0, 0.24);
    runtime.crystals = runtime.crystals || [];
    runtime.crystals.push(cristal);
    // 横向臂 + 挂灯
    const arm = part(boxGeo(1.9, 0.1, 0.1), matIron, { ol: 0.02, shadow: false });
    arm.position.set(0, h - 1.0, 0);
    grp.add(arm);
    for (const dx of [-0.7, 0.7]) {
      const lan = new THREE.Mesh(sphGeo(0.14, 10, 8), glow(PAL.candle, 0.95));
      lan.position.set(dx, h - 1.35, 0);
      grp.add(lan);
      halo(grp, 1.3, 0xffb45a, dx, h - 1.35, 0, 0.26);
    }
    // 告示牌
    const plate = part(boxGeo(0.34, 0.46, 0.05), matBrassDark, { ol: 0.02, shadow: false });
    plate.position.set(0, 2.2, 0.2);
    grp.add(plate);
    grp.position.set(x, 0.34, z);
    grp.rotation.y = ry;
    G.add(grp);
    poles.push({ x, z, h: h + 0.34, ry });
    return grp;
  }
  magicPole(12.15, 8.1, 6.2, 0);
  magicPole(-4.6, 17.2, 6.0, 0.15);
  magicPole(19.5, -6.6, 5.8, -0.1);
  magicPole(-13.4, -19.0, 5.6, 0);

  // 导灵电线（发光的能量线，沿线下垂）
  function leyWire(a, b, sag, r = 0.016, color = PAL.arcaneSoft) {
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    mid.y -= sag;
    const curve = new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, r, 4, false), glow(color, 0.18));
    m.castShadow = false;
    G.add(m);
    // 沿线少量小光珠
    for (const k of [0.34, 0.68]) {
      const p = curve.getPoint(k);
      const bead = new THREE.Mesh(sphGeo(0.038, 8, 6), glow(color, 0.7));
      bead.position.copy(p);
      G.add(bead);
    }
    return m;
  }
  const P1 = poles[0], P2 = poles[1], P3 = poles[2];
  const wireSet = (A, B, sag) => {
    for (let i = 0; i < 2; i++) {
      const dy = i * 0.36 - 0.2;
      const dx = (i % 2 ? 1 : -1) * 0.55;
      leyWire(V3(A.x + dx, A.h + dy, A.z), V3(B.x + dx, B.h + dy, B.z), sag + i * 0.07, 0.015,
        i % 2 ? PAL.arcaneSoft : PAL.mana);
    }
  };
  wireSet(P1, P2, 0.85);
  wireSet(P1, P3, 0.7);
  // 仅在后场拉一根引入线（避开店面）
  const P4 = poles[3];
  leyWire(V3(P4.x + 0.3, P4.h - 0.6, P4.z), V3(-16.4, 9.8, -17.4), 0.42, 0.016, PAL.mana);

  /* ================= 复古路牌 / 扫帚停车牌 ================= */
  function signPole(x, z, ry) {
    const grp = new THREE.Group();
    cyl(grp, 0.055, 0.06, 2.9, matIron, 0, 1.45, 0, { seg: 10, ol: 0.025 });
    cyl(grp, 0.12, 0.14, 0.16, matStoneDark, 0, 0.08, 0, { seg: 10, ol: 0.02, shadow: false });
    const s1 = part(boxGeo(0.64, 0.64, 0.03), toon(0xe8e2d2), { ol: 0.02, shadow: false });
    s1.position.set(0, 2.55, 0.02);
    grp.add(s1);
    const f1 = new THREE.Mesh(planeGeo(0.6, 0.6), new THREE.MeshBasicMaterial({ map: texRoadSign(0) }));
    f1.position.set(0, 2.55, 0.045); grp.add(f1);
    const f1b = f1.clone(); f1b.position.set(0, 2.55, -0.02); f1b.rotation.y = Math.PI; grp.add(f1b);
    const s2 = part(boxGeo(0.56, 0.56, 0.03), toon(0xe8e2d2), { ol: 0.02, shadow: false });
    s2.position.set(0, 1.78, 0.02);
    grp.add(s2);
    const f2 = new THREE.Mesh(planeGeo(0.54, 0.54), new THREE.MeshBasicMaterial({ map: texRoadSign(1) }));
    f2.position.set(0, 1.78, 0.045); grp.add(f2);
    grp.position.set(x, 0.34, z);
    grp.rotation.y = ry || 0;
    G.add(grp);
    return grp;
  }
  signPole(11.0, 5.3, Math.PI * 0.9);
  // 扫帚停车牌
  const pGrp = new THREE.Group();
  cyl(pGrp, 0.05, 0.055, 2.5, matIron, 0, 1.25, 0, { seg: 10, ol: 0.025 });
  const ps = part(boxGeo(0.6, 0.6, 0.03), matBrassDark, { ol: 0.02, shadow: false });
  ps.position.set(0, 2.3, 0); pGrp.add(ps);
  const pf = new THREE.Mesh(planeGeo(0.56, 0.56), new THREE.MeshBasicMaterial({ map: texParkSign() }));
  pf.position.set(0, 2.3, 0.03); pGrp.add(pf);
  pGrp.position.set(-11.6, 0.36, -17.6);
  G.add(pGrp);

  /* ================= 街角石护栏（石柱 + 锁链感横杆） ================= */
  function stoneGuard(x0, z0, x1, z1, n) {
    const grp = new THREE.Group();
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      cyl(grp, 0.07, 0.1, 0.82, matStone, x, 0.41, z, { seg: 8, ol: 0.03 });
      const cap = new THREE.Mesh(sphGeo(0.085, 10, 8), matStoneDark);
      cap.position.set(x, 0.86, z);
      grp.add(cap);
      if (i < n) {
        const t2 = (i + 1) / n;
        const x2 = x0 + (x1 - x0) * t2, z2 = z0 + (z1 - z0) * t2;
        link(grp, V3(x, 0.72, z), V3(x2, 0.72, z2), 0.032, matIron, 0.015);
        link(grp, V3(x, 0.5, z), V3(x2, 0.5, z2), 0.026, matIron, 0.015);
      }
    }
    G.add(grp);
    return grp;
  }
  stoneGuard(-20.4, 15.4, 20.4, 15.4, 12);
  stoneGuard(18.9, -20.2, 18.9, 6.4, 8);
  stoneGuard(8.4, 6.6, 12.2, 6.6, 3);
  stoneGuard(-21, -18.6, -15, -18.6, 3);

  // 车止め石柱
  for (const x of [-11.4, -3.2, 5.6]) {
    cyl(G, 0.09, 0.11, 0.78, matStone, x, 0.34 + 0.39, 5.4, { seg: 10, ol: 0.03 });
    const cap = new THREE.Mesh(sphGeo(0.1, 10, 8), glow(PAL.arcaneSoft, 0.55));
    cap.position.set(x, 0.34 + 0.81, 5.4);
    G.add(cap);
  }

  /* ================= 悬赏 / 海报栏 ================= */
  const board = new THREE.Group();
  board.add(part(boxGeo(2.0, 1.32, 0.12), matWoodDark, { ol: 0.04 }));
  const bFace = new THREE.Mesh(planeGeo(1.86, 1.18), new THREE.MeshBasicMaterial({ map: texBoard() }));
  bFace.position.set(0, 0, 0.065);
  board.add(bFace);
  const bRoof = part(boxGeo(2.16, 0.08, 0.36), matWoodDark, { ol: 0.03, shadow: false });
  bRoof.position.set(0, 0.74, 0.1);
  board.add(bRoof);
  board.position.set(9.6, 0.34 + 0.98, 4.9);
  board.rotation.y = Math.PI;
  G.add(board);
  for (const dx of [-0.9, 0.9]) {
    cyl(G, 0.055, 0.055, 1.1, matWoodDark, 9.6 + dx, 0.34 + 0.52, 4.95, { seg: 8, ol: 0.02 });
  }

  /* ================= 转角凸面占卜镜 ================= */
  const mirrorGrp = new THREE.Group();
  cyl(mirrorGrp, 0.05, 0.055, 2.9, matBrassDark, 0, 1.45, 0, { seg: 10, ol: 0.025 });
  const mGeo = new THREE.SphereGeometry(0.42, 20, 14, 0, TAU, 0, Math.PI * 0.42);
  const mM = new THREE.MeshStandardMaterial({ color: 0xe0d8f0, metalness: 1.0, roughness: 0.06, envMapIntensity: 1.5, side: THREE.DoubleSide });
  const mm = new THREE.Mesh(mGeo, mM);
  mm.rotation.x = Math.PI; mm.position.set(0, 2.8, 0.06); mm.rotation.z = -0.12;
  mirrorGrp.add(mm);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.035, 8, 24), matBrass);
  rim.position.set(0, 2.8, 0.0); rim.rotation.z = -0.12;
  mirrorGrp.add(rim);
  halo(mirrorGrp, 1.6, 0x9ad8ff, 0, 2.8, 0.2, 0.18);
  mirrorGrp.position.set(10.4, 0.34, 6.0);
  mirrorGrp.rotation.y = -2.3;
  G.add(mirrorGrp);

  /* ================= 悬幡（のぼり → 竖幅旗） ================= */
  const noboriTex = canvasTex(128, 512, (ctx, w, h) => {
    ctx.fillStyle = '#241834'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e8c46a'; ctx.lineWidth = 5; ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.fillStyle = '#c4a8ff';
    ctx.font = 'bold 40px Georgia'; ctx.textAlign = 'center';
    ctx.fillText('ARCANA', w / 2, 70);
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = i % 2 ? '#8b5cf6' : '#38d8ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const y = 150 + i * 96;
      ctx.moveTo(w / 2, y - 34); ctx.lineTo(w / 2 + 34, y); ctx.lineTo(w / 2, y + 34); ctx.lineTo(w / 2 - 34, y);
      ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(w / 2, y, 12, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 28px Georgia';
    ctx.fillText('POTION', w / 2, 452);
    ctx.font = 'bold 24px Georgia';
    ctx.fillText('¥320', w / 2, 490);
  });
  function nobori(x, z, ry) {
    const grp = new THREE.Group();
    cyl(grp, 0.03, 0.03, 2.5, matWoodDark, 0, 1.25, 0, { seg: 8, ol: 0.02 });
    cyl(grp, 0.12, 0.14, 0.12, matStoneDark, 0, 0.06, 0, { seg: 10, ol: 0.02, shadow: false });
    const cloth = new THREE.Mesh(planeGeo(0.46, 1.8), new THREE.MeshBasicMaterial({ map: noboriTex, side: THREE.DoubleSide }));
    cloth.position.set(-0.25, 1.5, 0);
    grp.add(cloth);
    grp.position.set(x, 0.34, z);
    grp.rotation.y = ry || 0;
    G.add(grp);
    return grp;
  }
  nobori(-4.2, 3.6, 0.1);
  nobori(4.9, 3.6, -0.1);

  /* ================= 漂浮烛火小灯（店前悬浮，缓慢起伏） ================= */
  runtime.floatCandles = [];
  function floatCandle(x, y, z, color, size = 0.09) {
    const grp = new THREE.Group();
    const flame = new THREE.Mesh(sphGeo(size, 10, 8), glow(color, 1.25, true));
    flame.scale.y = 1.5;
    grp.add(flame);
    halo(grp, size * 16, color, 0, 0, 0, 0.3);
    grp.position.set(x, y, z);
    G.add(grp);
    runtime.floatCandles.push({ g: grp, y0: y, ph: srand() * TAU, amp: sr(0.08, 0.2), spd: sr(0.5, 1.0) });
    return grp;
  }
  for (let i = 0; i < 9; i++) {
    floatCandle(-8.5 + i * 2.0, 3.4 + Math.sin(i) * 0.5, 5.6 + sr(-0.6, 0.6), i % 3 === 0 ? PAL.mana : PAL.candle, sr(0.07, 0.11));
  }
  for (let i = 0; i < 5; i++) {
    floatCandle(9.0 + sr(-1.5, 1.5), 2.6 + sr(0, 1.2), -2.0 + sr(-2, 2), PAL.arcaneSoft, sr(0.06, 0.1));
  }

  /* ================= 沿街药草盆栽 ================= */
  function herbPot(x, z, s = 1) {
    const grp = new THREE.Group();
    const barrel = part(cylGeo(0.26 * s, 0.22 * s, 0.42 * s, 12), matWood, { ol: 0.035 });
    grp.add(barrel);
    cyl(grp, 0.28 * s, 0.28 * s, 0.06 * s, matBrassDark, 0, 0.22 * s, 0, { seg: 12, ol: 0.02, shadow: false });
    // 药草叶（发光小叶簇）
    for (let i = 0; i < 9; i++) {
      const a = srand() * TAU, r = srand() * 0.18 * s;
      const leaf = new THREE.Mesh(sphGeo(sr(0.06, 0.11) * s, 8, 6), toon(spick([0x3f7a4a, 0x4ade80, 0x2f6a3a])));
      leaf.position.set(Math.cos(a) * r, sr(0.3, 0.62) * s, Math.sin(a) * r);
      leaf.scale.y = sr(1.2, 2.0);
      grp.add(leaf);
    }
    const glowDot = new THREE.Mesh(sphGeo(0.05 * s, 8, 6), glow(PAL.emerald, 0.9));
    glowDot.position.set(0, 0.5 * s, 0);
    grp.add(glowDot);
    grp.position.set(x, 0.34, z);
    G.add(grp);
    return grp;
  }
  herbPot(-11.2, 5.1, 1.05);
  herbPot(-10.2, 5.2, 0.9);
  herbPot(6.6, 5.0, 1.0);
  herbPot(7.5, 5.15, 0.85);
  herbPot(11.9, -3.4, 0.95);
  herbPot(-14.2, 2.4, 1.0);

  /* ================= 散落的卷轴边角 ================= */
  const scrollMat = toon(0xd8c9a4, { map: texScrollPaper() });
  for (const [x, z, ry, len] of [[-7.4, 4.6, 0.4, 0.5], [-2.2, 5.6, -0.7, 0.42], [3.4, 4.4, 1.2, 0.46], [10.2, 2.0, 0.2, 0.38]]) {
    const s = part(cylGeo(0.055, 0.055, len, 8), scrollMat, { ol: 0.025 });
    s.position.set(x, 0.38, z);
    s.rotation.set(Math.PI / 2, 0, ry);
    G.add(s);
  }

  /* ================= 雕花垃圾桶 ================= */
  function trashCan(x, z, color, lidColor, carved = true) {
    const grp = new THREE.Group();
    cyl(grp, 0.33, 0.29, 0.92, toon(color), 0, 0, 0, { seg: 16, ol: 0.04 });
    cyl(grp, 0.35, 0.35, 0.1, toon(lidColor), 0, 0.5, 0, { seg: 16, ol: 0.03, shadow: false });
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.15, 14), matIron);
    hole.rotation.x = -Math.PI / 2; hole.position.y = 0.552; grp.add(hole);
    if (carved) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.335, 0.02, 6, 20), matBrass);
      band.rotation.x = Math.PI / 2; band.position.y = -0.2; grp.add(band);
      const rn = new THREE.Mesh(planeGeo(0.34, 0.34), new THREE.MeshBasicMaterial({
        map: texRuneCircle(), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(PAL.goldBright),
      }));
      rn.position.set(0, 0.06, 0.336); grp.add(rn);
    }
    grp.position.set(x, 0.34 + 0.47, z);
    G.add(grp);
    return grp;
  }
  trashCan(2.9, 4.7, 0x4a4256, PAL.arcane);
  trashCan(3.7, 4.7, 0x4a4256, PAL.mana);
  trashCan(4.5, 4.7, 0x4a4256, PAL.emerald);

  /* ================= 雨伞架（含湿伞） ================= */
  function umbrellaStand(x, z) {
    const grp = new THREE.Group();
    cyl(grp, 0.24, 0.26, 0.54, matBrassDark, 0, 0.27, 0, { seg: 18, ol: 0.035 });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 6, 20), matBrass);
    rim.rotation.x = Math.PI / 2; rim.position.y = 0.54; grp.add(rim);
    const umbMat = [toon(0x3a2c52), toon(0x2a4a6a), toon(0x3a5a3a), toon(0x5a3a3a)];
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6 + srand();
      const u = part(cylGeo(0.035, 0.06, 1.02, 6), umbMat[i % 4], { ol: 0.02 });
      u.position.set(Math.cos(a) * 0.1, 0.62, Math.sin(a) * 0.1);
      u.rotation.set(sr(-0.13, 0.13), 0, sr(-0.13, 0.13));
      grp.add(u);
      const tip = part(cylGeo(0.012, 0.012, 0.22, 5), matIron, { ol: 0 });
      tip.position.set(Math.cos(a) * 0.1 + 0.02, 1.22, Math.sin(a) * 0.1);
      grp.add(tip);
    }
    grp.position.set(x, 0.34, z);
    G.add(grp);
    return grp;
  }
  umbrellaStand(2.2, 3.9);
  umbrellaStand(-2.8, 3.9);

  /* ================= 后场杂物 ================= */
  const cart = new THREE.Group();
  box(cart, 0.72, 0.08, 0.5, matBrassDark, 0, 0.72, 0, { ol: 0.03, shadow: false });
  box(cart, 0.72, 0.3, 0.5, matIron, 0, 0.52, 0, { ol: 0.03, shadow: false });
  for (const [dx, dz] of [[0.28, 0.2], [-0.28, 0.2]]) {
    cyl(cart, 0.06, 0.06, 0.04, matRubber, dx, 0.06, dz, { seg: 8, ol: 0, rz: Math.PI / 2 });
  }
  cart.position.set(6.6, 0.34, -9.6);
  cart.rotation.y = 0.4;
  G.add(cart);

  const bagMat = toon(0x262232);
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(sphGeo(sr(0.24, 0.32), 10, 8), bagMat);
    b.position.set(5.8 + srand() * 1.2, 0.36 + sr(0.2, 0.3), -11.8 - srand() * 0.6);
    b.scale.y = 0.85;
    b.castShadow = true;
    G.add(b);
  }

  /* ================= 店外立式小广告牌 ================= */
  const aBoard = new THREE.Group();
  const aTex = canvasTex(256, 384, (ctx, w, h) => {
    ctx.fillStyle = '#241834'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e8c46a'; ctx.lineWidth = 5; ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = '#c4a8ff';
    ctx.font = 'bold 30px Georgia'; ctx.textAlign = 'center';
    ctx.fillText('HOT BREW', w / 2, 52);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 64px Georgia'; ctx.fillText('¥120', w / 2, 150);
    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(w / 2, 232, 46, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const a = -Math.PI / 2 + (i * 4 / 5) * Math.PI * 2;
      const x = w / 2 + Math.cos(a) * 40, y = 232 + Math.sin(a) * 40;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle = '#38d8ff'; ctx.font = 'bold 26px Georgia';
    ctx.fillText('POTION ¥320', w / 2, 320);
    ctx.fillStyle = '#e8c46a'; ctx.font = '20px Georgia';
    ctx.fillText('ARCANA', w / 2, 360);
  });
  const aMat = new THREE.MeshBasicMaterial({ map: aTex, side: THREE.DoubleSide });
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(planeGeo(0.7, 1.05), aMat);
    p.position.set(0, 0.74, s * 0.06);
    p.rotation.x = -0.1 * s;
    aBoard.add(p);
  }
  aBoard.position.set(8.4, 0.34, 4.2);
  aBoard.rotation.y = -0.5;
  G.add(aBoard);

  runtime.props = G;
  return G;
}
