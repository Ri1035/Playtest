/**
 * neighbors.js — 西侧炼金师宅邸与法师塔、后巷符文、北侧石墙、街对面旧书店与民居、药草绿篱
 */
import * as THREE from 'three';
import {
  PAL, TAU, srand, sr, sri, spick, box, cyl, decal, part, boxGeo, cylGeo, sphGeo,
  toon, glow, litMap, wetMat, canvasTex, halo, lightStreak, planeGeo, texStoneWall,
  texTimber, texGoods, texPoster, texAsphalt, texRuneCircle, texBoard,
} from './lib/core.js';
import { L } from './layout.js';

function link(parent, a, b, r, mat, ol = 0) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const g = part(cylGeo(r, r, len, 8), mat, { ol, shadow: true });
  g.position.copy(a).add(b).multiplyScalar(0.5);
  g.userData.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  parent.add(g);
  return g;
}
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

/** 带光的窗（可选烛光、窗帘、彩色玻璃） */
function window_(parent, x, y, z, w, h, ry, opt = {}) {
  const frameMat = toon(opt.frameColor ?? 0x3a3550);
  const fr = part(boxGeo(w + 0.14, h + 0.14, 0.1), frameMat, { ol: 0.025, shadow: false });
  fr.position.set(x, y, z);
  fr.rotation.y = ry;
  parent.add(fr);
  const lit = opt.lit !== false;
  const g = new THREE.Mesh(planeGeo(w, h), lit ? glow(opt.color ?? 0xffc27a, opt.intensity ?? 0.85) : toon(0x1b1a26));
  g.position.set(x, y, z);
  g.rotation.y = ry;
  g.translateZ(0.06);
  parent.add(g);
  // 窗格
  const barMat = toon(opt.frameColor ?? 0x3a3550);
  for (const dx of [-w / 4, w / 4]) {
    const b = part(boxGeo(0.05, h, 0.09), barMat, { ol: 0, shadow: false });
    b.position.set(x, y, z);
    b.rotation.y = ry;
    b.translateZ(0.09);
    b.translateX(dx);
    parent.add(b);
  }
  if (lit && opt.curtain !== false) {
    const c = new THREE.Mesh(planeGeo(w * sr(0.35, 0.6), h), toon(0x8a7a9a));
    c.position.set(x, y, z);
    c.rotation.y = ry;
    c.translateZ(0.12);
    c.translateX(sr(-0.2, 0.2) * w);
    parent.add(c);
  }
  if (lit && opt.candle) {
    halo(parent, Math.max(w, h) * 2.2, opt.color ?? 0xffb45a, x, y, z + (ry ? 0 : 0.4), 0.16);
  }
  return fr;
}

export function buildNeighbors(scene, runtime) {
  const G = new THREE.Group();
  scene.add(G);

  const N = L.NEIGH_W;
  const matStone = toon(0x9a929e, { map: texStoneWall(0x9a929e, 7) });
  const matStoneDark = toon(0x6f6772, { map: texStoneWall(0x6f6772, 5) });
  const matTimber = toon(PAL.timber, { map: texTimber(PAL.timber) });
  const matTimberDark = toon(PAL.timberDark, { map: texTimber(PAL.timberDark) });
  const matIron = toon(PAL.iron);
  const matBrass = toon(PAL.brass);
  const matBrassDark = toon(PAL.brassDark);
  const matRoof = toon(0x3f3949);

  /* ================= 西侧邻栋：炼金师宅邸（两层石木） ================= */
  const nb = new THREE.Group();
  const w = N.x1 - N.x0, d = N.z1 - N.z0;
  const body = part(boxGeo(w, N.h, d), matStone, { ol: 0.07 });
  body.position.set((N.x0 + N.x1) / 2, N.h / 2, (N.z0 + N.z1) / 2);
  nb.add(body);
  // 一层深色木框（店面感）
  const base = part(boxGeo(w + 0.06, 2.8, d + 0.06), matTimberDark, { ol: 0.05 });
  base.position.set((N.x0 + N.x1) / 2, 1.4, (N.z0 + N.z1) / 2);
  nb.add(base);
  // 腰线
  const band = part(boxGeo(w + 0.14, 0.24, d + 0.14), matStoneDark, { ol: 0.03, shadow: false });
  band.position.set((N.x0 + N.x1) / 2, 4.6, (N.z0 + N.z1) / 2);
  nb.add(band);
  // 屋顶 + 女儿墙
  const par = part(boxGeo(w + 0.2, 0.55, d + 0.2), matRoof, { ol: 0.05 });
  par.position.set((N.x0 + N.x1) / 2, N.h + 0.27, (N.z0 + N.z1) / 2);
  nb.add(par);

  // 南立面：烛光窗 + 店门 + 挂灯
  for (let i = 0; i < 3; i++) {
    window_(nb, N.x0 + 1.7 + i * 1.85, 6.2, N.z1 + 0.02, 1.15, 1.4, 0, { lit: i !== 1, intensity: 0.62, candle: true });
    window_(nb, N.x0 + 1.7 + i * 1.85, 3.2, N.z1 + 0.02, 1.25, 1.5, 0, { lit: false });
  }
  // 拱形木门 + 门楣
  const door = part(boxGeo(1.5, 2.4, 0.14), matTimberDark, { ol: 0.04 });
  door.position.set(N.x1 - 1.7, 1.55, N.z1 + 0.04);
  nb.add(door);
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.15 + i / 4 * 0.7);
    box(nb, 0.4, 0.26, 0.16, matStoneDark, N.x1 - 1.7 + Math.cos(a) * 0.95, 2.85 + Math.sin(a) * 0.34, N.z1 + 0.06, { ol: 0.02, shadow: false, rz: -a + Math.PI / 2 });
  }
  const doorGlass = new THREE.Mesh(planeGeo(1.0, 1.4), glow(0xffb45a, 0.55));
  doorGlass.position.set(N.x1 - 1.7, 1.75, N.z1 + 0.12);
  nb.add(doorGlass);
  const dv = part(boxGeo(2.5, 0.14, 0.95), matRoof, { ol: 0.03, shadow: false });
  dv.position.set(N.x1 - 1.7, 3.0, N.z1 + 0.5);
  nb.add(dv);
  // 悬挂铁艺招牌（炼金符号 + 紫色霓虹）
  const gp = new THREE.Group();
  gp.add(part(boxGeo(0.14, 0.14, 0.14), matIron, { ol: 0.02, shadow: false }));
  link(gp, V3(0, -0.05, 0), V3(0, -0.45, 0), 0.02, matIron, 0.01);
  link(gp, V3(0, -0.45, 0), V3(0.55, -0.6, 0), 0.02, matIron, 0.01);
  const board = part(boxGeo(0.95, 0.95, 0.06), matBrassDark, { ol: 0.03 });
  board.position.set(0.95, -0.62, 0);
  gp.add(board);
  const brd = new THREE.Mesh(planeGeo(0.86, 0.86), new THREE.MeshBasicMaterial({
    map: texRuneCircle(), transparent: true, opacity: 0.85, color: new THREE.Color(PAL.witch),
  }));
  brd.position.set(0.95, -0.62, 0.045);
  gp.add(brd);
  const brd2 = brd.clone(); brd2.position.set(0.95, -0.62, -0.045); brd2.rotation.y = Math.PI; gp.add(brd2);
  gp.position.set(N.x1 - 0.4, 4.6, N.z1 + 0.1);
  nb.add(gp);
  const pl = new THREE.PointLight(0xff5fa2, 16, 10, 2);
  pl.position.set(N.x1 - 1.2, 3.9, N.z1 + 1.4);
  nb.add(pl);
  halo(nb, 2.6, 0xff5fa2, N.x1 - 0.6, 3.98, N.z1 + 0.7, 0.24);

  // 东立面（朝小巷）：符文刻痕 + 空调外机 + 管道 + 木构外梯
  for (let i = 0; i < 5; i++) {
    const z = N.z0 + 1.9 + i * 3.0;
    window_(nb, N.x1 + 0.02, 6.3, z, 1.1, 1.3, Math.PI / 2, { lit: i % 2 === 0, intensity: 0.55, candle: true });
    window_(nb, N.x1 + 0.02, 3.3, z, 1.0, 1.2, Math.PI / 2, { lit: false });
  }
  for (let i = 0; i < 4; i++) {
    const ac = part(boxGeo(0.74, 0.58, 0.38), toon(0x6e6878), { ol: 0.035 });
    ac.position.set(N.x1 + 0.23, 7.4, N.z0 + 3.0 + i * 3.4);
    nb.add(ac);
    const fan = new THREE.Mesh(new THREE.CircleGeometry(0.2, 14), toon(0x3d3550));
    fan.rotation.y = Math.PI / 2;
    fan.position.set(N.x1 + 0.43, 7.4, N.z0 + 3.0 + i * 3.4);
    nb.add(fan);
    const br = part(boxGeo(0.82, 0.06, 0.52), matIron, { ol: 0.02, shadow: false });
    br.position.set(N.x1 + 0.25, 7.07, N.z0 + 3.0 + i * 3.4);
    nb.add(br);
  }
  for (const [y, z] of [[1.7, -6.0], [1.7, -9.5], [3.5, -12.0]]) {
    const mb = part(boxGeo(0.24, 0.44, 0.34), matBrassDark, { ol: 0.02, shadow: false });
    mb.position.set(N.x1 + 0.12, y, z);
    nb.add(mb);
  }
  for (const z of [N.z0 + 0.8, -8.0, -14.0]) {
    cyl(nb, 0.075, 0.075, N.h, matIron, N.x1 + 0.14, N.h / 2, z, { seg: 8, ol: 0.02 });
  }
  // 室外木梯
  const st = new THREE.Group();
  const stepMat = matTimber;
  for (let i = 0; i < 11; i++) {
    const sp = part(boxGeo(0.9, 0.06, 0.26), stepMat, { ol: 0.02, shadow: false });
    sp.position.set(0, 0.2 + i * 0.24, -i * 0.26);
    st.add(sp);
  }
  link(st, V3(-0.45, 0.2, 0.1), V3(-0.45, 2.9, -2.7), 0.05, matIron, 0.02);
  link(st, V3(0.45, 0.2, 0.1), V3(0.45, 2.9, -2.7), 0.05, matIron, 0.02);
  link(st, V3(0.44, 1.05, 0.1), V3(0.44, 3.75, -2.7), 0.035, matIron, 0.02);
  st.position.set(N.x1 + 0.7, 0.34, N.z0 + 9.0);
  nb.add(st);
  const plat = part(boxGeo(1.2, 0.09, 3.0), stepMat, { ol: 0.03, shadow: false });
  plat.position.set(N.x1 + 0.7, 3.24, N.z0 + 7.0);
  nb.add(plat);
  const platDoor = new THREE.Mesh(planeGeo(0.85, 1.9), glow(0xffc27a, 0.4));
  platDoor.rotation.y = Math.PI / 2;
  platDoor.position.set(N.x1 + 0.05, 4.3, N.z0 + 7.0);
  nb.add(platDoor);

  // 屋顶：烟囱 + 风信标
  const chim = part(boxGeo(0.9, 1.6, 0.9), matStoneDark, { ol: 0.04 });
  chim.position.set(N.x0 + 3.0, N.h + 1.0, (N.z0 + N.z1) / 2 + 1.0);
  nb.add(chim);
  cyl(nb, 0.88, 0.92, 0.16, matIron, N.x0 + 3.0, N.h + 1.86, (N.z0 + N.z1) / 2 + 1.0, { seg: 12, ol: 0.03, shadow: false });
  cyl(nb, 0.035, 0.035, 2.0, matIron, N.x0 + 1.4, N.h + 1.6, N.z1 - 1.4, { seg: 6, ol: 0.015 });
  for (const dx of [-0.5, 0, 0.5]) {
    link(nb, V3(N.x0 + 1.4, N.h + 2.4, N.z1 - 1.4), V3(N.x0 + 1.4 + dx, N.h + 3.2, N.z1 - 1.4 + (dx ? 0 : 0.5)), 0.02, matIron, 0.01);
  }
  G.add(nb);

  /* ================= 法师塔（邻栋后方，细高打破天际线） ================= */
  const T = L.TOWER;
  const tower = new THREE.Group();
  const seg = 16;
  const th = T.h;
  const tb = new THREE.Mesh(new THREE.CylinderGeometry(T.r * 0.82, T.r, th, seg), matStone);
  tb.position.set(0, th / 2, 0);
  tb.castShadow = true;
  tower.add(tb);
  const tbOutline = new THREE.Mesh(new THREE.CylinderGeometry(T.r * 0.82, T.r, th, seg), matStone);
  // 层间石环 + 符文圈
  for (let i = 0; i < 5; i++) {
    const y = 2.6 + i * 3.0;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(T.r * (0.98 - i * 0.03), 0.09, 6, 20), matStoneDark);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, y, 0);
    tower.add(ring);
  }
  // 塔窗（烛光）
  for (let i = 0; i < 4; i++) {
    const y = 3.6 + i * 3.0;
    const a = i * 1.6;
    const wx = Math.cos(a) * T.r * 0.92, wz = Math.sin(a) * T.r * 0.92;
    const wg = new THREE.Mesh(planeGeo(0.62, 1.05), glow(i % 2 ? 0x9a7aff : 0xffc27a, 0.72));
    wg.position.set(wx, y, wz);
    wg.lookAt(0, y, 0);
    wg.rotateY(Math.PI);
    tower.add(wg);
    halo(tower, 1.9, i % 2 ? 0x9a7aff : 0xffb45a, wx * 1.05, y, wz * 1.05, 0.18);
    // 小阳台
    if (i % 2 === 0) {
      const bal = new THREE.Mesh(new THREE.TorusGeometry(T.r * 0.95, 0.05, 6, 16, Math.PI * 0.6), matIron);
      bal.rotation.x = Math.PI / 2;
      bal.position.set(0, y - 0.62, 0);
      tower.add(bal);
    }
  }
  // 塔顶锥形尖顶 + 发光水晶
  const roof = new THREE.Mesh(new THREE.ConeGeometry(T.r * 1.25, 3.4, seg), matRoof);
  roof.position.set(0, th + 1.7, 0);
  roof.castShadow = true;
  tower.add(roof);
  const spire = cyl(tower, 0.03, 0.03, 1.5, matIron, 0, th + 4.1, 0, { seg: 6, ol: 0.015, shadow: false });
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), glow(PAL.arcaneSoft, 1.05));
  crystal.position.set(0, th + 3.5, 0);
  tower.add(crystal);
  halo(tower, 6.0, 0xb08aff, 0, th + 3.5, 0, 0.26);
  runtime.crystals = runtime.crystals || [];
  runtime.crystals.push(crystal);
  // 塔基入口
  const tDoor = new THREE.Mesh(planeGeo(0.9, 1.7), glow(0xffb45a, 0.5));
  tDoor.position.set(0, 1.2, T.r * 0.86);
  tower.add(tDoor);
  tower.position.set(T.x, 0.2, T.z);
  G.add(tower);

  /* ================= 小巷符文细节 ================= */
  const al = L.ALLEY;
  const alleyGrp = new THREE.Group();
  const aMat = wetMat(0x302c3c, { map: texAsphalt().clone(), roughness: 0.2, metalness: 0.5 });
  aMat.map.repeat.set(2, 6); aMat.map.needsUpdate = true;
  const alleyFloor = new THREE.Mesh(planeGeo(al.x1 - al.x0, al.z1 - al.z0), aMat);
  alleyFloor.rotation.x = -Math.PI / 2;
  alleyFloor.position.set((al.x0 + al.x1) / 2, 0.05, (al.z0 + al.z1) / 2);
  alleyFloor.receiveShadow = true;
  alleyGrp.add(alleyFloor);
  const gutter = wetMat(0x1e1c26, { roughness: 0.06, metalness: 0.8 });
  const gg = new THREE.Mesh(planeGeo(0.36, al.z1 - al.z0), gutter);
  gg.rotation.x = -Math.PI / 2;
  gg.position.set((al.x0 + al.x1) / 2 - 0.3, 0.056, (al.z0 + al.z1) / 2);
  gg.renderOrder = 3;
  alleyGrp.add(gg);
  const sideWall = part(boxGeo(0.16, 3.0, al.z1 - al.z0), matStoneDark, { ol: 0.04 });
  sideWall.position.set(al.x1 + 0.08, 1.5, (al.z0 + al.z1) / 2);
  alleyGrp.add(sideWall);
  for (const z of [-3.0, -6.4, -10.0, -14.0]) {
    cyl(alleyGrp, 0.06, 0.06, 2.6, matIron, al.x1 - 0.06, 1.7, z, { seg: 8, ol: 0.02 });
  }
  const meter = part(boxGeo(0.3, 0.46, 0.24), matBrassDark, { ol: 0.025, shadow: false });
  meter.position.set(al.x1 - 0.14, 1.8, -8.5);
  alleyGrp.add(meter);
  // 巷内空调外机
  for (const [z, y] of [[-4.6, 0.9], [-11.8, 0.9]]) {
    const ac = part(boxGeo(0.44, 0.6, 0.86), toon(0x6e6878), { ol: 0.04 });
    ac.position.set(al.x0 + 0.4, y, z);
    alleyGrp.add(ac);
    const fan = new THREE.Mesh(new THREE.CircleGeometry(0.2, 14), toon(0x3d3550));
    fan.rotation.y = -Math.PI / 2;
    fan.position.set(al.x0 + 0.18, y, z);
    alleyGrp.add(fan);
  }
  // 巷内壁灯（昏暗闪烁）
  const alLampBody = part(boxGeo(0.22, 0.16, 0.3), matIron, { ol: 0.02, shadow: false });
  alLampBody.position.set(al.x1 - 0.2, 2.6, -7.0);
  alleyGrp.add(alLampBody);
  const alLamp = new THREE.Mesh(planeGeo(0.16, 0.1), glow(0x9ad8ff, 1.2, true));
  alLamp.userData.noMerge = true;
  alLamp.rotation.x = Math.PI / 2;
  alLamp.position.set(al.x1 - 0.2, 2.52, -7.0);
  alleyGrp.add(alLamp);
  const alLight = new THREE.PointLight(0x8fd0ff, 14, 8, 2);
  alLight.position.set(al.x1 - 0.5, 2.4, -7.0);
  alleyGrp.add(alLight);
  runtime.flickerLights = runtime.flickerLights || [];
  runtime.flickerLights.push({ light: alLight, mesh: alLamp });
  // 巷内墙面的发光符文（幽深感）
  for (let i = 0; i < 7; i++) {
    const rn = new THREE.Mesh(planeGeo(sr(0.5, 0.95), sr(0.5, 0.95)), new THREE.MeshBasicMaterial({
      map: texRuneCircle(), transparent: true, opacity: sr(0.25, 0.5), blending: THREE.AdditiveBlending, depthWrite: false,
      color: new THREE.Color(spick([PAL.mana, PAL.arcaneSoft, PAL.witch])),
    }));
    rn.rotation.y = Math.PI / 2;
    rn.position.set(al.x1 - 0.02, sr(0.5, 2.4), sr(-16, -1));
    rn.renderOrder = 6;
    alleyGrp.add(rn);
    runtime.runeCircles.push({ m: rn, seed: srand() * 6 });
  }
  // 巷内杂物
  for (const [z, s, ry] of [[-13.2, 1.0, 0.3], [-13.8, 0.8, -0.4]]) {
    box(alleyGrp, 0.6 * s, 0.46 * s, 0.5 * s, matTimber, al.x0 + 0.55, 0.29 * s, z, { ol: 0.03, ry });
  }
  cyl(alleyGrp, 0.19, 0.16, 0.44, matBrassDark, al.x0 + 0.5, 0.28, -15.6, { seg: 12, ol: 0.03 });
  // 尽头铁栅门
  for (let i = 0; i < 14; i++) {
    const b = part(boxGeo(0.05, 2.2, 0.05), matIron, { ol: 0.01, shadow: false });
    b.position.set(al.x0 + 0.2 + i * 0.2, 1.24, al.z0 + 0.1);
    alleyGrp.add(b);
  }
  for (const y of [0.5, 1.4, 2.3]) {
    const h = part(boxGeo(al.x1 - al.x0, 0.06, 0.06), matIron, { ol: 0.01, shadow: false });
    h.position.set((al.x0 + al.x1) / 2, y, al.z0 + 0.1);
    alleyGrp.add(h);
  }
  // 杂草
  for (let i = 0; i < 14; i++) {
    const w2 = new THREE.Mesh(new THREE.ConeGeometry(sr(0.05, 0.1), sr(0.16, 0.34), 5), toon(0x46603a));
    w2.position.set(al.x0 + srand() * (al.x1 - al.x0), 0.1, al.z0 + srand() * (al.z1 - al.z0));
    w2.rotation.z = sr(-0.2, 0.2);
    alleyGrp.add(w2);
  }
  // 积水
  const pMat = wetMat(0x16141d, { roughness: 0.04, metalness: 0.9, envMapIntensity: 1.5 });
  pMat.transparent = true; pMat.opacity = 0.6; pMat.depthWrite = false;
  for (const [x, z, rx, rz] of [[al.x0 + 1.0, -5.0, 0.9, 1.8], [al.x1 - 0.9, -12.0, 1.1, 2.2]]) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(1, 20), pMat);
    m.rotation.x = -Math.PI / 2;
    m.scale.set(rx, rz, 1);
    m.position.set(x, 0.062, z);
    m.renderOrder = 4;
    alleyGrp.add(m);
  }
  G.add(alleyGrp);

  /* ================= 北侧石墙 + 铁门 + 灯笼 ================= */
  const wallZ = L.WALL_N.z;
  const matWallC = toon(0x8a828e, { map: texStoneWall(0x8a828e, 5) });
  box(G, 14.0, L.WALL_N.h, 0.4, matWallC, -14.0, L.WALL_N.h / 2, wallZ, { ol: 0.05 });
  box(G, 8.0, L.WALL_N.h, 0.4, matWallC, 17.0, L.WALL_N.h / 2, wallZ, { ol: 0.05 });
  box(G, 0.3, 2.8, 0.5, matStoneDark, -6.6, 1.4, wallZ, { ol: 0.04 });
  box(G, 0.3, 2.8, 0.5, matStoneDark, -3.4, 1.4, wallZ, { ol: 0.04 });
  for (let i = 0; i < 5; i++) {
    const p = part(boxGeo(0.55, 2.5, 0.1), matIron, { ol: 0.03, shadow: false });
    p.position.set(-6.35 + i * 0.62, 1.26, wallZ);
    G.add(p);
  }
  box(G, 14.2, 0.16, 0.56, matStoneDark, -14.0, L.WALL_N.h + 0.08, wallZ, { ol: 0.02, shadow: false });
  box(G, 8.2, 0.16, 0.56, matStoneDark, 17.0, L.WALL_N.h + 0.08, wallZ, { ol: 0.02, shadow: false });
  // 墙上的石灯笼
  for (const [x, y] of [[-17.5, L.WALL_N.h + 0.6], [-9.5, L.WALL_N.h + 0.6], [13.0, L.WALL_N.h + 0.6]]) {
    const lant = new THREE.Group();
    lant.add(part(cylGeo(0.2, 0.26, 0.5, 6), matStoneDark, { ol: 0.03, shadow: false }));
    const g2 = new THREE.Mesh(cylGeo(0.18, 0.22, 0.44, 6), glow(0xffb45a, 0.9));
    lant.add(g2);
    lant.add(part(cylGeo(0.04, 0.3, 0.2, 6), matStoneDark, { ol: 0.02, shadow: false }).translateY(0.3));
    lant.position.set(x, y, wallZ + 0.34);
    G.add(lant);
    halo(G, 2.2, 0xffb45a, x, y, wallZ + 0.5, 0.22);
  }
  // 苔痕
  const mossMat = new THREE.MeshBasicMaterial({ color: 0x35502f, transparent: true, opacity: 0.5, depthWrite: false });
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(planeGeo(sr(1.0, 2.4), sr(0.5, 1.6)), mossMat);
    m.position.set(-19 + srand() * 12, sr(0.3, 1.6), wallZ + 0.21);
    G.add(m);
  }

  /* ================= 街对面：旧书店 + 民居（南侧） ================= */
  const farStone = toon(0x857e8c, { map: texStoneWall(0x857e8c, 6) });
  const A = { x0: -21, x1: -12.2, z0: 17.2, z1: 21, h: 6.4 };
  const Aw = A.x1 - A.x0, Ad = A.z1 - A.z0;
  const farB = part(boxGeo(Aw, A.h, Ad), farStone, { ol: 0.07 });
  farB.position.set((A.x0 + A.x1) / 2, A.h / 2, (A.z0 + A.z1) / 2);
  G.add(farB);
  // 一层店面（暖光 + 书架感）
  const shopGlow = new THREE.Mesh(planeGeo(Aw - 1.2, 1.9), litMap(texGoods('tome', 8, 1, 2), 0.5));
  shopGlow.position.set((A.x0 + A.x1) / 2, 1.5, A.z0 - 0.03);
  shopGlow.rotation.y = Math.PI;
  G.add(shopGlow);
  const shopFrame = part(boxGeo(Aw - 0.8, 0.5, 0.25), matTimberDark, { ol: 0.03, shadow: false });
  shopFrame.position.set((A.x0 + A.x1) / 2, 2.7, A.z0 - 0.12);
  G.add(shopFrame);
  const shopSign = new THREE.Mesh(planeGeo(3.8, 0.48), new THREE.MeshBasicMaterial({ map: texPoster(1), color: new THREE.Color(0xcfc6b4) }));
  shopSign.position.set((A.x0 + A.x1) / 2, 2.7, A.z0 - 0.26);
  shopSign.rotation.y = Math.PI;
  G.add(shopSign);
  const aLight = new THREE.PointLight(0xffc27a, 20, 13, 2);
  aLight.position.set((A.x0 + A.x1) / 2, 2.0, A.z0 - 1.6);
  G.add(aLight);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      window_(G, A.x0 + 1.8 + i * 3.2, 5.4 - j * 2.6, A.z0 - 0.02, 1.25, 1.4, Math.PI, { lit: (i + j) % 2 === 0, intensity: 0.48, candle: true });
    }
  }
  const parA = part(boxGeo(Aw + 0.2, 0.5, Ad + 0.2), matRoof, { ol: 0.05 });
  parA.position.set((A.x0 + A.x1) / 2, A.h + 0.25, (A.z0 + A.z1) / 2);
  G.add(parA);
  cyl(G, 0.5, 0.5, 0.9, matStoneDark, A.x0 + 2.2, A.h + 1.0, 19.6, { seg: 14, ol: 0.04 });
  cyl(G, 0.54, 0.54, 0.1, matIron, A.x0 + 2.2, A.h + 1.5, 19.6, { seg: 14, ol: 0.03, shadow: false });
  cyl(G, 0.03, 0.03, 2.0, matIron, A.x1 - 2.0, A.h + 1.5, 18.6, { seg: 6, ol: 0.015 });

  // B 栋：坡顶民居
  const B = { x0: -10.6, x1: -2.2, z0: 18.6, z1: 21, h: 4.4 };
  const Bw = B.x1 - B.x0, Bd = B.z1 - B.z0;
  const hb = part(boxGeo(Bw, B.h, Bd), matTimber, { ol: 0.06 });
  hb.position.set((B.x0 + B.x1) / 2, B.h / 2, (B.z0 + B.z1) / 2);
  G.add(hb);
  const roofMat2 = toon(0x453d4e);
  for (const s of [-1, 1]) {
    const rp = part(boxGeo(Bw + 0.7, 0.2, Bd * 0.62), roofMat2, { ol: 0.05, shadow: true });
    rp.position.set((B.x0 + B.x1) / 2, B.h + 0.55, (B.z0 + B.z1) / 2 + s * Bd * 0.24);
    rp.rotation.x = s * 0.42;
    G.add(rp);
  }
  window_(G, B.x0 + 3.0, 3.2, B.z0 - 0.02, 1.2, 1.2, Math.PI, { lit: true, intensity: 0.5, candle: true });
  window_(G, B.x0 + 6.4, 3.2, B.z0 - 0.02, 1.2, 1.2, Math.PI, { lit: false });
  const bDoor = part(boxGeo(0.95, 2.05, 0.16), matTimberDark, { ol: 0.03 });
  bDoor.position.set(B.x0 + 1.2, 1.05, B.z0 - 0.04);
  G.add(bDoor);
  const bLamp = new THREE.Mesh(planeGeo(0.3, 0.16), glow(0xffc27a, 0.9));
  bLamp.position.set(B.x0 + 1.2, 2.35, B.z0 - 0.12);
  bLamp.rotation.x = Math.PI / 2;
  G.add(bLamp);
  // 剖切面侧的窗
  for (let i = 0; i < 3; i++) {
    window_(G, A.x0 + 2.2 + i * 3.2, 5.4, A.z1 + 0.02, 1.15, 1.3, 0, { lit: i !== 1, intensity: 0.4 });
    window_(G, A.x0 + 2.2 + i * 3.2, 2.9, A.z1 + 0.02, 1.15, 1.3, 0, { lit: i === 0, intensity: 0.34 });
  }
  window_(G, B.x0 + 2.4, 3.0, B.z1 + 0.02, 1.1, 1.1, 0, { lit: true, intensity: 0.38 });
  window_(G, B.x0 + 6.0, 3.0, B.z1 + 0.02, 1.1, 1.1, 0, { lit: false });

  /* ================= 药草绿篱围合 ================= */
  const hedgeMat = toon(0x35503a);
  const hedgeDark = toon(0x28402c);
  const herbGlow = glow(PAL.emerald, 0.55);
  function hedge(x0, z0, x1, z1, h, n) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const ang = Math.atan2(x1 - x0, z1 - z0);
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const body = part(boxGeo(0.92, h, len), hedgeMat, { ol: 0.05 });
    body.position.set(cx, 0.34 + h / 2, cz);
    body.rotation.y = ang;
    G.add(body);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      const m = new THREE.Mesh(sphGeo(sr(0.3, 0.46), 10, 8), srand() > 0.5 ? hedgeMat : hedgeDark);
      m.position.set(x, 0.34 + h + 0.06, z);
      m.scale.set(1, 0.62, 1);
      m.castShadow = true;
      G.add(m);
    }
  }
  hedge(-1.2, 20.0, 20.4, 20.0, 0.9, 12);
  hedge(20.1, -20.2, 20.1, 5.6, 0.85, 14);
  // 石板花坛 + 发光药草
  const planterMat = toon(0x7d7982, { map: texStoneWall(0x7d7982, 3) });
  for (const [x, z] of [[-19.0, 16.6], [-16.0, 16.6], [15.5, 18.4]]) {
    const pl2 = part(boxGeo(2.4, 0.5, 1.1), planterMat, { ol: 0.04 });
    pl2.position.set(x, 0.34 + 0.25, z);
    G.add(pl2);
    const soil = new THREE.Mesh(planeGeo(2.2, 0.9), toon(0x3a2f28));
    soil.rotation.x = -Math.PI / 2;
    soil.position.set(x, 0.6, z);
    G.add(soil);
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(sphGeo(sr(0.16, 0.3), 8, 6), srand() > 0.5 ? hedgeMat : toon(0x3a5a38));
      b.position.set(x + sr(-1.0, 1.0), 0.72, z + sr(-0.35, 0.35));
      b.castShadow = true;
      G.add(b);
    }
    const gd = new THREE.Mesh(sphGeo(0.08, 8, 6), herbGlow);
    gd.position.set(x + sr(-0.8, 0.8), 0.9, z);
    G.add(gd);
  }

  runtime.neighbors = G;
  return G;
}
