# Website Restructure Instructions
# For AI agent execution in Windsurf
# Site: aaroncelestian.github.io/MineralSciences/
# Last updated: May 2026

---

## OVERVIEW

Transform the current academic portfolio site into a single continuous long-form article — 
the reading experience of a National Geographic feature, not a CV. One scroll. One voice. 
No cards, no bullet lists, no section boxes.

The hero animation (JavaScript diffraction pattern / floating orbs) is SACRED. Do not touch it.
The only change to the hero is the typewriter behavior (see Task 1).

---

## TASK 1 — Fix the typewriter in the hero

### Current behavior
The typewriter reveals one static statement and stays there.

### New behavior
The typewriter cycles through multiple statements continuously:
- Types the string character by character (40ms per character)
- Pauses 2400ms when complete
- Deletes character by character (20ms per character)
- Pauses 380ms when empty
- Moves to the next string and repeats forever

### Strings to cycle (in this order)
```
"Minerals cured a disease. I found the mechanism."
"I work in deep time. The questions reach all the way to tomorrow."
"One geometry. Fukushima. Emergency medicine. Same crystal."
"Life leaves its signature in stone. My job is to read it."
"I have named 17 things that never had a name."
"A natural history museum is the longest laboratory on Earth."
"The mineral that cleans Fukushima's water also lives in your pharmacy."
```

### Implementation
Find the existing typewriter element in the hero (likely a `<span>` or `<div>` with 
a typewriter class or id). Replace its JavaScript with this logic:

```javascript
const strings = [
  "Minerals cured a disease. I found the mechanism.",
  "I work in deep time. The questions reach all the way to tomorrow.",
  "One geometry. Fukushima. Emergency medicine. Same crystal.",
  "Life leaves its signature in stone. My job is to read it.",
  "I have named 17 things that never had a name.",
  "A natural history museum is the longest laboratory on Earth.",
  "The mineral that cleans Fukushima's water also lives in your pharmacy."
];

let si = 0, ci = 0, deleting = false;
const el = document.getElementById('YOUR_TYPEWRITER_ELEMENT_ID');

function type() {
  const s = strings[si];
  if (!deleting) {
    ci++;
    el.textContent = s.slice(0, ci);
    if (ci === s.length) {
      deleting = true;
      setTimeout(type, 2400);
      return;
    }
    setTimeout(type, 40);
  } else {
    ci--;
    el.textContent = s.slice(0, ci);
    if (ci === 0) {
      deleting = false;
      si = (si + 1) % strings.length;
      setTimeout(type, 380);
      return;
    }
    setTimeout(type, 20);
  }
}
setTimeout(type, 900);
```

Replace `YOUR_TYPEWRITER_ELEMENT_ID` with the actual id or selector of the 
typewriter element. Preserve any existing CSS classes on that element (font, 
letter-spacing, color, uppercase treatment).

The blinking cursor (if present) should remain. If no cursor exists, add a 
`<span>` after the typewriter element styled as:
```css
display: inline-block;
width: 1px;
height: 0.9em;
background: currentColor;
vertical-align: text-bottom;
animation: blink 1s step-end infinite;
opacity: 0.7;
```
```css
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
```

---

## TASK 2 — Replace the navigation label

### Current
"Research Portfolio" in the top-left nav

### New
"Aaron Celestian" in the same position, same styling

---

## TASK 3 — Replace the About section entirely

Delete the current About section content including:
- The opening paragraph ("The central question driving my research...")
- All research domain cards (Astrobiology, Lithium, Heavy metal, Biomineralization)
- Any "Read more" expand button tied to the old content

Replace with the following continuous prose. Use the existing section typography 
(h2 for "About", body font for paragraphs). No cards. No bullets. No boxes.

### New About prose

```
I didn't fall in love with minerals because they're beautiful. I fell in love 
with them because they remember.

Every crystal that has ever grown — in a volcanic vent three kilometers beneath 
the ocean floor, in the hypersaline pools of a California desert, inside the body 
of a person who never knew it was forming — carries a chemical record of the 
conditions that made it. Temperature. Pressure. What was dissolved in the water. 
Whether anything alive was nearby. Minerals are the planet's oldest archivists, 
and most of us walk past them every day without knowing what they're holding.

My job is to read those records. And then — this is the part that keeps me here — 
to ask what we can do with what they say.
```

After this third paragraph, insert a pull quote block:

```html
<blockquote class="pull-quote">
  "this is the part that keeps me here — to ask what we can do with what they say."
</blockquote>
```

Style the pull quote:
```css
.pull-quote {
  font-family: [same serif as existing body or headings];
  font-size: 1.2rem;
  font-style: italic;
  line-height: 1.55;
  border-left: 2px solid #2d6a4f;
  padding: 0.5rem 0 0.5rem 1.4rem;
  margin: 2rem 0;
  color: [existing primary text color];
}
```

Continue with:

```
I'm the Curator of Mineral Sciences at the Natural History Museum of Los Angeles 
County — steward of one of the finest mineral collections in the world: more than 
150,000 specimens, some of them billions of years old, gathered from every 
geologically significant corner of the planet. Most people think of a museum 
collection as a display case. It isn't. It's a research instrument — a library 
where every book was written by the Earth itself, and where the newest chapters 
are still being written in geothermal brines, in the bones of marine organisms, 
in the walls of craters on Mars.

Curating that collection is not a passive act. Every specimen has a provenance, 
a field context, a set of geochemical relationships that make it scientifically 
useful. Remove a crystal from its host rock without documenting where and how it 
grew, and you've destroyed most of what makes it interesting. The collection is 
only as powerful as the science that feeds it — and the science is only as 
powerful as the collection that grounds it.

That comparative depth — 150,000 specimens, six continents, 4.5 billion years of 
Earth history — changes what questions you can ask. When I pull a halite crystal 
from a California salt lake and find something unexpected in its fluid inclusions, 
I can set it against material from a dozen other hypersaline systems in the 
collection. That's a question a university laboratory with no collection simply 
cannot ask.
```

Insert second pull quote:

```html
<blockquote class="pull-quote">
  "A natural history museum is not where science goes to be preserved. 
  It's where science goes to be done."
</blockquote>
```

---

## TASK 4 — Replace the Field Research section prose

Keep the existing interactive map exactly as-is. Replace only the introductory 
prose above the map with:

```
Field work is not incidental to mineral sciences research — it is where the 
questions get set. The ground tells you things the textbook didn't anticipate.

I've worked at the margins — geochemically speaking. Salt lakes where the water 
is more chemistry than water. Desert playas where a billion years of continental 
runoff has been concentrated into a crust you can crack with your boot. 
Hydrothermal systems where the temperature gradient from vent to seafloor 
compresses the entire history of mineral formation into a few vertical meters. 
These aren't exotic destinations for their own sake. They're the places where 
Earth's processes run fast enough, and concentrate their signatures strongly 
enough, that you can actually see what's happening.

What comes back from those places — specimens, fluid samples, drill core, field 
measurements — feeds directly into the museum's research infrastructure: X-ray 
diffraction, Raman spectroscopy, high-resolution electron imaging, synchrotron 
access at national facilities. The field generates the questions. The laboratory 
reads the answers. The collection holds the evidence for the next person who 
needs to ask something we haven't thought of yet.
```

---

## TASK 5 — Replace the Research section entirely

Delete all current Research section content. Replace with four continuous prose 
beats, flowing without sub-headers. Use a thin horizontal rule or section marker 
between beats only if the existing site uses them — otherwise pure prose.

### Full Research section prose

```
Every research program I run follows the same logic: find the record, read the 
record, ask what the record means for something alive.

[BEAT 1 — Fluid inclusions and Mars]

Sometimes that means examining halite crystals from Searles Lake under a Raman 
spectrometer, looking for the chemical signatures of microbial life preserved 
inside fluid inclusions — tiny pockets of ancient water, sealed inside a crystal, 
sitting in the dark for tens of thousands of years. The water is still there. 
The chemistry is still there. If something was living in that water when the 
crystal formed, the evidence may still be there too. We are learning to read it. 
And what we learn here has a direct bearing on how we design the next generation 
of Mars rovers — because the evaporite sequences at Searles Lake are among the 
best geological analogs for the sedimentary environments Mars orbiters keep 
finding evidence of. We are practicing the method on Earth so we know what to 
look for there.

[BEAT 2 — The geometry nature invented twice]

Sometimes it means recognizing that nature solved an engineering problem millions 
of years before we did — and that the solution is sitting in the crystal structure 
of a mineral we already had in the collection. The titanium silicate framework of 
sitinakite has a cage geometry that selects for potassium ions with extraordinary 
precision. That same geometry, it turns out, is what biological potassium ion 
channels use to regulate electrochemical gradients across cell membranes. Evolution 
and mineralogy arrived at the same solution independently, for the same reason: 
the geometry works. Understanding that mechanism — characterizing exactly why this 
arrangement of atoms selects for cesium and potassium so precisely — led directly 
to two applications nobody planned: the emergency cleanup of radioactive wastewater 
at Fukushima Daiichi, and Lokelma, an FDA-approved drug that pulls excess potassium 
from the bloodstream of patients in cardiac crisis. Same crystal. Same mechanism. 
I didn't design either application. I described the mechanism that made both of 
them possible. That is what basic science does when you let it run long enough.
```

Insert pull quote here:

```html
<blockquote class="pull-quote">
  "Same crystal geometry. Same mechanism. One saves a contaminated bay. 
  One saves a life in an emergency room."
</blockquote>
```

Continue:

```
[BEAT 3 — Mineral-microbe co-construction]

It turns out that minerals and living systems have been collaborating on structural 
problems far longer than we have. Stromatolites — the layered mineral structures 
built by microbial mats in shallow seas — are the oldest macroscopic evidence of 
life on Earth, some of them 3.5 billion years old. They are not fossils in the 
conventional sense. They are architecture: the physical record of bacteria 
directing mineral precipitation to build structures that served biological 
purposes. Minerals and microbes, co-constructing something neither could build 
alone.

That same logic appears in one of the most medically significant findings this 
laboratory has produced. When we imaged kidney stones at synchrotron resolution, 
we found bacterial biofilm woven into the calcium oxalate matrix itself — not 
sitting on the surface, not contamination introduced during handling, but 
structurally integrated into the crystal architecture, as if the stone grew around 
the bacteria deliberately. Published in PNAS in 2026, this finding means kidney 
stone disease may be partly microbial in origin — opening a direct path to 
antibiotic and microbiome-targeted therapies for a condition affecting one in 
eleven people worldwide. From stromatolites to oncology: the mineral didn't just 
record the biology. The mineral is the biology.
```

Insert pull quote here:

```html
<blockquote class="pull-quote">
  "The mineral didn't just record the biology. The mineral is the biology."
</blockquote>
```

Continue with expandable Beat 4:

```
[BEAT 4 — Salton Sea / lithium — EXPANDABLE SECTION]

Wrap the following paragraph in an expand/collapse toggle. 
Button label: "Continue — lithium and the Salton Sea ›"
```

Expandable content:

```
The fourth thread asks whether the geothermal brine beneath the Salton Sea — hot, 
metal-rich, biologically active — might be a lithium source that doesn't require 
open-pit mining, because salt-tolerant bacteria are already doing the 
concentration work at the mineral-fluid interface. That question sits at the 
intersection of microbiology, economic geology, and energy policy. It belongs in 
a museum because a museum is the only institution with the deep-time collection, 
the analytical infrastructure, and the public mandate to work across all three 
at once.
```

### Expand/collapse implementation
```html
<button class="expand-btn" onclick="toggleSection('salton-sea', this)">
  Continue — lithium and the Salton Sea ›
</button>
<div id="salton-sea" class="expandable-section" style="display:none;">
  [expandable paragraph here]
</div>
```

```javascript
function toggleSection(id, btn) {
  const el = document.getElementById(id);
  const open = el.style.display === 'none';
  el.style.display = open ? 'block' : 'none';
  btn.textContent = open 
    ? 'Collapse ‹' 
    : 'Continue — lithium and the Salton Sea ›';
}
```

Or use a CSS max-height transition for smoothness — agent's discretion.

---

## TASK 6 — Replace the Mineral Discovery section

Delete all current content including the counter stats (17 species, 3 countries, 
6 classes) and their display boxes. Replace entirely with:

```
When the International Mineralogical Association approves a new mineral species, 
it means something very specific: a unique atomic arrangement, found in nature, 
that has never been formally characterized. A new combination of elements, locked 
into a geometry the universe invented on its own, that now has a name.

I have named seventeen of them. People sometimes assume that mineral discovery is 
a collector's pursuit — a trophy, a postage stamp in a catalogue. But every new 
mineral is a new material. And new materials are where new science begins.

Take rowleyite. Found at a mine in the Arizona desert, it's structurally unlike 
anything in the existing database. That distinction isn't merely academic. The 
same cage-like framework geometry that makes rowleyite crystallographically unique 
may make it capable of something extraordinary: carrying a drug molecule through 
the bloodstream and releasing it only when it reaches a tumor. We are 
investigating that possibility now. A mineral no one had ever heard of, 
potentially deployed in an oncology ward.

Most mineral discoverers stop at the name. The discovery earns a place in the 
catalogue and the work moves on. This laboratory doesn't stop there — because the 
catalogue is not the point. The point is what comes next: asking what this new 
arrangement of atoms can do, and whether anyone, anywhere, has a problem that 
this geometry might solve. Basic science advancing applied science — not the 
other way around.
```

Insert pull quote:

```html
<blockquote class="pull-quote">
  "Seventeen species. Each one a door that didn't exist before we opened it."
</blockquote>
```

---

## TASK 7 — Update the Media / Public Science section prose

Replace the current introductory text in the Media section with:

```
Discovery carries an obligation. When you find something — when you read a record 
no one has read before, or name a material no one has named — you owe it a 
translation. The work has to travel back from the laboratory to the people it 
ultimately belongs to.

That's what the museum floor is for. It's what Pocketful of χtals is for — a 
writing and podcast project that treats mineralogy the way it deserves to be 
treated: as one of the most consequential and under-told stories in science. Each 
piece starts from a single mineral and follows it wherever it leads — into nuclear 
physics, into medicine, into the history of pigments, into the search for life on 
other planets.

The Unearthed: Raw Beauty exhibition at NHMLAC, running through 2027, presents 
some of the largest and rarest uncut mineral specimens ever displayed — not as 
decoration, but as argument: this is what the Earth has been building for four 
billion years, and we are only beginning to understand what it means.
```

Keep all existing video embeds, TV credits, and press links exactly as they are.
Only replace the prose introduction.

---

## TASK 8 — Add a closing paragraph before Contact

After the media section and before the contact form, add:

```html
<div class="closing-statement">
  <p>The papers, the patents, the software tools, the mineral species — they are 
  the evidence log of a research program built on one conviction: that the most 
  important things minerals do are the things we haven't asked them about yet.</p>
  
  <p>The full record: 
    <a href="publications.html">Publications</a> · 
    <a href="cv.html">Curriculum Vitae</a> · 
    <a href="https://aaroncelestian.substack.com">Pocketful of χtals</a>
  </p>
</div>
```

---

## TASK 9 — Remove or restyle the section cards in About

The four research domain cards (Astrobiology, Lithium extraction, Heavy metal 
sequestration, Biomineralization) should be completely removed. They are replaced 
by the prose in Task 3. Do not keep them in any form.

---

## STYLE NOTES FOR AGENT

- Do not change any colors, fonts, or CSS variables already established in the site
- Do not touch the hero background, animation, orbs, or diffraction pattern JS
- Pull quotes use the green left border: `border-left: 2px solid #2d6a4f`
- All prose paragraphs: no bullet points, no bold mid-sentence, no sub-headers 
  within sections
- The reading experience should feel like one continuous essay from top to bottom
- When in doubt: less formatting, more prose

---

## VERIFICATION CHECKLIST

After implementation, verify:
- [ ] Typewriter cycles through all 7 strings and loops back to the first
- [ ] Typewriter cursor blinks while idle
- [ ] No research domain cards exist anywhere on the page
- [ ] No counter stat boxes (17 / 3 / 6) exist in the minerals section
- [ ] All four pull quotes appear with green left border
- [ ] Salton Sea section is hidden by default, expands on button click
- [ ] Hero animation (diffraction pattern / orbs) is completely unchanged
- [ ] Field map is completely unchanged
- [ ] All video embeds are present and functional
- [ ] Publications and CV link to their respective pages
- [ ] Page reads as continuous prose from hero to contact
