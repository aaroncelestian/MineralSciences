# CSS Color Changes — aaroncelestian.github.io/MineralSciences/
## For: Claude Agent in Windsurf
## Purpose: Replace cyan/violet tech palette with Verdigris — a copper-patina green derived from mineral chemistry

---

## Overview

Replace every instance of the cyan (`#6ae4ff`) and violet (`#a78bfa`) accent colors with a verdigris palette. The dark navy (`#0b1020`) stays unchanged. All changes are in `styles.css` unless otherwise noted.

Primary accent: `#2a7d6b` (verdigris — oxidized copper green)
Gradient partner: `#1a9e8a` (lighter teal-green)
Tint: `rgba(42, 125, 107, 0.12)` (for backgrounds and tag fills)
Glow: `rgba(42, 125, 107, 0.22)` (for borders and hover rings)

---

## Change 1: CSS Custom Properties

Find the `:root` block and replace these two variables:

```css
/* REMOVE: */
--secondary-color: #6ae4ff;
--accent-color: #a78bfa;

/* REPLACE WITH: */
--secondary-color: #2a7d6b;
--accent-color: #1a9e8a;
--accent-light: rgba(42, 125, 107, 0.12);
--accent-glow: rgba(42, 125, 107, 0.22);
```

---

## Change 2: Section Heading Underline

Fix both the color and the awkward fixed width.

**Find:**
```css
.section h2::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 86px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--secondary-color), var(--accent-color));
}
```

**Replace with:**
```css
.section h2::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 60%;
    max-width: 100px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--secondary-color), var(--accent-color));
}
```

---

## Change 3: Tag Pills

**Find:**
```css
.tag {
    background: linear-gradient(135deg, rgba(106, 228, 255, 0.18) 0%, rgba(167, 139, 250, 0.16) 100%);
    color: rgba(11, 16, 32, 0.92);
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-size: 0.86rem;
    font-weight: 600;
    border: 1px solid rgba(15, 23, 42, 0.10);
}
```

**Replace with:**
```css
.tag {
    background: var(--accent-light);
    color: #0d5c4a;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-size: 0.86rem;
    font-weight: 600;
    border: 1px solid var(--accent-glow);
}
```

---

## Change 4: Button Hover States

Two buttons need updating — `btn-small` and `collapsible-btn`.

**Find:**
```css
.btn-small:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 35px rgba(2, 6, 23, 0.22);
    background: linear-gradient(135deg, rgba(11, 16, 32, 0.98), rgba(167, 139, 250, 0.55));
}
```

**Replace with:**
```css
.btn-small:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 35px rgba(2, 6, 23, 0.22);
    background: linear-gradient(135deg, rgba(11, 16, 32, 0.98), rgba(42, 125, 107, 0.55));
}
```

**Find:**
```css
.collapsible-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 45px rgba(2, 6, 23, 0.24);
    background: linear-gradient(135deg, rgba(11, 16, 32, 0.98), rgba(167, 139, 250, 0.55));
}
```

**Replace with:**
```css
.collapsible-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 45px rgba(2, 6, 23, 0.24);
    background: linear-gradient(135deg, rgba(11, 16, 32, 0.98), rgba(42, 125, 107, 0.55));
}
```

---

## Change 5: Card Hover Glow

This cyan glow appears on `.project-card:hover`, `.publication:hover`, and `.video-card:hover`. Replace all three instances.

**Find** (three instances — replace each one):
```css
box-shadow: 0 16px 48px rgba(2, 6, 23, 0.14), 0 0 0 1px rgba(106, 228, 255, 0.2);
```

**Replace with:**
```css
box-shadow: 0 16px 48px rgba(2, 6, 23, 0.14), 0 0 0 1px rgba(42, 125, 107, 0.25);
```

---

## Change 6: Page Background Gradient

The body background currently tints the page with violet and cyan. Replace with a very subtle verdigris warmth — barely perceptible, just enough to feel alive.

**Find:**
```css
background:
    radial-gradient(900px 500px at 10% 5%, rgba(167, 139, 250, 0.18), transparent 60%),
    radial-gradient(900px 500px at 90% 10%, rgba(106, 228, 255, 0.16), transparent 55%),
    linear-gradient(180deg, #ffffff 0%, #fbfbfe 35%, #f6f7fb 100%);
```

**Replace with:**
```css
background:
    radial-gradient(900px 500px at 10% 5%, rgba(42, 125, 107, 0.07), transparent 60%),
    radial-gradient(900px 500px at 90% 10%, rgba(26, 158, 138, 0.05), transparent 55%),
    linear-gradient(180deg, #ffffff 0%, #fbfffe 35%, #f6faf8 100%);
```

The tints are intentionally low (7% and 5%) — the page should still read as white. The linear-gradient endpoint shifts from cool blue-grey `#f6f7fb` to a barely-warm green-white `#f6faf8`.

---

## Change 7: CV Heading Underline

The CV page heading uses `--secondary-color` via the variable, so it updates automatically once Change 1 is applied. No additional edit needed — just confirm it renders correctly after deploying.

---

## Change 8: Contact and Social Link Colors

Both `.contact-content a` and `.social-links a` use `var(--secondary-color)` and update automatically via Change 1. However, verdigris on white has slightly lower contrast than cyan. If legibility feels weak after testing, explicitly darken the link color:

```css
.contact-content a,
.social-links a {
    color: #1f6b5a;
}
```

`#1f6b5a` is one step darker than the primary verdigris and passes WCAG AA contrast against white.

---

## Change 9: Text Selection Color

`::selection` uses `var(--secondary-color)` and updates automatically via Change 1. No additional edit needed.

---

## Change 10: Mineral Network Filter Buttons

The D3 mineral discovery network filter buttons (from the main website brief) should use verdigris for active and hover states:

```css
.filter-btn.active {
    background: #2a7d6b;
    color: white;
    border-color: #2a7d6b;
}

.filter-btn:hover {
    background: rgba(42, 125, 107, 0.08);
    border-color: #2a7d6b;
}
```

---

## Summary of All Hex Values Changed

| Old value | New value | Where used |
|-----------|-----------|------------|
| `#6ae4ff` | `#2a7d6b` | `--secondary-color` |
| `#a78bfa` | `#1a9e8a` | `--accent-color` |
| `rgba(106, 228, 255, 0.18)` | `rgba(42, 125, 107, 0.12)` | Tag background |
| `rgba(167, 139, 250, 0.16)` | `rgba(42, 125, 107, 0.12)` | Tag background gradient (remove gradient, use flat tint) |
| `rgba(106, 228, 255, 0.2)` | `rgba(42, 125, 107, 0.25)` | Card hover glow ring |
| `rgba(167, 139, 250, 0.55)` | `rgba(42, 125, 107, 0.55)` | Button hover gradient tail |
| `rgba(167, 139, 250, 0.18)` | `rgba(42, 125, 107, 0.07)` | Body background radial tint 1 |
| `rgba(106, 228, 255, 0.16)` | `rgba(26, 158, 138, 0.05)` | Body background radial tint 2 |
| `#f6f7fb` | `#f6faf8` | Body background linear gradient endpoint |

All other colors — navy `#0b1020`, text `#0f172a`, muted text, light bg `#f6f7fb`, white — remain unchanged.
