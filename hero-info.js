/**
 * Hero info / narration panels (paper links + Lokelma story script).
 */

export function mountHeroInfo(host = document.querySelector(".hero")) {
  if (!host) return null;
  let root = host.querySelector(":scope > .hero-info-root") || document.querySelector(".hero-info-root");
  if (root) {
    if (root.parentElement !== host) host.appendChild(root);
    ensureNextButton(root);
    return root;
  }

  root = document.createElement("div");
  root.className = "hero-info-root";
  root.innerHTML = `
    <div class="hero-controls" role="group" aria-label="About this hero">
      <button type="button" class="hero-ctrl-btn" data-action="info" aria-expanded="false" title="About this model" aria-label="About this model">i</button>
      <button type="button" class="hero-ctrl-btn" data-action="narration" hidden aria-expanded="false" title="Text narration" aria-label="Text narration">¶</button>
      <button type="button" class="hero-ctrl-btn hero-ctrl-pause" data-action="pause" hidden aria-pressed="false" title="Pause story" aria-label="Pause story">❚❚</button>
      <button type="button" class="hero-ctrl-btn hero-ctrl-pan" data-action="pan" hidden aria-pressed="false" title="Pan view" aria-label="Pan view">✥</button>
      <button type="button" class="hero-ctrl-btn hero-ctrl-next" data-action="next" title="Next hero model" aria-label="Next hero model">›</button>
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
  wireHeroControls(root);
  return root;
}

function ensureNextButton(root) {
  const controls = root.querySelector(".hero-controls");
  if (!controls) return;
  let nextBtn = root.querySelector('[data-action="next"]');
  if (!nextBtn) {
    nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "hero-ctrl-btn hero-ctrl-next";
    nextBtn.dataset.action = "next";
    nextBtn.title = "Next hero model";
    nextBtn.setAttribute("aria-label", "Next hero model");
    nextBtn.textContent = "›";
    controls.appendChild(nextBtn);
  }
  if (!nextBtn.dataset.wired) {
    nextBtn.dataset.wired = "1";
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      root.dispatchEvent(new CustomEvent("hero:next", { bubbles: true }));
    });
  }
  ensurePauseButton(root);
  ensurePanButton(root);
}

function ensurePauseButton(root) {
  const controls = root.querySelector(".hero-controls");
  if (!controls) return;
  let pauseBtn = root.querySelector('[data-action="pause"]');
  if (!pauseBtn) {
    pauseBtn = document.createElement("button");
    pauseBtn.type = "button";
    pauseBtn.className = "hero-ctrl-btn hero-ctrl-pause";
    pauseBtn.dataset.action = "pause";
    pauseBtn.hidden = true;
    pauseBtn.setAttribute("aria-pressed", "false");
    pauseBtn.title = "Pause story";
    pauseBtn.setAttribute("aria-label", "Pause story");
    pauseBtn.textContent = "❚❚";
    const nextBtn = controls.querySelector('[data-action="next"]');
    if (nextBtn) controls.insertBefore(pauseBtn, nextBtn);
    else controls.appendChild(pauseBtn);
  }
  if (!pauseBtn.dataset.wired) {
    pauseBtn.dataset.wired = "1";
    pauseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      root.dispatchEvent(new CustomEvent("hero:pause-toggle", { bubbles: true }));
    });
  }
}

function ensurePanButton(root) {
  const controls = root.querySelector(".hero-controls");
  if (!controls) return;
  let panBtn = root.querySelector('[data-action="pan"]');
  if (!panBtn) {
    panBtn = document.createElement("button");
    panBtn.type = "button";
    panBtn.className = "hero-ctrl-btn hero-ctrl-pan";
    panBtn.dataset.action = "pan";
    panBtn.hidden = true;
    panBtn.setAttribute("aria-pressed", "false");
    panBtn.title = "Pan view";
    panBtn.setAttribute("aria-label", "Pan view");
    panBtn.textContent = "✥";
    const nextBtn = controls.querySelector('[data-action="next"]');
    if (nextBtn) controls.insertBefore(panBtn, nextBtn);
    else controls.appendChild(panBtn);
  }
  if (!panBtn.dataset.wired) {
    panBtn.dataset.wired = "1";
    panBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      root.dispatchEvent(new CustomEvent("hero:pan-toggle", { bubbles: true }));
    });
  }
}

export function setPauseButtonState(paused, root = document.querySelector(".hero-info-root")) {
  const pauseBtn = root?.querySelector('[data-action="pause"]');
  if (!pauseBtn) return;
  pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
  pauseBtn.classList.toggle("is-paused", !!paused);
  pauseBtn.textContent = paused ? "▶" : "❚❚";
  pauseBtn.title = paused ? "Resume story" : "Pause story";
  pauseBtn.setAttribute("aria-label", paused ? "Resume story" : "Pause story");
}

export function setPanButtonState(panning, root = document.querySelector(".hero-info-root")) {
  const panBtn = root?.querySelector('[data-action="pan"]');
  if (!panBtn) return;
  panBtn.setAttribute("aria-pressed", panning ? "true" : "false");
  panBtn.classList.toggle("is-panning", !!panning);
  panBtn.title = panning ? "Pan on — drag to move view" : "Pan view";
  panBtn.setAttribute(
    "aria-label",
    panning ? "Pan on — drag to move view" : "Pan view"
  );
}

function wireHeroControls(root) {
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
  ensureNextButton(root);
  root.querySelectorAll(".hero-panel-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAll();
    });
  });

  root.querySelectorAll(".hero-panel, .hero-controls").forEach((el) => {
    el.addEventListener("pointerdown", (e) => e.stopPropagation());
  });
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

  ensurePauseButton(root);
  ensurePanButton(root);
  const pauseBtn = root.querySelector('[data-action="pause"]');
  const panBtn = root.querySelector('[data-action="pan"]');
  const showExplore = !!(hero.pauseable || hero.kind === "halite");
  if (pauseBtn) {
    pauseBtn.hidden = !showExplore;
    if (!showExplore) setPauseButtonState(false, root);
  }
  if (panBtn) {
    panBtn.hidden = !showExplore;
    if (!showExplore) setPanButtonState(false, root);
  }
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
