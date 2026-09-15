// Probe round 2: fix Jupiter param + diagnose Kraken failure.
const BASE = "https://api.backed.fi/api/v2/public";

console.log("\n=== Jupiter quote USDC->AAPLx $50 (amount param) ===");
try {
  const usdc = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const aapl = "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp";
  const amount = String(50 * 1e6); // 50 USDC, 6 decimals
  const url = `https://api.jup.ag/swap/v2/order?inputMint=${usdc}&outputMint=${aapl}&amount=${amount}`;
  const r = await fetch(url);
  const j = await r.json();
  console.log("status:", r.status);
  console.log(JSON.stringify(j, null, 2).slice(0, 1800));
} catch (e) {
  console.log("FAILED:", e.message);
}

console.log("\n=== Kraken AAPLxUSD ticker (diagnose) ===");
for (const pair of ["AAPLxUSD", "AAPLUSD"]) {
  try {
    const r = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${pair}`);
    const txt = await r.text();
    console.log(`${pair} -> HTTP ${r.status}, len ${txt.length}: ${txt.slice(0, 300)}`);
  } catch (e) {
    console.log(`${pair} -> fetch failed: name=${e.name} cause=${e.cause?.code ?? e.cause?.message ?? "none"} msg=${e.message}`);
  }
}

console.log("\n=== xstocks mirror (api.xstocks.fi) sanity ===");
try {
  const r = await fetch(`https://api.xstocks.fi/api/v2/public/assets/AAPLx/multiplier?network=Solana`);
  const txt = await r.text();
  console.log(`mirror -> HTTP ${r.status}: ${txt.slice(0, 200)}`);
} catch (e) {
  console.log("mirror fetch failed:", e.message);
}