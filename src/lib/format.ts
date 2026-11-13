export const fmt = (x: number | null | undefined, d = 1) => (x == null || Number.isNaN(x) ? "–" : x.toFixed(d));
export const signed = (x: number | null | undefined, d = 0) => (x == null || Number.isNaN(x) ? "–" : (x > 0 ? "+" : "") + x.toFixed(d));
export const pct = (x: number | null | undefined, d = 0) => (x == null || Number.isNaN(x) ? "–" : (x * 100).toFixed(d) + "%");
export const kdaRatio = (k: number, d: number, a: number) => (k + a) / Math.max(1, d);
export const shortName = (riotId: string) => riotId.split("#")[0];
export const duration = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export function timeAgo(ts: number, now = Date.now()) {
  const s = Math.round((now - ts) / 1000);
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
