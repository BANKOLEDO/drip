"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMode } from "@/components/mode/mode-context";
import { DEMO_MARKET } from "@/lib/demo";
import { formatMoney } from "@/lib/format";
import { STOCKS, type StockSymbol } from "@/lib/tokens";

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

// Custom candlestick chart: real Yahoo OHLC for public symbols, hover
// crosshair with OHLC readout, volume bars, last-price tag. Private assets
// draw a seeded demo walk (labeled) or hide in live mode.
const POLL_MS = 60_000;
const W = 560;
const H = 250;
const VOL_H = 44;
const PAD = 8;
const POINTS = 48;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedWalk(symbol: StockSymbol, fair: number): Candle[] {
  const rnd = mulberry32(hash(symbol));
  const now = Math.floor(Date.now() / 300_000) * 300;
  const out: Candle[] = [];
  let p = fair * 0.997;
  for (let i = 0; i < POINTS; i++) {
    const o = p;
    const drift = (rnd() - 0.5) * 0.0012;
    const c = o * (1 + drift);
    const h = Math.max(o, c) * (1 + rnd() * 0.0004);
    const l = Math.min(o, c) * (1 - rnd() * 0.0004);
    out.push({ t: now - (POINTS - 1 - i) * 300, o, h, l, c, v: Math.floor(rnd() * 9000 + 1000) });
    p = c;
  }
  const k = fair / out[out.length - 1].c;
  return out.map((cd) => ({ ...cd, o: cd.o * k, h: cd.h * k, l: cd.l * k, c: cd.c * k }));
}

export function PriceChart({ symbol }: { symbol: StockSymbol }) {
  const { mode } = useMode();
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const runId = useRef(0);
  const tradeable = STOCKS[symbol].category === "public";

  useEffect(() => {
    if (!tradeable) return;
    let cancelled = false;
    runId.current += 1;
    const id = runId.current;
    async function tick() {
      try {
        const res = await fetch(`/api/history?symbol=${encodeURIComponent(symbol)}`, {
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) return;
        const body = (await res.json()) as { candles?: Candle[] };
        if (cancelled || id !== runId.current) return;
        if (body.candles && body.candles.length > 1) setCandles(body.candles);
      } catch {
        // Keep last good series on screen.
      }
    }
    void tick();
    const timer = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [symbol, tradeable]);

  const demoSeries = useMemo(
    () =>
      mode === "demo" && !tradeable
        ? seedWalk(symbol, DEMO_MARKET[symbol].fairUsd)
        : null,
    [symbol, mode, tradeable],
  );
  const series = candles ?? demoSeries;
  if (!series || series.length < 2) return null;

  const allH = series.map((c) => c.h);
  const allL = series.map((c) => c.l);
  const max = Math.max(...allH);
  const min = Math.min(...allL);
  const span = max - min || 1;
  const maxV = Math.max(...series.map((c) => c.v), 1);
  const priceH = H - VOL_H - PAD * 2;
  const n = series.length;
  const slot = (W - PAD * 2) / n;
  const bodyW = Math.max(3, Math.min(16, slot * 0.62));
  const y = (p: number) => PAD + (1 - (p - min) / span) * priceH;
  const cx = (i: number) => PAD + slot * (i + 0.5);

  const first = series[0].o;
  const lastClose = series[n - 1].c;
  const change = ((lastClose - first) / first) * 100;
  const hi = hover !== null ? Math.max(0, Math.min(n - 1, hover)) : null;
  const hc = hi !== null ? series[hi] : null;
  const flip = hi !== null && cx(hi) > W * 0.62;
  const up = (c: Candle) => c.c >= c.o;

  return (
    <figure aria-label={`${symbol} price chart`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full cursor-crosshair"
        role="img"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          setHover(Math.max(0, Math.min(n - 1, Math.floor((x - PAD) / slot))));
        }}
        onMouseLeave={() => setHover(null)}
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD}
            x2={W - PAD}
            y1={PAD + priceH * f}
            y2={PAD + priceH * f}
            stroke="var(--hairline)"
            strokeWidth="1"
          />
        ))}
        {series.map((c, i) => (
          <rect
            key={`v${i}`}
            x={cx(i) - bodyW / 2}
            y={H - VOL_H + (1 - c.v / maxV) * (VOL_H - PAD)}
            width={bodyW}
            height={Math.max(1, (c.v / maxV) * (VOL_H - PAD))}
            fill={up(c) ? "var(--leaf)" : "var(--danger)"}
            opacity={hi === i ? 1 : 0.45}
          />
        ))}
        {series.map((c, i) => (
          <g key={i}>
            <line
              x1={cx(i)}
              x2={cx(i)}
              y1={y(c.h)}
              y2={y(c.l)}
              stroke={up(c) ? "var(--leaf)" : "var(--danger)"}
              strokeWidth={Math.max(1, bodyW * 0.18)}
            />
            <rect
              x={cx(i) - bodyW / 2}
              y={y(Math.max(c.o, c.c))}
              width={bodyW}
              height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))}
              fill={up(c) ? "var(--leaf)" : "var(--danger)"}
            />
          </g>
        ))}
        <line
          x1={PAD}
          x2={W - PAD}
          y1={y(lastClose)}
          y2={y(lastClose)}
          stroke="var(--money)"
          strokeWidth="1"
          strokeDasharray="4 3"
          strokeOpacity="0.6"
        />
        <rect
          x={W - PAD - 62}
          y={Math.max(0, y(lastClose) - 11)}
          width="62"
          height="22"
          rx="4"
          fill="var(--money)"
        />
        <text
          x={W - PAD - 31}
          y={Math.max(0, y(lastClose) - 11) + 15}
          textAnchor="middle"
          fontSize="11"
          fontFamily="monospace"
          fill="var(--bg-paper)"
        >
          ${formatMoney(lastClose)}
        </text>
        {hc !== null && hi !== null && (
          <g>
            <line
              x1={cx(hi)}
              x2={cx(hi)}
              y1={0}
              y2={H}
              stroke="var(--money)"
              strokeWidth="1"
              strokeOpacity="0.35"
            />
            <rect
              x={flip ? cx(hi) - 148 : cx(hi) + 8}
              y={8}
              width="140"
              height="64"
              rx="4"
              fill="var(--money)"
            />
            <text
              x={flip ? cx(hi) - 78 : cx(hi) + 78}
              y={24}
              textAnchor="middle"
              fontSize="11"
              fontFamily="monospace"
              fill="var(--bg-paper)"
            >
              O {formatMoney(hc.o)}
            </text>
            <text
              x={flip ? cx(hi) - 78 : cx(hi) + 78}
              y={40}
              textAnchor="middle"
              fontSize="11"
              fontFamily="monospace"
              fill="var(--bg-paper)"
            >
              H {formatMoney(hc.h)} L {formatMoney(hc.l)}
            </text>
            <text
              x={flip ? cx(hi) - 78 : cx(hi) + 78}
              y={56}
              textAnchor="middle"
              fontSize="11"
              fontFamily="monospace"
              fill="var(--bg-paper)"
            >
              C {formatMoney(hc.c)}
            </text>
          </g>
        )}
      </svg>
      <figcaption className="mt-1 flex items-baseline justify-between font-mono text-xs tabular">
        <span className="text-sub">
          {mode === "demo" && !tradeable ? "Demo path" : !tradeable ? "This session" : "Today · 5m"}
        </span>
        <span className={change >= 0 ? "text-money-deep" : "text-danger"}>
          {change >= 0 ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      </figcaption>
    </figure>
  );
}
