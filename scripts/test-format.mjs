import { scaled, guardStateAt, formatCountdown } from "../app/lib/format.ts";

console.log("scaled:", scaled(0.9874123, 1.0032690125398187));
const g1 = guardStateAt(new Date("2026-08-08T00:20:00.000Z"));
console.log("guard 00:20 (paused, 10m into band):", JSON.stringify(g1, (_k, v) => (v instanceof Date ? v.toISOString() : v)));
const g2 = guardStateAt(new Date("2026-08-08T00:30:00.000Z"));
console.log("guard 00:30 (paused, 15m left):", JSON.stringify(g2, (_k, v) => (v instanceof Date ? v.toISOString() : v)));
const g3 = guardStateAt(new Date("2026-08-08T00:46:00.000Z"));
console.log("guard 00:46 (guarding toward next day):", JSON.stringify(g3, (_k, v) => (v instanceof Date ? v.toISOString() : v)));
const g0 = guardStateAt(new Date("2026-08-08T00:05:00.000Z"));
console.log("guard 00:05 (guarding, 10m to band):", JSON.stringify(g0, (_k, v) => (v instanceof Date ? v.toISOString() : v)));
console.log("countdown 14:09:", formatCountdown(14 * 60 * 1000 + 9 * 1000));
