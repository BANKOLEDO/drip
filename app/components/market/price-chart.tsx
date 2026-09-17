"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMode } from "@/components/mode/mode-context";
import { sessionTrace } from "@/lib/live";
import { DEMO_MARKET } from "@/lib/demo";
import { formatMoney } from "@/lib/format";
import { STOCKS, type StockSymbol } from "@/lib/tokens";

// Intraday chart: real Yahoo 5-minute closes for public symbols, hoverable
// with a crosshair readout. Private assets have no Yahoo series: demo mode
// draws a seeded illustrative walk (labeled), live mode hides the chart
// instead of faking a line.
const POLL_MS = 60_000;
const W = 560;
const H = 180;
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

function seedWalk(symbol: StockSymbol, fair: number): number[] {
  const rnd = mulberry32(hash(symbol));
  const pts = [fair * 0.997];
  for (let i = 1; i < POINTS; i++) {
    pts.push(pts[i - 1] * (1 + (rnd() - 0.5) * 0.0012));
  }
  const k = fair / pts[pts.length - 1];
  return pts.map((p) => p * k);
}

function geometry(closes: number[]) {
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const pts = closes.map((c, i) => ({
    x: PAD + (i * (W - PAD * 2)) / Math.max(1, closes.length - 1),
    y: PAD + (1 - (c - min) / span) * (H - PAD * 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return {
    line,
    area: `${line} L${last.x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`,
    pts,
  };
}

export function PriceChart({ symbol }: { symbol: StockSymbol }) {
  const { mode } = useMode();
  const [closes, setCloses] = useState<number[] | null>(null);
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
        const body = (await res.json()) as { closes?: number[] };
        if (cancelled || id !== runId.current) return;
        if (body.closes && body.closes.length > 1) setCloses(body.closes);
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
  const trace = !tradeable ? sessionTrace(symbol) : [];
  const series = closes ?? demoSeries ?? (trace.length > 1 ? trace : null);
  if (!series || series.length < 2) return null;

  const { line, area, pts } = geometry(series);
  const first = series[0];
  const lastClose = series[series.length - 1];
  const change = ((lastClose - first) / first) * 100;
  const hp = hover !== null ? pts[Math.min(hover, pts.length - 1)] : null;
  const hpPrice = hover !== null ? series[Math.min(hover, series.length - 1)] : null;
  const flip = hp !== null && hp.x > W * 0.7;

  return (
    <figure aria-label={`${symbol} price chart`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full cursor-crosshair"
        role="img"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          const idx = Math.round(((x - PAD) / (W - PAD * 2)) * (series.length - 1));
          setHover(Math.max(0, Math.min(series.length - 1, idx)));
        }}
        onMouseLeave={() => setHover(null)}
      >
        <path d={area} fill="var(--money)" opacity="0.08" />
        <path d={line} fill="none" stroke="var(--money)" strokeWidth="2" strokeLinejoin="round" />
        {hp !== null && hpPrice !== null && (
          <g>
            <line x1={hp.x} y1={0} x2={hp.x} y2={H} stroke="var(--money)" strokeOpacity="0.3" strokeWidth="1" />
            <circle cx={hp.x} cy={hp.y} r="4" fill="var(--money)" />
            <rect
              x={flip ? hp.x - 92 : hp.x + 8}
              y={Math.max(2, hp.y - 28)}
              width="84"
              height="22"
              rx="4"
              fill="var(--money)"
            />
            <text
              x={flip ? hp.x - 50 : hp.x + 50}
              y={Math.max(2, hp.y - 28) + 15}
              textAnchor="middle"
              fontSize="11"
              fontFamily="monospace"
              fill="var(--bg-paper)"
            >
              ${formatMoney(hpPrice)}
            </text>
          </g>
        )}
        {hp === null && (
          <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3.5" fill="var(--money)" />
        )}
      </svg>
      <figcaption className="mt-1 flex items-baseline justify-between font-mono text-xs tabular">
        <span className="text-sub">
          {mode === "demo" && !tradeable ? "Demo path" : !tradeable ? "This session" : "Today"}
        </span>
        <span className={change >= 0 ? "text-money-deep" : "text-danger"}>
          {change >= 0 ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      </figcaption>
    </figure>
  );
}
