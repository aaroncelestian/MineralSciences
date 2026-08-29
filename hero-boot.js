/**
 * Pick a homepage hero at random:
 *   - quartz XRD (blog link: Borghese–Windsor)
 *   - DNA–CaOx cylinder/slab
 *   - DNA–CaOx gel + 15 Å shell
 *   - Lokelma / ZS-9 zirconium silicate (Dallas 2026 + paper + narration)
 *   - Halite fluid inclusions (astrobiology / iron-cross)
 */

import { mountHeroInfo, applyHeroInfo } from "./hero-info.js?v=18";

const HEROES = [
  {
    id: "quartz",
    badge: "[001]",
    tooltip: "Drag to rotate · α-quartz reciprocal space · P3₂21 · Ewald · Cu Kα",
    attribution:
      "Hero animation: α-quartz reciprocal space — decorative XRD motif; essay: Borghese–Windsor Cabinet (Pocketful of χtals)",
    info: {
      kicker: "α-Quartz · reciprocal space",
      title: "Provenance. Material Records. Rewrite History.",
      blurb:
        "Diffraction is how we read what a crystal remembers — where it formed, what passed through it, what story the archive still holds. This Ewald construction is that language in motion. For the museum side of provenance and material record, start with the Borghese–Windsor Cabinet essay.",
      url: "https://aaroncelestian.substack.com/p/borghese-windsor-cabinet-396",
      linkLabel: "Read the Borghese–Windsor essay →",
    },
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
    info: {
      kicker: "DNA–CaOx · kidney stones",
      title: "Biofilm and calcium oxalate",
      blurb:
        "Bacterial biofilms are intrinsic internal components of calcium-based kidney stones — not surface contamination. DNA and mineral grow together. This hero shows a DNA-length CaOx coating model from that research thread.",
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
      "Drag to rotate · Gel + 15 Å shell (FIRE/OMM) · d(P) clouds",
    attribution:
      "Hero model: DNA–CaOx gel + 15 Å shell (FIRE/OpenMM), Ca distance clouds colored by phosphate distance",
    info: {
      kicker: "DNA–CaOx · gel shell",
      title: "Nucleation around DNA",
      blurb:
        "A gel + 15 Å CaOx shell around DNA — the same organic–inorganic story as the stone work: extracellular DNA as a template that concentrates nucleation. Linked to the PNAS biofilm–mineral study.",
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
    theatreUrl: "hero/halite-theatre.json",
    badge: "Halite",
    tooltip:
      "Drag to rotate · Halite fluid inclusions · iron-cross · life inside crystals",
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

function applyHeroMeta(hero) {
  const label = document.querySelector(".hero-xrd-label");
  const tip = document.querySelector(".hero-xrd-tooltip");
  const attr = document.querySelector(".hero-attribution");
  if (label) label.textContent = hero.badge;
  if (tip) tip.textContent = hero.tooltip;
  if (attr) attr.textContent = hero.attribution;
  document.documentElement.dataset.hero = hero.id;
  applyHeroInfo(hero);
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
  mountHeroInfo(canvas.closest(".hero") || document.querySelector(".hero"));
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
      const { startHaliteHero } = await import("./hero-halite.js?v=1");
      await startHaliteHero(canvas, hero);
    } else {
      const { startQuartzHero } = await import("./hero-canvas.js?v=18");
      startQuartzHero(canvas);
    }
  } catch (err) {
    console.error("Hero failed; falling back to quartz", err);
    applyHeroMeta(HEROES[0]);
    const fresh = canvas.cloneNode(false);
    canvas.replaceWith(fresh);
    const { startQuartzHero } = await import("./hero-canvas.js?v=18");
    startQuartzHero(fresh);
  }
}

boot();
