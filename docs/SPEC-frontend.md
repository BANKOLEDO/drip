# Spec: Drip Frontend (Next.js 16)

## Objective
A "Quiet Money" fintech UI for Drip — recurring auto-investing in tokenized US stocks (Backed xStocks) on Solana that pauses around dividend multiplier cuts (00:30 UTC) and guards weekend premium gaps. DOM 0: a polished, live-data-looking **frontend** (landing + app shell: Dashboard, Create Plan, Plan Detail) implementing the three signature components (scaled receipt, guard pill, premium gauge) from `docs/design.md`. Wallet/swap wiring is the next module; this spec is the UI contract only.

## Tech Stack (source-verified, Next.js 16)
- Next.js **16.3.5**, React **19.2.8**, TypeScript 5.9, Tailwind CSS **v4** (`@import "tailwindcss"` + `@theme inline`)
- `next/font/google`: `Inter` (variable) → `--font-sans`, `Geist_Mono` → `--font-mono`
- Turbopack is default for `dev`/`build` (do NOT pass `--turbopack`)
- Async Request APIs ONLY: `params`/`searchParams` are Promises; `cookies`/`headers` async
- `next lint` REMOVED — lint via `eslint` CLI directly
- No extra runtime deps for DOM 0 (no wallet lib yet; mock data lives in `lib/`)
- Icons: hand-drawn SVG components in `components/icons/` (1.5px stroke), never emoji

## Commands
- Dev: `pnpm dev` (app/)
- Build: `pnpm build`
- Lint: `pnpm lint`  (= `eslint`)
- Type: `npx tsc --noEmit`
- Verify after each slice: build + tsc clean

## Project Structure (app/)
```
app/                     → Next app root ("--no-src-dir")
  app/
    layout.tsx           → root layout, Inter var + data-scroll-behavior
    page.tsx             → landing (marketing hero)
    globals.css          → tokens (@theme inline + CSS vars)
    fonts.ts             → inter, geistMono (next/font/google, variable)
    dashboard/page.tsx   → app shell (mock)
    create/page.tsx      → create-plan flow (mock)
    plan/[id]/page.tsx   → plan detail (mock, async params)
  components/
    layout/ app-shell.tsx, topbar.tsx
    ui/ card.tsx, button.tsx, badge.tsx, pill.tsx, skeleton.tsx
    guard/ guard-pill.tsx, scaled-receipt.tsx, premium-gauge.tsx
    icons/ icon-*.tsx (shield, drop, calendar, pause, chart, wallet, moon)
  lib/
    tokens.ts            → verified mints (from ../AGENTS.md) + symbol meta
    mock.ts              → mock plans, portfolio, guard state, guard log
    format.ts            → formatMoney, formatShares, formatScale, useCountdown
  public/assets/
    logo.svg, hero-desktop.png, hero-mobile.png, empty-state.svg, og.png
```

## Code Style
- Functional components, named exports, strict TS. Client components only where interactive (`"use client"`).
- Semantic color tokens from `@theme`: `bg-paper`, `bg-card`, `text-ink`, `text-sub`, `border-hair`, `accent-money`, `accent-amber`, `accent-danger`, `accent-info`.
- Numbers: `tabular-nums` everywhere; mono (`font-mono`) for scale fractions, plan IDs, countdown clock.
- Copy in Drip's voice: short, factual, protective ("You kept the dividend." / "Protecting your buy — dividend cut imminent"). No lorem.
- Grid: page max-w 1200 (desktop 12-col), mobile 4-col gutter 16. Right rail `lg:` only.
- Tailwind scale only — no arbitrary px.

```tsx
// Card pattern
export function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl bg-card p-5 shadow-[0_1px_2px_rgba(20,20,18,.06),0_8px_24px_-12px_rgba(20,20,18,.12)]", className)}>
      {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
      {children}
    </section>
  );
}
```

## Testing Strategy (DOM 0)
- No test runner yet for the UI-only slice (riskiest logic is `format.ts` countdown/scaled math).
- Verification instead: `pnpm build` + `npx tsc --noEmit` per slice; manual responsive check at 320/768/1024/1440.
- Follow-ups: add Vitest for `lib/format.ts` in the keeper/contract slice.

## Boundaries
- Always: semantic tokens only; tabular-nums for money; loading/error/empty states on every list; keyboard-accessible controls; check 320/1440.
- Ask first: adding runtime deps (wallet libs, charts), changing page routes/names, dark-mode default.
- Never: real credit/withholding numbers fabricating beyond `lib/mock.ts`; emoji as icons; `image.domains` (deprecated → `remotePatterns`); committing `.env`/keys.

## Success Criteria
- Landing hero + dashboard + create + plan detail all build clean (`pnpm build`, `tsc --noEmit`)
- Three signature components render: scaled receipt with `×` middonote, guard pill with live countdown to 00:30 UTC pause, premium gauge (amber when over cap)
- Responsive at 320 / 768 / 1024 / 1440
- Mock plan data shows realistic scaled-share math matching AAPLx multiplier `1.0032690125398187`
- No AI-aesthetic violations (no purple gradients/glass/emoji) — greps clean for `from-purple|bg-gradient-to|glass`

## Open Questions
- Wallet library choice for the next module (Solana Kit vs wallet-adapter) — defer to keeper/swap slice.
- Landing share of the demo vs app flow — currently both built; judging leans on the app.