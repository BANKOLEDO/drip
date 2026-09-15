# Drip Design Language — "Quiet Money"

A billion-dollar UI is not flashier decoration — it is **more readable data, calmer surfaces, and one unmistakable moment**. Drip is a money product. It must look like it came from a bank, not a template.

## Principles (non-negotiable)
1. **Money is the hero.** Every screen leads with a real, tabular, live number. No lorem ipsum anywhere in the app — wire real Backed/Jupiter/Kraken data into every mock.
2. **Restraint = trust.** One accent color. Warm neutrals. Zero decorative gradients on cards, zero glassmorphism, zero emoji-as-icons, zero glow.
3. **Precision is the brand.** The scaled-share math (`raw × multiplier = scaled`) is shown in monospace numerals — that's Drip's signature "you kept your dividend" receipt.
4. **The guard is visible.** The pause-around-00:30-UTC + weekend premium guard is the *product*. It lives on the buy button and the plan card, not buried in settings.
5. **Real assets.** Stock tickers use the official Backed logos (https://xstocks-metadata.backed.fi/logos/tokens/{SYMBOL}.png). Never use invented/generated logos for real tickers — judges will spot it instantly.

## What most vibe-coded UIs get wrong (DON'T)
| Anti-Pattern | Why it fails | Drip rule |
|---|---|---|
| Purple/cyan aurora gradient blob in hero | Every AI template on earth | Flat warm paper #F7F7F4 |
| Glassmorphism cards over a stock photo | Unreadable, unmoney, 2019 | Solid white cards, 1px hairlines |
| Emoji as icons (📈💸🛡) | Deletes all trust | Real SVG icons only, 1.5px stroke |
| Gradient + glow on every button | Roblox, not Robinhood | Flat money-green CTA, hover darken only |
| Pill radii everywhere (24px+ cards) | Toy app | Radius 12 cards / 8 controls / 6 chips |
| Pure black dark-mode + neon | Amateur | #0E0F0D warm black, green accent #2EE584 |
| Lorem text + fake charts | Judges read it in 2s | Live data everywhere or a 00:30 UTC countdown |
| Everything rounded, one font weight | No hierarchy | Inter 400→700 + Geist Mono for numbers/clock |
| Spinners for "loading" | Cheap | Skeleton placeholders, tabular-friendly |

## Tokens
**Color (light-first, dark is secondary)**
- App bg: `#F7F7F4` (warm paper) · Cards: `#FFFFFF` · Ink: `#141414` · Sub-ink: `#5C5C57` · Hairline: `#E7E7E1`
- Accent (money): `#0A8A4A` · hover `#0B9C54`
- Guard states: Active `#0A8A4A` · **Paused/Protecting `#B45309` (amber — this color carries the story)** · Risk `#C0392B` (rare) · Info `#2563EB`
- Dark: bg `#0E0F0D` · card `#171812` · ink `#F4F5F1` · green `#2EE584`

**Type** — Inter var (400/500/600/700, `font-feature-settings: "tnum"`) for all numbers; Geist Mono (500/600) for scale fractions, plan IDs, and the guard clock.
- Display 56/60 (hero number) · H2 28 · H3 20 · Body 15/22 · Caption 12/16 (`letter-spacing: .04em`, uppercase, for labels)

**Shape & space** — 4pt grid. Page gutter 24 desktop / 16 mobile. Card padding 20. Radius 12/8/6. Elevation: `0 1px 2px rgba(20,20,18,.06), 0 8px 24px -12px rgba(20,20,18,.12)`.

**Motion** — 160ms ease-out for reduce-motion-safe transitions; the scaled-receipt number tick-overs at 300ms; guard state swap 240ms. No bounce, no parallax, no drag physics decoration.

**Grid** — desktop 12-col (max-width 1200px, gutters 24px); mobile 4-col (gutter 16px). Right "Live guard" rail appears ≥1024px only.

## Signature components (the 3 things judges remember)
1. **Scaled receipt** — the persuasive moment:
   ```
   0.9874123 AAPLx  ×  1.0032690  =  0.9909380 AAPLx
   ```
   Mono, middle term enlarged; caption below: *"You kept the dividend — shares scaled up +0.36%, price drops on the ex-date. You don't lose."*

2. **Guard window pill** — lives on the buy button AND the plan card:
   - Idle: `Guard ON · next multiplier flip 00:30 UTC · buys paused ±15 min`
   - Counting: a small live countdown to the pause window.
   - Paused: amber pill `Protecting your buy — dividend cut imminent`, button disabled.
   - Premium-spiked: `Premium spike detected — deferred` (Jupiter quote vs Kraken fair > cap).

3. **Premium gauge** — thin bar on the order preview: quoted vs fair %, tinted green when ≤ cap, amber when deferred.

## Screens (structure only — visuals follow tokens above)
**Landing (1 pager):** giant live number ticker headline → scaled-receipt card rendered live → 3 proof bars (pause-on-ex-date / weekend guard / self-custody user-signed swaps) → compliant-countries strip → CTA. Logo: wordmark + bar-chart-drop mark.

**App shell:**
- **Dashboard:** greeting, big portfolio value (tabular), "Next buy" card with countdown + guard pill, plan rows (ticker · amount · next buy · status), activity feed (real tx signatures).
- **Create plan:** stock picker grid (official logos) → amount USDC → interval (daily / weekly / 2-week) → premium tolerance (0.5%/1%/2%) → review: scaled-receipt + premium gauge → sign.
- **Plan detail:** status hero, scaled balance, schedule, **guard log** (past pauses with real dates: "Paused Aug 8 00:30 UTC — AAPLx multiplier flip"), edit/cancel.
- **Geography notice:** compliant-country confirmation + terms checkbox (trust, not friction).

**Mobile:** single column, thumb-reachable bottom sticky `Start DCA` CTA, condensed guard pill `< guard 00:30 · 14m >`, cards stack full-width.
**Desktop:** 12-col; left 8 = plan detail + activity table (dense, hairlines); right 4 = Live guard panel + order preview + scaled receipt.

## Deliverables when building
- `app/` Next.js: Tailwind v4 with these tokens as CSS variables; Inter + Geist Mono via next/font; the 3 signature components as `components/guard.tsx`, `components/scaled-receipt.tsx`, `components/premium-gauge.tsx`.
- Light mode default; dark optional toggle. No PageViews of generic templates anywhere.