/**
 * Halite fluid-inclusion hero — procedural iron-cross cavities + bacteria.
 * Camera zoom beats (overview → pattern → haven) driven by Theatre.js.
 * Reference: docs/halite_sm_01.png / 02 / 03 (inspiration only — redrawn in Three.js).
 */
import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js";
import { RoomEnvironment } from "https://unpkg.com/three@0.170.0/examples/jsm/environments/RoomEnvironment.js";
import theatre from "./vendor/theatre-core.esm.js";

const { getProject, types } = theatre;

const CRYSTAL = { sx: 11.2, sy: 6.4, sz: 4.6 };
const ARMS = "x"; // "x" | "xy" — match specimen 01 (left–right only)
const DENSITY = "sparse"; // "sparse" | "dense"

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Iron-cross: inclusions only near crystal axes; diagonals stay clear. */
function inIronCross(x, y, arms = ARMS) {
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  if (ax < 0.15 && ay < 0.15) return true; // tiny central core
  const angle = Math.atan2(ay, ax); // 0 = ±X, π/2 = ±Y
  const half = (32 * Math.PI) / 180;
  if (angle <= half) return true;
  if (arms === "xy" && angle >= Math.PI / 2 - half) return true;
  return false;
}

function overlaps(a, b, pad = 0.12) {
  return (
    Math.abs(a.x - b.x) * 2 < a.sx + b.sx + pad &&
    Math.abs(a.y - b.y) * 2 < a.sy + b.sy + pad &&
    Math.abs(a.z - b.z) * 2 < a.sz + b.sz + pad
  );
}

function generateInclusions(rng) {
  const { sx, sy, sz } = CRYSTAL;
  const hx = sx * 0.46;
  const hy = sy * 0.42;
  const hz = sz * 0.38;
  const count = DENSITY === "dense" ? 220 : 95;
  const boxes = [];

  for (let i = 0; i < count * 6 && boxes.length < count; i++) {
    const x = (rng() * 2 - 1) * hx;
    const y = (rng() * 2 - 1) * hy;
    const z = (rng() * 2 - 1) * hz;
    if (!inIronCross(x, y)) continue;

    // Prefer elongated channels along ±Y when in the horizontal arms (matches mid-zoom)
    const roll = rng();
    let bx;
    let by;
    let bz;
    if (roll < 0.28) {
      const s = 0.18 + rng() * 0.28;
      bx = by = bz = s;
    } else if (roll < 0.62) {
      bx = 0.22 + rng() * 0.35;
      by = 0.55 + rng() * 1.1;
      bz = 0.18 + rng() * 0.28;
    } else {
      bx = 0.28 + rng() * 0.55;
      by = 0.28 + rng() * 0.5;
      bz = 0.2 + rng() * 0.35;
    }

    // Keep inside host with a margin
    if (Math.abs(x) + bx / 2 > hx * 0.98) continue;
    if (Math.abs(y) + by / 2 > hy * 0.98) continue;
    if (Math.abs(z) + bz / 2 > hz * 0.98) continue;

    const cand = { x, y, z, sx: bx, sy: by, sz: bz };
    if (boxes.some((b) => overlaps(b, cand))) continue;
    boxes.push(cand);
  }

  // Ensure a few larger “habitat” cavities in the right arm for the close zoom
  const habitats = [
    { x: 3.4, y: 0.15, z: 0.05, sx: 0.85, sy: 1.35, sz: 0.7 },
    { x: 2.55, y: -0.45, z: -0.35, sx: 0.55, sy: 0.95, sz: 0.5 },
    { x: -3.1, y: 0.2, z: 0.2, sx: 0.7, sy: 1.15, sz: 0.55 },
  ];
  for (const h of habitats) {
    if (!boxes.some((b) => overlaps(b, h, 0.05))) boxes.push(h);
  }
  return boxes;
}

function boxEdges(sx, sy, sz) {
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;
  const c = [
    [-hx, -hy, -hz],
    [hx, -hy, -hz],
    [hx, hy, -hz],
    [-hx, hy, -hz],
    [-hx, -hy, hz],
    [hx, -hy, hz],
    [hx, hy, hz],
    [-hx, hy, hz],
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
  const pos = [];
  for (const [i, j] of pairs) {
    pos.push(...c[i], ...c[j]);
  }
  return pos;
}

function spawnBacteria(inclusions, rng) {
  const large = inclusions
    .filter((b) => b.sx * b.sy * b.sz > 0.35)
    .sort((a, b) => b.sx * b.sy * b.sz - a.sx * a.sy * a.sz)
    .slice(0, 4);
  const bugs = [];
  for (const cav of large) {
    const n = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < n; i++) {
      const margin = 0.12;
      bugs.push({
        cav,
        x: cav.x + (rng() - 0.5) * (cav.sx - margin),
        y: cav.y + (rng() - 0.5) * (cav.sy - margin),
        z: cav.z + (rng() - 0.5) * (cav.sz - margin),
        vx: (rng() - 0.5) * 0.35,
        vy: (rng() - 0.5) * 0.35,
        vz: (rng() - 0.5) * 0.25,
        len: 0.14 + rng() * 0.1,
        phase: rng() * Math.PI * 2,
      });
    }
  }
  return bugs;
}

export async function startHaliteHero(canvas, meta = {}) {
  const stateUrl = meta.theatreUrl || "hero/halite-theatre.json";
  const stateRes = await fetch(stateUrl);
  if (!stateRes.ok) throw new Error(`Failed to load ${stateUrl}`);
  const theatreState = await stateRes.json();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x060810, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060810);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(40, 1, 0.08, 200);
  camera.position.set(4.2, 2.8, 16.5);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xb8c0cc, 0.45));
  const key = new THREE.DirectionalLight(0xfff2e4, 1.05);
  key.position.set(8, 12, 10);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9eb6ff, 0.4);
  fill.position.set(-10, -4, -8);
  scene.add(fill);
  const rim = new THREE.PointLight(0xc9b8e8, 0.55, 40);
  rim.position.set(-6, 4, 8);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xd8dee8, 0x1a1c22, 0.35));

  const root = new THREE.Group();
  scene.add(root);

  // Host crystal — pale lavender glass (photo tint), no photo textures
  const hostGeo = new THREE.BoxGeometry(CRYSTAL.sx, CRYSTAL.sy, CRYSTAL.sz);
  const hostMat = new THREE.MeshPhysicalMaterial({
    color: 0xc8c2d4,
    roughness: 0.12,
    metalness: 0.02,
    transmission: 0.72,
    thickness: 2.2,
    ior: 1.54,
    transparent: true,
    opacity: 1,
    clearcoat: 0.55,
    clearcoatRoughness: 0.2,
    attenuationColor: new THREE.Color(0xb0a8c0),
    attenuationDistance: 8,
    side: THREE.DoubleSide,
  });
  const host = new THREE.Mesh(hostGeo, hostMat);
  root.add(host);

  const edgeGeo = new THREE.EdgesGeometry(hostGeo, 20);
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xe8e4f0,
    transparent: true,
    opacity: 0.35,
  });
  root.add(new THREE.LineSegments(edgeGeo, edgeMat));

  const rng = mulberry32(0x5ea15e);
  const inclusions = generateInclusions(rng);

  const cavityMat = new THREE.MeshPhysicalMaterial({
    color: 0x8aa8c4,
    roughness: 0.22,
    metalness: 0,
    transparent: true,
    opacity: 0.22,
    transmission: 0.35,
    thickness: 0.4,
    ior: 1.33,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const rimMat = new THREE.LineBasicMaterial({
    color: 0x2a3038,
    transparent: true,
    opacity: 0.55,
  });

  const cavityGroup = new THREE.Group();
  root.add(cavityGroup);
  const boxGeoCache = new Map();
  function boxGeo(sx, sy, sz) {
    const key = `${sx.toFixed(3)}_${sy.toFixed(3)}_${sz.toFixed(3)}`;
    if (!boxGeoCache.has(key)) boxGeoCache.set(key, new THREE.BoxGeometry(sx, sy, sz));
    return boxGeoCache.get(key);
  }

  inclusions.forEach((inc) => {
    const mesh = new THREE.Mesh(boxGeo(inc.sx, inc.sy, inc.sz), cavityMat);
    mesh.position.set(inc.x, inc.y, inc.z);
    cavityGroup.add(mesh);

    const eg = new THREE.BufferGeometry();
    eg.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(boxEdges(inc.sx, inc.sy, inc.sz), 3)
    );
    const lines = new THREE.LineSegments(eg, rimMat);
    lines.position.copy(mesh.position);
    cavityGroup.add(lines);
  });

  // Bacteria — rods bouncing inside larger cavities (readable on close zoom)
  const bacteria = spawnBacteria(inclusions, rng);
  const bugGroup = new THREE.Group();
  root.add(bugGroup);
  const bugGeo = new THREE.CapsuleGeometry(0.035, 0.12, 3, 6);
  const bugMat = new THREE.MeshPhysicalMaterial({
    color: 0x6a8a78,
    roughness: 0.45,
    emissive: 0x2a4034,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.55,
  });
  const bugMeshes = bacteria.map((b) => {
    const m = new THREE.Mesh(bugGeo, bugMat);
    m.scale.set(1, b.len / 0.12, 1);
    m.position.set(b.x, b.y, b.z);
    bugGroup.add(m);
    return m;
  });

  // Theatre.js camera sequence (01 → 02 → 03)
  const project = getProject("Halite Hero", { state: theatreState });
  const sheet = project.sheet("Zoom");
  const camObj = sheet.object("Camera", {
    position: { x: 4.2, y: 2.8, z: 16.5 },
    lookAt: { x: 0, y: 0, z: 0 },
    fov: types.number(40, { range: [12, 70] }),
  });

  let theatreCam = {
    position: { x: 4.2, y: 2.8, z: 16.5 },
    lookAt: { x: 0, y: 0, z: 0 },
    fov: 40,
  };
  camObj.onValuesChange((v) => {
    theatreCam = v;
  });
  await project.ready;
  sheet.sequence.play({
    iterationCount: Infinity,
    direction: "alternate",
    rate: 0.55,
  });

  // Drag orbit (pauses theatre briefly by rotating the root)
  let userSpin = true;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let resumeTimer = 0;
  const _viewRight = new THREE.Vector3();
  const _viewUp = new THREE.Vector3();
  const rotPerFrame = ((2 * Math.PI) / 60 / 60) * 0.35;

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
    orbitByPointer(e.clientX - lastX, e.clientY - lastY);
    lastX = e.clientX;
    lastY = e.clientY;
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
    }, 2400);
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

  const clock = new THREE.Clock();
  function tickBugs(dt) {
    bacteria.forEach((b, i) => {
      b.vx += (Math.random() - 0.5) * 0.8 * dt;
      b.vy += (Math.random() - 0.5) * 0.8 * dt;
      b.vz += (Math.random() - 0.5) * 0.5 * dt;
      const speed = Math.hypot(b.vx, b.vy, b.vz);
      if (speed > 0.55) {
        b.vx *= 0.55 / speed;
        b.vy *= 0.55 / speed;
        b.vz *= 0.55 / speed;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.z += b.vz * dt;
      const m = 0.08;
      const cav = b.cav;
      const minX = cav.x - cav.sx / 2 + m;
      const maxX = cav.x + cav.sx / 2 - m;
      const minY = cav.y - cav.sy / 2 + m;
      const maxY = cav.y + cav.sy / 2 - m;
      const minZ = cav.z - cav.sz / 2 + m;
      const maxZ = cav.z + cav.sz / 2 - m;
      if (b.x < minX || b.x > maxX) {
        b.vx *= -1;
        b.x = THREE.MathUtils.clamp(b.x, minX, maxX);
      }
      if (b.y < minY || b.y > maxY) {
        b.vy *= -1;
        b.y = THREE.MathUtils.clamp(b.y, minY, maxY);
      }
      if (b.z < minZ || b.z > maxZ) {
        b.vz *= -1;
        b.z = THREE.MathUtils.clamp(b.z, minZ, maxZ);
      }
      const mesh = bugMeshes[i];
      mesh.position.set(b.x, b.y, b.z);
      mesh.rotation.z = Math.atan2(b.vy, b.vx);
      mesh.rotation.x = Math.sin(b.phase + performance.now() * 0.002) * 0.2;
    });
  }

  function tick() {
    const dt = Math.min(0.05, clock.getDelta());
    tickBugs(dt);

    camera.position.set(
      theatreCam.position.x,
      theatreCam.position.y,
      theatreCam.position.z
    );
    camera.lookAt(theatreCam.lookAt.x, theatreCam.lookAt.y, theatreCam.lookAt.z);
    if (camera.fov !== theatreCam.fov) {
      camera.fov = theatreCam.fov;
      camera.updateProjectionMatrix();
    }

    if (userSpin && !dragging) root.rotation.y += rotPerFrame;

    // Fade bacteria visibility with zoom (more visible when close)
    const zoomProx = THREE.MathUtils.clamp(1 - (theatreCam.position.z - 2.5) / 14, 0, 1);
    bugMat.opacity = 0.35 + zoomProx * 0.65;
    bugMat.transparent = true;
    bugMat.emissiveIntensity = 0.2 + zoomProx * 0.55;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}
