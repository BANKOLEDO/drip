export function formatMoney(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

// Shares / amounts: tubeoff digits to 7 decimals (scaled-ui precision)
export function formatShares(value: number, digits = 7) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: true,
  }).format(value);
}

// formatScale — the fraction part of a multiplier like 0.0032690
export function formatScale(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 7,
    maximumFractionDigits: 7,
    useGrouping: false,
  }).format(value);
}

/**
 * Scaled-ui accounting: scaled = raw x multiplier (in u64 raw it's exact /
 * per-unit; here UI-level for display).
 */
export function scaled(rawShares: number, multiplier: number) {
  return rawShares * multiplier;
}

export type GuardState = {
  // Milliseconds until the pause window starts
  // < 0 => already past the window end
  untilPauseStartMs: number;
  // Milliseconds remaining in the pause window
  // > 0 while paused
  inPauseMs: number;
  // If now is inside pause window
  paused: boolean;
  // If now is before the window (guarding, about to pause)
  guarding: boolean;
  // If now is after the window (next flip pending)
  afterWindow: boolean;
  start: Date;
  end: Date;
};

/**
 * Compute guard state vs a given "now". The pause window is the
 * 30-minute band centered on the next 00:30 UTC multiplier flip that has
 * not fully passed (we always keep computing forward so the demo never
 * looks stale).
 *
 * A flip that already happened is "consumed"; the next candidate is the
 * upcoming 00:30 UTC. -- if we are within the window we are paused.
 */
export function guardStateAt(now: Date): GuardState {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();

  // Next candidate flip at 00:30 UTC today or tomorrow.
  function flipAt(year: number, month: number, day: number) {
    return new Date(Date.UTC(year, month, day, 0, 30, 0, 0));
  }

  let flip = flipAt(y, m, d);
  const winSecs = 15 * 60 * 1000; // 15 min either side
  let start = new Date(flip.getTime() - winSecs);
  let end = new Date(flip.getTime() + winSecs);
  // A flip is consumed only once its full pause window (00:30 ± 15m)
  // has passed — otherwise the second half of the band mid-flip would
  // incorrectly roll to the next day.
  if (now >= end) {
    flip = flipAt(y, m, d + 1);
    start = new Date(flip.getTime() - winSecs);
    end = new Date(flip.getTime() + winSecs);
  }

  const paused = now >= start && now < end;
  const guarding = !paused && now < start;
  const afterWindow = !paused && now >= end;

  return {
    untilPauseStartMs: Math.max(0, start.getTime() - now.getTime()),
    inPauseMs: paused ? end.getTime() - now.getTime() : 0,
    paused,
    guarding,
    afterWindow,
    start,
    end,
  };
}

// Format a clock { h, m, s } like 14:59:59 without leading weirdness
export function formatCountdown(totalMs: number) {
  const totalSec = Math.max(0, Math.floor(totalMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}