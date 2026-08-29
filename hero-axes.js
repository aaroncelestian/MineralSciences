/** Small XYZ triad legend for hero canvases (bottom-left overlay). */

export function mountHeroAxes(stage = document.querySelector(".hero-stage")) {
  if (!stage) return null;
  let el = stage.querySelector(".hero-axes");
  if (!el) {
    el = document.createElement("canvas");
    el.className = "hero-axes";
    el.width = 96;
    el.height = 96;
    el.setAttribute("aria-hidden", "true");
    stage.appendChild(el);
  }
  return el.getContext("2d");
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {(x:number,y:number,z:number)=>[number,number,number]} basis
 *        Maps unit-axis endpoints into view/model space (x right, y up, z toward viewer).
 */
export function drawHeroAxes(ctx, basis) {
  if (!ctx) return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);

  const ox = W * 0.4;
  const oy = H * 0.64;
  const scale = 26;

  const axes = [
    { v: basis(1, 0, 0), color: "rgba(255,120,120,0.95)", label: "X" },
    { v: basis(0, 1, 0), color: "rgba(120,230,160,0.95)", label: "Y" },
    { v: basis(0, 0, 1), color: "rgba(120,180,255,0.95)", label: "Z" },
  ].sort((a, b) => a.v[2] - b.v[2]);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const ax of axes) {
    const x2 = ox + ax.v[0] * scale;
    const y2 = oy - ax.v[1] * scale;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = ax.color;
    ctx.lineWidth = 2.1;
    ctx.stroke();
    ctx.fillStyle = ax.color;
    ctx.font = "600 11px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ax.label, x2 + ax.v[0] * 8, y2 - ax.v[1] * 8);
  }

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  ctx.arc(ox, oy, 2.4, 0, Math.PI * 2);
  ctx.fill();
}
