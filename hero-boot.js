/**
 * Pick a homepage hero at random:
 *   - quartz XRD (blog link: Borghese–Windsor)
 *   - DNA–CaOx cylinder/slab
 *   - DNA–CaOx gel + 15 Å shell
 *   - Lokelma / ZS-9 zirconium silicate (Dallas 2026 + paper + narration)
 *   - Halite fluid inclusions (astrobiology / iron-cross)
 */

import { mountHeroInfo, applyHeroInfo } from "./hero-info.js?v=21";

const HEROES = [
  {
    id: "quartz",
    badge: "[001]",
    tooltip: "Drag to rotate · α-quartz reciprocal space · P3₂21 · Ewald · Cu Kα",
    attribution:
      "Hero animation: α-quartz reciprocal space — decorative XRD motif; essay: Borghese–Windsor Cabinet (Pocketful of χtals)",
    info: {
      kicker: "α-Quartz · reciprocal space",
      title: "Provenance. Material Records. Discovery. New History.",
      blurb:
        "Not everything that happened was written down. Empires, workshops, voyages, quiet exchanges — whole chapters never made it onto paper. Minerals keep a different archive: chemistry, structure, wear, inclusion. Diffraction is one way we read that record. It cannot be erased. For the museum side of provenance and material memory, start with the Borghese–Windsor Cabinet essay.",
      url: "https://aaroncelestian.substack.com/p/borghese-windsor-cabinet-396",
      linkLabel: "Read the Borghese–Windsor essay →",
    },
    hud: [
      { text: "α-SiO₂   P3₂21  (#154)", tone: "strong" },
      { text: "a = 4.913 Å    c = 5.405 Å" },
      { text: "Cu Kα   λ = 1.5418 Å" },
      { text: "|k| = 1/λ   (Ewald)" },
      { text: "2 d sinθ = n λ" },
      { text: "00ℓ: ℓ = 3n   (screw)", tone: "accent" },
      { text: "q = h a* + k b* + ℓ c*" },
    ],
  },
  {
    id: "slab",
    kind: "caox",
    dataUrl: "hero/slab.json",
    badge: "CaOx",
    tooltip:
      "Drag to rotate · organic–mineral interface · d(P) clouds",
    attribution:
      "Hero model: organic–mineral interface visualization, Ca distance clouds colored by phosphate distance",
    info: {
      kicker: "Life · mineral interfaces",
      title: "Where biology and mineralogy meet",
      blurb:
        "Life and minerals don't only interact in landscapes you can walk across — they also meet at the molecular scale, where organic structure and inorganic growth shape each other. The published thread here is kidney stone pathogenesis: bacterial biofilms are intrinsic internal components of calcium-based stones, not surface contamination.",
      url: "https://doi.org/10.1073/pnas.2517066123",
      linkLabel: "Read the PNAS paper →",
    },
  },
  {
    id: "shell15",
    kind: "caox",
    dataUrl: "hero/shell15.json",
    badge: "Gel",
    tooltip:
      "Drag to rotate · organic–mineral interface · d(P) clouds",
    attribution:
      "Hero model: organic–mineral interface visualization, Ca distance clouds colored by phosphate distance",
    info: {
      kicker: "Life · mineral interfaces",
      title: "Macroscopic to molecular",
      blurb:
        "From stromatolites to stone disease, life and minerals co-construct records you can see — and mechanisms that only resolve at the scale of molecules. This scene is a window onto that continuum. For the published biofilm–mineral story in calcium-based kidney stones, see the PNAS paper.",
      url: "https://doi.org/10.1073/pnas.2517066123",
      linkLabel: "Read the PNAS paper →",
    },
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
    narrationUrl: "hero/lokelma-narration.json",
    info: {
      kicker: "ZS-9 · Lokelma",
      title: "Zirconium silicate ion exchange",
      blurb:
        "In situ potassium and hydrogen ion exchange into a cubic zirconium silicate microporous material — the crystal chemistry behind size-selective K⁺ capture in sodium zirconium cyclosilicate (Lokelma).",
      url: "https://doi.org/10.1371/journal.pone.0298661",
      linkLabel: "Read the PLOS ONE paper →",
    },
  },
  {
    id: "halite",
    kind: "halite",
    pauseable: true,
    theatreUrl: "hero/halite-theatre.json?v=19",
    badge: "Halite",
    tooltip:
      "❚❚ pause · ✥ pan · drag to rotate/pan · scroll to zoom · focus bar while paused",
    attribution:
      "Hero model: procedural halite fluid inclusions (iron-cross pattern); bacteria in brine cavities — Theatre.js zoom 01→03",
    info: {
      kicker: "Halite · fluid inclusions",
      title: "Life finds haven inside crystals",
      blurb:
        "Primary fluid inclusions in evaporite halite seal ancient brine — and sometimes the microbes that lived in it. Clear diagonals and filled axis arms form the iron-cross growth pattern. What we learn in Searles Lake–style Mars analogs shapes how we look for biosignatures on Mars.",
      url: "https://www.youtube.com/watch?v=44BXfaC_6R8&t=114s",
      linkLabel: "Watch: Searching for Life in Salt Crystals →",
    },
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

function goToHero(id) {
  const url = new URL(window.location.href);
  url.searchParams.set("hero", id);
  window.location.assign(url.toString());
}

function nextHeroId(currentId) {
  const i = Math.max(0, HEROES.findIndex((h) => h.id === currentId));
  return HEROES[(i + 1) % HEROES.length].id;
}

function applyHeroMeta(hero) {
  const label = document.querySelector(".hero-xrd-label");
  const tip = document.querySelector(".hero-xrd-tooltip");
  const attr = document.querySelector(".hero-attribution");
  if (label) label.textContent = hero.badge;
  if (tip) tip.textContent = hero.tooltip;
  if (attr) attr.textContent = hero.attribution;
  document.documentElement.dataset.hero = hero.id;
  applyHeroInfo(hero);

  const hud = document.getElementById("heroMetaHud");
  if (hud) {
    const rows = hero.hud || [];
    if (rows.length) {
      hud.hidden = false;
      hud.innerHTML = rows
        .map((row) => {
          const text = typeof row === "string" ? row : row.text;
          const tone = typeof row === "string" ? "" : row.tone || "";
          const cls = tone ? ` hero-meta-hud-line--${tone}` : "";
          return `<div class="hero-meta-hud-line${cls}">${text}</div>`;
        })
        .join("");
    } else {
      hud.hidden = true;
      hud.innerHTML = "";
    }
  }
}

async function loadNarration(hero) {
  if (!hero.narrationUrl) return hero;
  try {
    const res = await fetch(hero.narrationUrl);
    if (!res.ok) return hero;
    hero.narration = await res.json();
  } catch (_) {
    /* optional */
  }
  return hero;
}

async function boot() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const host = canvas.closest(".hero") || document.querySelector(".hero");
  mountHeroInfo(host);
  host?.addEventListener("hero:next", () => {
    goToHero(nextHeroId(document.documentElement.dataset.hero));
  });
  let hero = pickHero();
  hero = await loadNarration(hero);
  applyHeroMeta(hero);
  try {
    if (hero.kind === "caox") {
      const { startCaOxHero } = await import("./hero-caox.js?v=18");
      await startCaOxHero(canvas, hero);
    } else if (hero.kind === "lokelma") {
      const { startLokelmaHero } = await import("./hero-lokelma.js?v=18");
      await startLokelmaHero(canvas, hero);
    } else if (hero.kind === "halite") {
      const { startHaliteHero } = await import("./hero-halite.js?v=54");
      await startHaliteHero(canvas, hero);
    } else {
      const { startQuartzHero } = await import("./hero-canvas.js?v=21");
      startQuartzHero(canvas);
    }
  } catch (err) {
    console.error("Hero failed; falling back to quartz", err);
    applyHeroMeta(HEROES[0]);
    const fresh = canvas.cloneNode(false);
    canvas.replaceWith(fresh);
    const { startQuartzHero } = await import("./hero-canvas.js?v=21");
    startQuartzHero(fresh);
  }
}

boot();
