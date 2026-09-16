"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/use-reduced-motion";

// Scroll-appear: elements rise on every viewport entry, both directions.
// Pass once for live polling content, where replay glitches mid-tick.
// Reduced motion and no-JS get content immediately.

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  from?: "up" | "down" | "left" | "right" | "scale";
  delay?: number;
  once?: boolean;
};

const hidden: Record<NonNullable<RevealProps["from"]>, string> = {
  up: "translateY(24px)",
  down: "translateY(-24px)",
  left: "translateX(-28px)",
  right: "translateX(28px)",
  scale: "scale(0.96)",
};

export function Reveal({ children, className, from = "up", delay = 0, once = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hit, setHit] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== el) continue;
          if (entry.isIntersecting) {
            setHit(true);
            if (once) io.disconnect();
          } else if (!once) {
            setHit(false);
          }
        }
      },
      { rootMargin: "-12% 0px -12% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, once]);

  const seen = hit || reduced;

  return (
    <>
      <div
        ref={ref}
        className={cn("reveal-root will-change-transform", className)}
        style={{
          opacity: seen ? 1 : 0,
          transform: seen ? "none" : hidden[from],
          transition: "transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 700ms linear",
          transitionDelay: `${delay}s`,
        }}
      >
        {children}
      </div>
      <noscript>
        <style>{`.reveal-root { opacity: 1 !important; transform: none !important; transition: none !important; }`}</style>
      </noscript>
    </>
  );
}