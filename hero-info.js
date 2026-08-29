/**
 * Hero info / narration panels (paper links + Lokelma story script).
 */

export function mountHeroInfo(host = document.querySelector(".hero")) {
  if (!host) return null;
  let root = host.querySelector(":scope > .hero-info-root") || document.querySelector(".hero-info-root");
  if (root) {
    if (root.parentElement !== host) host.appendChild(root);
    return root;
  }

  root = document.createElement("div");
  root.className = "hero-info-root";
  root.innerHTML = `
    <div class="hero-controls" role="group" aria-label="About this hero">
      <button type="button" class="hero-ctrl-btn" data-action="info" aria-expanded="false" title="About this model" aria-label="About this model">i</button>
      <button type="button" class="hero-ctrl-btn" data-action="narration" hidden aria-expanded="false" title="Text narration" aria-label="Text narration">¶</button>
    </div>
    <div class="hero-panel" data-panel="info" hidden>
      <button type="button" class="hero-panel-close" aria-label="Close">×</button>
      <p class="hero-panel-kicker"></p>
      <h3 class="hero-panel-title"></h3>
      <p class="hero-panel-body"></p>
      <a class="hero-panel-link" href="#" target="_blank" rel="noopener noreferrer"></a>
    </div>
    <div class="hero-panel hero-panel-narration" data-panel="narration" hidden>
      <button type="button" class="hero-panel-close" aria-label="Close">×</button>
      <h3 class="hero-panel-title">The Story</h3>
      <div class="hero-narration-list"></div>
    </div>
  `;
  host.appendChild(root);

  const infoBtn = root.querySelector('[data-action="info"]');
  const narrBtn = root.querySelector('[data-action="narration"]');
  const infoPanel = root.querySelector('[data-panel="info"]');
  const narrPanel = root.querySelector('[data-panel="narration"]');

  function closeAll() {
    infoPanel.hidden = true;
    narrPanel.hidden = true;
    infoBtn.setAttribute("aria-expanded", "false");
    narrBtn.setAttribute("aria-expanded", "false");
  }

  function toggle(panel, btn) {
    const opening = panel.hidden;
    closeAll();
    if (opening) {
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }
  }

  infoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle(infoPanel, infoBtn);
  });
  narrBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle(narrPanel, narrBtn);
  });
  root.querySelectorAll(".hero-panel-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAll();
    });
  });

  // Don't let panel clicks fall through to the canvas drag
  root.querySelectorAll(".hero-panel, .hero-controls").forEach((el) => {
    el.addEventListener("pointerdown", (e) => e.stopPropagation());
  });

  return root;
}

export function applyHeroInfo(hero, root = document.querySelector(".hero-info-root")) {
  if (!root || !hero) return;
  const info = hero.info || {};
  root.querySelector(".hero-panel-kicker").textContent = info.kicker || hero.badge || "";
  root.querySelector('[data-panel="info"] .hero-panel-title').textContent =
    info.title || hero.id;
  root.querySelector(".hero-panel-body").textContent = info.blurb || "";
  const link = root.querySelector(".hero-panel-link");
  if (info.url) {
    link.hidden = false;
    link.href = info.url;
    link.textContent = info.linkLabel || "Read more →";
  } else {
    link.hidden = true;
    link.removeAttribute("href");
  }

  const narrBtn = root.querySelector('[data-action="narration"]');
  const narrList = root.querySelector(".hero-narration-list");
  const beats = hero.narration || [];
  if (beats.length) {
    narrBtn.hidden = false;
    narrList.innerHTML = beats
      .map(
        (b) => `
      <article class="hero-narration-beat" data-beat="${b.id || ""}">
        <h4>${escapeHtml(b.title || "")}</h4>
        <p>${escapeHtml(b.text || "")}</p>
      </article>`
      )
      .join("");
  } else {
    narrBtn.hidden = true;
    narrList.innerHTML = "";
    root.querySelector('[data-panel="narration"]').hidden = true;
    narrBtn.setAttribute("aria-expanded", "false");
  }

  // Close panels when switching heroes
  root.querySelector('[data-panel="info"]').hidden = true;
  root.querySelector('[data-action="info"]').setAttribute("aria-expanded", "false");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Highlight the narration beat that matches the current Lokelma phase. */
export function setNarrationBeat(beatId) {
  const root = document.querySelector(".hero-info-root");
  if (!root) return;
  root.querySelectorAll(".hero-narration-beat").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.beat === beatId);
  });
}
