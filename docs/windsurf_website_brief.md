# Website Redesign Brief — aaroncelestian.github.io/MineralSciences/
## For: Claude Agent in Windsurf
## Purpose: Strengthen profile for Explorers Club National Fellowship application

---

## Context

This is a GitHub Pages static site. The owner is a museum curator and field scientist applying to be a National Fellow of the Explorers Club. The goal is to shift the site's identity from "academic research portfolio" to "explorer-scientist" — someone who goes to genuinely extreme environments AND brings samples back to one of the world's most sophisticated analytical laboratories. Both identities must be present and balanced.

---

## Change 1: Rewrite the Hero / About Section

**Location:** `index.html`, `#about` section

**Replace the current about text with:**

```
Some scientists ask what minerals are. I ask what they do — and to answer that, I go where they form.

I am the Curator of Mineral Sciences at the Natural History Museum of Los Angeles County, and my laboratory is everywhere: the hypersaline lake beds of Western Australia where life clings to chemistry that mirrors early Mars; the geothermal brines of California where bacteria pull lithium from ancient seawater; the crystalline interiors of human kidney stones where bacterial biofilms rewrite what we thought we knew about disease. Every sample I collect in the field eventually faces the most sophisticated analytical arsenal in the natural sciences — X-ray diffraction, Raman spectroscopy, high-resolution electron imaging — housed in one of the world's great research museums.

The curator's role is a strange and powerful one: to be simultaneously the person who goes out and the person who brings back, who transforms raw field material into permanent scientific knowledge. I have discovered new mineral species, co-developed mineral-based therapeutics now used in hospitals, searched for biosignatures that could confirm life on another planet, and extracted lithium from brines using only bacteria and sunlight. The specimens in my collection are not just beautiful objects. They are evidence.
```

**Research Interests line — replace with:**
`Astrobiology • Mineral Discovery • Environmental Remediation • PharmaMineralogy • Energy Materials • Cultural Heritage`

---

## Change 2: Move Field Exploration Section to Near Top

**Location:** `index.html` — insert ABOVE `#research` section, BELOW `#about`

**New section ID:** `#field`

**Section heading:** `Field Exploration`

**Intro text:**
```
Field work in mineral sciences means going where the chemistry is extreme — environments that test both equipment and researcher. The interactive map below documents active and completed research expeditions spanning six continents. Each site was selected because it represents a boundary condition: the edge of habitability, the limit of a geochemical system, or an analog environment for planetary surfaces we cannot yet visit directly. Click any marker to explore the location, the science, and the conditions on the ground.
```

**Move the existing ArcGIS interactive map embed here** (currently at the bottom of the page under "Field Work & Research Locations"). Keep the existing embed code exactly as-is. The map's existing popup markers provide site-level detail — no additional cards or lists are needed below it.

---

## Change 3: Add "Mineral Discoveries" Section

**Location:** Insert AFTER `#field`, BEFORE `#research`

**New section ID:** `#discoveries`

**Section heading:** `Discovery: New Mineral Species`

**Stat bar (three boxes, styled like metric cards):**
- `17` / IMA-approved species
- `6` / mineral classes
- `5` / countries

**Intro text:**
```
The formal discovery of a new mineral species is among the most permanent contributions a scientist can make to the natural record. Each requires rigorous crystallographic characterization — typically single-crystal X-ray diffraction, electron microprobe analysis, and Raman spectroscopy — followed by peer review and approval by the International Mineralogical Association Commission on New Minerals, Nomenclature and Classification. The mineral then enters the geological record permanently, named, described, and citable for as long as the scientific literature exists.

To date, research from this laboratory has contributed to the discovery and formal description of seventeen new mineral species across five countries — spanning phosphates, vanadates, sulfates, tellurites, and arsenates. Seven of these were recovered from a single locality: the Rowley Mine in Maricopa County, Arizona, making it one of the most mineralogically productive type localities in recent American mineralogy.
```

**Interactive Network Visualization:**

Replace the static list with a D3.js force-directed network graph. Full implementation code is provided below. Place the visualization in a `<div id="mineral-network-container">` immediately after the intro text.

### D3 Network — Full Implementation

Install D3 v7 via CDN: `https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js`

**Mineral data (use exactly):**
```javascript
const minerals = [
  {id:"rowleyite",     name:"Rowleyite",        formula:"Na[Mn²⁺,Fe²⁺]₁₃[Mn³⁺,Fe³⁺]₂(AsO₄)₆(Cl,OH)₁₂·6H₂O", locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"arsenate",         year:2018, ref:"Am. Mineralogist",        note:"Type locality for the Rowley Mine; first described from a chlorine-rich secondary assemblage.",                       color:"#185FA5"},
  {id:"phoxite",       name:"Phoxite",           formula:"(NH₄)₂Mg₂(C₂O₄)(PO₃OH)₂(H₂O)₄",                     locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"phosphate/oxalate", year:2020, ref:"Mineral. Mag.",             note:"Rare mixed-anion mineral with both phosphate and oxalate groups; Rowley Mine secondary zone.",                      color:"#185FA5"},
  {id:"flagite",       name:"Flagite",           formula:"Cu₄Pb₂(SO₄)(TeO₃)₂(OH)₄·H₂O",                        locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"tellurite-sulfate", year:2021, ref:"Can. J. Mineral. Petrol.", note:"Copper-lead tellurite-sulfate from the oxidized zone; one of seven species described from this single locality.",     color:"#185FA5"},
  {id:"relianceite",   name:"Relianceite-(K)",   formula:"KNa₃(SO₄)₂·2H₂O",                                     locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"sulfate",           year:2019, ref:"Mineral. Mag.",             note:"Potassium sodium sulfate hydrate; part of the remarkable secondary mineral suite at Rowley Mine.",                  color:"#185FA5"},
  {id:"thebaite",      name:"Thebaite-(NH₄)",    formula:"(NH₄)Fe²⁺₃(SO₄)₂(OH)₃·3H₂O",                         locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"sulfate",           year:2022, ref:"Mineral. Mag.",             note:"Ammonium-dominant iron sulfate; jarosite supergroup member from Rowley Mine.",                                      color:"#185FA5"},
  {id:"dendoraite",    name:"Dendoraite-(NH₄)",  formula:"(NH₄)₄Mg(SO₄)₃·4H₂O",                                 locality:"Rowley Mine, Maricopa Co., Arizona",          group:"rowley",   class:"sulfate",           year:2023, ref:"Mineral. Mag.",             note:"Magnesium ammonium sulfate hydrate; seventh new species from the Rowley Mine type locality.",                      color:"#185FA5"},
  {id:"svornostite",   name:"Svornostite-(NH₄)", formula:"(NH₄)₂Mg(UO₂)₂(SO₄)₄(H₂O)₈",                         locality:"Blue Lizard Mine, San Juan Co., Utah",        group:"utah",     class:"uranyl sulfate",    year:2025, ref:"Mineral. Mag. 89(5)",       note:"Establishes the svornostite mineral group; found in an active uranium mine in canyon country.",                    color:"#3B6D11"},
  {id:"jasonsmithite", name:"Jasonsmithite",     formula:"Pb₄(AsO₄)₂(SO₄)·2H₂O",                                locality:"Foote Lithium Co. Mine, Cleveland Co., NC",   group:"nc",       class:"arsenate-sulfate",  year:2020, ref:"Can. J. Mineral. Petrol.", note:"Lead arsenate sulfate hydrate from a lithium pegmatite; named for mineralogist Jason Smith.",                      color:"#BA7517"},
  {id:"barwoodite",    name:"Barwoodite",         formula:"Mn²⁺₂(SO₄)(OH)₂·H₂O",                                 locality:"Big Creek, Fresno Co., California",           group:"ca",       class:"sulfate",           year:2021, ref:"Mineral. Mag.",             note:"Manganese sulfate hydroxide hydrate from a California metamorphic manganese deposit.",                             color:"#D4537E"},
  {id:"cadvanite",     name:"Cadvanite",          formula:"Cd(VO₃)OH",                                            locality:"Burro Mine, San Miguel Co., Colorado",        group:"colorado", class:"vanadate",          year:2026, ref:"Can. J. Mineral. Petrol.", note:"Rare cadmium vanadate hydroxide from an oxidized polymetallic ore deposit in the Colorado Plateau.",                color:"#993C1D"},
  {id:"camanchacaite", name:"Camanchacaite",      formula:"Na₂Mg₃(SO₄)₄·6H₂O",                                   locality:"Torrecillas Mine, Iquique Province, Chile",   group:"chile",    class:"sulfate",           year:2019, ref:"Mineral. Mag. 83(5)",       note:"Named for the camanchaca coastal fog of the Atacama; hyperarid secondary sulfate.",                                color:"#0F6E56"},
  {id:"chinchorroite", name:"Chinchorroite",      formula:"NaCu₂(SO₄)(OH)·H₂O",                                  locality:"Torrecillas Mine, Iquique Province, Chile",   group:"chile",    class:"sulfate",           year:2019, ref:"Mineral. Mag. 83(5)",       note:"Sodium copper sulfate hydroxide from the Torrecillas Mine; one of six co-described Chilean species.",             color:"#0F6E56"},
  {id:"espadaite",     name:"Espadaite",          formula:"KMg(SO₄)(OH)·3H₂O",                                   locality:"Torrecillas Mine, Iquique Province, Chile",   group:"chile",    class:"sulfate",           year:2019, ref:"Mineral. Mag. 83(5)",       note:"Potassium magnesium sulfate hydroxide hydrate; Atacama hyperarid evaporite assemblage.",                          color:"#0F6E56"},
  {id:"magnesiofluckite",name:"Magnesioflükkite", formula:"CaMg(SO₄)F₂",                                          locality:"Torrecillas Mine, Iquique Province, Chile",   group:"chile",    class:"sulfate-fluoride",  year:2019, ref:"Mineral. Mag. 83(5)",       note:"Magnesium analogue of flükkite; calcium magnesium sulfate fluoride from extreme desert.",                         color:"#0F6E56"},
  {id:"picaite",       name:"Picaite",            formula:"K₂Mg(SO₄)₂·2H₂O",                                     locality:"Torrecillas Mine, Iquique Province, Chile",   group:"chile",    class:"sulfate",           year:2019, ref:"Mineral. Mag. 83(5)",       note:"Named for the Pica oasis region of northern Chile; potassium magnesium sulfate dihydrate.",                      color:"#0F6E56"},
  {id:"riosecoite",    name:"Ríosecoite",         formula:"Na₄Mg(SO₄)₃·4H₂O",                                    locality:"Torrecillas Mine, Iquique Province, Chile",   group:"chile",    class:"sulfate",           year:2019, ref:"Mineral. Mag. 83(5)",       note:"Named for Río Seco (dry river); sodium magnesium sulfate from one of Earth's driest environments.",              color:"#0F6E56"},
  {id:"doubekite",     name:"Doubekite",          formula:"Cu(AsO₃OH)·2H₂O",                                      locality:"Běloves, Náchod, Czech Republic",             group:"czech",    class:"arsenate",          year:2024, ref:"Mineral. Mag.",             note:"Copper hydrogen arsenate dihydrate from an oxidized uranium-bearing deposit in Bohemia.",                         color:"#533AB7"},
];
```

**Hub nodes (geographic clusters):**
```javascript
const hubData = [
  {id:"hub_rowley",   label:"Rowley Mine, AZ", group:"rowley",   color:"#185FA5"},
  {id:"hub_chile",    label:"Torrecillas, Chile", group:"chile", color:"#0F6E56"},
  {id:"hub_utah",     label:"Blue Lizard, UT",   group:"utah",   color:"#3B6D11"},
  {id:"hub_colorado", label:"Colorado",          group:"colorado",color:"#993C1D"},
  {id:"hub_nc",       label:"North Carolina",    group:"nc",     color:"#BA7517"},
  {id:"hub_ca",       label:"California",        group:"ca",     color:"#D4537E"},
  {id:"hub_czech",    label:"Czech Republic",    group:"czech",  color:"#533AB7"},
];
```

**Behavior spec:**
- SVG canvas: 100% width, 420px height, constrained to container
- Force simulation: `d3.forceSimulation` with link, charge, center, collision, x, y forces
- Hub nodes: `r=16`, clickable — clicking a hub activates that region filter (same as filter button)
- Mineral nodes: `r=11`, hover expands to `r=15`, click opens detail panel below canvas
- Edges: `stroke-width: 1`, 50% opacity, connect hub to each of its mineral children
- On filter change: rebuild simulation with only visible nodes/hubs, animate in with opacity transition
- Node labels: 9px, shown below each node, truncate suffix `-(NH₄)` and `-(K)` for display
- Boundary clamping: keep all nodes within canvas bounds
- Clicking hub node triggers same filter as the corresponding region button

**Filter bar above canvas:**
- Buttons: `all` | `Rowley Mine, AZ` | `Torrecillas, Chile` | `Blue Lizard, UT` | `Colorado` | `North Carolina` | `California` | `Czech Republic`
- Active button: filled with group color, white text
- Inactive: outline style

**Detail panel below canvas:**
- Appears on mineral node click (opacity transition)
- Shows: mineral name (18px, 500 weight), formula (monospace, 12px, muted), locality + reference + year + one-line note (13px)
- Two tags: mineral class + locality region, colored with group color at 22% opacity

**Closing line** (after the network container):
```
Each of these minerals existed for millions — sometimes billions — of years before it had a name. Naming them is not just taxonomy. It is the act of bringing something genuinely new into human knowledge.
```

---

## Change 4: Elevate Astrobiology as a Featured Research Card

**Location:** `index.html`, `#research` section

**Make the astrobiology card the FIRST research card** (currently it may be buried). Update/replace its content with:

**Card title:** `Astrobiology: The Search for Life in Minerals`

**Body text:**
```
Among the most profound questions in science is whether life exists — or has existed — beyond Earth. My contribution to that search is mineralogical: if life touches a mineral system, it leaves a chemical signature. The question is whether those signatures survive.

Working with NASA's Jet Propulsion Laboratory and field teams operating in Mars analog environments — the hypersaline lakes of Western Australia, the evaporite systems of the Mojave — my research investigates how organic biomarkers and microbial cells are preserved within halite and sulfate mineral matrices over geological timescales. The findings inform instrumentation design for future Mars surface missions and establish detection thresholds for confirming biosignatures in ancient extraterrestrial materials.

If life ever existed on Mars, it likely left its record in minerals. We are learning to read that record here, on Earth, first.
```

**Tags:** `Astrobiology` `NASA/JPL` `Mars Analogs` `Biosignatures` `Halite` `Evaporites`

---

## Change 5: Add Television & Media Credits Section

**Location:** `index.html`, inside `#media` section, ADD as a new subsection ABOVE the existing podcast/video content

**Subsection heading:** `Television & Film`

**Intro line:**
```
Science communication is part of the explorer's obligation — to bring the discovery back not just to the museum, but to the public.
```

**Credits table:**

| Production | Network | Role | Year |
|---|---|---|---|
| *The UnXplained* — "Mysterious Stones" | History Channel | Featured Scientist | 2020 |
| *The UnXplained* — "Curses Unleashed" | History Channel | Featured Scientist | 2023 |
| *The UnXplained* — "Sacred Rituals" | History Channel | Featured Scientist | 2023 |
| *Expedition Unknown* | Discovery Channel | Self — Mineralogist | 2019 |
| *The Color of Ink* | Film | Consulting Geologist | — |

**Below table, add:** `IMDB: nm10697707`  (link to `https://www.imdb.com/name/nm10697707/`)

---

## Change 6: Update Navigation

**Add two new nav items:**
- `Field` → `#field` (move/rename existing "Field" nav item to point to new section)
- `Discoveries` → `#discoveries` (new)

**Final nav order:** About · Field · Discoveries · Research · Publications · Media · CV · Contact

---

## Change 7: Minor Copy Updates

**About section — research interests line:**
Replace current with:
`Astrobiology • Mineral Discovery • Environmental Remediation • PharmaMineralogy • Energy Materials • Cultural Heritage`

**Footer copyright line:**
Update year to 2026 if not already done.

---

## Notes for the Agent

- The site is GitHub Pages static HTML — no build system, no framework. All changes are direct HTML/CSS/JS edits.
- The existing visual style (dark nav, card-based research section, tag pills) should be preserved. New sections should match existing styling conventions exactly.
- The D3 network is the most complex addition. Load D3 from the CDN specified above. The full working implementation has been prototyped and tested — use the mineral data and behavior spec above verbatim.
- All formulas use Unicode superscripts/subscripts — preserve these exactly in HTML (they render correctly in modern browsers without MathML).
- Do not change the hero photo. The studio/curator photo is intentional.
- Flag any images that are referenced in new field site cards but not present in `/images/` — the owner will supply them.

---

## Change 8: Research Constellation — Full Spec

**Purpose:** Replace the existing flat research project card grid with an interactive star constellation arranged as a crystallographic octahedron projection. The constellation is the primary way visitors explore Aaron's six research domains. Each star is clickable and reveals a full narrative panel below the SVG.

**The conceptual anchor:** All six research programs share one thread — *minerals remember*. Every domain is about reading what a mineral recorded and using that record to do something that matters. "Minerals remember" appears as a dim, unclickable center node at the geometric heart of the octahedron.

**Section heading:** `Research`

**Intro text (place above the constellation SVG):**
```
Every research program I pursue follows the same thread: minerals record. A crystal grown in a hypersaline lake records the chemistry of the water that made it — and whether anything was alive in that water. A kidney stone records the bacteria that helped build it. A microporous titanium silicate records a geometry that evolution independently discovered in cell membranes. My work is the act of reading those records — and deciding what to do with what they say.
```

---

### Constellation Geometry

**Shape:** True octahedron, 2D projection. Six vertex nodes plus one center anchor.

**Canvas:** SVG, 100% width, 420px viewBox height, viewBox="0 0 680 420"

**Center point:** cx=340, cy=210

**Vertex positions** (compute precisely — this is a regular octahedron projection):
- Top pole: `(cx, cy - R)` where R = 155
- Bottom pole: `(cx, cy + R)`
- Left equatorial: `(cx - Req, cy)` where Req = 148
- Right equatorial: `(cx + Req, cy)`
- Lower-left diagonal: `(cx - Req×sin45°, cy + R×sin45°)` = approx `(cx - 105, cy + 110)`
- Lower-right diagonal: `(cx + Req×sin45°, cy + R×sin45°)` = approx `(cx + 105, cy + 110)`
- Center anchor: `(cx, cy)`

**Tune in browser until the shape reads as a clean symmetric octahedron.** The equatorial pair should be at true horizontal mid-height. The lower diagonal pair should be equidistant from center as the equatorial pair.

**Background:** Scatter ~70 small dots (r=0.5, a few at r=1.1) randomly across the canvas at low opacity (0.15–0.7) to simulate a star field. Use a seeded random function for reproducibility.

**Constellation edges** (draw as thin dashed or solid lines, stroke-width 0.75, low opacity ~0.45):
```
top → left
top → right
top → lower-left
top → lower-right
bottom → left
bottom → right
bottom → lower-left
bottom → lower-right
left → lower-left
right → lower-right
lower-left → lower-right
all six outer nodes → center (thin, more faded, ~0.25 opacity)
```

---

### Node Styling

**Outer nodes (clickable):**
- Default: filled circle, radius per domain (see below), color per domain
- Hover: radius +2, glow halo appears (filled circle r+9, color at 18% opacity)
- Active/selected: radius +3, glow halo stays visible
- Label: positioned to avoid collision with edges (see label positions below)
- Font: 10.5px, 500 weight, color matches node color

**Center anchor (not clickable):**
- Radius: 4px
- Fill: muted gray, 30% opacity
- Label: "minerals remember" in italic, 9px, muted gray, centered below node

---

### The Six Nodes

#### 1. Astrobiology
- **Position:** Top pole
- **Radius:** 7
- **Color:** `#0369a1` (deep blue)
- **Glow:** `rgba(3,105,161,0.2)`
- **Label position:** Above node, centered
- **Display label:** `Astrobiology`
- **Panel title:** The search for life in minerals
- **Panel subtitle:** Halite · Mars analogs · NASA/JPL · Western Australia
- **Impact chips:**
  - "NASA/JPL" — blue tint
  - "Mars mission instrumentation" — gray tint
- **Panel body:**
  > If life ever existed on Mars, it left its record in minerals. Working with NASA/JPL in Mars analog environments — hypersaline lakes of Western Australia, Mojave evaporite systems — my research investigates how organic biomarkers and microbial cells are preserved within halite and sulfate matrices over geological timescales. The findings inform instrumentation design for future Mars surface missions and establish biosignature detection thresholds for ancient extraterrestrial materials.
- **Tags:** Astrobiology · Halite · Mars analogs · Biosignatures · Evaporites · Western Australia · NASA/JPL

---

#### 2. Environmental Remediation
- **Position:** Bottom pole
- **Radius:** 7
- **Color:** `#2a7d6b` (verdigris)
- **Glow:** `rgba(42,125,107,0.2)`
- **Label position:** Below node, centered
- **Display label:** `Environmental remediation`
- **Panel title:** Minerals as remediation tools
- **Panel subtitle:** Zeolites · Lead · PAHs · Fukushima · La Brea
- **Impact chips:**
  - "Lead remediation — Los Angeles" — gray tint
  - "PAH degradation — La Brea" — amber tint
- **Panel body:**
  > Microporous minerals are nature's own filtration systems. My environmental work spans zeolite amendment of lead-contaminated residential soils in Los Angeles; photocatalytic degradation of polycyclic aromatic hydrocarbons at La Brea Tar Pits; and pharmaceutical compound sequestration from aqueous waste streams. The same crystal chemistry that drives the laboratory drives the field deployments.
- **Tags:** Zeolites · Lead remediation · PAH degradation · La Brea · Ion exchange · Photocatalysis · Los Angeles

---

#### 3. Nuclear Waste Capture
- **Position:** Left equatorial
- **Radius:** 8 (slightly larger — foundational discovery)
- **Color:** `#dc2626` (red)
- **Glow:** `rgba(220,38,38,0.18)`
- **Label position:** Left of node, right-aligned text
- **Display label:** `Nuclear waste capture`
- **Panel title:** Entombing Fukushima
- **Panel subtitle:** Sitinakite · Cesium · Radiostrontium · Double lever mechanism
- **Impact chips:**
  - "Fukushima Daiichi" — red tint
  - "Radiocesium extraction" — gray tint
- **Panel body:**
  > The double lever mechanism — a coupled two-site ion exchange geometry I identified in sitinakite — selectively captures cesium and strontium ions with extraordinary efficiency. Structurally analogous to the Nobel Prize-winning potassium ion channel, this geometry makes sitinakite-based materials practically indispensable for nuclear remediation. They are now deployed in the treatment of radioactive wastewater from the Fukushima Daiichi nuclear disaster, selectively extracting radiocesium at scale.
- **Tags:** Sitinakite · Ion exchange · Double lever mechanism · Fukushima · Radiocesium · Nuclear remediation · Crystal chemistry

---

#### 4. PharmaMineralogy
- **Position:** Right equatorial
- **Radius:** 8 (slightly larger — sibling of foundational discovery)
- **Color:** `#7c3aed` (violet)
- **Glow:** `rgba(124,58,237,0.18)`
- **Label position:** Right of node, left-aligned text
- **Display label:** `Pharma-mineralogy`
- **Panel title:** From crystal chemistry to hospital drug
- **Panel subtitle:** Lokelma · Hyperkalemia · FDA-approved · Sitinakite
- **Impact chips:**
  - "FDA-approved drug" — blue tint
  - "Hyperkalemia rescue treatment" — green tint
  - "Long-term therapeutic" — violet tint
- **Panel body:**
  > The same double lever mechanism that captures nuclear waste also saves lives in emergency rooms. The ion selectivity principle I described in sitinakite underlies Lokelma (sodium zirconium cyclosilicate), an FDA-approved drug used as both an emergency rescue treatment for life-threatening hyperkalemia and as a long-term therapeutic for chronic kidney disease patients. A Nobel-recognized mechanism. A mineral. A hospital drug.
- **Tags:** PharmaMineralogy · Lokelma · Hyperkalemia · FDA · Ion selectivity · Sitinakite · Crystal chemistry

---

#### 5. Biomineralization
- **Position:** Lower-left diagonal
- **Radius:** 7
- **Color:** `#b45309` (amber-brown)
- **Glow:** `rgba(180,83,9,0.18)`
- **Label position:** Below-left of node, right-aligned text
- **Display label:** `Biomineralization`
- **Panel title:** Bacteria inside kidney stones
- **Panel subtitle:** Calcium oxalate · Bacterial biofilms · PNAS 2026
- **Impact chips:**
  - "PNAS 2026" — violet tint
  - "Clinical applications" — green tint
- **Panel body:**
  > Using high-resolution electron imaging and synchrotron XRD, my research demonstrated that bacterial biofilms are structurally intercalated within calcium oxalate kidney stone matrices — not surface contaminants but intrinsic architectural components. Published in PNAS (2026), these findings reframe kidney stone disease as partly microbial in origin, opening direct pathways to therapeutic intervention targeting the bacterial communities integral to stone formation.
- **Tags:** Biomineralization · Kidney stones · SEM · Synchrotron XRD · Bacterial biofilms · PNAS · Clinical translation

---

#### 6. Sustainable Lithium
- **Position:** Lower-right diagonal
- **Radius:** 7
- **Color:** `#0f766e` (teal-green)
- **Glow:** `rgba(15,118,110,0.18)`
- **Label position:** Below-right of node, left-aligned text
- **Display label:** `Sustainable lithium`
- **Panel title:** Regenerative lithium extraction
- **Panel subtitle:** LMO · Geothermal brines · DOE · BrineWorks
- **Impact chips:**
  - "DOE grant DE-EE0009442" — amber tint
  - "BrineWorks startup" — gray tint
  - "Provisional patent" — green tint
- **Panel body:**
  > We're not mining lithium — we're borrowing it. Using lithium manganese oxide intercalation and halophilic bacteria, my research extracts battery-grade Li₂CO₃ from geothermal brines, oil field wastewater, and desalination streams at near-zero energy cost. Funded by the U.S. Department of Energy and commercialized through BrineWorks, this approach addresses global lithium demand without the environmental cost of conventional hard-rock mining.
- **Tags:** Lithium extraction · LMO · Geothermal brines · DOE · BrineWorks · Halophiles · Critical materials

---

### Detail Panel (below SVG)

- Appears on first star click, opacity transition 0.25s
- Structure: title (18px, serif, 500) → subtitle (12px, italic, muted) → impact chips row → body text (13px, 1.7 line-height) → tag pills
- Impact chips: small colored badges, color-coded by domain/impact type (red for nuclear/danger, blue for institutional, green for clinical/positive outcomes, gray for neutral)
- Tag pills: verdigris tint background (`rgba(42,125,107,0.1)`), dark verdigris text (`#0d5c4a`), verdigris border
- On page load, auto-click the Nuclear Waste Capture node so the panel is populated immediately — visitors should not land on an empty panel

---

### Integration Notes

- This constellation **replaces** the existing flat `.project-grid` research card section entirely
- The existing research card CSS (`.project-card`, `.project-grid`) can be kept for other uses but is no longer used in the main research section
- The section `id` stays `#research` for nav link compatibility
- Use plain SVG + vanilla JS — no D3 needed for this component (unlike the mineral network which uses D3 for physics simulation)
- The constellation and the mineral discovery network are intentionally different visual registers: the constellation is static/celestial, the network is dynamic/physical. This distinction is deliberate — do not apply force simulation to the constellation
