/**
 * DNA–CaOx hero for MineralSciences.
 * Display defaults match the DNA_CaOx viewer setCoatView():
 * distance clouds, color by d(P), DNA/oxalate/water on, side view, slow auto-rotate.
 */
import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js";
import { mountHeroAxes, drawHeroAxes } from "./hero-axes.js?v=14";

const DNA_PINK = {
  backbone: 0xf5b0d0,
  phosphate: 0xff9ec8,
  trace: 0xa8386e,
};
const STRAND_COLOR = {
  A: DNA_PINK.backbone,
  B: DNA_PINK.backbone,
  C: DNA_PINK.backbone,
  D: DNA_PINK.backbone,
};
const ACCENT_YELLOW = { emissive: 0xffe033 };
const PHASES = 3;

function dpColor(dp) {
  const t = Math.min(1, (dp || 0) / 32);
  return new THREE.Color().setHSL(0.08 + 0.55 * (1 - t), 0.75, 0.5);
}

function catmull(points, samples) {
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  return curve.getSpacedPoints(samples);
}

function ribbonGeometry(center, toward, width, thickness) {
  const n = center.length;
  const pos = [];
  const idx = [];
  const hw = width / 2;
  const ht = thickness / 2;
  const frames = [];
  for (let i = 0; i < n; i++) {
    const p = center[i];
    const t = new THREE.Vector3();
    if (i < n - 1) t.subVectors(center[i + 1], p);
    else t.subVectors(p, center[i - 1]);
    t.normalize();
    let u = toward[i].clone();
    u.addScaledVector(t, -u.dot(t));
    if (u.lengthSq() < 1e-8) {
      u = Math.abs(t.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      u.cross(t);
    }
    u.normalize();
    const v = new THREE.Vector3().crossVectors(t, u).normalize();
    frames.push({ p, u, v });
  }
  for (let i = 0; i < n; i++) {
    const { p, u, v } = frames[i];
    const corners = [
      p.clone().addScaledVector(u, hw).addScaledVector(v, ht),
      p.clone().addScaledVector(u, -hw).addScaledVector(v, ht),
      p.clone().addScaledVector(u, -hw).addScaledVector(v, -ht),
      p.clone().addScaledVector(u, hw).addScaledVector(v, -ht),
    ];
    for (const c of corners) pos.push(c.x, c.y, c.z);
    if (i < n - 1) {
      const a = i * 4;
      const b = (i + 1) * 4;
      for (const [a0, a1, b1, b0] of [
        [0, 1, 1, 0],
        [1, 2, 2, 1],
        [2, 3, 3, 2],
        [3, 0, 0, 3],
      ]) {
        idx.push(a + a0, a + a1, b + b1, a + a0, b + b1, b + b0);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function makeSprite() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export async function startCaOxHero(canvas, meta) {
  const res = await fetch(meta.dataUrl);
  if (!res.ok) throw new Error(`Failed to load ${meta.dataUrl}`);
  const MODEL = await res.json();
  const display = { ...meta.display, ...(MODEL.display || {}) };
  const ca = MODEL.ca;
  const nCa = ca.x.length;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x060810, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060810);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 800);
  const autoRotate = display.autoRotate !== false;
  const rotPerFrame = ((2 * Math.PI) / 60 / 60) * (display.autoRotateSpeed ?? 0.45);
  let userSpin = true;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let resumeTimer = 0;

  scene.add(new THREE.AmbientLight(0x9aa4b2, 0.55));
  const key = new THREE.DirectionalLight(0xfff4e5, 1.15);
  key.position.set(40, 30, 55);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x8fb7ff, 0.35);
  fill.position.set(-50, -10, -30);
  scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xced6e0, 0x1a1c20, 0.35));

  const root = new THREE.Group();
  scene.add(root);
  const dnaGroup = new THREE.Group();
  const mineralGroup = new THREE.Group();
  const hotspotGroup = new THREE.Group();
  root.add(dnaGroup, mineralGroup, hotspotGroup);

  // DNA
  (MODEL.strands || []).forEach((strand) => {
    const c1 = strand.residues.map((r) => new THREE.Vector3(...r.C1));
    const ng = strand.residues.map((r) => new THREE.Vector3(...r.N));
    const p = strand.residues.map((r) => new THREE.Vector3(...r.P));
    if (display.showDnaRibbons !== false) {
      const samples = 48;
      const cSmooth = catmull(c1, samples);
      const nSmooth = catmull(ng, samples);
      const toward = cSmooth.map((pt, i) => nSmooth[i].clone().sub(pt));
      const geom = ribbonGeometry(cSmooth, toward, 2.15, 0.42);
      const mesh = new THREE.Mesh(
        geom,
        new THREE.MeshPhysicalMaterial({
          color: STRAND_COLOR[strand.chain] || 0xdddddd,
          roughness: 0.35,
          metalness: 0.05,
          clearcoat: 0.25,
        })
      );
      dnaGroup.add(mesh);
    }
    if (display.showPhosphates !== false) {
      dnaGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(p, false, "centripetal"),
            40,
            0.28,
            8,
            false
          ),
          new THREE.MeshPhysicalMaterial({ color: DNA_PINK.trace, roughness: 0.4 })
        )
      );
      const pGeom = new THREE.SphereGeometry(0.85, 16, 12);
      const pMat = new THREE.MeshPhysicalMaterial({
        color: DNA_PINK.phosphate,
        roughness: 0.3,
      });
      p.forEach((pt) => {
        const s = new THREE.Mesh(pGeom, pMat);
        s.position.copy(pt);
        dnaGroup.add(s);
      });
    }
  });

  if (display.showDnaPairs !== false) {
    const rungMat = new THREE.MeshPhysicalMaterial({
      color: 0x8fa8c4,
      roughness: 0.45,
      transparent: true,
      opacity: 0.9,
    });
    (MODEL.pairs || []).forEach((pair) => {
      const a = new THREE.Vector3(...pair.a);
      const b = new THREE.Vector3(...pair.b);
      const axis = new THREE.Vector3().subVectors(b, a);
      const len = axis.length();
      axis.normalize();
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const box = new THREE.Mesh(new THREE.BoxGeometry(len, 0.32, 3.3), rungMat);
      box.position.copy(mid);
      let side = new THREE.Vector3().crossVectors(axis, new THREE.Vector3(0, 1, 0));
      if (side.lengthSq() < 1e-8) side = new THREE.Vector3(0, 0, 1);
      side.normalize();
      const up = new THREE.Vector3().crossVectors(side, axis).normalize();
      box.setRotationFromMatrix(new THREE.Matrix4().makeBasis(axis, up, side));
      dnaGroup.add(box);
    });
  }

  if (display.showSeeds !== false) {
    const seedMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.2,
      emissive: 0x335577,
      emissiveIntensity: 0.25,
    });
    const seedGeom = new THREE.OctahedronGeometry(1.35, 0);
    (MODEL.seeds || []).forEach((xyz) => {
      const s = new THREE.Mesh(seedGeom, seedMat);
      s.position.set(...xyz);
      dnaGroup.add(s);
    });
  }

  if (display.showOxalate !== false && MODEL.oxalate?.length) {
    const pos = new Float32Array(MODEL.oxalate.length * 6);
    MODEL.oxalate.forEach((seg, i) => {
      pos[i * 6] = seg[0][0];
      pos[i * 6 + 1] = seg[0][1];
      pos[i * 6 + 2] = seg[0][2];
      pos[i * 6 + 3] = seg[1][0];
      pos[i * 6 + 4] = seg[1][1];
      pos[i * 6 + 5] = seg[1][2];
    });
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    dnaGroup.add(
      new THREE.LineSegments(
        geom,
        new THREE.LineBasicMaterial({
          color: 0xc4b49a,
          transparent: true,
          opacity: 0.7,
        })
      )
    );
  }

  // Ca distance clouds (viewer defaults)
  const sprite = makeSprite();
  const cloudSizes = [12.0, 7.2, 4.6];
  const cloudOpac = [0.38, 0.48, 0.72];
  const clouds = cloudSizes.map((size, ph) => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nCa * 3), 3));
    geom.setAttribute("color", new THREE.BufferAttribute(new Float32Array(nCa * 3), 3));
    geom.setDrawRange(0, 0);
    const pts = new THREE.Points(
      geom,
      new THREE.PointsMaterial({
        size,
        map: sprite,
        vertexColors: true,
        transparent: true,
        opacity: cloudOpac[ph],
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })
    );
    pts.frustumCulled = false;
    mineralGroup.add(pts);
    return pts;
  });

  const dmin = display.dmin ?? 0;
  const dmax = display.dmax ?? 75;
  const rmax = display.rmax ?? 75;
  const slab = display.slab ?? 75;
  const phaseOn = display.phases || [true, true, true];
  const packed = [[], [], []];
  for (let i = 0; i < nCa; i++) {
    const ph = ca.phase[i];
    if (!phaseOn[ph]) continue;
    if (ca.dP[i] < dmin || ca.dP[i] > dmax) continue;
    if (ca.radial[i] > rmax) continue;
    if (Math.abs(ca.y[i]) > slab) continue;
    const col = dpColor(ca.dP[i]);
    packed[ph].push({ x: ca.x[i], y: ca.y[i], z: ca.z[i], r: col.r, g: col.g, b: col.b });
  }
  for (let ph = 0; ph < PHASES; ph++) {
    const pos = clouds[ph].geometry.getAttribute("position");
    const col = clouds[ph].geometry.getAttribute("color");
    packed[ph].forEach((p, k) => {
      pos.setXYZ(k, p.x, p.y, p.z);
      col.setXYZ(k, p.r, p.g, p.b);
    });
    pos.needsUpdate = true;
    col.needsUpdate = true;
    clouds[ph].geometry.setDrawRange(0, packed[ph].length);
  }

  if (display.showHotspots !== false && ca.hotspot) {
    const pts = [];
    for (let i = 0; i < nCa; i++) if (ca.hotspot[i]) pts.push(i);
    if (pts.length) {
      const geom = new THREE.SphereGeometry(1, 14, 12);
      const mat = new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.18,
        emissive: ACCENT_YELLOW.emissive,
        emissiveIntensity: 0.95,
        transparent: true,
        opacity: 0.98,
        toneMapped: false,
      });
      const mesh = new THREE.InstancedMesh(geom, mat, pts.length);
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(pts.length * 3), 3);
      const dummy = new THREE.Object3D();
      pts.forEach((i, k) => {
        dummy.position.set(ca.x[i], ca.y[i], ca.z[i]);
        dummy.scale.setScalar(1.45);
        dummy.updateMatrix();
        mesh.setMatrixAt(k, dummy.matrix);
        mesh.setColorAt(k, dpColor(ca.dP[i]));
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
      hotspotGroup.add(mesh);
    }
  }

  if (display.showWater !== false && MODEL.water?.x?.length) {
    const w = MODEL.water;
    const n = w.x.length;
    const waterMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.68, 8, 6),
      new THREE.MeshPhysicalMaterial({
        color: 0x6a9cc9,
        roughness: 0.4,
        transparent: true,
        opacity: 0.5,
      }),
      n
    );
    const d = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const r = Math.hypot(w.x[i], w.z[i]);
      if (r > rmax || Math.abs(w.y[i]) > slab) {
        d.position.set(0, 1e6, 0);
        d.scale.setScalar(0.001);
      } else {
        d.position.set(w.x[i], w.y[i], w.z[i]);
        d.scale.setScalar(1);
      }
      d.updateMatrix();
      waterMesh.setMatrixAt(i, d.matrix);
    }
    waterMesh.instanceMatrix.needsUpdate = true;
    mineralGroup.add(waterMesh);
  }

  function setSideView() {
    const hx = MODEL.helix || {};
    const span = Math.max(
      hx.rCoat || 42,
      ((hx.zmax || 40) - (hx.zmin || -40)) * 0.55,
      MODEL.seedRadius || 30
    );
    const r = span + 20;
    // Frame above the typewriter band so the model is vertically centered on stage
    camera.position.set(18, 7.5, r * 1.48);
    camera.lookAt(0, -span * 0.1, 0);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width) || window.innerWidth);
    const h =
      Math.max(1, Math.round(rect.height)) ||
      Math.min(Math.round(window.innerHeight * 0.6), 760);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  const axesCtx = mountHeroAxes(canvas.closest(".hero-stage"));
  const _ax = new THREE.Vector3();
  const _worldUp = new THREE.Vector3(0, 1, 0);
  const _viewRight = new THREE.Vector3();
  const _viewUp = new THREE.Vector3();

  function orbitByPointer(dx, dy) {
    // View-relative orbit: drag follows screen axes, not fixed model X/Y Euler
    _viewRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    _viewUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    root.rotateOnWorldAxis(_viewUp, dx * 0.005);
    root.rotateOnWorldAxis(_viewRight, dy * 0.004);
  }

  function onPointerDown(e) {
    e.preventDefault();
    dragging = true;
    userSpin = false;
    clearTimeout(resumeTimer);
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.classList.add("is-dragging");
    canvas.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    orbitByPointer(dx, dy);
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove("is-dragging");
    try {
      canvas.releasePointerCapture?.(e.pointerId);
    } catch (_) {}
    resumeTimer = setTimeout(() => {
      userSpin = true;
    }, 2200);
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("lostpointercapture", onPointerUp);

  setSideView();
  resize();
  window.addEventListener("resize", resize);

  function tick() {
    if (autoRotate && userSpin && !dragging) {
      root.rotateOnWorldAxis(_worldUp, rotPerFrame);
    }
    renderer.render(scene, camera);
    drawHeroAxes(axesCtx, (x, y, z) => {
      _ax.set(x, y, z).applyQuaternion(root.quaternion);
      return [_ax.x, _ax.y, _ax.z];
    });
    requestAnimationFrame(tick);
  }
  tick();
}
