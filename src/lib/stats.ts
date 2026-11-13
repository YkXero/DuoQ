// Small statistics toolkit. Pure functions, no DOM, also used by scripts/report.ts.
export const clean = (xs: (number | null | undefined)[]) => xs.filter((x): x is number => typeof x === "number" && Number.isFinite(x));

export function mean(xs: (number | null | undefined)[]): number | null {
  const a = clean(xs);
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
}

export function sd(xs: (number | null | undefined)[]): number | null {
  const a = clean(xs);
  if (a.length < 2) return null;
  const m = mean(a)!;
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
}

/** Wilson score interval for a proportion (95%). */
export function wilson(wins: number, n: number, z = 1.96): [number, number] {
  if (!n) return [0, 1];
  const p = wins / n, d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n), r = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [(c - r) / d, (c + r) / d];
}

/** Win rate shrunk toward 50% so small samples don't dominate rankings. */
export const shrunkWr = (wins: number, n: number, prior = 5) => (wins + prior) / (n + 2 * prior);

/** Exponentially weighted moving average, alpha ~0.15 = ~12-game memory. */
export function ewma(xs: (number | null)[], alpha = 0.15): (number | null)[] {
  let acc: number | null = null;
  return xs.map((x) => {
    if (x == null) return acc;
    acc = acc == null ? x : alpha * x + (1 - alpha) * acc;
    return acc;
  });
}

export type TrendDir = "up" | "down" | "flat" | "na";

export interface Trend {
  recent: number | null; previous: number | null; delta: number | null;
  dir: TrendDir; // raw direction of the number
  significant: boolean; // |delta| > 1 pooled standard error
  nRecent: number; nPrevious: number;
}

/** Compare the last `w` values with the `w` before that (values in chronological order). */
export function windowTrend(chrono: (number | null)[], w = 10): Trend {
  const vals = clean(chrono);
  const recent = vals.slice(-w), previous = vals.slice(-2 * w, -w);
  const r = mean(recent), p = mean(previous);
  if (r == null || p == null || recent.length < Math.min(5, w) || previous.length < Math.min(5, w))
    return { recent: r, previous: p, delta: null, dir: "na", significant: false, nRecent: recent.length, nPrevious: previous.length };
  const se = Math.sqrt(((sd(recent) ?? 0) ** 2) / recent.length + ((sd(previous) ?? 0) ** 2) / previous.length);
  const delta = r - p;
  return { recent: r, previous: p, delta, dir: delta > 0 ? "up" : delta < 0 ? "down" : "flat", significant: se > 0 && Math.abs(delta) > se, nRecent: recent.length, nPrevious: previous.length };
}

export function groupBy<T>(list: T[], key: (x: T) => string | null | undefined): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const x of list) {
    const k = key(x);
    if (k == null) continue;
    const arr = map.get(k);
    if (arr) arr.push(x); else map.set(k, [x]);
  }
  return map;
}

/** ISO week key "2026-W46". */
export function isoWeek(ts: number): string {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(d.getFullYear(), 0, 4);
  const week = 1 + Math.round(((d.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
