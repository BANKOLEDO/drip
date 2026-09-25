# Keeper

Intraday legs belong to the browser gating loop (`app/lib/keeper.ts`,
45s `setInterval`, fail-closed). This folder + the Vercel daily cron own
the once-a-day safety sweep only — Vercel Hobby allows 1 cron/day, so it
can never cover intraday legs.

## Pieces

- `sweep.mjs` — zero-dep Node 24 preflight. Checks Backed
  corporate-action flips (±15 min around 00:30 UTC, day after ex-date)
  and Kraken fair prices. Opt-in single Jupiter quote via `--quote`.
  `node keeper/sweep.mjs` before demo day.
- `app/app/api/cron/sweep/route.ts` — deployed daily sweep. Returns
  per-symbol `pause | ok | watch | stale` JSON. Wire it in
  `app/vercel.json` (`0 0 * * *`).
- Browser keeper — the only writer of urgency: premium deferrals,
  stale-data pauses, 80%-of-cap resume hysteresis.

## Why not Vercel for legs

1/day cron can't see a 00:30 UTC flip and a weekend premium spike on the
same week. The browser keeper polls both every 45s while the plan page
is open; the daily sweep catches rot (dead feed, stale fair) overnight.
Neither ever signs: swaps stay user-signed through Jupiter, receipts
stay owner-signed through `record_fill`.
