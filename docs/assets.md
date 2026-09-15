# Drip Asset Prompts

Generate these, save into `app/public/assets/`. Rules for EVERY asset:
- Pipeline: generate at the largest size, then downscale. Never upscale.
- All PNGs at **2x minimum** of displayed size. Vector assets (logo, mark) must be traced/exported as **SVG** after generation.
- **No emoji, no text/logos of real stocks inside generated images** (we use official Backed logos for tickers: `https://xstocks-metadata.backed.fi/logos/tokens/{SYMBOL}.png`).
- **No purple/cyan aurora, no glassmorphism, no glow.** Palette is fixed: paper `#F7F7F4` / white `#FFFFFF` / ink `#141414` / sub-ink `#5C5C57` / money-green `#0A8A4A` / amber `#B45309`.

---

## Asset 1 — App icon / brand mark (SVG master + raster fallbacks)
Signature: a printed bar-chart drop. Three ascending rounded bars shaped like a lowercase "d" / drople it.

Use across: favicon, PWA manifest, brand mark in nav.

**Prompt (Midjourney):**
```
Minimalist flat vector app icon, single bold geometric mark: three ascending vertical bars of increasing height, the tallest bar bends slightly and drips a single rounded drop downward at its tip, forming a negative-space letter "D". Flat colors only: deep green #0A8A4A mark on pure white background. No gradients, no glow, no texture, no 3D, no shadows, no text, no letters. Symmetric, centered, huge margin / breathing room around mark. Clean rounded corners, tech-finance, Swiss editorial style. --v 7 --style raw --no gradient, glow, 3d, text --ar 1:1
```

**Sizes to export (desktop + mobile):**
| Use | Display size | File (2x) |
|---|---|---|
| Favicon .ico | 16/32 sq | 32px PNG + generated ico |
| Web / nav bar | 32×32 | 64px PNG |
| Dashboard empty-state mark | 48 | 96px PNG |
| PWA manifest | 192×192 · 512×512 | 512px PNG (master raster) |
| App store / OS | 1024×1024 | 1024px PNG (master) |
**Master:** trace to `app/public/assets/logo.svg` (viewBox 0 0 512 512) — single path, used everywhere via `<svg>`.

---

## Asset 2 — Hero / "the drip compounds" illustration
Two aspect variants, one concept: a coin-drop falling from a marked price point onto an ascending staircase of shares, steps rising higher as they go right (DCA growth), final step dripping green.

Used in: landing page hero (desktop and mobile).

**Prompt (Midjourney):**
```
Elegant flat editorial illustration, dark ink #141414 line-and-shape style on warm paper #F7F7F4 background. A single drop of coin falls vertically and lands on a staircase of three ascending rounded steps; each step is slightly taller; the topmost step emits one more small drop in bright money green #0A8A4A. Steps have subtle tick-mark seam lines like tiny candlestick/bar-chart columns. Generous negative space on the left third for headline text. No gradients, no glow, no shadows, no texture, no 3D render, no text, no letters. Swiss graphic design, SaaS finance, quiet luxury, crisp 2px strokes. --v 7 --style raw --no gradient, glow, shadow, 3d, text --ar 3:2
```

**Export both variants:**
| Variant | Aspect | File | Display |
|---|---|---|---|
| Desktop hero | 16:9 → 1536×864 | `assets/hero-desktop.png` (2x: 3072×1728 PNG) | right ~6 cols of hero |
| Mobile hero | 4:5 crop → 864×1080 | `assets/hero-mobile.png` (2x) | full-width above-the-fold, headline over the negative-space left third |
Keep negative space on the **left** in both variants (headline overlays there).

---

## Asset 3 — OG / social share card (1600×900 at 2x)
Vertical split: left = "Drip — Auto-invest in US stocks. Dividends handled." with the scaled-receipt number `0.9909380 AAPLx` in mono; right = flat UI mock of the guard pill amber `Protecting your buy · dividend cut imminent`.

**Prompt (Midjourney):**
```
Flat fintech marketing card. Left half: deep ink #141414 solid panel with wordmark "Drip" in clean sans-serif and one line stacked under it: "Auto-invest in US stocks. Dividends handled." Below, monospace numeral "0.9909380 AAPLx" in white. Right half: warm paper #F7F7F4 with a small flat UI card: rounded white card, 1px hairline border, an amber #B45309 pill badge reading "Protecting your buy — dividend cut imminent" and a small ascending green bar chart. No gradients, no glow, no glassmorphism, no stock photos, no logos of real companies, strict flat 2D. --v 7 --style raw --no gradient, glow, 3d, photo, logo, text spill
```

**Export:** `assets/og.png` 1600×900 (min 1200×630 for judging links; provide 2x).

---

## Asset 4 — Empty state illustration ("no plans yet")
Single drop-of-coin resting on one flat step, small seam-line, amber pilot light (off).

Used in: dashboard and plan list when user has no active plan.

**Prompt (Midjourney):**
```
Minimalist flat illustration on warm paper #F7F7F4: one rounded drop of coin sitting on a single short flat step below it; above the drop a tiny off-circle dot in pale gray #C8C8C0 (off state). Thin 1.5px ink #141414 outline style, no fill except the drop in muted green #8DBFA0. Generous padding, centered. No gradients, no glow, no shadows, no text. Swiss editorial. --v 7 --style raw --no gradient, glow, shadow, text --ar 3:1
```

**Export:** `assets/empty-state.svg` (reuse via `<svg>`), display 320×~107 (mobile) / 480×~160 (desktop).

---

## In-app icons (SVG, 1.5px stroke): build these as code, don't generate
Guard shield, drop, calendar/dividend, pause-timer, chart, wallet, arrow-up (buy), moon (dark mode). Hand-drawn in `app/icons/` — a generated image would look off-brand. Keep stroke `1.5px`, round caps, ink color adapts via CSS.