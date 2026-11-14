// Higher-level analysis built on the metric registry: filters, synergies, matchups,
// per-player stat tables, sessions and the in-game performance score.
import { QUEUES, type DataFile, type Match } from "../../shared/types.ts";
import { benchFor, PLAYER_METRICS, DUO_METRICS, relativeToBench, series, type Metric } from "./metrics.ts";
import { groupBy, mean, shrunkWr, wilson, windowTrend, type Trend } from "./stats.ts";
import { adcIdx, enemyIdx, snapDiff, supIdx, view, type Role, type Slot } from "./views.ts";

// ---------------------------------------------------------------- filters
export interface Filters {
  queue: "all" | "ranked" | "normal" | number;
  range: "all" | "20" | "50" | "7d" | "30d";
  result: "all" | "win" | "loss";
  adcChamp: string | null;
  supChamp: string | null;
  enemy: string | null; // enemy bot laner champion
  champ: string | null; // played by either of you
  patch: string | null;
}
export const DEFAULT_FILTERS: Filters = { queue: "all", range: "all", result: "all", adcChamp: null, supChamp: null, enemy: null, champ: null, patch: null };

export function applyFilters(matches: Match[], f: Filters, now = Date.now()): Match[] {
  let out = matches.filter((m) => {
    if (f.queue === "ranked" && !QUEUES[m.queue]?.ranked) return false;
    if (f.queue === "normal" && QUEUES[m.queue]?.ranked !== false) return false;
    if (typeof f.queue === "number" && m.queue !== f.queue) return false;
    if (f.result === "win" && !m.win) return false;
    if (f.result === "loss" && m.win) return false;
    if (f.adcChamp && m.parts[adcIdx(m)].champ !== f.adcChamp) return false;
    if (f.supChamp && m.parts[supIdx(m)].champ !== f.supChamp) return false;
    if (f.enemy && ![enemyIdx(m, "BOTTOM"), enemyIdx(m, "UTILITY")].some((i) => i >= 0 && m.parts[i].champ === f.enemy)) return false;
    if (f.patch && m.patch !== f.patch) return false;
    if (f.champ && !m.duo.some((i) => m.parts[i].champ === f.champ)) return false;
    if (f.range === "7d" && m.ts < now - 7 * 86400000) return false;
    if (f.range === "30d" && m.ts < now - 30 * 86400000) return false;
    return true;
  });
  if (f.range === "20" || f.range === "50") out = out.slice(0, Number(f.range));
  return out;
}

// ---------------------------------------------------------------- basics
export const wins = (g: Match[]) => g.filter((m) => m.win).length;
export const winRate = (g: Match[]) => (g.length ? wins(g) / g.length : null);
export const chrono = (g: Match[]) => [...g].sort((a, b) => a.ts - b.ts);

export interface Record_ { n: number; w: number; l: number; wr: number | null; lo: number; hi: number; shrunk: number }
export function record(g: Match[]): Record_ {
  const w = wins(g), [lo, hi] = wilson(w, g.length);
  return { n: g.length, w, l: g.length - w, wr: winRate(g), lo, hi, shrunk: shrunkWr(w, g.length) };
}

// ---------------------------------------------------------------- synergy & matchups
export interface PairRow { adc: string; sup: string; games: Match[]; rec: Record_; kda: number | null; gd15: number | null }
export function synergies(g: Match[]): PairRow[] {
  return [...groupBy(g, (m) => `${m.parts[adcIdx(m)].champ}|${m.parts[supIdx(m)].champ}`)].map(([key, games]) => {
    const [adc, sup] = key.split("|");
    return {
      adc, sup, games, rec: record(games),
      kda: mean(games.map((m) => { const a = m.parts[adcIdx(m)], s = m.parts[supIdx(m)]; return (a.k + a.a + s.k + s.a) / Math.max(1, a.d + s.d); })),
      gd15: mean(series(DUO_METRICS.find((x) => x.id === "duoGd15")!, games)),
    };
  }).sort((a, b) => b.rec.n - a.rec.n || b.rec.shrunk - a.rec.shrunk);
}

export interface MatchupRow { champ: string; games: Match[]; rec: Record_; gd15: number | null }
export function matchups(g: Match[], pos: Role): MatchupRow[] {
  const ourIdx = (m: Match) => (pos === "BOTTOM" ? adcIdx(m) : supIdx(m));
  return [...groupBy(g, (m) => { const i = enemyIdx(m, pos); return i >= 0 ? m.parts[i].champ : null; })].map(([champ, games]) => ({
    champ, games, rec: record(games), gd15: mean(games.map((m) => snapDiff(m, "15", ourIdx(m), enemyIdx(m, pos), 0))),
  })).sort((a, b) => b.rec.n - a.rec.n || a.rec.shrunk - b.rec.shrunk);
}

export interface ChampRow { champ: string; games: Match[]; rec: Record_; kda: number | null; csMin: number | null; dmgMin: number | null }
export function champPool(g: Match[], slot: Slot): ChampRow[] {
  return [...groupBy(g, (m) => m.parts[m.duo[slot]].champ)].map(([champ, games]) => {
    const ps = games.map((m) => ({ p: m.parts[m.duo[slot]], min: m.dur / 60 }));
    return {
      champ, games, rec: record(games),
      kda: mean(ps.map(({ p }) => (p.k + p.a) / Math.max(1, p.d))),
      csMin: mean(ps.map(({ p, min }) => p.cs / min)),
      dmgMin: mean(ps.map(({ p, min }) => p.dmg / min)),
    };
  }).sort((a, b) => b.rec.n - a.rec.n);
}

// ---------------------------------------------------------------- stat tables
export interface StatRow {
  metric: Metric;
  avg: number | null; inWins: number | null; inLosses: number | null;
  bench: number | null; vsBench: number | null; // >0 = better than benchmark
  trend: Trend; n: number;
}

function statRow(metric: Metric, g: Match[], role: Role, bracket: number, slot?: Slot): StatRow {
  const c = chrono(g);
  const vals = series(metric, c, slot);
  const avg = mean(vals), bench = benchFor(metric, role, bracket);
  return {
    metric, avg, bench,
    inWins: mean(vals.filter((_, i) => c[i].win)), inLosses: mean(vals.filter((_, i) => !c[i].win)),
    vsBench: avg != null && bench != null ? relativeToBench(metric, avg, bench) : null,
    trend: windowTrend(vals, 10), n: vals.filter((v) => v != null).length,
  };
}

/** The role a player mostly played in these games. */
export function mainRole(g: Match[], slot: Slot): Role {
  const adcGames = g.filter((m) => view(m, slot).role === "BOTTOM").length;
  return adcGames >= g.length / 2 ? "BOTTOM" : "UTILITY";
}

export function playerStats(g: Match[], slot: Slot, bracket: number): StatRow[] {
  const role = mainRole(g, slot);
  return PLAYER_METRICS.filter((m) => !m.roles || m.roles.includes(role)).map((m) => statRow(m, g, role, bracket, slot)).filter((r) => r.n > 0);
}
export function duoStats(g: Match[], bracket: number): StatRow[] {
  return DUO_METRICS.map((m) => statRow(m, g, "BOTTOM", bracket)).filter((r) => r.n > 0);
}

/** Trend arrow meaning for the UI: improved / worse / stable. */
export function trendVerdict(r: StatRow): "better" | "worse" | "stable" | "na" {
  const t = r.trend;
  if (t.dir === "na" || t.delta == null) return "na";
  if (!t.significant) return "stable";
  const up = t.delta > 0;
  return (r.metric.better === "higher") === up ? "better" : "worse";
}

// ---------------------------------------------------------------- sessions (tilt analysis)
export interface SessionInfo { game: number; prev: boolean | null; prev2: boolean | null }
export function sessions(all: Match[]): Map<string, SessionInfo> {
  const out = new Map<string, SessionInfo>();
  let prev: Match | null = null, prevInfo: SessionInfo | null = null;
  for (const m of chrono(all)) {
    const sameSession = prev && m.ts - (prev.ts + prev.dur * 1000) < 60 * 60000;
    const info: SessionInfo = sameSession && prev && prevInfo
      ? { game: prevInfo.game + 1, prev: prev.win, prev2: prevInfo.prev }
      : { game: 1, prev: null, prev2: null };
    out.set(m.id, info);
    prev = m; prevInfo = info;
  }
  return out;
}

// ---------------------------------------------------------------- performance score (our own, op.gg-style)
/**
 * "Duo Score" 0–10 for every participant, relative to the other 9 in the same game.
 * Weighted mix of KDA, kill participation, damage share, gold share, vision share and CS share,
 * with role-aware weights. MVP = best on winning team, ACE = best on losing team.
 */
export function gameScores(m: Match): { score: number[]; rank: number[] } {
  const teamTotal = (t: number, f: (p: Match["parts"][number]) => number) => m.parts.reduce((s, p) => (p.team === t ? s + f(p) : s), 0);
  // Raw components per player
  const comp = m.parts.map((p) => {
    const tk = Math.max(1, teamTotal(p.team, (q) => q.k));
    const share = (f: (q: Match["parts"][number]) => number) => f(p) / Math.max(1, teamTotal(p.team, f));
    return {
      kda: Math.min(12, (p.k + p.a) / Math.max(1, p.d)),
      kp: Math.min(1, (p.k + p.a) / tk),
      dmg: share((q) => q.dmg),
      gold: share((q) => q.gold),
      vis: share((q) => q.vision),
      deaths: -p.d,
    };
  });
  // Normalise each component to 0..1 across the 10 players, so no single stat dominates.
  const keys = ["kda", "kp", "dmg", "gold", "vis", "deaths"] as const;
  const norm = Object.fromEntries(keys.map((k) => {
    const xs = comp.map((c) => c[k]), lo = Math.min(...xs), hi = Math.max(...xs);
    return [k, xs.map((x) => (hi - lo < 1e-9 ? 0.5 : (x - lo) / (hi - lo)))];
  })) as Record<(typeof keys)[number], number[]>;
  const raw = m.parts.map((p, i) => {
    const n = (k: (typeof keys)[number]) => norm[k][i];
    const won = p.team === m.team ? m.win : !m.win;
    const base = p.pos === "UTILITY"
      ? 0.3 * n("kda") + 0.3 * n("kp") + 0.15 * n("vis") + 0.1 * n("dmg") + 0.15 * n("deaths")
      : 0.25 * n("kda") + 0.2 * n("kp") + 0.25 * n("dmg") + 0.1 * n("gold") + 0.05 * n("vis") + 0.15 * n("deaths");
    return base + (won ? 0.08 : 0);
  });
  const max = Math.max(...raw), min = Math.min(...raw);
  const score = raw.map((r) => Math.round((3 + 7 * ((r - min) / Math.max(1e-6, max - min))) * 10) / 10);
  const order = [...score.keys()].sort((a, b) => score[b] - score[a]);
  const rank = Array(10).fill(0);
  order.forEach((i, r) => (rank[i] = r + 1));
  return { score, rank };
}
export function badge(m: Match, i: number, scores = gameScores(m)): "MVP" | "ACE" | null {
  const p = m.parts[i];
  const won = p.team === m.team ? m.win : !m.win;
  const best = m.parts.map((_, j) => j).filter((j) => m.parts[j].team === p.team).sort((a, b) => scores.score[b] - scores.score[a])[0];
  return best === i ? (won ? "MVP" : "ACE") : null;
}

// ---------------------------------------------------------------- misc
export const patches = (d: DataFile) => [...new Set(d.matches.map((m) => m.patch))].sort().reverse();
export const champsPlayed = (g: Match[], pick: (m: Match) => number) => [...new Set(g.map((m) => m.parts[pick(m)].champ))].sort();
