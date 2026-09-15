"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

// Counts to a value, eased, the first time the number scrolls into view.
// Used for the real dividend numbers so the page reads as evidence, not stock
// art. Reduced-motion viewers get the final value immediately.

export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1000,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(0);
  const reduced = useReducedMotion();

  const format = (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    let raf = 0;
    let completed = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || completed) return;
        completed = true;
        io.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplayed(value * eased);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: "-12% 0px -12% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, reduced]);

  return (
    <span ref={root} aria-label={format(value)}>
      {format(reduced ? value : displayed)}
    </span>
  );
}