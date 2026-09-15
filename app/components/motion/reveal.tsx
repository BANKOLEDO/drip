"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/use-reduced-motion";

// Site-wide scroll-appear, the way zoneless.com animates every section: an
// element starts below its resting spot and rises in the first time it enters
// the viewport. IntersectionObserver fires once, then the observer detaches.
// Reduced-motion viewers get content immediately. A noscript style keeps the
// content visible for crawlers and no-JS users.

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  from?: "up" | "down" | "left" | "right" | "scale";
  delay?: number;
};

const hidden: Record<NonNullable<RevealProps["from"]>, string> = {
  up: "translateY(24px)",
  down: "translateY(-24px)",
  left: "translateX(-28px)",
  right: "translateX(28px)",
  scale: "scale(0.96)",
};

export function Reveal({ children, className, from = "up", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hit, setHit] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setHit(true);
          io.disconnect();
        }
      },
      { rootMargin: "-12% 0px -12% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

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