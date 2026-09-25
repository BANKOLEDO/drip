// Drip keeper sweep — zero-dependency Node 24 (ESM) preflight.
// Browser keeper (lib/keeper.ts) owns intraday legs; this script + the
// Vercel daily cron (/api/cron/sweep) own the once-a-day safety sweep.
//
// Usage:
//   node keeper/sweep.mjs                 # dividend-pause check, all public symbols
//   node keeper/sweep.mjs --quote 50      # also pull one Jupiter quote (AAPLx, $50)
//
// Fail-closed: any unreachable feed prints STALE/WATCH, never BUY.
// Keyless Jupiter budget is 0.5 RPS, so quotes are opt-in and single-symbol.

const BACKED_CA = "https://api.backed.fi/api/v2/public/corporate-actions/history?symbol=";
const KRAKEN = "https://api.kraken.com/0/public/Ticker?pair=";
const JUP_ORDER = "https://api.jup.ag/swap/v2/order";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const MINTS = {
  AAPLx: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
  NVDAx: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
  TSLAx: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
  SPYx: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
};
const PAUSE_MINUTES = 15;

async function getJson(url, timeoutMs = 8000) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function flipsFromRows(rows, now) {
  const flips = [];
  for (const r of rows ?? []) {
    const raw = r.exDate ?? r.ex_date ?? r.exTimestamp ?? r.ex_timestamp ?? r.date;
    const t = typeof raw === "number" ? raw * 1000 : Date.parse(String(raw));
    if (!Number.isFinite(t)) continue;
    const ex = new Date(t);
    const flip = new Date(
      Date.UTC(ex.getUTCFullYear(), ex.getUTCMonth(), ex.getUTCDate() + 1, 0, 30, 0),
    );
    const ageH = (now.getTime() - flip.getTime()) / 3_600_000;
    if (ageH > -24 && ageH < 24 + (2 * PAUSE_MINUTES) / 60) flips.push(flip);
  }
  return flips.sort((a, b) => b - a);
}

async function krakenFair(symbol) {
  for (const pair of [`${symbol}USD`, `${symbol.replace(/x$/, "")}USD`]) {
    const json = await getJson(KRAKEN + pair, 6000);
    const result = json?.result;
    const last = result ? Object.values(result)[0]?.c?.[0] : undefined;
    const price = last ? Number(last) : NaN;
    if (Number.isFinite(price) && price > 0) return price;
  }
  return null;
}

const now = new Date();
console.log(`drip sweep @ ${now.toISOString()}`);
for (const symbol of Object.keys(MINTS)) {
  const json = await getJson(BACKED_CA + symbol);
  const rows = Array.isArray(json) ? json : (json?.data ?? null);
  if (rows === null) {
    console.log(`${symbol}: WATCH — corporate-action feed unreachable, dividend pause unverified`);
    continue;
  }
  const flips = flipsFromRows(rows, now);
  const flip = flips[0] ?? null;
  if (flip && Math.abs(now - flip) / 60_000 <= PAUSE_MINUTES) {
    console.log(`${symbol}: PAUSE — multiplier flips ${flip.toISOString()} (±${PAUSE_MINUTES} min)`);
    continue;
  }
  const fair = await krakenFair(symbol);
  if (fair === null) {
    console.log(`${symbol}: STALE — no fair price, standing aside`);
    continue;
  }
  console.log(
    `${symbol}: OK — fair $${fair.toFixed(2)}` +
      (flip ? `, next flip ${flip.toISOString()}` : ", no flip in window"),
  );
}

const quoteIdx = process.argv.indexOf("--quote");
if (quoteIdx !== -1) {
  const amount = Number(process.argv[quoteIdx + 1] ?? "50") || 50;
  const q = await getJson(
    `${JUP_ORDER}?inputMint=${USDC_MINT}&outputMint=${MINTS.AAPLx}&amount=${Math.round(amount * 1_000_000)}`,
    8000,
  );
  const out = Number(q?.outAmount);
  if (Number.isFinite(out) && out > 0) {
    const price = amount / (out / 1e8);
    console.log(`AAPLx quote: $${price.toFixed(2)} for $${amount} (keyless, quote-only)`);
  } else {
    console.log("AAPLx quote: unreachable — guard would WATCH, never buy");
  }
}
