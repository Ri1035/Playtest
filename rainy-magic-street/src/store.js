/**
 * store.js — 魔法杂货铺：石木外墙 / 彩色玻璃橱窗 / 符文招牌 / 完整店内陈设
 */
import * as THREE from 'three';
import {
  PAL, TAU, srand, sr, sri, spick, box, cyl, decal, part, boxGeo, cylGeo,
  toon, glow, litMap, glassMat, texShopSign, texVertSign, texDoorSign,
  texStoneWall, texTimber, texGoods, texPoster, texAlchemyCabinet, texBackDoor,
  texPriceStrip, texStainedGlass, texGlassStreak, texFloorArrow, texCaution,
  texScrollPaper, texRuneCircle, halo, sphGeo, planeGeo,
} from './lib/core.js';
import { L } from './layout.js';
import { wetMat } from './lib/core.js';

const S = L.STORE;
const W = 0.26;
const IX0 = S.x0 + W, IX1 = S.x1 - W;
const IZ0 = S.z0 + W, IZ1 = S.z1 - W;
const FY = S.floorY;
const CY = S.ceilY;

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
function linkRoof(parent, a, b, mat, r = 0.028) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const grp = part(new THREE.CylinderGeometry(r, r, len, 6), mat, { ol: 0, shadow: false });
  grp.position.copy(a).add(b).multiplyScalar(0.5);
  grp.userData.mesh.quaternion.setFromUnitVectors(V3(0, 1, 0), dir.normalize());
  parent.add(grp);
  return grp;
}

export function buildStore(scene, runtime) {
  const g = new THREE.Group();
  scene.add(g);

  /* ================= 材质 ================= */
  const matStone = toon(PAL.wallStone, { map: texStoneWall(PAL.wallStone, 6) });
  const matStoneCool = toon(PAL.wallStoneCool, { map: texStoneWall(PAL.wallStoneCool, 5) });
  const matTimber = toon(PAL.timber, { map: texTimber(PAL.timber) });
  const matTimberDark = toon(PAL.timberDark, { map: texTimber(PAL.timberDark) });
  const matMetal = toon(PAL.metal);
  const matBrass = toon(PAL.brass);
  const matIron = toon(PAL.iron);
  const matSteel = toon(0xb9c0c7);
  const matFrame = toon(0x4a3f52);
  const matWood = toon(PAL.wood);
  const matWoodDark = toon(PAL.woodDark);
  const matWhite = toon(0xe8e2d2);
  const matDark = toon(0x2f2a3a);
  const glassPanel = glassMat(0xd8ccff, 0.1);
  const matFloor = toon(0xd8c9a8, { map: texStoneSlabFloor() });

  function texStoneSlabFloor() {
    // 店内暖色石板（局部，避免污染公共调色板）
    return texFloorIndoor();
  }
  function texFloorIndoor() {
    const cnv = document.createElement('canvas');
    cnv.width = 512; cnv.height = 512;
    const ctx = cnv.getContext('2d');
    ctx.fillStyle = '#cdbb99'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      const c = new THREE.Color('#cdbb99').offsetHSL(sr(-0.02, 0.02), sr(-0.04, 0.04), sr(-0.07, 0.07));
      ctx.fillStyle = '#' + c.getHexString();
      ctx.beginPath(); ctx.roundRect(i * 85 + 3, j * 85 + 3, 79, 79, sr(3, 10)); ctx.fill();
      for (let k = 0; k < 40; k++) {
        ctx.fillStyle = `rgba(120,100,70,${sr(0.02, 0.08)})`;
        ctx.fillRect(i * 85 + srand() * 80, j * 85 + srand() * 80, sr(2, 7), 2);
      }
    }
    const t = new THREE.CanvasTexture(cnv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(4, 4);
    return t;
  }

  /* ================= 结构 ================= */
  // 地面
  const floor = new THREE.Mesh(planeGeo(IX1 - IX0 + 0.6, IZ1 - IZ0 + 0.6), matFloor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set((IX0 + IX1) / 2, FY + 0.002, (IZ0 + IZ1) / 2);
  floor.receiveShadow = true;
  g.add(floor);
  const floorWet = new THREE.Mesh(planeGeo(IX1 - IX0 + 0.6, IZ1 - IZ0 + 0.6), wetMat(0xd6c9ab, {
    roughness: 0.3, metalness: 0.3, envMapIntensity: 0.45,
  }));
  floorWet.rotation.x = -Math.PI / 2;
  floorWet.position.copy(floor.position).setY(FY + 0.006);
  g.add(floorWet);
  box(g, S.x1 - S.x0, 0.36, S.z1 - S.z0, toon(0x8a8272), (S.x0 + S.x1) / 2, 0.18, (S.z0 + S.z1) / 2, { ol: 0.05, shadow: false });

  // 天花（深色木梁）
  box(g, IX1 - IX0 + 0.6, 0.22, IZ1 - IZ0 + 0.6, matDark, (IX0 + IX1) / 2, CY + 0.11, (IZ0 + IZ1) / 2, { ol: 0.03, shadow: false });
  for (let i = 0; i < 5; i++) {
    box(g, 0.26, 0.22, IZ1 - IZ0, matWoodDark, IX0 + 1.6 + i * 3.3, CY - 0.08, (IZ0 + IZ1) / 2, { ol: 0.03, shadow: false });
  }
  box(g, IX1 - IX0, 0.22, 0.26, matWoodDark, (IX0 + IX1) / 2, CY - 0.08, IZ0 + 3.2, { ol: 0.03, shadow: false });
  box(g, IX1 - IX0, 0.22, 0.26, matWoodDark, (IX0 + IX1) / 2, CY - 0.08, IZ1 - 3.4, { ol: 0.03, shadow: false });

  // 屋面
  box(g, S.x1 - S.x0 + 0.5, 0.3, S.z1 - S.z0 + 0.5, toon(0x5d5566), (S.x0 + S.x1) / 2, S.wall + 0.15, (S.z0 + S.z1) / 2, { ol: 0.06 });
  const roofMat = toon(0x3f3949);
  const roofPlane = new THREE.Mesh(planeGeo(S.x1 - S.x0 - 0.1, S.z1 - S.z0 - 0.1), roofMat);
  roofPlane.rotation.x = -Math.PI / 2;
  roofPlane.position.set((S.x0 + S.x1) / 2, S.wall + 0.37, (S.z0 + S.z1) / 2);
  roofPlane.receiveShadow = true;
  g.add(roofPlane);
  // 女儿墙（石造 + 齿状压顶）
  const paraH = S.para - S.wall;
  const paraMat = toon(0xb8b0a4, { map: texStoneWall(0xb8b0a4, 4) });
  box(g, S.x1 - S.x0 + 0.5, paraH, 0.3, paraMat, (S.x0 + S.x1) / 2, S.wall + 0.15 + paraH / 2, S.z1 + 0.1, { ol: 0.05 });
  box(g, S.x1 - S.x0 + 0.5, paraH, 0.3, paraMat, (S.x0 + S.x1) / 2, S.wall + 0.15 + paraH / 2, S.z0 - 0.1, { ol: 0.05 });
  box(g, 0.3, paraH, S.z1 - S.z0 + 0.5, paraMat, S.x0 - 0.1, S.wall + 0.15 + paraH / 2, (S.z0 + S.z1) / 2, { ol: 0.05 });
  box(g, 0.3, paraH, S.z1 - S.z0 + 0.5, paraMat, S.x1 + 0.1, S.wall + 0.15 + paraH / 2, (S.z0 + S.z1) / 2, { ol: 0.05 });
  for (let i = 0; i < 16; i++) {
    box(g, 0.42, 0.22, 0.42, paraMat, S.x0 + 0.6 + i * 1.28, S.para + 0.11, S.z1 + 0.1, { ol: 0.04, shadow: false });
  }

  /* ================= 墙体 ================= */
  // 西墙（石）
  box(g, W, S.wall - 0.36, S.z1 - S.z0, toon(PAL.wallStoneCool, { map: texStoneWall(PAL.wallStoneCool, 5) }), S.x0 + W / 2, 0.36 + (S.wall - 0.36) / 2, (S.z0 + S.z1) / 2, { ol: 0.05 });
  // 北墙 + 后门洞
  const backDoor = { x0: 3.2, x1: 4.5 };
  box(g, (backDoor.x0 - S.x0), S.wall - 0.36, W, matStone, (S.x0 + backDoor.x0) / 2, 0.36 + (S.wall - 0.36) / 2, S.z0 + W / 2, { ol: 0.05 });
  box(g, (S.x1 - backDoor.x1), S.wall - 0.36, W, matStone, (backDoor.x1 + S.x1) / 2, 0.36 + (S.wall - 0.36) / 2, S.z0 + W / 2, { ol: 0.05 });
  box(g, backDoor.x1 - backDoor.x0, S.wall - 2.6, W, matStone, (backDoor.x0 + backDoor.x1) / 2, 2.6 + (S.wall - 2.6) / 2, S.z0 + W / 2, { ol: 0.05 });
  const bd = part(boxGeo(backDoor.x1 - backDoor.x0 - 0.06, 2.2, 0.12), toon(PAL.timberDark, { map: texBackDoor() }), { ol: 0.035 });
  bd.position.set((backDoor.x0 + backDoor.x1) / 2, FY + 1.1, S.z0 + 0.16);
  g.add(bd);
  // 前墙：石裙 + 木构上层
  const skirtH = 1.15;
  box(g, S.x1 - S.x0, skirtH - 0.3, W, matStone, (S.x0 + S.x1) / 2, 0.3 + (skirtH - 0.3) / 2, S.z1 - W / 2, { ol: 0.05 });
  box(g, S.x1 - S.x0, S.wall - 4.3, W, matTimber, (S.x0 + S.x1) / 2, 4.3 + (S.wall - 4.3) / 2, S.z1 - W / 2, { ol: 0.05 });
  // 东墙
  box(g, W, skirtH - 0.3, S.z1 - S.z0, toon(PAL.wallStoneCool, { map: texStoneWall(PAL.wallStoneCool, 5) }), S.x1 - W / 2, 0.3 + (skirtH - 0.3) / 2, (S.z0 + S.z1) / 2, { ol: 0.05 });
  box(g, W, S.wall - 4.3, S.z1 - S.z0, matStone, S.x1 - W / 2, 4.3 + (S.wall - 4.3) / 2, (S.z0 + S.z1) / 2, { ol: 0.05 });
  // 转角石柱 + 木构交叉梁
  box(g, 0.56, S.wall - 0.36, 0.56, matStone, S.x1 - 0.28, 0.36 + (S.wall - 0.36) / 2, S.z1 - 0.28, { ol: 0.05 });
  for (const [x0, x1, y0, y1] of [
    [S.x0 + 0.4, S.x0 + 3.4, 1.15, 4.3], [S.x0 + 6.4, S.x0 + 9.4, 1.15, 4.3],
    [S.x1 - 4.6, S.x1 - 1.6, 1.15, 4.3], [S.x1 - 1.6, S.x1 - 0.4, 3.0, 4.3],
  ]) {
    linkRoof(g, V3(x0, y0, S.z1), V3(x1, y1, S.z1), matWoodDark, 0.09);
    linkRoof(g, V3(x0, y1, S.z1), V3(x1, y0, S.z1), matWoodDark, 0.09);
  }

  /* ================= 彩色玻璃橱窗 ================= */
  const glassTop = 4.3, glassBot = skirtH;
  const glassY = (glassTop + glassBot) / 2, glassH = glassTop - glassBot;
  const stainedTex = texStainedGlass();
  const stainedMat = new THREE.MeshBasicMaterial({ map: stainedTex, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });

  function stainedWindow(axis, fixed, a0, a1) {
    const len = a1 - a0, n = Math.max(1, Math.round(len / 2.3)), pw = len / n;
    for (let i = 0; i < n; i++) {
      const c = a0 + pw * (i + 0.5);
      const wPlane = pw - 0.1;
      if (axis === 'z') {
        const panes = new THREE.Mesh(planeGeo(wPlane, glassH), stainedMat);
        panes.position.set(c, glassY, fixed + 0.02);
        g.add(panes);
        const m = new THREE.Mesh(planeGeo(wPlane, glassH), glassPanel);
        m.position.set(c, glassY, fixed);
        m.renderOrder = 8;
        g.add(m);
        if (i % 2 === 0) {
          const st = new THREE.Mesh(planeGeo(wPlane * 0.9, glassH * 0.9), new THREE.MeshBasicMaterial({
            map: texGlassStreak(), transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
          }));
          st.position.set(c, glassY, fixed + 0.05);
          st.renderOrder = 9;
          g.add(st);
        }
        const mu = part(boxGeo(0.1, glassH, 0.18), matFrame, { ol: 0.02, shadow: false });
        mu.position.set(a0 + pw * i, glassY, fixed); g.add(mu);
      } else {
        const panes = new THREE.Mesh(planeGeo(wPlane, glassH), stainedMat);
        panes.rotation.y = Math.PI / 2;
        panes.position.set(fixed + 0.02, glassY, c);
        g.add(panes);
        const m = new THREE.Mesh(planeGeo(wPlane, glassH), glassPanel);
        m.rotation.y = Math.PI / 2;
        m.position.set(fixed, glassY, c);
        m.renderOrder = 8;
        g.add(m);
        const mu = part(boxGeo(0.18, glassH, 0.1), matFrame, { ol: 0.02, shadow: false });
        mu.position.set(fixed, glassY, a0 + pw * i); g.add(mu);
      }
    }
    if (axis === 'z') {
      box(g, len, 0.14, 0.22, matFrame, (a0 + a1) / 2, glassTop, fixed, { ol: 0.02, shadow: false });
      box(g, len, 0.14, 0.22, matFrame, (a0 + a1) / 2, glassBot, fixed, { ol: 0.02, shadow: false });
    } else {
      const mu = part(boxGeo(0.18, glassH, 0.1), matFrame, { ol: 0.02, shadow: false });
      mu.position.set(fixed, glassY, a1); g.add(mu);
      box(g, 0.22, 0.14, len, matFrame, fixed, glassTop, (a0 + a1) / 2, { ol: 0.02, shadow: false });
      box(g, 0.22, 0.14, len, matFrame, fixed, glassBot, (a0 + a1) / 2, { ol: 0.02, shadow: false });
    }
  }
  // 正面：门两侧各一大扇彩窗
  stainedWindow('z', S.z1 - W / 2 - 0.02, S.x0 + 0.7, S.x1 - 0.9);
  // 东侧
  stainedWindow('x', S.x1 - W / 2 - 0.02, S.z0 + 0.7, S.z1 - 0.9);

  /* ============ 复古实木门（拱形门头） ============ */
  const doorY0 = skirtH, doorH = 2.45;
  const doorW = L.DOOR.x1 - L.DOOR.x0;
  // 门洞（在彩窗中间挖出）：用石框把它标出来
  box(g, 0.22, doorH + 0.5, 0.3, matStone, L.DOOR.x0 - 0.05, doorY0 + (doorH + 0.5) / 2, S.z1 - 0.02, { ol: 0.03, shadow: false });
  box(g, 0.22, doorH + 0.5, 0.3, matStone, L.DOOR.x1 + 0.05, doorY0 + (doorH + 0.5) / 2, S.z1 - 0.02, { ol: 0.03, shadow: false });
  box(g, doorW + 0.7, 0.3, 0.34, matStone, (L.DOOR.x0 + L.DOOR.x1) / 2, doorY0 + doorH + 0.3, S.z1 - 0.02, { ol: 0.03, shadow: false });
  // 拱形上楣
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.1 + i / 6 * 0.8);
    box(g, 0.34, 0.24, 0.3, matStone,
      (L.DOOR.x0 + L.DOOR.x1) / 2 + Math.cos(a) * 1.15, doorY0 + doorH + 0.36 + Math.sin(a) * 0.42, S.z1 - 0.02,
      { ol: 0.03, shadow: false, rz: -a + Math.PI / 2 });
  }
  // 门扇（一扇半开）
  const doorLeaf = part(boxGeo(doorW - 0.06, doorH, 0.12), toon(PAL.woodDark, { map: texTimber(PAL.woodDark) }), { ol: 0.04 });
  doorLeaf.position.set(L.DOOR.x0 + doorW / 2 + 0.03, doorY0 + doorH / 2, S.z1 - 0.1);
  doorLeaf.rotation.y = -0.62;
  g.add(doorLeaf);
  // 门框金属包边 + 门环
  box(g, doorW - 0.02, 0.12, 0.16, matIron, L.DOOR.x0 + doorW / 2 + 0.03, doorY0 + doorH - 0.08, S.z1 - 0.09, { ol: 0.02, shadow: false });
  cyl(g, 0.09, 0.09, 0.05, matBrass, L.DOOR.x0 + doorW * 0.72, doorY0 + 1.2, S.z1 + 0.02, { seg: 12, ol: 0.02, shadow: false, rz: Math.PI / 2 });
  // 门上小玻璃（发光）
  const doorGlass = new THREE.Mesh(planeGeo(0.5, 0.7), glow(0xffd9a0, 0.75));
  doorGlass.position.set(L.DOOR.x0 + doorW / 2 + 0.03, doorY0 + 1.85, S.z1 - 0.16);
  g.add(doorGlass);
  // 门头灯箱
  const dl = part(boxGeo(doorW + 0.9, 0.5, 0.18), toon(0xf2e8d0), { ol: 0.03, shadow: false });
  dl.position.set((L.DOOR.x0 + L.DOOR.x1) / 2, doorY0 + doorH + 0.95, S.z1 + 0.1); g.add(dl);
  decal(g, doorW + 0.7, 0.42, new THREE.MeshBasicMaterial({ map: texDoorSign() }), (L.DOOR.x0 + L.DOOR.x1) / 2, doorY0 + doorH + 0.95, S.z1 + 0.2);
  // 门口星纹地垫
  const matMat = toon(0x4a3a6a);
  const matMesh = new THREE.Mesh(planeGeo(3.4, 1.4), matMat);
  matMesh.rotation.x = -Math.PI / 2;
  matMesh.position.set((L.DOOR.x0 + L.DOOR.x1) / 2 + 0.1, 0.355, S.z1 + 1.05);
  matMesh.receiveShadow = true;
  g.add(matMesh);
  const star = new THREE.Mesh(planeGeo(1.1, 1.1), new THREE.MeshBasicMaterial({
    map: texRuneCircle(), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(PAL.goldBright),
  }));
  star.rotation.x = -Math.PI / 2;
  star.position.set((L.DOOR.x0 + L.DOOR.x1) / 2 + 0.1, 0.357, S.z1 + 1.05);
  star.renderOrder = 5;
  g.add(star);
  runtime.runeCircles.push({ m: star, seed: 3.1 });

  /* ============ 招牌 ============ */
  const signY = 4.86, signH = 1.0;
  box(g, S.x1 - S.x0 + 0.2, signH + 0.12, 0.32, toon(0x2a1c3c), (S.x0 + S.x1) / 2, signY, S.z1 + 0.17, { ol: 0.05 });
  const signFace = new THREE.Mesh(planeGeo(S.x1 - S.x0 - 0.1, signH - 0.1), new THREE.MeshBasicMaterial({ map: texShopSign() }));
  signFace.position.set((S.x0 + S.x1) / 2, signY, S.z1 + 0.335);
  g.add(signFace);
  const signE = new THREE.Mesh(planeGeo(S.z1 - S.z0 - 0.2, signH - 0.1), new THREE.MeshBasicMaterial({ map: texShopSign() }));
  signE.rotation.y = Math.PI / 2;
  signE.position.set(S.x1 + 0.335, signY, (S.z0 + S.z1) / 2);
  g.add(signE);
  box(g, 0.32, signH + 0.12, S.z1 - S.z0 + 0.2, toon(0x2a1c3c), S.x1 + 0.17, signY, (S.z0 + S.z1) / 2, { ol: 0.05 });
  // 招牌光晕（招牌在雨幕里发光的层次）
  halo(g, 9.0, 0xb08aff, (S.x0 + S.x1) / 2, signY, S.z1 + 0.9, 0.14);
  halo(g, 6.0, 0xffd88a, (S.x0 + S.x1) / 2, signY - 0.4, S.z1 + 0.7, 0.12);

  // 转角竖向符文灯箱
  const vs = new THREE.Group();
  vs.add(part(boxGeo(0.36, 3.5, 1.15), toon(0x2a1c3c), { ol: 0.05, shadow: false }));
  const vsTex = texVertSign();
  for (const [ry, z] of [[0, 0.58], [Math.PI, -0.58]]) {
    const f = new THREE.Mesh(planeGeo(1.05, 3.4), new THREE.MeshBasicMaterial({ map: vsTex }));
    f.position.set(0, 0, z); f.rotation.y = ry; vs.add(f);
  }
  const fE = new THREE.Mesh(planeGeo(0.34, 3.4), new THREE.MeshBasicMaterial({ map: vsTex }));
  fE.position.set(0.19, 0, 0); fE.rotation.y = Math.PI / 2; vs.add(fE);
  const fW = new THREE.Mesh(planeGeo(0.34, 3.4), new THREE.MeshBasicMaterial({ map: vsTex }));
  fW.position.set(-0.19, 0, 0); fW.rotation.y = -Math.PI / 2; vs.add(fW);
  vs.position.set(S.x1 + 0.6, 3.6, S.z1 + 0.35);
  g.add(vs);
  box(g, 1.05, 0.13, 0.13, matIron, S.x1 + 0.12, 5.3, S.z1 + 0.35, { ol: 0.02, shadow: false });
  box(g, 0.13, 0.13, 0.18, matIron, S.x1 + 0.6, 5.3, S.z1 + 0.05, { ol: 0.02, shadow: false });
  halo(g, 3.4, 0xc4a8ff, S.x1 + 0.9, 3.6, S.z1 + 0.6, 0.2);

  /* ============ 屋檐雨棚（深紫木构 + 暖光檐口） ============ */
  const awMat = toon(0x3a2c52);
  const awD = 1.85;
  const aw = new THREE.Group();
  aw.add(part(boxGeo(S.x1 - S.x0 + 0.5, 0.2, awD), awMat, { ol: 0.06 }));
  const awEdge = part(boxGeo(S.x1 - S.x0 + 0.5, 0.12, 0.12), toon(PAL.brass), { ol: 0.03, shadow: false });
  awEdge.position.set(0, -0.02, awD / 2);
  aw.add(awEdge);
  const awLight = new THREE.Mesh(planeGeo(S.x1 - S.x0 - 0.6, awD - 0.4), new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffcf8a).multiplyScalar(0.4), transparent: true, opacity: 0.6,
  }));
  awLight.rotation.x = Math.PI / 2;
  awLight.position.set(0, -0.11, 0);
  aw.add(awLight);
  aw.position.set((S.x0 + S.x1) / 2, 3.8, S.z1 + awD / 2 - 0.2);
  aw.rotation.x = -0.055;
  g.add(aw);
  for (const x of [S.x0 + 1.6, S.x0 + 7.4, 4.4, S.x1 - 1.6]) {
    cyl(g, 0.07, 0.07, 3.7, matIron, x, 1.85, S.z1 + 1.6, { ol: 0.02, seg: 8 });
  }
  // 东侧小雨棚
  const awE = part(boxGeo(1.6, 0.18, S.z1 - S.z0 - 0.6), awMat, { ol: 0.05 });
  awE.position.set(S.x1 + 0.8, 3.8, (S.z0 + S.z1) / 2);
  awE.rotation.z = 0.055;
  g.add(awE);

  // 檐下悬挂的小灯笼（暖光 + 光晕）
  for (let i = 0; i < 5; i++) {
    const x = S.x0 + 2.2 + i * 4.0;
    cyl(g, 0.02, 0.02, 0.5, matIron, x, 3.42, S.z1 + 0.6, { seg: 5, ol: 0, shadow: false, unique: true });
    const lan = new THREE.Mesh(sphGeo(0.19, 12, 10), glow(PAL.candle, 0.95));
    lan.scale.y = 1.3;
    lan.position.set(x, 3.05, S.z1 + 0.6);
    g.add(lan);
    halo(g, 1.5, 0xffb45a, x, 3.05, S.z1 + 0.6, 0.3);
  }

  /* ================= 店内陈设 ================= */
  const I = new THREE.Group();
  g.add(I);

  const mShelf = toon(0x6b4f36, { map: texTimber(PAL.wood) });
  const mShelfDark = toon(0x4a3626);
  const mMetalShelf = toon(0x8a8290);

  // --- 中央：药剂货架（双面，3 座） ---
  const potionRack = (x0, x1, z, kind, rows = 3) => {
    const w = x1 - x0, h = 1.95;
    const body = part(boxGeo(w, h, 0.9), mShelf, { ol: 0.035 });
    body.position.set((x0 + x1) / 2, FY + h / 2, z);
    I.add(body);
    for (let r = 0; r < rows; r++) {
      const y = FY + 0.44 + r * 0.5;
      const bd = part(boxGeo(w + 0.08, 0.06, 1.0), mShelfDark, { ol: 0.02, shadow: false });
      bd.position.set((x0 + x1) / 2, y, z);
      I.add(bd);
      const t = texGoods(kind, Math.max(4, Math.round(w / 0.42)), 1, r + Math.round(x0));
      for (const [zz, ry] of [[0.53, 0], [-0.53, Math.PI]]) {
        const f = new THREE.Mesh(planeGeo(w - 0.06, 0.46), litMap(t, 0.3));
        f.position.set((x0 + x1) / 2, y + 0.26, z + zz);
        f.rotation.y = ry;
        I.add(f);
      }
      // 层板小烛台光
      const cup = new THREE.Mesh(planeGeo(0.4, 0.1), glow(0xffcf8a, 0.9));
      cup.rotation.x = Math.PI / 2;
      cup.position.set((x0 + x1) / 2, y + 0.5, z + 0.53);
      I.add(cup);
    }
    for (const x of [x0, x1]) {
      const e = part(boxGeo(0.08, h + 0.08, 0.96), mShelfDark, { ol: 0.02, shadow: false });
      e.position.set(x, FY + h / 2, z);
      I.add(e);
    }
    const strip = new THREE.Mesh(planeGeo(w - 0.1, 0.17), new THREE.MeshBasicMaterial({ map: texPriceStrip(), transparent: true }));
    strip.position.set((x0 + x1) / 2, FY + h + 0.11, z + 0.5);
    I.add(strip);
  };
  potionRack(-8.6, 0.4, -3.7, 'potion', 3);
  potionRack(-8.6, 0.4, -5.95, 'crystal', 3);
  potionRack(-8.6, 0.4, -8.2, 'scroll', 3);

  // --- 后墙：魔药冷藏柜 + 水晶球陈列柜 ---
  const cooler = new THREE.Group();
  const cw = 6.0, cd = 0.95, ch = 2.45;
  const cBody = part(boxGeo(cw, ch, cd), toon(0x3a3348), { ol: 0.05 });
  cBody.position.set(-4.6, FY + ch / 2, IZ0 + cd / 2);
  I.add(cBody);
  const cInside = new THREE.Mesh(planeGeo(cw - 0.2, ch - 0.5), litMap(texAlchemyCabinet(), 0.62));
  cInside.position.set(-4.6, FY + ch / 2 - 0.05, IZ0 + 0.36);
  I.add(cInside);
  for (let i = 0; i < 3; i++) {
    const x = -4.6 + (i - 1) * (cw / 3 - 0.03);
    const gl = new THREE.Mesh(planeGeo(cw / 3 - 0.16, ch - 0.42), glassMat(0xd8ccff, 0.1));
    gl.position.set(x, FY + ch / 2 - 0.04, IZ0 + cd - 0.02);
    gl.renderOrder = 8;
    I.add(gl);
    const fr = part(boxGeo(cw / 3 - 0.08, 0.12, 0.1), matBrass, { ol: 0.02, shadow: false });
    fr.position.set(x, FY + ch - 0.12, IZ0 + cd - 0.01); I.add(fr);
    const hd = part(boxGeo(0.06, ch - 0.42, 0.12), matBrass, { ol: 0.02, shadow: false });
    hd.position.set(x + (cw / 6) - 0.07, FY + ch / 2, IZ0 + cd - 0.01); I.add(hd);
  }
  const cb = part(boxGeo(cw, 0.44, 0.26), toon(0x2a1c3c), { ol: 0.03, shadow: false });
  cb.position.set(-4.6, FY + ch + 0.24, IZ0 + cd + 0.06); I.add(cb);
  const cbTxt = new THREE.Mesh(planeGeo(cw - 0.3, 0.36), new THREE.MeshBasicMaterial({ map: texGoods('potion', 6, 1, 5), color: new THREE.Color(0xd8ccff) }));
  cbTxt.position.set(-4.6, FY + ch + 0.24, IZ0 + cd + 0.2);
  I.add(cbTxt);

  // 水晶球陈列柜（右侧，玻璃罩 + 内部发光球）
  const orbCase = new THREE.Group();
  const ow = 3.1, oh = 1.9;
  const oBody = part(boxGeo(ow, oh, 0.95), toon(0x463c56), { ol: 0.05 });
  oBody.position.set(2.4, FY + oh / 2, IZ0 + 0.48);
  I.add(oBody);
  for (let i = 0; i < 4; i++) {
    const ox = 1.35 + i * 0.7;
    const ob = new THREE.Mesh(sphGeo(0.24, 14, 12), glow(spick([PAL.arcaneSoft, PAL.mana, PAL.witch]), 0.9));
    ob.position.set(ox, FY + 1.05, IZ0 + 0.45);
    I.add(ob);
    const stand = cyl(I, 0.11, 0.14, 0.24, matBrass, ox, FY + 0.72, IZ0 + 0.45, { seg: 10, ol: 0.02, shadow: false });
    const glassDome = new THREE.Mesh(sphGeo(0.3, 14, 10, 0, TAU, 0, Math.PI / 2), glassMat(0xe4dcff, 0.14));
    glassDome.position.set(ox, FY + 0.86, IZ0 + 0.45);
    I.add(glassDome);
    halo(I, 0.9, 0xb08aff, ox, FY + 1.05, IZ0 + 0.45, 0.22);
    if (i < 3) {
      const ob2 = new THREE.Mesh(sphGeo(0.2, 12, 10), glow(0x8ad8ff, 0.75));
      ob2.position.set(ox + 0.35, FY + 1.85, IZ0 + 0.42);
      I.add(ob2);
    }
  }
  const obTop = part(boxGeo(ow, 0.4, 0.26), toon(0x2a1c3c), { ol: 0.03, shadow: false });
  obTop.position.set(2.4, FY + oh + 0.22, IZ0 + 0.5); I.add(obTop);
  const obTxt = new THREE.Mesh(planeGeo(ow - 0.3, 0.32), new THREE.MeshBasicMaterial({ map: texGoods('crystal', 4, 1, 2) }));
  obTxt.position.set(2.4, FY + oh + 0.22, IZ0 + 0.64);
  I.add(obTxt);

  // --- 西墙：咒语书与卷轴区（壁面书架） ---
  const wshelf = new THREE.Group();
  for (let r = 0; r < 4; r++) {
    const y = FY + 0.52 + r * 0.56;
    const sh = part(boxGeo(0.52, 0.07, 7.6), mShelfDark, { ol: 0.02, shadow: false });
    sh.position.set(IX0 + 0.31, y, -5.4);
    wshelf.add(sh);
    const f = new THREE.Mesh(planeGeo(7.5, 0.48), litMap(texGoods(r % 2 ? 'tome' : 'scroll', 20, 1, r * 3), 0.28));
    f.position.set(IX0 + 0.59, y + 0.27, -5.4);
    f.rotation.y = Math.PI / 2;
    wshelf.add(f);
  }
  for (const z of [-9.2, -5.4, -1.6]) {
    const p = part(boxGeo(0.1, 2.7, 0.1), mShelfDark, { ol: 0.02, shadow: false });
    p.position.set(IX0 + 0.57, FY + 1.35, z);
    wshelf.add(p);
  }
  I.add(wshelf);

  // --- 入口左侧：卷轴架 + 悬赏海报 ---
  const scroller = new THREE.Group();
  const scrB = part(boxGeo(1.1, 0.95, 2.2), mShelf, { ol: 0.04 });
  scrB.position.set(IX0 + 0.65, FY + 0.47, 1.0);
  scroller.add(scrB);
  for (let r = 0; r < 3; r++) {
    const f = new THREE.Mesh(planeGeo(2.0, 0.28), litMap(texGoods('scroll', 5, 1, r * 4), 0.34));
    f.position.set(IX0 + 1.22, FY + 0.32 + r * 0.32, 1.0);
    f.rotation.set(-0.35, Math.PI / 2, 0);
    scroller.add(f);
  }
  // 展开的卷轴（架顶）
  const openScroll = new THREE.Mesh(planeGeo(1.9, 0.6), litMap(texScrollPaper(), 0.3));
  openScroll.position.set(IX0 + 0.42, FY + 1.55, 1.0);
  openScroll.rotation.set(-1.1, Math.PI / 2, 0);
  scroller.add(openScroll);
  const scTop = part(boxGeo(0.22, 0.7, 2.2), mShelfDark, { ol: 0.03, shadow: false });
  scTop.position.set(IX0 + 0.3, FY + 1.5, 1.0);
  scroller.add(scTop);
  I.add(scroller);

  // --- 复古收银台（L 形木台 + 黄铜收银机 + 提灯） ---
  const reg = new THREE.Group();
  const ctopH = 1.02;
  const ct = part(boxGeo(5.0, ctopH, 1.15), mShelf, { ol: 0.05 });
  ct.position.set(4.6, FY + ctopH / 2, -1.75);
  reg.add(ct);
  const ctt = part(boxGeo(5.2, 0.1, 1.3), mShelfDark, { ol: 0.03, shadow: false });
  ctt.position.set(4.6, FY + ctopH + 0.05, -1.75);
  reg.add(ctt);
  const cs = part(boxGeo(1.15, ctopH, 2.7), mShelf, { ol: 0.05 });
  cs.position.set(2.6, FY + ctopH / 2, -0.5);
  reg.add(cs);
  const cst = part(boxGeo(1.3, 0.1, 2.9), mShelfDark, { ol: 0.03, shadow: false });
  cst.position.set(2.6, FY + ctopH + 0.05, -0.5);
  reg.add(cst);
  // 黄铜收银机
  const cash = new THREE.Group();
  cash.add(part(boxGeo(0.6, 0.42, 0.52), toon(PAL.brassDark), { ol: 0.03 }));
  const cashTop = part(boxGeo(0.5, 0.16, 0.44), matBrass, { ol: 0.02, shadow: false });
  cashTop.position.set(0, 0.3, 0);
  cash.add(cashTop);
  for (let i = 0; i < 4; i++) {
    const k = part(boxGeo(0.08, 0.05, 0.05), matBrass, { ol: 0, shadow: false });
    k.position.set(-0.18 + i * 0.12, 0.4, 0.1);
    cash.add(k);
  }
  const dial = new THREE.Mesh(planeGeo(0.3, 0.2), glow(PAL.goldBright, 0.9));
  dial.position.set(0, 0.1, 0.28);
  cash.add(dial);
  cash.position.set(3.4, FY + ctopH + 0.32, -1.8);
  reg.add(cash);
  // 台面小物：天平、蜡烛、账本
  const scale = new THREE.Group();
  cyl(scale, 0.02, 0.02, 0.42, matBrass, 0, 0.21, 0, { seg: 6, ol: 0.015, shadow: false });
  box(scale, 0.5, 0.03, 0.06, matBrass, 0, 0.42, 0, { ol: 0.015, shadow: false });
  for (const dx of [-0.22, 0.22]) {
    cyl(scale, 0.09, 0.09, 0.03, matBrass, dx, 0.3, 0, { seg: 10, ol: 0.015, shadow: false });
  }
  scale.position.set(5.3, FY + ctopH + 0.1, -1.75);
  reg.add(scale);
  cyl(reg, 0.05, 0.05, 0.3, matWhite, 6.0, FY + ctopH + 0.25, -1.7, { seg: 8, ol: 0.02, shadow: false });
  const flame = new THREE.Mesh(sphGeo(0.06, 8, 8), glow(0xffc46a, 1.3));
  flame.position.set(6.0, FY + ctopH + 0.44, -1.7);
  reg.add(flame);
  halo(reg, 0.7, 0xffb45a, 6.0, FY + ctopH + 0.44, -1.7, 0.3);
  box(reg, 0.36, 0.1, 0.28, toon(0x8a3a3a), 4.4, FY + ctopH + 0.14, -1.9, { ol: 0.02, shadow: false });
  // 店员高脚凳
  const stool = new THREE.Group();
  cyl(stool, 0.2, 0.22, 0.1, matWoodDark, 0, 0.64, 0, { seg: 10, ol: 0.02 });
  cyl(stool, 0.05, 0.05, 0.62, matIron, 0, 0.31, 0, { seg: 8, ol: 0.02 });
  stool.position.set(5.4, FY, -3.0);
  reg.add(stool);
  I.add(reg);

  // --- 炼金坩埚台（后柜） ---
  const back = new THREE.Group();
  const bctH = 0.96;
  const bc = part(boxGeo(6.0, bctH, 0.7), mShelf, { ol: 0.05 });
  bc.position.set(4.6, FY + bctH / 2, -4.3);
  back.add(bc);
  const bct = part(boxGeo(6.2, 0.1, 0.85), mShelfDark, { ol: 0.03, shadow: false });
  bct.position.set(4.6, FY + bctH + 0.05, -4.3);
  back.add(bct);
  // 坩埚
  const cauldron = new THREE.Group();
  const pot = new THREE.Mesh(sphGeo(0.42, 16, 12, 0, TAU, Math.PI * 0.42, Math.PI * 0.58), toon(0x2a2632));
  pot.scale.y = 0.95;
  cauldron.add(pot);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 20), matIron);
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.22;
  cauldron.add(rim);
  const brew = new THREE.Mesh(new THREE.CircleGeometry(0.36, 18), glow(0x4ade80, 1.2));
  brew.rotation.x = -Math.PI / 2; brew.position.y = 0.2;
  cauldron.add(brew);
  // 炖煮气泡
  runtime.cauldronBubbles = [];
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Mesh(sphGeo(sr(0.03, 0.06), 8, 6), glow(0x86efac, 1.4, true));
    const a = srand() * TAU, r = srand() * 0.26;
    b.position.set(Math.cos(a) * r, 0.22, Math.sin(a) * r);
    b.userData = { ph: srand(), r, a, y0: 0.22 };
    cauldron.add(b);
    runtime.cauldronBubbles.push(b);
  }
  // 三脚架
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * TAU + 0.4;
    const l = part(cylGeo(0.035, 0.045, 0.85, 6), matIron, { ol: 0.02, shadow: false });
    l.position.set(Math.cos(a) * 0.3, -0.42, Math.sin(a) * 0.3);
    l.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3);
    cauldron.add(l);
  }
  cauldron.position.set(2.4, FY + 0.86, -4.5);
  back.add(cauldron);
  halo(back, 3.0, 0x6ee7a0, 2.4, FY + 1.15, -4.4, 0.22);
  // 坩埚招牌
  decal(back, 1.5, 0.34, new THREE.MeshBasicMaterial({ map: texGoods('potion', 3, 1, 2), color: new THREE.Color(0xd8ffd8) }), 2.4, FY + 1.95, -4.35);
  // 悬吊的炼金灯
  const odenLamp = new THREE.Mesh(planeGeo(1.6, 0.07), glow(0xa8ffd0, 1.1));
  odenLamp.position.set(2.4, FY + 2.05, -4.42);
  back.add(odenLamp);
  // 药草罐墙（贴后墙）
  const cab = part(boxGeo(2.6, 1.9, 0.44), toon(0x2a2233, { map: texAlchemyCabinet() }), { ol: 0.04 });
  cab.position.set(6.4, FY + 1.02 + 0.44, IZ0 + 0.26);
  back.add(cab);
  const cabGl = new THREE.Mesh(planeGeo(2.5, 1.75), glassMat(0xe4dcff, 0.1));
  cabGl.position.set(6.4, FY + 1.48, IZ0 + 0.5);
  cabGl.renderOrder = 8;
  back.add(cabGl);
  I.add(back);

  // --- 东墙：魔法道具陈列（多段敞开架） ---
  const relic = new THREE.Group();
  const rh = 1.8, rd = 1.25;
  const rb = part(boxGeo(rd, rh, 5.0), toon(0x3f3648), { ol: 0.05 });
  rb.position.set(IX1 - rd / 2 - 0.05, FY + rh / 2, -6.1);
  relic.add(rb);
  for (let r = 0; r < 3; r++) {
    const y = FY + 0.44 + r * 0.46;
    const t = texGoods('relic', 4, 1, r * 2 + 1);
    const f = new THREE.Mesh(planeGeo(4.8, 0.44), litMap(t, 0.3));
    f.position.set(IX1 - rd - 0.1, y + 0.24, -6.1);
    f.rotation.y = -Math.PI / 2;
    relic.add(f);
    const sh = part(boxGeo(rd - 0.1, 0.06, 5.02), mMetalShelf, { ol: 0.02, shadow: false });
    sh.position.set(IX1 - rd / 2 - 0.05, y, -6.1);
    relic.add(sh);
  }
  for (const z of [-4.2, -6.1, -8.0]) {
    const lp = new THREE.Mesh(planeGeo(0.95, 0.1), glow(0xffdcae, 1.1));
    lp.position.set(IX1 - rd - 0.08, FY + 1.58, z); lp.rotation.y = -Math.PI / 2;
    relic.add(lp);
  }
  const rTop = part(boxGeo(0.26, 0.42, 5.0), toon(0x2a1c3c), { ol: 0.03, shadow: false });
  rTop.position.set(IX1 - 0.29, FY + rh + 0.21, -6.1);
  relic.add(rTop);
  decal(relic, 4.9, 0.34, new THREE.MeshBasicMaterial({ map: texGoods('relic', 4, 1, 0) }), IX1 - 0.43, FY + rh + 0.21, -6.1, 0, -Math.PI / 2);
  I.add(relic);

  // --- 东墙前：保鲜药柜（小） ---
  const herb = new THREE.Group();
  const hh = 1.35;
  const hb = part(boxGeo(0.95, hh, 2.0), toon(0x3a3348), { ol: 0.04 });
  hb.position.set(IX1 - 0.6, FY + hh / 2, -2.6);
  herb.add(hb);
  const hIn = new THREE.Mesh(planeGeo(1.8, 0.6), litMap(texGoods('herb', 4, 1, 3), 0.4));
  hIn.position.set(IX1 - 1.09, FY + 0.95, -2.6);
  hIn.rotation.y = -Math.PI / 2;
  herb.add(hIn);
  const hGl = new THREE.Mesh(planeGeo(1.9, 0.55), glassMat(0xe4ffe4, 0.12));
  hGl.position.set(IX1 - 1.13, FY + 0.98, -2.6); hGl.rotation.y = -Math.PI / 2;
  hGl.renderOrder = 8;
  herb.add(hGl);
  I.add(herb);

  // --- 店内海报 ---
  const posterSpots = [
    [IX0 + 0.17, 2.6, -9.7, Math.PI / 2], [IX0 + 0.17, 1.5, 2.3, Math.PI / 2],
    [-8.2, 3.4, IZ0 + 0.17, 0], [-1.0, 3.4, IZ0 + 0.17, 0],
    [S.x1 - W - 0.02, 3.3, -1.0, -Math.PI / 2], [S.x1 - W - 0.02, 1.5, 2.3, -Math.PI / 2],
    [IX0 + 0.17, 3.4, -4.0, Math.PI / 2],
  ];
  posterSpots.forEach(([x, y, z, ry], i) => {
    decal(I, 0.74, 1.1, litMap(texPoster(i), 0.34), x, FY + y, z, 0, ry);
  });
  // 收银台上方横幅
  decal(I, 4.4, 0.6, new THREE.MeshBasicMaterial({ map: texPoster(4), color: new THREE.Color(0xc8bfae) }), 4.6, FY + 3.5, -1.75, 0, Math.PI);

  // --- 天花魔法灯盘（暖黄 + 中央吊灯） ---
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const x = IX0 + 3.0 + i * 5.0;
      const z = IZ0 + 3.4 + j * 3.6;
      const lp = new THREE.Mesh(planeGeo(2.2, 0.5), glow(0xffdcae, 1.0));
      lp.rotation.x = Math.PI / 2;
      lp.position.set(x, CY - 0.03, z);
      I.add(lp);
      const boxl = part(boxGeo(2.4, 0.1, 0.62), matDark, { ol: 0.02, shadow: false });
      boxl.position.set(x, CY - 0.02, z);
      I.add(boxl);
    }
  }
  // 中央：悬吊的魔法球（三颗 + 光晕）
  const chandelier = new THREE.Group();
  for (const [dx, dz, r, col] of [[-1.6, 1.2, 0.3, PAL.arcaneSoft], [0.4, 0.4, 0.36, PAL.goldBright], [2.2, 1.4, 0.3, PAL.mana]]) {
    const orb = new THREE.Mesh(sphGeo(r, 16, 12), glow(col, 1.0));
    orb.position.set(dx, CY - 0.9, dz);
    chandelier.add(orb);
    halo(chandelier, r * 9, col, dx, CY - 0.9, dz, 0.24);
    cyl(chandelier, 0.012, 0.012, 0.85, matIron, dx, CY - 0.42, dz, { seg: 4, ol: 0, shadow: false });
  }
  chandelier.add(part(boxGeo(5.0, 0.08, 0.08), matIron, { ol: 0.02, shadow: false }));
  chandelier.position.set(0.4, 0, -4.6);
  I.add(chandelier);
  // 吊挂价签
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(planeGeo(0.5, 0.15), new THREE.MeshBasicMaterial({ map: texPriceStrip(), transparent: true }));
    s.position.set(IX0 + 1.6 + (i % 3) * 4.6, 2.95, IZ0 + 4.6 + Math.floor(i / 3) * 4.6);
    s.rotation.y = Math.PI / 2;
    I.add(s);
  }

  // --- 地面符文导视 ---
  decal(I, 0.62, 1.24, new THREE.MeshBasicMaterial({ map: texFloorArrow(), transparent: true }), -3.4, FY + 0.014, 1.3, -Math.PI / 2, 0, 0);
  decal(I, 0.62, 1.24, new THREE.MeshBasicMaterial({ map: texFloorArrow(), transparent: true }), 1.2, FY + 0.014, 0.5, -Math.PI / 2, 0, Math.PI / 2);
  const guide = new THREE.Mesh(planeGeo(9.0, 0.09), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xc4a8ff).multiplyScalar(0.75) }));
  guide.rotation.x = -Math.PI / 2;
  guide.position.set(2.4, FY + 0.012, -0.9);
  I.add(guide);
  // 警示牌
  const caution = new THREE.Group();
  const cauMat = new THREE.MeshBasicMaterial({ map: texCaution(), side: THREE.DoubleSide });
  const c1 = new THREE.Mesh(planeGeo(0.34, 0.42), cauMat); c1.position.y = 0.44; c1.rotation.x = -0.12;
  caution.add(c1);
  const c2 = new THREE.Mesh(planeGeo(0.34, 0.42), cauMat); c2.position.y = 0.44; c2.rotation.set(-0.12, Math.PI / 2, 0);
  caution.add(c2);
  caution.position.set(-1.2, FY, -0.4);
  I.add(caution);

  // --- 后场杂物（木箱 / 酒桶 / 扫帚） ---
  const crateMat = toon(0x6b4f36, { map: texTimber(PAL.wood) });
  for (const [x, z, s, ry] of [[2.0, -10.1, 1.0, 0.3], [2.7, -10.4, 0.8, -0.2], [1.4, -10.5, 0.9, 0.6]]) {
    box(I, 0.72 * s, 0.52 * s, 0.56 * s, crateMat, x, FY + 0.26 * s, z, { ol: 0.03, ry });
  }
  cyl(I, 0.3, 0.3, 0.72, toon(0x5a3f2a), 8.0 - 0.6, FY + 0.36, -9.8, { seg: 12, ol: 0.03, ry: 0.4 });
  cyl(I, 0.3, 0.3, 0.72, toon(0x5a3f2a), 8.0 - 1.5, FY + 0.36, -10.3, { seg: 12, ol: 0.03, ry: -0.3 });

  /* ================= 店内灯光（精简到 3 盏 + 自发光为主） ================= */
  const lights = [];
  const mkPoint = (x, y, z, color, intensity, dist) => {
    const p = new THREE.PointLight(color, intensity, dist, 2);
    p.position.set(x, y, z);
    g.add(p);
    lights.push(p);
    return p;
  };
  mkPoint(-6.2, CY - 0.6, -2.6, 0xffcf8a, 38, 22);
  mkPoint(-2.4, CY - 0.6, -8.4, 0xffc880, 38, 22);
  mkPoint(3.6, CY - 0.6, -4.6, 0xffd39a, 36, 22);
  // 店外檐下暖光（照亮门口与地垫）
  mkPoint(-3.0, 3.4, 4.9, 0xffc27a, 34, 18);

  /* ================= 屋顶设备（法师塔残迹 + 通风塔 + 符文天线） ================= */
  const acShell = toon(0x7c7488);
  const roofY = S.wall + 0.15 + 0.16;
  const ph = part(boxGeo(2.6, 1.5, 2.4), toon(0x6d6478, { map: texStoneWall(0x6d6478, 3) }), { ol: 0.05 });
  ph.position.set(3.4, roofY + 0.75, -0.8);
  g.add(ph);
  const phDoor = new THREE.Mesh(planeGeo(0.8, 1.5), toon(PAL.timberDark, { map: texBackDoor() }));
  phDoor.position.set(3.4, roofY + 0.75, -0.8 + 1.21);
  g.add(phDoor);
  const phRoof = part(boxGeo(2.9, 0.16, 2.7), toon(0x4a4256), { ol: 0.04, shadow: false });
  phRoof.position.set(3.4, roofY + 1.58, -0.8);
  g.add(phRoof);
  // 通风塔
  cyl(g, 0.28, 0.28, 1.1, matSteel, -8.6, roofY + 0.55, -7.6, { seg: 12, ol: 0.03 });
  cyl(g, 0.36, 0.36, 0.16, matIron, -8.6, roofY + 1.16, -7.6, { seg: 12, ol: 0.02, shadow: false });
  // 符文天线（发光的悬空符文环）
  cyl(g, 0.04, 0.04, 2.4, matIron, 6.4, roofY + 1.2, -9.4, { seg: 6, ol: 0.015 });
  const runeRing = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.045, 8, 24), glow(PAL.arcaneSoft, 0.8));
  runeRing.rotation.x = Math.PI / 2;
  runeRing.position.set(6.4, roofY + 2.4, -9.4);
  g.add(runeRing);
  halo(g, 3.2, 0xb08aff, 6.4, roofY + 2.4, -9.4, 0.2);
  runtime.runeRing = runeRing;

  /* ================= 外墙面细节 ================= */
  const wallAC = (x, y, z, w, h, d, ry) => {
    const grp = new THREE.Group();
    grp.add(part(boxGeo(w, h, d), acShell, { ol: 0.035 }));
    const grill = new THREE.Mesh(new THREE.CircleGeometry(Math.min(w, h) * 0.34, 16), toon(0x3d3550));
    grill.position.set(0, 0, d / 2 + 0.012);
    grp.add(grill);
    const bracket = part(boxGeo(w * 1.1, 0.06, d + 0.1), matIron, { ol: 0.02, shadow: false });
    bracket.position.set(0, -h / 2 - 0.06, 0);
    grp.add(bracket);
    grp.position.set(x, y, z);
    grp.rotation.y = ry || 0;
    g.add(grp);
    return grp;
  };
  wallAC(S.x1 + 0.42, 2.9, -3.6, 0.9, 0.66, 0.42, Math.PI / 2);
  wallAC(S.x1 + 0.42, 2.9, -6.4, 0.9, 0.66, 0.42, Math.PI / 2);
  wallAC(S.x0 - 0.42, 3.0, -7.2, 0.9, 0.66, 0.42, Math.PI / 2);
  // 落水管
  for (const [x, z] of [[S.x1 + 0.16, S.z1 - 0.4], [S.x0 - 0.16, S.z1 - 0.4], [S.x1 + 0.16, S.z0 + 0.4]]) {
    cyl(g, 0.09, 0.09, S.wall + 0.2, matIron, x, (S.wall + 0.2) / 2, z, { seg: 8, ol: 0.02, shadow: false });
  }
  // 墙面煤油灯
  for (const x of [S.x0 + 3.0, 2.8, S.x1 - 3.0]) {
    const b = part(boxGeo(0.3, 0.18, 0.24), matIron, { ol: 0.02, shadow: false });
    b.position.set(x, 4.36, S.z1 + 0.12);
    g.add(b);
    const lp = new THREE.Mesh(planeGeo(0.22, 0.1), glow(0xffc27a, 1.1));
    lp.position.set(x, 4.26, S.z1 + 0.12);
    lp.rotation.x = Math.PI / 2;
    g.add(lp);
    halo(g, 1.4, 0xffb45a, x, 4.2, S.z1 + 0.2, 0.24);
  }
  // 东墙小灯箱
  const sE2 = new THREE.Mesh(planeGeo(1.6, 0.5), new THREE.MeshBasicMaterial({ map: texShopSign() }));
  sE2.rotation.y = Math.PI / 2;
  sE2.position.set(S.x1 + 0.02, 3.7, -8.8);
  g.add(sE2);

  /* ---- 西墙（面向小巷）：后门 / 管道 / 符文刻痕 / 壁灯 ---- */
  const westX = S.x0 - 0.02;
  const svcGroup = new THREE.Group();
  const svcDoor = part(boxGeo(0.14, 2.2, 1.1), toon(PAL.timberDark, { map: texBackDoor() }), { ol: 0.04 });
  svcDoor.position.set(westX - 0.06, FY + 1.1, 1.2);
  svcGroup.add(svcDoor);
  const svcFrame = part(boxGeo(0.16, 2.45, 1.34), matStone, { ol: 0.03 });
  svcFrame.position.set(westX - 0.04, FY + 1.22, 1.2);
  svcGroup.add(svcFrame);
  box(svcGroup, 0.5, 0.16, 1.3, matStone, westX - 0.32, FY + 0.08, 1.2, { ol: 0.03, shadow: false });
  const wl = part(boxGeo(0.24, 0.14, 0.3), matIron, { ol: 0.02, shadow: false });
  wl.position.set(westX - 0.16, FY + 2.75, 1.2);
  svcGroup.add(wl);
  const wlGlow = new THREE.Mesh(planeGeo(0.18, 0.1), glow(0xffc27a, 1.0));
  wlGlow.rotation.x = Math.PI / 2; wlGlow.rotation.z = Math.PI / 2;
  wlGlow.position.set(westX - 0.16, FY + 2.67, 1.2);
  svcGroup.add(wlGlow);
  for (const z of [0.2, -2.6, -5.4]) {
    cyl(svcGroup, 0.07, 0.07, S.wall, matIron, westX - 0.12, S.wall / 2, z, { seg: 8, ol: 0.02 });
  }
  // 墙上的发光符文刻痕
  for (let i = 0; i < 5; i++) {
    const rn = new THREE.Mesh(planeGeo(0.5, 0.5), new THREE.MeshBasicMaterial({
      map: texRuneCircle(), transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false,
      color: new THREE.Color(i % 2 ? PAL.mana : PAL.arcaneSoft),
    }));
    rn.rotation.y = -Math.PI / 2;
    rn.position.set(westX - 0.02, sr(0.6, 2.4), sr(-9.0, 1.6));
    rn.renderOrder = 6;
    svcGroup.add(rn);
    runtime.runeCircles.push({ m: rn, seed: srand() * 6 });
  }
  g.add(svcGroup);

  runtime.interiorLights = lights;
  runtime.store = g;
  return { group: g, points: lights };
}
