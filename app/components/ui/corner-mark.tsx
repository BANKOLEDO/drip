import { cn } from "@/lib/cn";

/**
 * Corner registration mark: the little square that sits on a framed
 * panel's border junctions. Shared by the guard studio, the receipt
 * panel, and any future instrument frame.
 */
export function CornerMark({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute size-3 rounded-[2px] border border-hair bg-card",
        className,
      )}
    />
  );
}
