/**
 * Pick a homepage hero at random:
 *   - quartz XRD (existing 2D canvas)
 *   - DNA–CaOx cylinder/slab (distance clouds)
 *   - DNA–CaOx gel + 15 Å shell
 *
 * CaOx display defaults match the DNA_CaOx viewer setCoatView().
 */

const HEROES = [
  {
    id: "quartz",
    badge: "[001]",
    tooltip: "Rotating X-ray diffraction pattern · α-Quartz · Cu Kα radiation",
    attribution:
      "Hero animation: rotating X-ray diffraction pattern, α-quartz (SiO₂), Cu Kα radiation (λ = 1.5418 Å)",
  },
  {
    id: "slab",
    kind: "caox",
    dataUrl: "hero/slab.json",
    badge: "CaOx",
    tooltip:
      "DNA-length CaOx coating · cylinder/slab cut · distance clouds colored by d(P)",
    attribution:
      "Hero model: DNA–CaOx cylinder/slab coating (30 Å DNA-length cut), Ca distance clouds colored by phosphate distance",
  },
  {
    id: "shell15",
    kind: "caox",
    dataUrl: "hero/shell15.json",
    badge: "Gel",
    tooltip:
      "Gel + 15 Å shell (FIRE/OMM) · distance clouds colored by d(P)",
    attribution:
      "Hero model: DNA–CaOx gel + 15 Å shell (FIRE/OpenMM), Ca distance clouds colored by phosphate distance",
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
      const { startCaOxHero } = await import("./hero-caox.js");
      await startCaOxHero(canvas, hero);
    } else {
      const { startQuartzHero } = await import("./hero-canvas.js");
      startQuartzHero(canvas);
    }
  } catch (err) {
    console.error("Hero failed; falling back to quartz", err);
    applyHeroMeta(HEROES[0]);
    const { startQuartzHero } = await import("./hero-canvas.js");
    startQuartzHero(canvas);
  }
}

boot();
