# Website Layout Fix — Windsurf Agent Instructions V2
# Site: aaroncelestian.github.io/MineralSciences/
# File to edit: index.html (root of repository)

---

## PROBLEM

The previous pass added new prose text but left old HTML elements in place.
The page now has BOTH old and new content stacked together.

This pass is purely REMOVAL and STRUCTURAL cleanup.
Do NOT add any new prose — it is already there from the previous pass.

---

## BEFORE YOU START

Open index.html. Search for each element described below.
Delete the entire element including its opening and closing tags and all children.
Save and push after all deletions are complete.

---

## REMOVAL 1 — The four research domain cards in About

Find and DELETE the entire card grid/container that holds these four cards:
- "Astrobiology and biosignature research"
- "Lithium extraction and recovery"  
- "Heavy metal sequestration"
- "Biomineralization"

Also DELETE the paragraph that begins:
"Specimens and data from each setting are analyzed using the museum's full 
research infrastructure..."

Also DELETE the line:
"Research Interests: Astrobiology • Mineral Discovery • PharmaMineralogy • 
Energy Materials • Cultural Heritage"

Also DELETE the old opening paragraph that begins:
"The central question driving my research is not compositional — what minerals 
are — but functional..."

Keep everything else in the About section.

---

## REMOVAL 2 — The constellation / research network graphic

Find and DELETE the interactive constellation graphic in the Research section.
It is likely a canvas element, an SVG, or a div with a class like "constellation",
"network", "research-network", "research-graph", or similar.
It may be rendered by a JavaScript library (D3, vis.js, or custom canvas).

Delete:
- The HTML container element for the graphic
- Any associated <script> tags that only serve this graphic
- Any associated <style> or CSS classes that only serve this graphic

Do NOT delete JavaScript that serves the hero animation or the field map.

---

## REMOVAL 3 — The mineral discovery network / location filter

In the Mineral Discovery section, find and DELETE:
- The interactive mineral location network/globe graphic
- The filter buttons (All Localities / Rowley Mine, AZ / Torreçillas, Chile / 
  Blue Lizard, UT / Colorado / North Carolina / California / Czech Republic)
- Any associated JavaScript that only drives this filter/network

Also DELETE the three counter stat boxes:
- "17 / IMA-approved species"
- "3 / countries"  
- "6 / mineral classes"

Keep all prose paragraphs in the Mineral Discovery section.

---

## REMOVAL 4 — The TV credit cards in Media

Find and DELETE the three side-by-side cards:
- Discovery Channel / Expedition Unknown card
- History Channel / The UnXplained card
- Feature Film / The Color of Ink card

Replace with this plain prose block:

```html
<div class="media-credits">
  <p>Television: <em>Expedition Unknown</em> (Discovery Channel, 2019) · 
  <em>The UnXplained</em> (History Channel, Seasons 1 &amp; 5) · 
  Consulting Geologist, <em>The Color of Ink</em> (documentary feature)</p>
  <p>Additional appearances: Spectrum News 1 · Univision · Members Q&amp;A, NHMLAC · 
  IMDB: <a href="https://www.imdb.com/name/nm10697707/">nm10697707</a></p>
</div>
```

---

## REMOVAL 5 — The "Entombing Fukushima" publication card / interactive element

In the Publications section or Research section, find and DELETE any interactive 
card, modal, or expandable element titled "Entombing Fukushima" with keyword 
tags (Sitinakite, Cesium, Radiocesium, etc.).

The Fukushima story is told in prose in the Research section — it does not need 
a separate card.

---

## REMOVAL 6 — Old Field Research intro text

In the Field Research section, find and DELETE this specific sentence if it 
still exists:
"Specimens without field context lose the geochemical relationships that make 
them scientifically useful."

And DELETE this sentence if it still exists:
"The map above documents active research sites across six continents, spanning 
direct field campaigns and ongoing collaborations. Click any marker for location 
details, associated science, and outcomes."

The new field prose is already present — these are leftovers from the old version.

Keep the interactive map and the "Gems of Southern California" link.

---

## STRUCTURAL CHANGES

### Video grid layout

The videos in the Media section are currently displayed in a card grid with 
thumbnails, titles, and descriptions.

Change the video grid to a simple stacked list. Each video should be:
- Full width (not in a grid column)
- iframe embed at 16:9 aspect ratio, full width
- Title in plain text below, no card border, no box

CSS for the video container:
```css
.video-item {
  margin-bottom: 2.5rem;
}
.video-item iframe {
  width: 100%;
  aspect-ratio: 16/9;
  border: none;
  display: block;
}
.video-item p {
  font-size: 14px;
  color: [existing muted text color];
  margin-top: 0.5rem;
}
```

### Section spacing

After all removals, check that sections flow into each other with consistent 
spacing. There should be no large empty gaps where removed elements used to be.
Standard section padding: 3rem top, 2rem bottom, or whatever the existing 
sections use — be consistent.

---

## WHAT TO KEEP — DO NOT TOUCH

- Hero animation (diffraction pattern, floating orbs, all JavaScript)
- Typewriter cycling behavior (from previous pass)
- Interactive field research map
- All prose paragraphs added in the previous pass
- Pull quotes with green left border
- Publications section cards and links
- PoX blog section and image
- Press & Features cards
- Contact form
- Navigation bar
- Footer

---

## VERIFICATION CHECKLIST

After all removals, verify these elements NO LONGER exist on the page:

- [ ] Four research domain cards (Astrobiology / Lithium / Heavy metal / 
      Biomineralization)
- [ ] Constellation / research network graphic
- [ ] Mineral discovery network graphic with location filter buttons
- [ ] Three stat counter boxes (17 / 3 / 6)
- [ ] Three TV credit cards (Discovery / History / Feature Film)
- [ ] "Entombing Fukushima" interactive card
- [ ] Old About opening paragraph ("not compositional — what minerals are")
- [ ] Research Interests bullet/tag line

And verify these ARE present and clean:
- [ ] Prose flows continuously in About, Field, Research, Minerals, Media
- [ ] No doubled content (old + new version of same paragraph)
- [ ] Videos display full-width stacked, not in a card grid
- [ ] Hero animation unchanged
- [ ] Field map unchanged
- [ ] All pull quotes visible with green left border

---

## COMMIT MESSAGE

"Layout cleanup — remove cards, constellation, network graphics, stat counters"

PUSH TO MAIN immediately after commit.
