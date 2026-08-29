// Hero — α-quartz reciprocal space / Ewald construction
// Space group P3₂21 · a=4.913 Å · c=5.405 Å · Cu Kα λ=1.5418 Å

import { mountHeroAxes, drawHeroAxes } from "./hero-axes.js?v=14";

export function startQuartzHero(canvas) {
  if (!canvas) throw new Error("hero-canvas element missing");
  const ctx = canvas.getContext("2d");
  const axesCtx = mountHeroAxes(canvas.closest(".hero-stage"));

  let W, H, cx, cy, pxPerQ, hudTop = 84;
  let t = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let autoSpin = true;
  let resumeTimer = 0;

  // View-space rotation matrix (row-major). Avoids Euler "pitch always about model X".
  function rotXM(a) {
    const c = Math.cos(a),
      s = Math.sin(a);
    return [1, 0, 0, 0, c, -s, 0, s, c];
  }
  function rotYM(a) {
    const c = Math.cos(a),
      s = Math.sin(a);
    return [c, 0, s, 0, 1, 0, -s, 0, c];
  }
  function rotZM(a) {
    const c = Math.cos(a),
      s = Math.sin(a);
    return [c, -s, 0, s, c, 0, 0, 0, 1];
  }
  function mulM(A, B) {
    const C = new Array(9);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        C[r * 3 + c] =
          A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c];
      }
    }
    return C;
  }
  function mulMV(M, x, y, z) {
    return [
      M[0] * x + M[1] * y + M[2] * z,
      M[3] * x + M[4] * y + M[5] * z,
      M[6] * x + M[7] * y + M[8] * z,
    ];
  }
  // Match prior starting pose: Rz(0.12) · Ry(0.35) · Rx(0.55)
  let R = mulM(rotZM(0.12), mulM(rotYM(0.35), rotXM(0.55)));

  const a = 4.913;
  const cCell = 5.405;
  // Reciprocal lattice in Å⁻¹ (crystallographic 1/d convention — matches |k|=1/λ)
  const aStar = 2 / (a * Math.sqrt(3));
  const bStar = aStar;
  const cStar = 1 / cCell;
  const lambda = 1.5418;
  const ewaldR = 1 / lambda;

  const REFLECTIONS = (() => {
    const out = [];
    for (let h = -4; h <= 4; h++) {
      for (let k = -4; k <= 4; k++) {
        for (let l = -5; l <= 5; l++) {
          if (h === 0 && k === 0 && l === 0) continue;
          // P3₂21: 00l only if l = 3n
          if (h === 0 && k === 0 && l % 3 !== 0) continue;

          // Hexagonal reciprocal metric
          const qx = aStar * (h - k / 2);
          const qy = bStar * ((k * Math.sqrt(3)) / 2);
          const qz = cStar * l;
          const q = Math.hypot(qx, qy, qz);
          if (q > 0.9) continue;

          const ring = h * h + k * k + h * k;
          const sf =
            10 +
            8 * Math.cos((2 * Math.PI * (h + k)) / 3) +
            6 * Math.cos(0.7 * h + 0.5 * k + 0.9 * l) +
            (ring % 3 === 0 ? 4 : 0);
          const I0 = Math.abs(sf) * Math.exp(-0.85 * q * q);
          if (I0 < 5.5) continue;
          out.push({ h, k, l, qx, qy, qz, q, I0 });
        }
      }
    }
    const mx = Math.max(...out.map((r) => r.I0), 1);
    out.forEach((r) => {
      r.I0 /= mx;
    });
    return out;
  })();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = canvas.width = Math.max(1, Math.round(rect.width) || window.innerWidth);
    H = canvas.height = Math.max(
      1,
      Math.round(rect.height) || Math.min(Math.round(window.innerHeight * 0.55), 620)
    );
    // Center in the clear band between nav (top) and typewriter (bottom)
    const padTop = Math.max(64, Math.round(H * 0.09));
    const padBottom = Math.max(120, Math.round(H * 0.2));
    cx = W * 0.5;
    cy = padTop + (H - padTop - padBottom) * 0.5;
    pxPerQ = (0.32 * Math.min(W, H - padTop - padBottom)) / ewaldR;
    hudTop = padTop + 6;
  }

  function xform(x, y, z) {
    return mulMV(R, x, y, z);
  }

  function project(x, y, z) {
    const persp = 6.5 / (6.5 + z * 0.55);
    return [x * pxPerQ * persp, y * pxPerQ * persp, z];
  }

  function line(pts, color, width, dash) {
    if (!pts || pts.length < 2) return;
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash || []);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function spot(x, y, I, depth) {
    const d = depth * 0.5 + 0.5;
    const s = Math.pow(Math.max(I, 0), 0.5);
    // Compact Bragg node — soft halo, then a crisp core (less fog)
    const r = (1.4 + s * 8.5) * (0.85 + d * 0.2);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.65);
    g.addColorStop(0, `rgba(255,255,255,${Math.min(0.78, 0.22 + s * 0.55)})`);
    g.addColorStop(0.45, `rgba(160,205,255,${Math.min(0.42, 0.1 + s * 0.38)})`);
    g.addColorStop(1, "rgba(40,80,160,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(230,245,255,${Math.min(0.9, 0.35 + s * 0.5)})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1.1, r * 0.28), 0, Math.PI * 2);
    ctx.fill();
  }

  function ghost(x, y, I, depth) {
    const d = depth * 0.5 + 0.5;
    const a0 = (0.06 + I * 0.18) * (0.4 + d * 0.5);
    const r = 1.6 + I * 4;
    ctx.fillStyle = `rgba(130,180,230,${a0})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function miller(h, k, l) {
    const b = (n) => (n < 0 ? bar(Math.abs(n)) : String(n));
    const bar = (n) => n + "\u0304";
    return b(h) + b(k) + b(l);
  }

  function drawEwald() {
    const N = 72;
    // latitude rings
    for (let ring = 1; ring <= 4; ring++) {
      const phi = (ring / 5) * Math.PI;
      const pts = [];
      for (let i = 0; i <= N; i++) {
        const th = (i / N) * Math.PI * 2;
        let x = ewaldR * Math.sin(phi) * Math.cos(th);
        let y = ewaldR * Math.sin(phi) * Math.sin(th);
        let z = ewaldR * Math.cos(phi) - ewaldR;
        [x, y, z] = xform(x, y, z);
        pts.push(project(x, y, z));
      }
      line(pts, "rgba(140,195,255,0.55)", 1.55, [5, 5]);
    }
    // meridians (6-fold echo of hexagonal symmetry)
    for (let m = 0; m < 6; m++) {
      const th0 = (m * Math.PI) / 3;
      const pts = [];
      for (let i = 0; i <= N; i++) {
        const phi = (i / N) * Math.PI;
        let x = ewaldR * Math.sin(phi) * Math.cos(th0);
        let y = ewaldR * Math.sin(phi) * Math.sin(th0);
        let z = ewaldR * Math.cos(phi) - ewaldR;
        [x, y, z] = xform(x, y, z);
        pts.push(project(x, y, z));
      }
      line(pts, "rgba(120,175,255,0.42)", 1.35, [3, 6]);
    }

    // incident beam → origin → sample of diffracted direction
    const o = project(...xform(0, 0, 0));
    const kin = project(...xform(0, 0, -ewaldR * 2.1));
    const kout = project(...xform(ewaldR * 0.7, ewaldR * 0.15, ewaldR * 0.35));
    line([kin, o], "rgba(255,205,120,0.95)", 2.2);
    line([o, kout], "rgba(255,200,110,0.55)", 1.6, [5, 4]);
    ctx.fillStyle = "rgba(255,230,160,1)";
    ctx.beginPath();
    ctx.arc(o[0], o[1], 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,220,150,0.9)";
    ctx.font = "12px 'IBM Plex Mono', monospace";
    ctx.fillText("kᵢ", kin[0] + 6, kin[1] - 4);
    ctx.fillText("0", o[0] + 7, o[1] + 13);
  }

  function drawReciprocalCell() {
    const o = [0, 0, 0];
    const a1 = [aStar, 0, 0];
    const a2 = [-0.5 * aStar, (Math.sqrt(3) / 2) * aStar, 0];
    const cc = [0, 0, cStar];
    const C = [
      o,
      a1,
      [a1[0] + a2[0], a1[1] + a2[1], 0],
      a2,
      cc,
      [a1[0], a1[1], cStar],
      [a1[0] + a2[0], a1[1] + a2[1], cStar],
      [a2[0], a2[1], cStar],
    ].map((p) => project(...xform(...p)));
    const E = [
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
    E.forEach(([i, j]) => line([C[i], C[j]], "rgba(190,240,255,0.95)", 2.1));
    ctx.fillStyle = "rgba(210,245,255,0.95)";
    ctx.font = "13px 'IBM Plex Mono', monospace";
    ctx.fillText("a*", C[1][0] + 6, C[1][1]);
    ctx.fillText("a₂*", C[3][0] + 6, C[3][1]);
    ctx.fillText("c*", C[4][0] + 6, C[4][1] - 4);
  }

  function drawDirectCell() {
    const s = 0.085;
    const o = [-1.15, 0.85, -0.2];
    const a1 = [a * s, 0, 0];
    const a2 = [-0.5 * a * s, (Math.sqrt(3) / 2) * a * s, 0];
    const cc = [0, 0, cCell * s];
    const add = (u, v) => [u[0] + v[0], u[1] + v[1], u[2] + v[2]];
    const C = [
      o,
      add(o, a1),
      add(add(o, a1), a2),
      add(o, a2),
      add(o, cc),
      add(add(o, a1), cc),
      add(add(add(o, a1), a2), cc),
      add(add(o, a2), cc),
    ].map((p) => project(...xform(...p)));
    const E = [
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
    E.forEach(([i, j]) => line([C[i], C[j]], "rgba(255,185,130,0.92)", 1.9));
    ctx.fillStyle = "rgba(255,200,150,0.95)";
    ctx.font = "12px 'IBM Plex Mono', monospace";
    ctx.fillText("real cell", C[0][0] - 4, C[0][1] + 14);
  }

  function drawScrew32() {
    const pts = [];
    const N = 80;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const z = (u - 0.5) * cStar * 5.5;
      const ang = u * (4 / 3) * Math.PI * 2; // 3₂: 120° per c
      const r = 0.12;
      pts.push(project(...xform(r * Math.cos(ang), r * Math.sin(ang), z)));
    }
    line(pts, "rgba(255,150,210,0.95)", 2.6);
    const shaft = [];
    for (let i = 0; i <= 24; i++) {
      const z = ((i / 24) - 0.5) * cStar * 5.8;
      shaft.push(project(...xform(0, 0, z)));
    }
    line(shaft, "rgba(255,140,200,0.7)", 1.6, [3, 4]);
    const tip = shaft[shaft.length - 1];
    ctx.fillStyle = "rgba(255,180,220,1)";
    ctx.font = "bold 14px 'IBM Plex Mono', monospace";
    ctx.fillText("3₂", tip[0] + 8, tip[1] - 2);
  }

  function drawSymmetryRays() {
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3;
      const pts = [];
      for (let r = 0.08; r <= 1.35; r += 0.08) {
        pts.push(project(...xform(r * Math.cos(ang), r * Math.sin(ang), 0)));
      }
      line(pts, i % 2 === 0 ? "rgba(150,210,255,0.45)" : "rgba(150,210,255,0.28)", 1.25, [
        2, 5,
      ]);
    }
    // 3-fold marker at origin in hk0
    for (let i = 0; i < 3; i++) {
      const ang = (i * 2 * Math.PI) / 3 + t * 0.15;
      const p0 = project(...xform(0, 0, 0));
      const p1 = project(...xform(0.22 * Math.cos(ang), 0.22 * Math.sin(ang), 0));
      line([p0, p1], "rgba(255,170,215,0.75)", 1.8);
    }
  }

  function drawHUD() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = "12px 'IBM Plex Mono', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const rows = [
      ["α-SiO₂   P3₂21  (#154)", "rgba(210,235,255,0.9)"],
      ["a = 4.913 Å    c = 5.405 Å", "rgba(160,200,255,0.7)"],
      ["Cu Kα   λ = 1.5418 Å", "rgba(160,200,255,0.7)"],
      ["|k| = 1/λ   (Ewald)", "rgba(160,200,255,0.65)"],
      ["2 d sinθ = n λ", "rgba(160,200,255,0.65)"],
      ["00ℓ: ℓ = 3n   (screw)", "rgba(255,170,210,0.7)"],
      ["q = h a* + k b* + ℓ c*", "rgba(160,200,255,0.65)"],
    ];
    rows.forEach((row, i) => {
      ctx.fillStyle = row[1];
      ctx.fillText(row[0], 16, hudTop + i * 16);
    });
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(140,180,230,0.55)";
    ctx.fillText("drag to rotate · reciprocal space · Ewald construction", W - 16, H - 36);
    ctx.restore();

    drawHeroAxes(axesCtx, (x, y, z) => xform(x, y, z));
  }

  function onPointerDown(e) {
    e.preventDefault();
    dragging = true;
    autoSpin = false;
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
    // Orbit in view space: horizontal → screen-up axis, vertical → screen-right axis
    R = mulM(rotYM(dx * 0.005), R);
    R = mulM(rotXM(dy * 0.005), R);
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove("is-dragging");
    try {
      canvas.releasePointerCapture?.(e.pointerId);
    } catch (_) {}
    resumeTimer = setTimeout(() => {
      autoSpin = true;
    }, 2200);
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("lostpointercapture", onPointerUp);

  function frame(ts) {
    t = ts * 0.001;
    if (autoSpin && !dragging) {
      R = mulM(rotYM(0.0004), R);
      R = mulM(rotXM(0.00018), R);
      R = mulM(rotZM(0.00012), R);
    }

    ctx.fillStyle = "#060810";
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(cx, cy);

    // Spots first (background texture), geometry on top so it stays solid/readable
    const ghosts = REFLECTIONS.filter((ref) => ref.I0 > 0.28)
      .map((ref) => {
        const [qx, qy, qz] = xform(ref.qx, ref.qy, ref.qz);
        const [sx, sy, depth] = project(qx, qy, qz);
        return {
          sx,
          sy,
          I: ref.I0,
          depth: Math.max(-1, Math.min(1, depth / 1.6)),
        };
      })
      .sort((a, b) => a.depth - b.depth);
    ghosts.forEach((g) => ghost(g.sx, g.sy, g.I * 0.22, g.depth));

    const spots = [];
    REFLECTIONS.forEach((ref) => {
      const [qx, qy, qz] = xform(ref.qx, ref.qy, ref.qz);
      const [sx, sy, depth] = project(qx, qy, qz);
      const dist = Math.abs(Math.hypot(qx, qy, qz + ewaldR) - ewaldR);
      const ewald = Math.exp(-dist * dist * 2.8);
      const trig =
        0.9 + 0.1 * Math.cos(3 * Math.atan2(qy, qx) + t * 0.25);
      const pulse = 0.9 + 0.1 * Math.sin(t * 0.55 + ref.h + ref.k * 1.3);
      const I = ref.I0 * ewald * trig * pulse * 0.82;
      if (I > 0.08) {
        spots.push({
          sx,
          sy,
          I,
          depth: Math.max(-1, Math.min(1, depth / 1.6)),
          ref,
        });
      }
    });
    spots.sort((a, b) => a.depth - b.depth);
    spots.forEach(({ sx, sy, I, depth, ref }) => {
      spot(sx, sy, I, depth);
      if (I > 0.4) {
        ctx.font = "10px 'IBM Plex Mono', monospace";
        ctx.fillStyle = `rgba(180,220,255,${Math.min(0.55, I * 0.65)})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(miller(ref.h, ref.k, ref.l), sx, sy + 8 + I * 6);
      }
    });

    drawSymmetryRays();
    drawEwald();
    drawScrew32();
    drawDirectCell();
    drawReciprocalCell();

    ctx.restore();
    drawHUD();
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
}
