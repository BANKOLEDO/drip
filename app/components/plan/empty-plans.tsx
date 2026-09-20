"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getPlansSnapshot,
  getPlansServerSnapshot,
  subscribePlans,
} from "@/lib/plans";

// Empty state that also sees browser-stored plans, not just seeds.
export function EmptyPlans({ seedCount }: { seedCount: number }) {
  const stored = useSyncExternalStore(subscribePlans, getPlansSnapshot, getPlansServerSnapshot);
  if (seedCount > 0 || stored.length > 0) return null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="flex flex-col items-center px-8 py-16 text-center">
        <Image
          src="/assets/empty-state.jpg"
          alt="A quiet droplet waiting to drip"
          width={1200}
          height={400}
          sizes="100vw"
          className="mb-8 h-auto w-full max-w-md rounded-card border border-hair"
        />
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">
          No plans yet
        </h1>
        <p className="mt-3 max-w-sm text-center text-sub">
          Set a schedule. Pick a stock. Drip handles the rest, skipping
          the buys that would overpay, so every fill is real.
        </p>
        <ButtonLink href="/create" className="mt-6">
          Create your first plan
        </ButtonLink>
      </Card>
    </div>
  );
}
