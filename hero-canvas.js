// Hero Canvas Animation - 3D Quartz Diffraction with Ewald Sphere
// α-Quartz: P3₂21, a=4.913Å, c=5.405Å

const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

let W, H, cx, cy, sc;
let t = 0;
let rotX = 0, rotY = 0, rotZ = 0;

// Quartz unit cell (hexagonal)
const a = 4.913, c = 5.405;
const astar = 2 * Math.PI / (a * Math.sqrt(3));
const cstar = 2 * Math.PI / c;

// X-ray wavelength (Cu Kα = 1.5418Å)
const lambda = 1.5418;
const ewaldR = 1 / lambda; // Ewald sphere radius in reciprocal space

// ── SPOT SIZE TUNING ─────────────────────────────────────────────────────────
// Increase SPOT_SCALE to make all spots larger; decrease to make them smaller.
// Good range: 1.0 (tiny) → 5.0 (large). Default: 2.5
const SPOT_SCALE = 5;
// ─────────────────────────────────────────────────────────────────────────────

// Generate 3D reciprocal lattice for quartz
const REFLECTIONS = (function(){
  const out = [];
  const maxH = 6, maxK = 6, maxL = 7;  // Smaller unit cell coverage
  
  for (let h = -maxH; h <= maxH; h++){
    for (let k = -maxK; k <= maxK; k++){
      for (let l = -maxL; l <= maxL; l++){
        if (h === 0 && k === 0 && l === 0) continue;
        
        // P3₂21 systematic absences
        // 00l: l ≠ 3n
        if (h === 0 && k === 0 && l % 3 !== 0) continue;
        
        // Reciprocal lattice vector (hexagonal)
        const qx = astar * (h - k/2);
        const qy = astar * (k * Math.sqrt(3)/2);
        const qz = cstar * l;
        
        const q = Math.sqrt(qx*qx + qy*qy + qz*qz);
        if (q > 1.8) continue; // Tighter resolution limit
        
        // Structure factor approximation (Si and O positions)
        const sf = Math.abs(
          Math.cos(h * 0.47 + k * 0.41 + l * 0.67) * 14 + // Si
          Math.cos(h * 0.41 + k * 0.27 + l * 0.21) * 8    // O
        );
        
        // Debye-Waller factor
        const B = 0.5;
        const dw = Math.exp(-B * q * q / 4);
        
        const I0 = sf * sf * dw;
        if (I0 < 1.5) continue;  // Moderate threshold
        
        out.push({h, k, l, qx, qy, qz, q, I0});
      }
    }
  }
  // Normalize I0 to 0-1 range for wide dynamic range in rendering
  const maxI0 = Math.max(...out.map(r => r.I0));
  out.forEach(r => r.I0 = r.I0 / maxI0);
  return out;
})();

console.log(`Generated ${REFLECTIONS.length} reflections for quartz`);
if (REFLECTIONS.length > 0) {
  console.log('Sample reflection:', REFLECTIONS[0]);
}

function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = canvas.parentElement.offsetHeight;
  cx = W * .545; // slightly right of center — avoids text overlap
  cy = H * .5;
  sc = Math.min(W, H) / 860;
}

function drawSpot(x, y, I){
  // I is 0-1 normalized - use full range for variation
  // Power scaling: dim spots much smaller, bright spots large
  const scaled = Math.pow(I, 0.6);  // sub-linear: preserves variation

  const base = 0.5;           // minimum radius in px (tiny dim spots)
  const range = 14.0;         // wider range for bigger spots
  const r = (base + scaled * range) * sc * SPOT_SCALE;

  const halo = r * 2.0;

  // Outer blue halo ring - transparent inside core, glows outside
  const g0 = ctx.createRadialGradient(x, y, 0, x, y, halo);
  g0.addColorStop(0.35, 'rgba(100,160,255,0)');
  g0.addColorStop(0.55, `rgba(100,170,255,${Math.min(0.3, scaled * 0.4).toFixed(3)})`);
  g0.addColorStop(1,    'rgba(50,100,200,0)');
  ctx.fillStyle = g0;
  ctx.beginPath();
  ctx.arc(x, y, halo, 0, 6.283);
  ctx.fill();

  // Spot core - always brightest at center, fades outward
  const g1 = ctx.createRadialGradient(x, y, 0, x, y, r * 0.75);
  g1.addColorStop(0,   `rgba(255,255,255,${Math.min(0.95, scaled * 1.6).toFixed(3)})`);
  g1.addColorStop(0.5, `rgba(210,230,255,${Math.min(0.75, scaled * 1.05).toFixed(3)})`);
  g1.addColorStop(1,   `rgba(150,195,255,${Math.min(0.35, scaled * 0.5).toFixed(3)})`);
  ctx.fillStyle = g1;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.75, 0, 6.283);
  ctx.fill();
}

function drawRings(){
  ctx.save();
  ctx.translate(cx, cy);
  ctx.setLineDash([2, 11]);
  ctx.lineWidth = .5;
  [88, 168, 252, 335, 415].forEach(r => {
    ctx.strokeStyle = 'rgba(50,100,210,.07)';
    ctx.beginPath();
    ctx.arc(0, 0, r * sc, 0, 6.283);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.restore();
}

function drawBeamStop(){
  const r = 20 * sc;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
  g.addColorStop(0,  'rgba(6,8,16,1)');
  g.addColorStop(.6, 'rgba(6,8,16,.97)');
  g.addColorStop(1,  'rgba(6,8,16,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2.2, 0, 6.283);
  ctx.fill();
}

// 3D rotation matrices
function rotateX(x, y, z, angle){
  const c = Math.cos(angle), s = Math.sin(angle);
  return [x, y*c - z*s, y*s + z*c];
}

function rotateY(x, y, z, angle){
  const c = Math.cos(angle), s = Math.sin(angle);
  return [x*c + z*s, y, -x*s + z*c];
}

function rotateZ(x, y, z, angle){
  const c = Math.cos(angle), s = Math.sin(angle);
  return [x*c - y*s, x*s + y*c, z];
}

let frameCount = 0;
let spotCount = 0;

function frame(ts){
  t = ts * .001;
  frameCount++;
  spotCount = 0;
  
  // Slow 3-axis rotation to show different zone axes
  rotX += 0.0003;
  rotY += 0.0005;
  rotZ += 0.0004;

  ctx.fillStyle = '#060810';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(cx, cy);
  // Use normal blending so spots are visible on dark background
  ctx.globalCompositeOperation = 'source-over';

  // Process each reflection
  REFLECTIONS.forEach(ref => {
    // Apply 3D rotation
    let [qx, qy, qz] = [ref.qx, ref.qy, ref.qz];
    [qx, qy, qz] = rotateX(qx, qy, qz, rotX);
    [qx, qy, qz] = rotateY(qx, qy, qz, rotY);
    [qx, qy, qz] = rotateZ(qx, qy, qz, rotZ);
    
    // Project onto detector plane (perpendicular to beam)
    // Scale to screen coordinates - larger scale = longer detector distance
    const screenX = qx * sc * 250;
    const screenY = qy * sc * 250;
    
    // Ewald sphere modulation (optional - can disable for debugging)
    const distToCenter = Math.sqrt(qx*qx + qy*qy + (qz + ewaldR)*(qz + ewaldR));
    const distFromSphere = Math.abs(distToCenter - ewaldR);
    const ewaldFactor = Math.exp(-distFromSphere * distFromSphere * 6);
    
    // Final intensity with pulse
    const pulse = 0.9 + 0.1 * Math.sin(t * 0.4 + ref.h * 2.1 + ref.k * 3.7);
    const I = ref.I0 * ewaldFactor * pulse * 0.5;
    
    // Show spot if it has any intensity
    if (I > 0.003) {
      spotCount++;
      drawSpot(screenX, screenY, I);
      
      // Add Miller indices label for all visible spots
      if (I > 0.005) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = `${8 * sc}px 'IBM Plex Mono', monospace`;
        ctx.fillStyle = `rgba(140, 200, 255, ${Math.min(0.6, I * 0.8)})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Format Miller indices with bar notation for negative
        const hStr = ref.h < 0 ? `${Math.abs(ref.h)}̄` : ref.h.toString();
        const kStr = ref.k < 0 ? `${Math.abs(ref.k)}̄` : ref.k.toString();
        const lStr = ref.l < 0 ? `${Math.abs(ref.l)}̄` : ref.l.toString();
        
        // Offset label below spot - use actual spot radius for offset
        const spotR = (0.5 + Math.pow(I, 0.6) * 14.0) * sc * SPOT_SCALE;
        ctx.fillText(`${hStr}${kStr}${lStr}`, screenX, screenY + spotR * 0.75 + 4 * sc);
        ctx.restore();
      }
    }
  });

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  // Log every 60 frames
  if (frameCount % 60 === 0) {
    console.log(`Frame ${frameCount}: Drew ${spotCount} spots`);
  }

  requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(frame);
