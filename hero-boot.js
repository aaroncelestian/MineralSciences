/**
 * Pick a homepage hero at random:
 *   - quartz XRD (existing 2D canvas)
 *   - DNA–CaOx cylinder/slab (distance clouds)
 *   - DNA–CaOx gel + 15 Å shell
 *   - Lokelma / ZS-9 zirconium silicate (Dallas 2026)
 */

const HEROES = [
  {
    id: "quartz",
    badge: "[001]",
    tooltip: "Drag to rotate · α-quartz reciprocal space · P3₂21 · Ewald · Cu Kα",
    attribution:
      "Hero animation: α-quartz reciprocal space — P3₂21, Ewald sphere, Cu Kα (λ = 1.5418 Å)",
  },
  {
    id: "slab",
    kind: "caox",
    dataUrl: "hero/slab.json",
    badge: "CaOx",
    tooltip:
      "Drag to rotate · DNA-length CaOx coating · cylinder/slab · d(P) clouds",
    attribution:
      "Hero model: DNA–CaOx cylinder/slab coating (30 Å DNA-length cut), Ca distance clouds colored by phosphate distance",
  },
  {
    id: "shell15",
    kind: "caox",
    dataUrl: "hero/shell15.json",
    badge: "Gel",
    tooltip:
      "Drag to rotate · Gel + 15 Å shell (FIRE/OMM) · d(P) clouds",
    attribution:
      "Hero model: DNA–CaOx gel + 15 Å shell (FIRE/OpenMM), Ca distance clouds colored by phosphate distance",
  },
  {
    id: "lokelma",
    kind: "lokelma",
    dataUrl: "hero/lokelma.json",
    badge: "ZS-9",
    tooltip:
      "Drag to rotate · Sodium zirconium cyclosilicate (Lokelma) · K⁺ / H exchange",
    attribution:
      "Hero model: sodium zirconium cyclosilicate (ZS-9 / Lokelma) — Pa-3, K⁺ in 7-ring channels (Dallas 2026 talk)",
  },
];

function pickHero() {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("hero");
  if (forced) {
    const match = HEROES.find((h) => h.id === forced);
    if (match) return match;
  }
  return HEROES[Math.floor(Math.random() * HEROES.length)];
}

function applyHeroMeta(hero) {
  const label = document.querySelector(".hero-xrd-label");
  const tip = document.querySelector(".hero-xrd-tooltip");
  const attr = document.querySelector(".hero-attribution");
  if (label) label.textContent = hero.badge;
  if (tip) tip.textContent = hero.tooltip;
  if (attr) attr.textContent = hero.attribution;
  document.documentElement.dataset.hero = hero.id;
}

async function boot() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const hero = pickHero();
  applyHeroMeta(hero);
  try {
    if (hero.kind === "caox") {
      const { startCaOxHero } = await import("./hero-caox.js?v=10");
      await startCaOxHero(canvas, hero);
    } else if (hero.kind === "lokelma") {
      const { startLokelmaHero } = await import("./hero-lokelma.js?v=10");
      await startLokelmaHero(canvas, hero);
    } else {
      const { startQuartzHero } = await import("./hero-canvas.js?v=10");
      startQuartzHero(canvas);
    }
  } catch (err) {
    console.error("Hero failed; falling back to quartz", err);
    applyHeroMeta(HEROES[0]);
    const fresh = canvas.cloneNode(false);
    canvas.replaceWith(fresh);
    const { startQuartzHero } = await import("./hero-canvas.js?v=10");
    startQuartzHero(fresh);
  }
}

boot();
