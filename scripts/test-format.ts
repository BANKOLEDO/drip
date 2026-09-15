import { scaled, guardStateAt, formatCountdown } from "../app/lib/format.ts";

console.log("scaled:", scaled(0.9874123, 1.0032690125398187));
const g1 = guardStateAt(new Date("2026-08-08T00:20:00.000Z"));
console.log("guard 00:20 (guarding, untilPause 10m):", JSON.stringify(g1, (_k, v) => (v instanceof Date ? v.toISOString() : v)));
const g2 = guardStateAt(new Date("2026-08-08T00:30:00.000Z"));
console.log("guard 00:30 (paused, inPause 15m):", JSON.stringify(g2, (_k, v) => (v instanceof Date ? v.toISOString() : v)));
const g3 = guardStateAt(new Date("2026-08-08T00:46:00.000Z"));
console.log("guard 00:46 (afterWindow):", JSON.stringify(g3, (_k, v) => (v instanceof Date ? v.toISOString() : v)));
const g4 = guardStateAt(new Date("2026-08-08T02:00:00.000Z"));
console.log("guard next-day window:", g4.start.toISOString(), g4.end.toISOString());
console.log("countdown 14:09:", formatCountdown(14 * 60 * 1000 + 9 * 1000));