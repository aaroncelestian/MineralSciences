/**
 * Halite fluid-inclusion hero — procedural iron-cross cavities + microbes.
 * Physical scale: crystal ≈ 2 mm, bacteria = 1 µm diameter.
 * Camera: overview → pause on pattern → deep dive (Theatre.js) + live scale bar.
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import theatre from "./vendor/theatre-core.esm.js";
import { setPauseButtonState, setPanButtonState } from "./hero-info.js?v=21";

const { getProject, types } = theatre;

/** 1 Three.js unit = 20 µm. Crystal long axis = 2 mm. Bacteria diameter = 1 µm. */
const UM_PER_UNIT = 20;
const CRYSTAL = { sx: 100, sy: 58, sz: 42 }; // 2.00 × 1.16 × 0.84 mm
const BACTERIA_DIAM_UM = 1;
const BACTERIA_R = BACTERIA_DIAM_UM / 2 / UM_PER_UNIT; // 0.025 units
const ARMS = "x";
const DENSITY = "sparse";
const MAX_MICROBES = 320;

/** Featured cubic inclusion for deep-zoom (the “main” cavity in frame). ~14 µm. */
const HABITAT = { x: 30.8, y: 0.9, z: 0.3, sx: 0.72, sy: 0.78, sz: 0.68 };
/** Tall neighbor kept for context — not the focus target. */
const HABITAT_NEIGHBOR = { x: 32.6, y: 0.35, z: 0.15, sx: 0.9, sy: 2.3, sz: 0.75 };

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

function inIronCross(x, y, arms = ARMS) {
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  if (ax < 1.0 && ay < 1.0) return true;
  const angle = Math.atan2(ay, ax);
  const half = (30 * Math.PI) / 180;
  if (angle <= half) return true;
  if (arms === "xy" && angle >= Math.PI / 2 - half) return true;
  return false;
}

function overlaps(a, b, pad = 0.18) {
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
  const count = DENSITY === "dense" ? 468 : 302; // −15% for frame pacing
  const boxes = [];

  for (let i = 0; i < count * 14 && boxes.length < count; i++) {
    const x = (rng() * 2 - 1) * hx;
    const y = (rng() * 2 - 1) * hy;
    const z = (rng() * 2 - 1) * hz;
    if (!inIronCross(x, y)) continue;

    const roll = rng();
    let bx;
    let by;
    let bz;
    if (roll < 0.34) {
      const s = 0.16 + rng() * 0.22; // ~3–8 µm squares
      bx = by = bz = s;
    } else if (roll < 0.72) {
      bx = 0.14 + rng() * 0.22; // ~3–7 µm
      by = 0.35 + rng() * 0.85; // ~7–24 µm elongated
      bz = 0.12 + rng() * 0.18;
    } else {
      bx = 0.22 + rng() * 0.38; // ~4–12 µm
      by = 0.18 + rng() * 0.32;
      bz = 0.14 + rng() * 0.22;
    }

    if (Math.abs(x) + bx / 2 > hx * 0.98) continue;
    if (Math.abs(y) + by / 2 > hy * 0.98) continue;
    if (Math.abs(z) + bz / 2 > hz * 0.98) continue;

    const cand = { x, y, z, sx: bx, sy: by, sz: bz };
    if (boxes.some((b) => overlaps(b, cand))) continue;
    boxes.push(cand);
  }

  boxes.push({ ...HABITAT });
  boxes.push({ ...HABITAT_NEIGHBOR });
  return boxes;
}

function microbeCountFor(inc) {
  const minDim = Math.min(inc.sx, inc.sy, inc.sz);
  if (minDim < BACTERIA_R * 4) return 0;
  // Featured cubic cavity always gets a clear microbe population
  if (
    Math.abs(inc.x - HABITAT.x) < 0.01 &&
    Math.abs(inc.y - HABITAT.y) < 0.01 &&
    Math.abs(inc.z - HABITAT.z) < 0.01
  ) {
    return 8;
  }
  const vol = inc.sx * inc.sy * inc.sz;
  if (vol < 0.2) return 2;
  if (vol < 0.8) return 3;
  if (vol < 2.0) return 4 + Math.floor(vol);
  return Math.min(10, 5 + Math.floor(vol * 0.8));
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
  for (const [i, j] of pairs) pos.push(...c[i], ...c[j]);
  return pos;
}

function spawnMicrobes(inclusions, rng) {
  function isHabitat(inc) {
    return (
      Math.abs(inc.x - HABITAT.x) < 0.01 &&
      Math.abs(inc.y - HABITAT.y) < 0.01 &&
      Math.abs(inc.z - HABITAT.z) < 0.01
    );
  }
  // Featured habitat first, then larger cavities
  const ranked = inclusions
    .map((inc) => ({ inc, n: microbeCountFor(inc) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => {
      const ah = isHabitat(a.inc) ? 1 : 0;
      const bh = isHabitat(b.inc) ? 1 : 0;
      if (ah !== bh) return bh - ah;
      return b.inc.sx * b.inc.sy * b.inc.sz - a.inc.sx * a.inc.sy * a.inc.sz;
    });

  const bugs = [];
  for (const { inc, n } of ranked) {
    if (bugs.length >= MAX_MICROBES) break;
    const take = Math.min(n, MAX_MICROBES - bugs.length);
    for (let i = 0; i < take; i++) {
      const margin = BACTERIA_R * 2.2;
      const roomX = Math.max(0.01, inc.sx - margin);
      const roomY = Math.max(0.01, inc.sy - margin);
      const roomZ = Math.max(0.01, inc.sz - margin);
      bugs.push({
        cav: inc,
        x: inc.x + (rng() - 0.5) * roomX,
        y: inc.y + (rng() - 0.5) * roomY,
        z: inc.z + (rng() - 0.5) * roomZ,
        vx: (rng() - 0.5),
        vy: (rng() - 0.5),
        vz: (rng() - 0.5),
        r: BACTERIA_R * (0.9 + rng() * 0.25),
      });
      // Normalize initial velocity to shared Brownian speed
      const last = bugs[bugs.length - 1];
      const sp = Math.hypot(last.vx, last.vy, last.vz) || 1;
      const s = 0.55 / sp;
      last.vx *= s;
      last.vy *= s;
      last.vz *= s;
    }
  }
  return bugs;
}

function niceScaleUm(raw) {
  if (!(raw > 0) || !Number.isFinite(raw)) return 100;
  const exp = Math.floor(Math.log10(raw));
  const f = raw / 10 ** exp;
  const nice = f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10;
  return nice * 10 ** exp;
}

function formatScale(um) {
  if (um >= 1000) {
    const mm = um / 1000;
    return mm >= 10 ? `${Math.round(mm)} mm` : `${parseFloat(mm.toFixed(2))} mm`;
  }
  if (um >= 10) return `${Math.round(um)} µm`;
  return `${parseFloat(um.toFixed(1))} µm`;
}

function mountScaleBar(host) {
  const root =
    host?.querySelector(".hero-info-root") ||
    host ||
    document.querySelector(".hero");
  if (!root) return null;
  let el = root.querySelector(".hero-scalebar");
  if (!el) {
    el = document.createElement("div");
    el.className = "hero-scalebar";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<span class="hero-scalebar-bar"></span><span class="hero-scalebar-label"></span>';
    root.appendChild(el);
  }
  return el;
}

/** Vertical microscope focus rack — marker tracks Z-focus during hunt holds. */
function mountFocusRack(host) {
  const root =
    host?.querySelector(".hero-info-root") ||
    host ||
    document.querySelector(".hero");
  if (!root) return null;
  let el = root.querySelector(".hero-focusrack");
  if (!el) {
    el = document.createElement("div");
    el.className = "hero-focusrack";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<span class="hero-focusrack-label">Focus</span>' +
      '<div class="hero-focusrack-track">' +
      '<span class="hero-focusrack-ticks"></span>' +
      '<span class="hero-focusrack-marker"></span>' +
      "</div>";
    root.appendChild(el);
  }
  return el;
}

export async function startHaliteHero(canvas, meta = {}) {
  const stateUrl = meta.theatreUrl || "hero/halite-theatre.json";
  const stateRes = await fetch(stateUrl);
  if (!stateRes.ok) throw new Error(`Failed to load ${stateUrl}`);
  const theatreState = await stateRes.json();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // composer handles presentation; MSAA + DOF is costly
    alpha: false,
    powerPreference: "high-performance",
  });
  const dprCap = 1.25;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.setClearColor(0x060810, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060810);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 800);
  camera.position.set(48, 30, 195);
  camera.lookAt(0, 0, 0);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bokehPass = new BokehPass(scene, camera, {
    focus: 195,
    aperture: 0.00012,
    maxblur: 0.009,
  });
  composer.addPass(bokehPass);
  // DOF at 1× pixel ratio — biggest win during zoom
  const DOF_PR = 1;

  scene.add(new THREE.AmbientLight(0xd8dee8, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(60, 90, 80);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc0c8d8, 0.7);
  fill.position.set(-80, -30, -60);
  scene.add(fill);
  const rim = new THREE.PointLight(0xe8eef8, 0.7, 400);
  rim.position.set(-50, 35, 70);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xf2f6fc, 0x1a1c22, 0.55));

  const root = new THREE.Group();
  scene.add(root);

  const hostGeo = new THREE.BoxGeometry(CRYSTAL.sx, CRYSTAL.sy, CRYSTAL.sz);
  // Cool, nearly colorless host — pink faces were tinting the whole frame under DOF blur
  const hostMat = new THREE.MeshStandardMaterial({
    color: 0xe4e8f0,
    roughness: 0.35,
    metalness: 0.02,
    transparent: true,
    opacity: 0.16,
    side: THREE.FrontSide,
    depthWrite: false,
  });
  const hostMesh = new THREE.Mesh(hostGeo, hostMat);
  const hostEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(hostGeo, 20),
    new THREE.LineBasicMaterial({
      color: 0xe8eef8,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      depthTest: false,
    })
  );
  root.add(hostMesh);
  root.add(hostEdges);

  const rng = mulberry32(0x5ea15e);
  const inclusions = generateInclusions(rng);

  // Constant pink (MeshBasic) — Standard+emissive shifts muddy-red under DOF blur
  const cavityMat = new THREE.MeshBasicMaterial({
    color: 0xffc4dc,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    depthTest: true,
    toneMapped: false,
  });
  const cavityMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    cavityMat,
    inclusions.length
  );
  cavityMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  cavityMesh.frustumCulled = true;
  const _cavityDummy = new THREE.Object3D();
  const rimPositions = [];
  inclusions.forEach((inc, i) => {
    _cavityDummy.position.set(inc.x, inc.y, inc.z);
    _cavityDummy.scale.set(inc.sx, inc.sy, inc.sz);
    _cavityDummy.updateMatrix();
    cavityMesh.setMatrixAt(i, _cavityDummy.matrix);
    const local = boxEdges(inc.sx, inc.sy, inc.sz);
    for (let k = 0; k < local.length; k += 3) {
      rimPositions.push(local[k] + inc.x, local[k + 1] + inc.y, local[k + 2] + inc.z);
    }
  });
  cavityMesh.instanceMatrix.needsUpdate = true;
  root.add(cavityMesh);

  const rimGeo = new THREE.BufferGeometry();
  rimGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(rimPositions, 3)
  );
  // Unlit pink rims — stable color at all zoom / DOF levels
  const rimLines = new THREE.LineSegments(
    rimGeo,
    new THREE.LineBasicMaterial({
      color: 0xff9ec8,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
    })
  );
  root.add(rimLines);

  const bacteria = spawnMicrobes(inclusions, rng);
  const bugMat = new THREE.MeshStandardMaterial({
    color: 0x7ecf9a,
    roughness: 0.4,
    metalness: 0.02,
    emissive: 0x2a6b45,
    emissiveIntensity: 0.7,
    transparent: false,
    depthTest: true,
    depthWrite: true,
  });
  const bugMesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 8, 6),
    bugMat,
    Math.max(1, bacteria.length)
  );
  bugMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  bugMesh.frustumCulled = false;
  bugMesh.renderOrder = 3;
  root.add(bugMesh);
  const _dummy = new THREE.Object3D();
  bacteria.forEach((b, i) => {
    _dummy.position.set(b.x, b.y, b.z);
    _dummy.scale.setScalar(b.r);
    _dummy.updateMatrix();
    bugMesh.setMatrixAt(i, _dummy.matrix);
  });
  bugMesh.count = bacteria.length;
  bugMesh.instanceMatrix.needsUpdate = true;
  console.info(
    `[halite] ${inclusions.length} inclusions (instanced), ${bacteria.length} microbes (1 µm)`
  );

  // Depth pass: hide host + solid cavity fills. Solid cavity fronts make every
  // box stacked along a ray share the nearest depth → “behind stays sharp”.
  // Microbes + rim lines keep real per-object depths (planar focus).
  const _bokehRender = bokehPass.render.bind(bokehPass);
  bokehPass.render = (renderer, writeBuffer, readBuffer, deltaTime, maskActive) => {
    hostMesh.visible = false;
    hostEdges.visible = false;
    cavityMesh.visible = false;
    try {
      _bokehRender(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
    } finally {
      hostMesh.visible = true;
      hostEdges.visible = true;
      cavityMesh.visible = true;
    }
  };

  const project = getProject("Halite Hero v13", { state: theatreState });
  const sheet = project.sheet("Zoom");
  const camObj = sheet.object("Camera", {
    position: { x: 48, y: 30, z: 195 },
    lookAt: { x: 0, y: 0, z: 0 },
    fov: types.number(38, { range: [8, 70] }),
  });

  let theatreCam = {
    position: { x: 48, y: 30, z: 195 },
    lookAt: { x: 0, y: 0, z: 0 },
    fov: 38,
  };
  camObj.onValuesChange((v) => {
    theatreCam = v;
  });
  await project.ready;

  const playOpts = {
    iterationCount: Infinity,
    direction: "alternate",
    rate: 0.92,
  };
  function playStory() {
    return sheet.sequence.play(playOpts).catch(() => {
      // Paused / interrupted
    });
  }
  playStory();

  // Microscope focus-hunt windows (match theatre hold beats)
  const FOCUS_HOLDS = [
    { start: 3.2, end: 6.0 }, // pattern (~2 mm) — one focus hunt
    { start: 10.5, end: 17.5 }, // deep — find microbes
  ];
  const FIELD_MM_MAX = 5; // only hunt when FOV ≤ 5 mm

  function activeFocusHold(seqPos) {
    for (const h of FOCUS_HOLDS) {
      if (seqPos >= h.start && seqPos <= h.end) return h;
    }
    return null;
  }

  /** Progress 0→1 through a hold, correct for alternate (reverse) playback. */
  let _prevSeqPos = 0;
  let _seqGoingForward = true;
  function microscopeHoldProgress(seqPos, hold) {
    if (seqPos >= _prevSeqPos) _seqGoingForward = true;
    else if (seqPos < _prevSeqPos) _seqGoingForward = false;
    _prevSeqPos = seqPos;
    const raw = (seqPos - hold.start) / Math.max(1e-4, hold.end - hold.start);
    const u = THREE.MathUtils.clamp(raw, 0, 1);
    return _seqGoingForward ? u : 1 - u;
  }

  function fieldWidthMm(focusDist) {
    const worldH =
      2 * focusDist * Math.tan(((camera.fov || 38) * Math.PI) / 180 / 2);
    const worldWUm = worldH * camera.aspect * UM_PER_UNIT;
    return worldWUm / 1000;
  }

  /** Rack-focus hunt: slide the focal plane, then lock. */
  function microscopeFocus(baseFocus, holdProgress, deep = false) {
    const u = THREE.MathUtils.clamp(holdProgress, 0, 1);
    if (deep) {
      // High-DOF: one clear near→far slide through the stack, then settle on subject
      if (u < 0.78) {
        const h = u / 0.78;
        const ease = h * h * (3 - 2 * h);
        const near = baseFocus * 0.48;
        const far = baseFocus * 1.42;
        return Math.max(0.12, THREE.MathUtils.lerp(near, far, ease));
      }
      const s = (u - 0.78) / 0.22;
      const ease = s * s * (3 - 2 * s);
      return Math.max(0.12, THREE.MathUtils.lerp(baseFocus * 1.18, baseFocus, ease));
    }
    // Pattern (~2 mm): gentler single sweep
    if (u >= 0.55) {
      const s = (u - 0.55) / 0.45;
      const ease = s * s * (3 - 2 * s);
      return THREE.MathUtils.lerp(baseFocus * 1.03, baseFocus, ease);
    }
    const h = u / 0.55;
    const amp = baseFocus * (0.2 * (1 - h * 0.45) + 0.05);
    const wave = Math.sin(h * Math.PI) * Math.exp(-h * 0.4);
    return Math.max(0.15, baseFocus + wave * amp);
  }

  function microscopeAperture(baseAperture, holdProgress, deep = false) {
    const u = THREE.MathUtils.clamp(holdProgress, 0, 1);
    if (deep) {
      // Keep aperture open while sliding so the rack is obvious
      if (u < 0.78) return baseAperture * 1.35;
      const s = (u - 0.78) / 0.22;
      return THREE.MathUtils.lerp(baseAperture * 1.35, baseAperture, s * s * (3 - 2 * s));
    }
    if (u >= 0.55) {
      const s = (u - 0.55) / 0.45;
      return THREE.MathUtils.lerp(baseAperture * 1.2, baseAperture, s * s * (3 - 2 * s));
    }
    return baseAperture * THREE.MathUtils.lerp(1.4, 1.12, u / 0.55);
  }

  const heroHost = canvas.closest(".hero") || document.querySelector(".hero");
  const scaleEl = mountScaleBar(heroHost);
  const scaleBar = scaleEl?.querySelector(".hero-scalebar-bar");
  const scaleLabel = scaleEl?.querySelector(".hero-scalebar-label");
  const focusRackEl = mountFocusRack(heroHost);
  const focusMarker = focusRackEl?.querySelector(".hero-focusrack-marker");
  const focusTrack = focusRackEl?.querySelector(".hero-focusrack-track");

  let paused = false;
  let panMode = false;
  let blending = false;
  let userSpin = true;
  let dragging = false;
  let focusDragging = false;
  /** Manual focus rack 0→1 when paused (0 = nearer, 1 = farther). */
  let userFocusRack = 0.5;
  let lastX = 0;
  let lastY = 0;
  let resumeTimer = 0;
  // Smoothed DOF state — survives beat transitions without infinite-focus pops
  let dofFocus = 195;
  let dofAperture = 0.00012;
  let dofMaxblur = 0.006;
  const exploreTarget = new THREE.Vector3();
  const _panDelta = new THREE.Vector3();
  const _viewRight = new THREE.Vector3();
  const _viewUp = new THREE.Vector3();
  const _worldUp = new THREE.Vector3(0, 1, 0);
  const _look = new THREE.Vector3();
  const _camPos = new THREE.Vector3();
  const _offset = new THREE.Vector3();
  const rotPerFrame = ((2 * Math.PI) / 60 / 60) * 0.28;
  const BLEND_RATE = 2.4;
  const MIN_DIST = 1.2;
  const MAX_DIST = 320;
  const DEEP_OFFSET_ARRIVE = new THREE.Vector3(1.4, 0.25, 2.5); // matches Theatre @ 10.5
  const DEEP_OFFSET_CLOSE = new THREE.Vector3(0.9, 0.15, 1.55); // matches Theatre @ 17.5
  const DEEP_SEQ_START = 10.5;
  const DEEP_SEQ_END = 17.5;
  const DEEP_BLEND_IN = 6.0;
  const _habCam = new THREE.Vector3();
  const _habLook = new THREE.Vector3();
  const _blendCam = new THREE.Vector3();
  const _blendLook = new THREE.Vector3();

  function trackSequenceDirection(seqPos) {
    if (seqPos >= _prevSeqPos) _seqGoingForward = true;
    else if (seqPos < _prevSeqPos) _seqGoingForward = false;
    _prevSeqPos = seqPos;
  }

  function habitatWorld(out = _look) {
    out.set(HABITAT.x, HABITAT.y, HABITAT.z);
    root.updateMatrixWorld(true);
    root.localToWorld(out);
    return out;
  }

  function deepCloseness(seqPos) {
    const raw = (seqPos - DEEP_SEQ_START) / (DEEP_SEQ_END - DEEP_SEQ_START);
    return THREE.MathUtils.clamp(raw, 0, 1);
  }

  function isDeepBeat(seqPos) {
    return seqPos >= DEEP_SEQ_START && seqPos <= DEEP_SEQ_END;
  }

  /** 0→1 ease into deep framing during the dive (smoothstep; works on reverse too). */
  function deepBlend(seqPos) {
    if (seqPos >= DEEP_SEQ_START && seqPos <= DEEP_SEQ_END) return 1;
    if (seqPos > DEEP_BLEND_IN && seqPos < DEEP_SEQ_START) {
      const u = (seqPos - DEEP_BLEND_IN) / (DEEP_SEQ_START - DEEP_BLEND_IN);
      return u * u * (3 - 2 * u);
    }
    return 0;
  }

  /** Theatre poses are authored in crystal-local space — always transform by root. */
  function theatrePoseWorld(outCam, outLook) {
    outCam.set(
      theatreCam.position.x,
      theatreCam.position.y,
      theatreCam.position.z
    );
    outLook.set(theatreCam.lookAt.x, theatreCam.lookAt.y, theatreCam.lookAt.z);
    root.updateMatrixWorld(true);
    root.localToWorld(outCam);
    root.localToWorld(outLook);
  }

  function habitatCameraLocal(closeness, outCam, outLook) {
    const c = THREE.MathUtils.clamp(closeness, 0, 1);
    _offset.copy(DEEP_OFFSET_ARRIVE).lerp(DEEP_OFFSET_CLOSE, c);
    outCam.set(
      HABITAT.x + _offset.x,
      HABITAT.y + _offset.y,
      HABITAT.z + _offset.z
    );
    outLook.set(HABITAT.x, HABITAT.y, HABITAT.z);
    root.updateMatrixWorld(true);
    root.localToWorld(outCam);
    root.localToWorld(outLook);
  }

  function storyLookAt(target = _look) {
    theatrePoseWorld(_habCam, target);
    return target;
  }

  function applyHabitatCenteredCamera(closeness, fov) {
    habitatCameraLocal(closeness, _habCam, _look);
    camera.position.copy(_habCam);
    camera.lookAt(_look);
    if (fov != null && Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }

  function applyStoryCamera() {
    const seqPos = sheet.sequence.position;
    trackSequenceDirection(seqPos);
    // Follow Theatre only (local→world). Deep offsets match keyframes so there is
    // no hard cut when entering the inclusion; alternate reverse zooms back out.
    theatrePoseWorld(_camPos, _look);
    camera.position.copy(_camPos);
    camera.lookAt(_look);
    if (Math.abs(camera.fov - theatreCam.fov) > 0.01) {
      camera.fov = theatreCam.fov;
      camera.updateProjectionMatrix();
    }
  }

  function setPaused(next) {
    if (next === paused && !blending) return;
    paused = next;
    blending = false;
    focusDragging = false;
    setPauseButtonState(paused);
    if (paused) {
      sheet.sequence.pause();
      userSpin = false;
      clearTimeout(resumeTimer);
      storyLookAt(exploreTarget);
      const dist = camera.position.distanceTo(exploreTarget);
      userFocusRack = rackFromFocus(dofFocus, dist);
      setFocusRackInteractive(true);
    } else {
      setPanMode(false);
      setFocusRackInteractive(false);
      blending = true;
    }
  }

  function setPanMode(next) {
    const on = !!next;
    if (on === panMode) {
      setPanButtonState(panMode);
      return;
    }
    if (on && !paused) setPaused(true);
    if (!paused && on) return; // pause rejected
    panMode = on && paused;
    setPanButtonState(panMode);
    canvas.classList.toggle("is-panning", panMode);
  }

  function focusSpan(focusDist) {
    // Wider travel when paused or deep-DOF sliding so the rack reads clearly
    return Math.max(0.5, focusDist * (paused ? 0.55 : 0.42));
  }

  function rackFromFocus(focus, focusDist) {
    return THREE.MathUtils.clamp(
      0.5 + (focus - focusDist) / focusSpan(focusDist),
      0.04,
      0.96
    );
  }

  function focusFromRack(rack, focusDist) {
    return Math.max(0.12, focusDist + (rack - 0.5) * focusSpan(focusDist));
  }

  function setFocusRackInteractive(on) {
    if (!focusRackEl) return;
    focusRackEl.classList.toggle("is-interactive", on);
    focusRackEl.setAttribute("aria-hidden", on ? "false" : "true");
    if (on) {
      focusRackEl.setAttribute("role", "slider");
      focusRackEl.setAttribute("aria-label", "Focus");
      focusRackEl.setAttribute("aria-orientation", "vertical");
      focusRackEl.setAttribute("aria-valuemin", "0");
      focusRackEl.setAttribute("aria-valuemax", "100");
    } else {
      focusRackEl.removeAttribute("role");
      focusRackEl.removeAttribute("aria-label");
      focusRackEl.removeAttribute("aria-orientation");
      focusRackEl.removeAttribute("aria-valuemin");
      focusRackEl.removeAttribute("aria-valuemax");
      focusRackEl.removeAttribute("aria-valuenow");
    }
  }

  function setUserFocusFromClientY(clientY) {
    if (!focusTrack) return;
    const rect = focusTrack.getBoundingClientRect();
    if (rect.height < 1) return;
    userFocusRack = THREE.MathUtils.clamp(
      (clientY - rect.top) / rect.height,
      0.04,
      0.96
    );
    if (focusRackEl) {
      focusRackEl.setAttribute(
        "aria-valuenow",
        String(Math.round(userFocusRack * 100))
      );
    }
  }

  heroHost?.addEventListener("hero:pause-toggle", () => {
    setPaused(!paused);
  });
  heroHost?.addEventListener("hero:pan-toggle", () => {
    setPanMode(!panMode);
  });
  setPauseButtonState(false);
  setPanButtonState(false);
  setFocusRackInteractive(false);

  function onFocusPointerDown(e) {
    if (!paused) return;
    e.preventDefault();
    e.stopPropagation();
    focusDragging = true;
    setUserFocusFromClientY(e.clientY);
    focusTrack?.setPointerCapture?.(e.pointerId);
    focusRackEl?.classList.add("is-dragging");
  }
  function onFocusPointerMove(e) {
    if (!focusDragging) return;
    e.preventDefault();
    e.stopPropagation();
    setUserFocusFromClientY(e.clientY);
  }
  function onFocusPointerUp(e) {
    if (!focusDragging) return;
    e.stopPropagation();
    focusDragging = false;
    focusRackEl?.classList.remove("is-dragging");
    try {
      focusTrack?.releasePointerCapture?.(e.pointerId);
    } catch (_) {}
  }
  function onFocusWheel(e) {
    if (!paused) return;
    e.preventDefault();
    e.stopPropagation();
    userFocusRack = THREE.MathUtils.clamp(
      userFocusRack + e.deltaY * 0.0012,
      0.04,
      0.96
    );
    if (focusRackEl) {
      focusRackEl.setAttribute(
        "aria-valuenow",
        String(Math.round(userFocusRack * 100))
      );
    }
  }
  if (focusTrack) {
    focusTrack.addEventListener("pointerdown", onFocusPointerDown);
    focusTrack.addEventListener("pointermove", onFocusPointerMove);
    focusTrack.addEventListener("pointerup", onFocusPointerUp);
    focusTrack.addEventListener("pointercancel", onFocusPointerUp);
    focusRackEl?.addEventListener("wheel", onFocusWheel, { passive: false });
  }

  function orbitByPointer(dx, dy) {
    // Turntable: yaw around fixed world +Y, pitch around screen-right.
    // (Camera-view tumble + Euler auto-spin was fighting and felt like loose XYZ.)
    root.rotateOnWorldAxis(_worldUp, dx * 0.005);
    _viewRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    // Keep pitch axis horizontal so we don't accumulate roll
    _viewRight.addScaledVector(_worldUp, -_viewRight.dot(_worldUp));
    if (_viewRight.lengthSq() > 1e-8) {
      _viewRight.normalize();
      root.rotateOnWorldAxis(_viewRight, dy * 0.004);
    }
  }

  function spinRoot(angle) {
    root.rotateOnWorldAxis(_worldUp, angle);
  }

  function panByPointer(dx, dy) {
    const dist = camera.position.distanceTo(exploreTarget);
    const worldH =
      2 * Math.max(dist, 0.2) * Math.tan((camera.fov * Math.PI) / 180 / 2);
    const pxToWorld = worldH / Math.max(1, viewH);
    _viewRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    _viewUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    _panDelta
      .copy(_viewRight)
      .multiplyScalar(-dx * pxToWorld)
      .addScaledVector(_viewUp, dy * pxToWorld);
    camera.position.add(_panDelta);
    exploreTarget.add(_panDelta);
    camera.lookAt(exploreTarget);
  }

  function zoomByWheel(deltaY) {
    _look.copy(exploreTarget);
    _offset.copy(camera.position).sub(_look);
    const dist = _offset.length();
    if (dist < 1e-4) return;
    const factor = Math.exp(deltaY * 0.00115);
    const next = THREE.MathUtils.clamp(dist * factor, MIN_DIST, MAX_DIST);
    _offset.multiplyScalar(next / dist);
    camera.position.copy(_look).add(_offset);
    camera.lookAt(_look);
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
    if (panMode && paused) panByPointer(dx, dy);
    else orbitByPointer(dx, dy);
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
    if (!paused) {
      resumeTimer = setTimeout(() => {
        userSpin = true;
      }, 2400);
    }
  }
  function onWheel(e) {
    if (!paused) return;
    e.preventDefault();
    zoomByWheel(e.deltaY);
  }
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("lostpointercapture", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  let viewW = 1;
  let viewH = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    viewW = Math.max(1, Math.round(rect.width) || window.innerWidth);
    viewH =
      Math.max(1, Math.round(rect.height)) ||
      Math.min(Math.round(window.innerHeight * 0.6), 760);
    camera.aspect = viewW / viewH;
    camera.updateProjectionMatrix();
    renderer.setSize(viewW, viewH, false);
    composer.setSize(viewW, viewH);
    composer.setPixelRatio(DOF_PR);
  }
  resize();
  window.addEventListener("resize", resize);

  function updateScaleBar() {
    if (!scaleBar || !scaleLabel) return;
    if (paused) _look.copy(exploreTarget);
    else storyLookAt(_look);
    const dist = camera.position.distanceTo(_look);
    const worldH = 2 * dist * Math.tan((camera.fov * Math.PI) / 180 / 2);
    const worldW = worldH * camera.aspect;
    const worldWUm = worldW * UM_PER_UNIT;
    const targetUm = worldWUm * (110 / viewW);
    const barUm = niceScaleUm(targetUm);
    const barPx = Math.max(28, Math.min(220, (barUm / worldWUm) * viewW));
    scaleBar.style.width = `${barPx.toFixed(1)}px`;
    scaleLabel.textContent = formatScale(barUm);
  }

  function blendTowardStory(dt) {
    const alpha = 1 - Math.exp(-BLEND_RATE * dt);
    trackSequenceDirection(sheet.sequence.position);
    theatrePoseWorld(_camPos, _look);
    const targetFov = theatreCam.fov;
    camera.position.lerp(_camPos, alpha);
    camera.fov += (targetFov - camera.fov) * alpha;
    camera.updateProjectionMatrix();
    camera.lookAt(_look);

    const posErr = camera.position.distanceTo(_camPos);
    const fovErr = Math.abs(camera.fov - targetFov);
    if (posErr < 0.35 && fovErr < 0.35) {
      applyStoryCamera();
      blending = false;
      playStory();
      userSpin = true;
    }
  }

  function updateFocusRack(hunting, focusDist, targetFocus) {
    if (!focusRackEl || !focusMarker) return;
    focusRackEl.classList.toggle("is-active", hunting);
    if (paused) {
      focusMarker.style.setProperty("--rack", userFocusRack.toFixed(3));
      return;
    }
    // Map focus plane vs subject distance → marker travel (0 = near/top, 1 = far/bottom)
    const rack = rackFromFocus(targetFocus ?? focusDist, focusDist);
    focusMarker.style.setProperty("--rack", rack.toFixed(3));
  }

  const clock = new THREE.Clock();
  // Shared Brownian speed (world units / s) — same for every microbe
  const BROWNIAN_SPEED = 0.55;
  const BROWNIAN_KICK = 2.2;
  let bugCursor = 0;
  const _prevCam = new THREE.Vector3().copy(camera.position);
  let camSpeed = 0;

  function tickBugs(dt, focusDist, budget) {
    if (!bacteria.length) return;
    // Far away: animate a slice each frame. Close: update everyone.
    const slice =
      focusDist > 60
        ? Math.max(24, Math.ceil(bacteria.length / 4))
        : focusDist > 25
          ? Math.max(48, Math.ceil(bacteria.length / 2))
          : bacteria.length;
    const n = Math.min(budget ?? slice, bacteria.length);
    for (let nDone = 0; nDone < n; nDone++) {
      const i = bugCursor % bacteria.length;
      bugCursor++;
      const b = bacteria[i];
      b.vx += (Math.random() - 0.5) * BROWNIAN_KICK * dt;
      b.vy += (Math.random() - 0.5) * BROWNIAN_KICK * dt;
      b.vz += (Math.random() - 0.5) * BROWNIAN_KICK * dt;
      let speed = Math.hypot(b.vx, b.vy, b.vz);
      if (speed < 1e-6) {
        b.vx = Math.random() - 0.5;
        b.vy = Math.random() - 0.5;
        b.vz = Math.random() - 0.5;
        speed = Math.hypot(b.vx, b.vy, b.vz);
      }
      const scale = BROWNIAN_SPEED / speed;
      b.vx *= scale;
      b.vy *= scale;
      b.vz *= scale;

      // Scale motion by how many frames since last update for this bug
      const step = dt * (bacteria.length / n);
      b.x += b.vx * step;
      b.y += b.vy * step;
      b.z += b.vz * step;
      const m = b.r * 1.15;
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
      speed = Math.hypot(b.vx, b.vy, b.vz) || 1;
      const s2 = BROWNIAN_SPEED / speed;
      b.vx *= s2;
      b.vy *= s2;
      b.vz *= s2;

      _dummy.position.set(b.x, b.y, b.z);
      _dummy.scale.setScalar(b.r);
      _dummy.updateMatrix();
      bugMesh.setMatrixAt(i, _dummy.matrix);
    }
    bugMesh.instanceMatrix.needsUpdate = true;
  }

  function tick() {
    const dt = Math.min(0.05, clock.getDelta());

    // Safety: never leave DOF depth-pass hides stuck off after an error
    hostMesh.visible = true;
    hostEdges.visible = true;
    cavityMesh.visible = true;

    if (paused) {
      camera.lookAt(exploreTarget);
    } else if (blending) {
      blendTowardStory(dt);
    } else {
      applyStoryCamera();
      const seqPos = sheet.sequence.position;
      // Keep a little spin except while fully locked on the inclusion
      if (deepBlend(seqPos) < 0.85 && userSpin && !dragging) {
        spinRoot(rotPerFrame);
      }
    }

    if (paused) _look.copy(exploreTarget);
    else storyLookAt(_look);
    const focusDist = camera.position.distanceTo(_look);
    // Bokeh uses view-space Z (planar focus), not Euclidean distance — match it
    _offset.copy(_look).sub(camera.position);
    camera.getWorldDirection(_viewUp);
    const focusViewZ = -_offset.dot(_viewUp); // positive distance along view axis
    camSpeed = camera.position.distanceTo(_prevCam) / Math.max(dt, 1e-4);
    _prevCam.copy(camera.position);

    const movingFast = camSpeed > 12 || blending;
    const fieldMm = fieldWidthMm(focusDist);
    // Mild DOF from ~1.5 mm FOV; strong only at deep inclusion scales
    const dofAmt = 1 - THREE.MathUtils.smoothstep(fieldMm, 0.04, 1.5);
    const wantDof = dofAmt > 0.08;
    const seqPos = sheet.sequence.position;
    const hold = !paused && fieldMm <= FIELD_MM_MAX ? activeFocusHold(seqPos) : null;
    bokehPass.enabled = wantDof;

    tickBugs(dt, focusDist, movingFast && !hold ? Math.ceil(bacteria.length / 6) : undefined);

    bugMat.emissiveIntensity = focusDist < 20 ? 0.95 : 0.65;

    let rackEucl = focusDist;
    let slidingFocus = false;
    if (bokehPass.enabled) {
      const dofCurve = dofAmt * dofAmt;
      let targetFocus = focusViewZ;
      let targetAperture = THREE.MathUtils.lerp(0.00006, 0.00085, dofCurve);
      let targetMaxblur = THREE.MathUtils.lerp(0.004, 0.028, dofCurve);
      const deep = isDeepBeat(seqPos) || dofAmt > 0.55;

      if (paused) {
        const eucl = focusFromRack(userFocusRack, focusDist);
        rackEucl = eucl;
        targetFocus = eucl * (focusViewZ / Math.max(focusDist, 1e-4));
        targetAperture *= 1.05;
        targetMaxblur *= 1.05;
      } else if (hold || (deep && wantDof)) {
        // Slide focus through the stack whenever DOF is strong
        const slideHold = hold || { start: DEEP_SEQ_START, end: DEEP_SEQ_END };
        const progress = microscopeHoldProgress(seqPos, slideHold);
        const eucl = microscopeFocus(focusDist, progress, deep);
        rackEucl = eucl;
        targetFocus = eucl * (focusViewZ / Math.max(focusDist, 1e-4));
        targetAperture = microscopeAperture(targetAperture, progress, deep);
        slidingFocus = progress < 0.78;
        if (deep) {
          targetMaxblur = Math.max(targetMaxblur, 0.026 * Math.max(dofAmt, 0.5));
          targetAperture = Math.max(targetAperture, 0.0007 * Math.max(dofAmt, 0.5));
        }
      } else if (movingFast) {
        targetMaxblur *= 0.8;
      }

      const ease = 1 - Math.exp(-(focusDragging ? 28 : slidingFocus ? 16 : movingFast ? 6 : 10) * dt);
      dofFocus += (targetFocus - dofFocus) * ease;
      dofAperture += (targetAperture - dofAperture) * ease;
      dofMaxblur += (targetMaxblur - dofMaxblur) * ease;

      bokehPass.uniforms.focus.value = dofFocus;
      bokehPass.uniforms.aperture.value = dofAperture;
      bokehPass.uniforms.maxblur.value = dofMaxblur;
      bokehPass.uniforms.nearClip.value = camera.near;
      bokehPass.uniforms.farClip.value = camera.far;
      composer.render();
    } else {
      dofFocus = focusViewZ;
      dofAperture = 0;
      dofMaxblur = 0;
      bokehPass.uniforms.aperture.value = 0;
      bokehPass.uniforms.maxblur.value = 0;
      renderer.render(scene, camera);
    }

    updateScaleBar();
    updateFocusRack(
      !!hold || slidingFocus || (paused && wantDof) || (wantDof && isDeepBeat(seqPos)),
      focusDist,
      rackEucl
    );
    requestAnimationFrame(tick);
  }
  tick();
}
