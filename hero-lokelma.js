/**
 * Lokelma / ZS-9 zirconium silicate hero (from Dallas 2026 talk CrystalViewer).
 * Ball-and-stick framework + K⁺ channels, with a looping H/K exchange beat.
 */
import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js";
import { mountHeroAxes, drawHeroAxes } from "./hero-axes.js?v=14";
import { setNarrationBeat } from "./hero-info.js?v=17";
import {
  buildExchangeSites,
  buildPoreWindows,
  samplePore,
  sampleHEntry,
  sampleExchange,
  hydroxylAt,
  flashAt,
  REST,
  LOCKED,
} from "./hero/lokelma-exchange.js?v=13";

const SCALE = 0.4;
const K_COLOR = 0xf0c878;
const H_COLOR = 0xe8f2f6;
const PORE_COLOR = 0xf3cc7a;
const PORE_FREE = 1.5;

const PHASES = [
  { id: "k", dur: 7.0, beat: "gut" },
  { id: "pore", dur: 5.2, beat: "pore" },
  { id: "h-point", dur: 4.8, beat: "protons" },
  { id: "exchange", dur: 8.2, beat: "lock" },
  { id: "locked", dur: 3.0, beat: "patients" },
];
const PORE_FADE_IN = 0.55;
const PORE_FADE_OUT = 1.15;

function makeBondMesh(a, b) {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...b);
  const dir = new THREE.Vector3().subVectors(B, A);
  const length = dir.length();
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.028, 1, 6),
    new THREE.MeshStandardMaterial({
      color: 0x6a645c,
      roughness: 0.7,
      metalness: 0.1,
    })
  );
  mesh.position.copy(A).add(B).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  mesh.scale.set(1, length, 1);
  return mesh;
}

function alignBond(mesh, a, b) {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...b);
  const dir = new THREE.Vector3().subVectors(B, A);
  const length = dir.length();
  mesh.position.copy(A).add(B).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  mesh.scale.set(1, length, 1);
}

function makeLine(points, color, opacity = 0.5) {
  const geo = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(...p))
  );
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const line = new THREE.Line(geo, mat);
  line.userData.baseOp = opacity;
  return line;
}

function circlePoints(center, normal, radius, steps = 48) {
  const n = new THREE.Vector3(...normal);
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    n
  );
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const p = new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    p.applyQuaternion(q);
    pts.push([center[0] + p.x, center[1] + p.y, center[2] + p.z]);
  }
  return pts;
}

function cellEdges(size) {
  const h = size / 2;
  const c = [
    [-h, -h, -h],
    [h, -h, -h],
    [h, h, -h],
    [-h, h, -h],
    [-h, -h, h],
    [h, -h, h],
    [h, h, h],
    [-h, h, h],
  ];
  const pairs = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  return pairs.map(([i, j]) => [c[i], c[j]]);
}

function applyPhase(phase, progress, kStart = 1) {
  if (phase === "k") return REST;
  if (phase === "pore") return samplePore(progress);
  if (phase === "h-point") return sampleHEntry(progress, kStart);
  if (phase === "locked") return LOCKED;
  return sampleExchange(progress);
}

export async function startLokelmaHero(canvas, meta = {}) {
  const dataUrl = meta.dataUrl || "hero/lokelma.json";
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error(`Failed to load ${dataUrl}`);
  const structure = await res.json();
  const atoms = structure.atoms;
  const bonds = structure.bonds;
  const framework = atoms.filter((a) => a.element !== "K");
  const kAtoms = atoms.filter((a) => a.element === "K");
  const sites = buildExchangeSites(atoms);
  const pores = buildPoreWindows(atoms, bonds);

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
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  // Aim slightly below the cell so the structure sits mid-stage above the typewriter
  camera.position.set(3.4, 1.45, 12.2);
  camera.lookAt(0, -0.55, 0);

  scene.add(new THREE.AmbientLight(0x9aa4b2, 0.55));
  const key = new THREE.DirectionalLight(0xfff4e5, 1.15);
  key.position.set(6, 8, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x8fb7ff, 0.32);
  fill.position.set(-4, -2, -6);
  scene.add(fill);
  const accent = new THREE.PointLight(PORE_COLOR, 1.05, 14);
  accent.position.set(0, 0.4, 2.2);
  scene.add(accent);

  const root = new THREE.Group();
  scene.add(root);

  // Unit-cell wire
  const cellGroup = new THREE.Group();
  const cellLines = cellEdges(structure.cell.a * SCALE).map(([a, b]) =>
    makeLine([a, b], 0xe4b45a, 0.28)
  );
  cellLines.forEach((l) => cellGroup.add(l));
  root.add(cellGroup);

  // Framework bonds + atoms
  bonds.forEach(([i, j]) => {
    const A = atoms[i];
    const B = atoms[j];
    if (!A || !B) return;
    root.add(
      makeBondMesh(
        [A.x * SCALE, A.y * SCALE, A.z * SCALE],
        [B.x * SCALE, B.y * SCALE, B.z * SCALE]
      )
    );
  });

  const sphereGeo = new THREE.SphereGeometry(1, 14, 14);
  framework.forEach((atom) => {
    const mesh = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(atom.color),
        roughness: 0.4,
        metalness: atom.element === "Zr" ? 0.45 : 0.12,
      })
    );
    mesh.position.set(atom.x * SCALE, atom.y * SCALE, atom.z * SCALE);
    mesh.scale.setScalar(atom.radius * 0.92);
    root.add(mesh);
  });

  // Potassium
  const kGroup = new THREE.Group();
  const kGeo = new THREE.SphereGeometry(1, 20, 20);
  kAtoms.forEach((atom) => {
    const mesh = new THREE.Mesh(
      kGeo,
      new THREE.MeshStandardMaterial({
        color: K_COLOR,
        roughness: 0.22,
        metalness: 0.55,
        emissive: K_COLOR,
        emissiveIntensity: 0.55,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      })
    );
    mesh.position.set(atom.x * SCALE, atom.y * SCALE, atom.z * SCALE);
    mesh.userData.radius = atom.radius * 1.08;
    mesh.scale.setScalar(mesh.userData.radius);
    kGroup.add(mesh);
  });
  root.add(kGroup);

  // Pore windows
  const poreGroup = new THREE.Group();
  poreGroup.visible = false;
  pores.forEach((w) => {
    const g = new THREE.Group();
    const center = w.center.map((c) => c * SCALE);
    const aperture = circlePoints(center, w.normal, PORE_FREE * SCALE);
    g.add(makeLine(aperture, PORE_COLOR, 0.95));
    const window = [...w.oxygens.map((o) => o.map((c) => c * SCALE)), w.oxygens[0].map((c) => c * SCALE)];
    g.add(makeLine(window, PORE_COLOR, 0.7));
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(PORE_FREE * SCALE, 32),
      new THREE.MeshBasicMaterial({
        color: PORE_COLOR,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    disc.position.set(...center);
    disc.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(...w.normal)
    );
    g.add(disc);
    w.oxygens.forEach((o) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 12, 12),
        new THREE.MeshStandardMaterial({
          color: PORE_COLOR,
          emissive: PORE_COLOR,
          emissiveIntensity: 1.15,
          roughness: 0.28,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        })
      );
      m.position.set(o[0] * SCALE, o[1] * SCALE, o[2] * SCALE);
      g.add(m);
    });
    poreGroup.add(g);
  });
  root.add(poreGroup);

  // Hydroxyls
  const hGroup = new THREE.Group();
  hGroup.visible = false;
  const hBondGeo = new THREE.CylinderGeometry(0.016, 0.016, 1, 6);
  const hPairs = sites.hydroxyls.map((site) => {
    const pair = new THREE.Group();
    const atom = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 12),
      new THREE.MeshStandardMaterial({
        color: H_COLOR,
        roughness: 0.25,
        metalness: 0.05,
        emissive: H_COLOR,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      })
    );
    const bond = new THREE.Mesh(
      hBondGeo,
      new THREE.MeshStandardMaterial({
        color: 0xc5d4dc,
        roughness: 0.45,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
    );
    pair.add(atom, bond);
    pair.userData.site = site;
    hGroup.add(pair);
    return pair;
  });
  root.add(hGroup);

  // Exchange flashes
  const flashGroup = new THREE.Group();
  flashGroup.visible = false;
  sites.hydroxyls.forEach((site) => {
    const pos = flashAt(site).map((c) => c * SCALE);
    const pair = new THREE.Group();
    pair.position.set(...pos);
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0xfff6d0,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    core.userData.gain = 1;
    core.userData.scale = 1;
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 12, 12),
      new THREE.MeshBasicMaterial({
        color: K_COLOR,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    halo.userData.gain = 0.32;
    halo.userData.scale = 2.35;
    pair.add(core, halo);
    flashGroup.add(pair);
  });
  root.add(flashGroup);

  let phaseIdx = 0;
  let phaseT = 0;
  let kStart = 1;
  let anim = REST;
  let poreDisplay = 0;

  function applyPoreVisuals(op) {
    poreGroup.visible = op > 0.01;
    const pulse = 0.82 + 0.18 * Math.sin(performance.now() * 0.0021);
    const poreOp = op * pulse;
    poreGroup.traverse((obj) => {
      if (!obj.material || !("opacity" in obj.material)) return;
      if (obj.isLine) {
        obj.material.opacity = (obj.userData.baseOp ?? 0.7) * poreOp;
      } else if (obj.geometry?.type === "CircleGeometry") {
        obj.material.opacity = 0.16 * poreOp;
      } else if (obj.geometry?.type === "SphereGeometry") {
        obj.material.opacity = 0.95 * poreOp;
        if (obj.material.emissiveIntensity != null) {
          obj.material.emissiveIntensity = 1.15 * poreOp;
        }
      }
    });
  }

  function setAnim(next) {
    anim = next;
    root.scale.setScalar(anim.cellScale);

    const glow = anim.cellGlow;
    cellLines.forEach((line) => {
      line.material.opacity = 0.22 + glow * 0.52;
    });

    kGroup.visible = anim.kOp > 0.02;
    kGroup.children.forEach((mesh) => {
      mesh.material.opacity = anim.kOp;
      mesh.material.emissiveIntensity = (0.55 + anim.kLock * 0.45) * anim.kOp;
      mesh.scale.setScalar(mesh.userData.radius * (1 + anim.kLock * 0.08));
    });

    hGroup.visible = anim.hOp > 0.02;
    hPairs.forEach((pair) => {
      const site = pair.userData.site;
      const h = hydroxylAt(site, anim.hMix).map((c) => c * SCALE);
      const atom = pair.children[0];
      const bond = pair.children[1];
      atom.position.set(...h);
      atom.material.opacity = anim.hOp;
      atom.material.emissiveIntensity = 0.7 * anim.hOp;
      alignBond(bond, site.oxygen.map((c) => c * SCALE), h);
      bond.material.opacity = anim.hOp * 0.85;
    });

    flashGroup.visible = anim.flash > 0.02;
    const grow = 0.55 + anim.flash * 1.2;
    flashGroup.children.forEach((pair) => {
      pair.children.forEach((mesh) => {
        mesh.material.opacity = anim.flash * mesh.userData.gain;
        mesh.scale.setScalar(grow * mesh.userData.scale);
      });
    });

    accent.color.setHex(
      anim.hOp > 0.2 || anim.flash > 0.1 ? H_COLOR : PORE_COLOR
    );
    accent.intensity = anim.hOp > 0.2 || anim.flash > 0.1 ? 0.85 : 1.15;
  }

  // Orbit controls (view-relative)
  let userSpin = true;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let resumeTimer = 0;
  const _worldUp = new THREE.Vector3(0, 1, 0);
  const _viewRight = new THREE.Vector3();
  const _viewUp = new THREE.Vector3();
  const rotPerFrame = ((2 * Math.PI) / 60 / 60) * 0.55;

  function orbitByPointer(dx, dy) {
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
  resize();
  window.addEventListener("resize", resize);

  const axesCtx = mountHeroAxes(canvas.closest(".hero-stage"));
  const _ax = new THREE.Vector3();
  let last = performance.now();

  setAnim(REST);

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (userSpin && !dragging) {
      root.rotateOnWorldAxis(_worldUp, rotPerFrame);
    }

    const phase = PHASES[phaseIdx];
    phaseT += dt;
    setNarrationBeat(phase.beat);
    const live =
      phase.id === "pore" || phase.id === "h-point" || phase.id === "exchange";
    const progress = live ? Math.min(1, phaseT / (phase.dur * 0.85)) : 1;
    if (phase.id === "h-point" && phaseT < dt * 1.5) {
      kStart = PHASES[(phaseIdx + PHASES.length - 1) % PHASES.length].id === "pore" ? 0.12 : 1;
    }
    if (phase.id === "locked" && progress >= 1) {
      setAnim(LOCKED);
    } else if (phase.id === "k") {
      setAnim(REST);
    } else {
      setAnim(applyPhase(phase.id, progress, kStart));
    }

    // Smooth pore ring opacity (especially fade-out when leaving the pore beat)
    const poreTarget = anim.poreOp;
    if (poreTarget > poreDisplay) {
      poreDisplay = Math.min(poreTarget, poreDisplay + dt / PORE_FADE_IN);
    } else if (poreTarget < poreDisplay) {
      poreDisplay = Math.max(poreTarget, poreDisplay - dt / PORE_FADE_OUT);
    }
    applyPoreVisuals(poreDisplay);

    // hold at end of phase briefly then advance
    if (phaseT >= phase.dur) {
      phaseT = 0;
      phaseIdx = (phaseIdx + 1) % PHASES.length;
      if (PHASES[phaseIdx].id === "h-point") {
        kStart =
          PHASES[(phaseIdx + PHASES.length - 1) % PHASES.length].id === "pore"
            ? 0.12
            : 1;
      }
    }

    renderer.render(scene, camera);
    drawHeroAxes(axesCtx, (x, y, z) => {
      _ax.set(x, y, z).applyQuaternion(root.quaternion);
      return [_ax.x, _ax.y, _ax.z];
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
