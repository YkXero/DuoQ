// Turns stat rows into plain-language coaching: report-card grades, problems to fix, strengths,
// and what changes between wins and losses. Pure, also used by scripts/report.ts.
import type { Match } from "../../shared/types.ts";
import { champName } from "./names.ts";
import { duoStats, matchups, playerStats, sessions, synergies, trendVerdict, winRate, type StatRow } from "./analysis.ts";
import { formatValue } from "./formatValue.ts";
import type { Category } from "./metrics.ts";
import { fill, plain } from "./plain.ts";
import type { Slot } from "./views.ts";

export type Severity = "strength" | "improve" | "note";
export type Who = Slot | "duo";
export interface Insight {
  severity: Severity;
  who: Who;
  title: string; // plain sentence, e.g. "Imsomnia dies too much in lane"
  detail: string; // the number behind it, in words
  why?: string;
  tip?: string;
  row?: StatRow; // present for stat-based items (draw a meter)
  champs?: string[]; // champion icons to show (pairs, matchups)
  trend?: "better" | "worse" | "stable" | "na";
  weight: number;
}

const wl = (w: number, l: number) => `${w} ${w === 1 ? "win" : "wins"}, ${l} ${l === 1 ? "loss" : "losses"}`;
const whoName = (names: string[], who: Who) => (who === "duo" ? "You" : names[who]);

function describe(r: StatRow): string {
  const v = formatValue(r.metric.format, r.avg), b = formatValue(r.metric.format, r.bench);
  const dir = r.metric.better === "higher" ? "or more" : "or less";
  const unit = r.metric.rate ? " of games" : r.metric.format === "pct" ? "" : " per game";
  return `${plain(r.metric.id).name}: ${v}${unit} · target ${b} ${dir}`;
}

/** How much a stat matters for winning. Low-impact stats never crowd out the important ones. */
export const IMPORTANCE: Record<string, number> = {
  deaths14: 1, botDeaths14: 1, sharedDeaths: 1, duoGd15: 1, gd15: 1, csMin: 1, cs10: 1, deaths: 1, throwRate: 1, visionMin: 0.9, pinks: 0.9,
  dmgShare: 0.9, kp: 0.85, csd10: 0.8, csd15: 0.8, dragonShare: 0.8, lateDeaths: 0.8, timeDead: 0.7, deathShare: 0.7, dmgMin: 0.7,
  duoGd10: 0.7, laneKillDiff: 0.7, plates: 0.6, dragonPart: 0.6, wardsMin: 0.6, visionDiff: 0.6, firstBotTower: 0.6, kda: 0.6,
  firstBlood: 0.3, soloKills: 0.35, laneDom: 0.4, wardsKilledMin: 0.45, firstDragon: 0.5, comebackRate: 0.4, dmgGold: 0.5, xpd15: 0.5,
};

function fromRows(rows: StatRow[], names: string[], who: Who): Insight[] {
  const out: Insight[] = [];
  for (const r of rows) {
    if (r.vsBench == null || r.metric.id === "winrate" || r.n < Math.max(5, Math.ceil(r.metric.minN / 2))) continue;
    const c = plain(r.metric.id), name = whoName(names, who);
    const trend = trendVerdict(r);
    const imp = IMPORTANCE[r.metric.id] ?? 0.6;
    if (r.vsBench <= -0.12) {
      // A positive lead that's just smaller than the target isn't "losing".
      const softer = r.metric.format === "signed" && (r.avg ?? 0) >= 0 && r.metric.better === "higher";
      out.push({ severity: "improve", who, row: r, trend, weight: imp * (-r.vsBench + (trend === "worse" ? 0.2 : 0)) * (softer ? 0.6 : 1),
        title: softer ? `${fill(c.good, name)}, but only by a little` : fill(c.bad, name), detail: describe(r), why: c.why, tip: c.tip });
    } else if (r.vsBench >= 0.12)
      out.push({ severity: "strength", who, row: r, trend, weight: imp * r.vsBench, title: fill(c.good, name), detail: describe(r), why: c.why });
  }
  return out;
}

/** One plain sentence + tone for a stat row (used by the meter list and report card). */
export type Tone = "good" | "bad" | "neutral";

/** Three levels, used everywhere a stat is coloured: within ~8% of the target counts as normal. */
export function toneOf(r: StatRow): Tone {
  const v = r.vsBench ?? 0;
  if (Math.abs(v) < 0.08) return "neutral";
  if (v > 0) return "good";
  const softer = r.metric.format === "signed" && (r.avg ?? 0) >= 0 && r.metric.better === "higher";
  return softer ? "neutral" : "bad";
}

export function verdict(r: StatRow, name: string): { text: string; tone: Tone } {
  const c = plain(r.metric.id), tone = toneOf(r), v = r.vsBench ?? 0;
  if (tone === "neutral")
    return { text: v < 0 && r.metric.format === "signed" && (r.avg ?? 0) >= 0 ? `${fill(c.good, name)}, but only by a little` : `${name} ${name === "You" ? "are" : "is"} about normal for your rank`, tone };
  return { text: fill(tone === "good" ? c.good : c.bad, name), tone };
}

/** Keep one insight per sentence (e.g. CS diff @10 and @15 both say "out-farmed"). */
const dedupe = (xs: Insight[]) => {
  const seen = new Set<string>();
  return xs.filter((x) => (seen.has(x.title) ? false : (seen.add(x.title), true)));
};

export interface Coaching { improve: Insight[]; strengths: Insight[]; notes: Insight[] }

export function coaching(g: Match[], names: string[], bracket: number): Coaching {
  if (g.length < 5) return { improve: [], strengths: [], notes: [{ severity: "note", who: "duo", title: "Not enough games yet", detail: "Play at least 5 games together to unlock coaching.", weight: 1 }] };
  const all: Insight[] = [
    ...fromRows(playerStats(g, 0, bracket), names, 0),
    ...fromRows(playerStats(g, 1, bracket), names, 1),
    ...fromRows(duoStats(g, bracket), names, "duo"),
  ];

  // Champion pairs
  const pairs = synergies(g).filter((p) => p.rec.n >= 4);
  const best = [...pairs].sort((a, b) => b.rec.lo - a.rec.lo)[0];
  if (best && (best.rec.wr ?? 0) >= 0.6)
    all.push({ severity: "strength", who: "duo", weight: 0.8, champs: [best.adc, best.sup], title: `${champName(best.adc)} + ${champName(best.sup)} is your best duo`, detail: `${wl(best.rec.w, best.rec.l)} together.`, tip: "Pick it more when the draft allows." });
  const worst = [...pairs].sort((a, b) => a.rec.hi - b.rec.hi)[0];
  if (worst && worst !== best && (worst.rec.wr ?? 1) <= 0.35)
    all.push({ severity: "improve", who: "duo", weight: 0.7, champs: [worst.adc, worst.sup], title: `${champName(worst.adc)} + ${champName(worst.sup)} isn't working`, detail: `${wl(worst.rec.w, worst.rec.l)} together.`, tip: "Practise it in normals or pick a pair that works for you." });

  // Matchups
  for (const pos of ["BOTTOM", "UTILITY"] as const) {
    const bad = matchups(g, pos).filter((x) => x.rec.n >= 3 && (x.rec.wr ?? 1) <= 0.34).sort((a, b) => a.rec.shrunk - b.rec.shrunk)[0];
    if (bad) all.push({ severity: "improve", who: "duo", weight: 0.6, champs: [bad.champ], title: `You struggle against ${champName(bad.champ)}`, detail: `${wl(bad.rec.w, bad.rec.l)} against them${bad.gd15 != null ? `, ${bad.gd15 >= 0 ? "+" : ""}${Math.round(bad.gd15)} gold in lane at 15 min` : ""}.`, tip: "Look up the matchup before the game, or ban it." });
  }

  // Tilt
  const s = sessions(g), wr = winRate(g) ?? 0.5;
  const late = g.filter((m) => (s.get(m.id)?.game ?? 1) >= 4);
  if (late.length >= 5 && (winRate(late) ?? 1) < wr - 0.1)
    all.push({ severity: "improve", who: "duo", weight: 0.9, title: "You get worse after 3 games in a row", detail: `${Math.round((winRate(late) ?? 0) * 100)}% wins from game 4 on, vs ${Math.round(wr * 100)}% overall.`, tip: "Stop after 3 games." });
  const after2L = g.filter((m) => { const i = s.get(m.id); return i?.prev === false && i?.prev2 === false; });
  if (after2L.length >= 4 && (winRate(after2L) ?? 1) < 0.4)
    all.push({ severity: "improve", who: "duo", weight: 0.9, title: "You tilt after two losses", detail: `${wl(after2L.filter((m) => m.win).length, after2L.filter((m) => !m.win).length)} in games right after losing twice.`, tip: "Take a 15-minute break after two losses in a row." });

  const byWeight = (a: Insight, b: Insight) => b.weight - a.weight;
  return {
    improve: dedupe(all.filter((i) => i.severity === "improve").sort(byWeight)),
    strengths: dedupe(all.filter((i) => i.severity === "strength").sort(byWeight)),
    notes: [],
  };
}

/** Back-compat flat list (used by scripts/report.ts). */
export function insights(g: Match[], names: string[], bracket: number): Insight[] {
  const c = coaching(g, names, bracket);
  return [...c.improve, ...c.strengths, ...c.notes];
}

// ---------------------------------------------------------------- report card
export type Grade = "A" | "B" | "C" | "D" | "F";
export const CATEGORY_ORDER: Category[] = ["Laning", "Farming", "Survival", "Vision", "Combat", "Objectives", "Game state"];
export const CATEGORY_NAME: Record<Category, string> = { Laning: "Laning", Farming: "Farming", Survival: "Staying alive", Vision: "Vision", Combat: "Fighting", Objectives: "Objectives", "Game state": "Closing games" };

export function gradeOf(score: number): Grade {
  return score >= 0.2 ? "A" : score >= 0.06 ? "B" : score >= -0.08 ? "C" : score >= -0.22 ? "D" : "F";
}

export interface CardCell { category: Category; grade: Grade | null; score: number | null; rows: StatRow[]; worst: StatRow | null }

export function reportCard(rows: StatRow[]): CardCell[] {
  return CATEGORY_ORDER.map((category) => {
    const rs = rows.filter((r) => r.metric.category === category && r.vsBench != null && r.n >= 3);
    if (!rs.length) return { category, grade: null, score: null, rows: rs, worst: null };
    const score = rs.reduce((s, r) => s + Math.max(-0.6, Math.min(0.6, r.vsBench!)), 0) / rs.length;
    // Rank by impact: a big miss on an important stat outweighs a big miss on a minor one.
    const sorted = [...rs].sort((a, b) => a.vsBench! * (IMPORTANCE[a.metric.id] ?? 0.6) - b.vsBench! * (IMPORTANCE[b.metric.id] ?? 0.6));
    const grade = gradeOf(score);
    // Explain the grade with the stat that best represents it: the best one for A/B, the worst otherwise.
    const worst = grade === "A" || grade === "B" ? sorted.at(-1)! : sorted[0];
    return { category, grade, score, rows: rs, worst };
  });
}

// ---------------------------------------------------------------- wins vs losses
export interface Swing { who: Who; row: StatRow; text: string; size: number }

/** The stats that change most between wins and losses, as sentences. */
export function winLossSwings(g: Match[], names: string[], bracket: number, limit = 5): Swing[] {
  const groups: [Who, StatRow[]][] = [[0, playerStats(g, 0, bracket)], [1, playerStats(g, 1, bracket)], ["duo", duoStats(g, bracket)]];
  const out: Swing[] = [];
  for (const [who, rows] of groups) {
    for (const r of rows) {
      if (r.inWins == null || r.inLosses == null || r.metric.rate || r.n < 8) continue;
      const scale = r.metric.scale ?? (Math.abs(r.avg ?? 0) || 1);
      const size = Math.abs(r.inWins - r.inLosses) / scale;
      if (size < 0.15) continue;
      const lossesWorse = r.metric.better === "higher" ? r.inLosses < r.inWins : r.inLosses > r.inWins;
      if (!lossesWorse) continue;
      const f = (v: number) => formatValue(r.metric.format, v);
      const name = who === "duo" ? "your bot lane" : names[who];
      out.push({ who, row: r, size, text: `${plain(r.metric.id).name}: ${f(r.inWins)} in wins, ${f(r.inLosses)} in losses (${name})` });
    }
  }
  return out.sort((a, b) => b.size - a.size).slice(0, limit);
}
