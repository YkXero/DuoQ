// The metric registry: every stat is defined once here and reused by tables, trends, goals,
// insights and scripts/report.ts. To track a new stat, add an entry; everything else picks it up.
import type { Match } from "../../shared/types.ts";
import { adcIdx, enemyIdx, killsBefore, snapDiff, snapVal, supIdx, view, type PlayerView, type Role, type Slot } from "./views.ts";

export type Format = "dec1" | "dec2" | "int" | "pct" | "signed" | "time";
export type Category = "Laning" | "Farming" | "Combat" | "Vision" | "Objectives" | "Survival" | "Game state";

/** Typical *good* value per rank bracket: [Iron–Silver, Gold–Plat, Emerald–Diamond, Master+]. */
export type Bench = [number, number, number, number];

interface Base {
  id: string;
  label: string;
  short?: string;
  category: Category;
  format: Format;
  better: "higher" | "lower";
  /** What it means / why it matters (shown in tooltips and goals). */
  info: string;
  /** Games needed before the number is trustworthy. */
  minN: number;
  /** Rate metrics return 0/1 per game (or null when the game doesn't qualify). */
  rate?: boolean;
  /** Size of a "meaningful" difference, used to rank strengths/weaknesses. */
  scale?: number;
}
export interface PlayerMetric extends Base {
  scope: "player";
  roles?: Role[]; // only meaningful for these roles
  get: (v: PlayerView) => number | null;
  bench?: Partial<Record<Role, Bench>>;
}
export interface DuoMetric extends Base {
  scope: "duo";
  get: (m: Match) => number | null;
  bench?: Bench;
}
export type Metric = PlayerMetric | DuoMetric;

const per10 = (x: number, v: PlayerView) => (x / v.min) * 10;
const ADC: Role[] = ["BOTTOM"], SUP: Role[] = ["UTILITY"];

export const PLAYER_METRICS: PlayerMetric[] = [
  // ---------- Combat
  { scope: "player", id: "kda", label: "KDA", category: "Combat", format: "dec2", better: "higher", minN: 10, info: "(Kills + Assists) / Deaths.",
    get: ({ me }) => (me.k + me.a) / Math.max(1, me.d), bench: { BOTTOM: [2.4, 2.8, 3.2, 3.5], UTILITY: [2.6, 3.0, 3.4, 3.8] } },
  { scope: "player", id: "kp", label: "Kill participation", short: "KP", category: "Combat", format: "pct", better: "higher", minN: 10, info: "Share of your team's kills you took part in. For support it's the main macro signal.",
    get: ({ me, m }) => me.kp ?? (m.teams[m.team].kills ? (me.k + me.a) / m.teams[m.team].kills : null), bench: { BOTTOM: [0.5, 0.53, 0.55, 0.57], UTILITY: [0.55, 0.58, 0.62, 0.65] } },
  { scope: "player", id: "dmgMin", label: "Damage / min", short: "DPM", category: "Combat", format: "int", better: "higher", minN: 10, roles: ADC, info: "Damage to champions per minute.",
    get: (v) => v.me.dmg / v.min, bench: { BOTTOM: [575, 675, 775, 875] } },
  { scope: "player", id: "dmgShare", label: "Damage share", category: "Combat", format: "pct", better: "higher", minN: 10, roles: ADC, info: "Your share of the team's champion damage. The ADC's job is converting gold into damage.",
    get: ({ me, m }) => me.dmgShare ?? me.dmg / Math.max(1, m.parts.filter((p) => p.team === m.team).reduce((s, p) => s + p.dmg, 0)), bench: { BOTTOM: [0.255, 0.27, 0.285, 0.295] } },
  { scope: "player", id: "dmgGold", label: "Damage per gold", category: "Combat", format: "dec2", better: "higher", minN: 15, roles: ADC, info: "How efficiently gold turns into champion damage.",
    get: ({ me }) => me.dmg / Math.max(1, me.gold), bench: { BOTTOM: [1.55, 1.75, 1.9, 2.1] } },
  { scope: "player", id: "soloKills", label: "Solo kills", category: "Combat", format: "dec1", better: "higher", minN: 20, info: "Kills with no allied assist. A sign of lane dominance.",
    get: ({ me }) => me.soloKills, bench: { BOTTOM: [0.3, 0.4, 0.5, 0.5] } },
  { scope: "player", id: "immobilize", label: "Enemy immobilizations", category: "Combat", format: "dec1", better: "higher", minN: 15, roles: SUP, info: "Times you crowd-controlled an enemy champion. Engage and peel volume.",
    get: ({ me }) => me.immobilize },
  { scope: "player", id: "healShield", label: "Effective heal & shield / min", category: "Combat", format: "int", better: "higher", minN: 15, roles: SUP, info: "Healing and shielding that actually prevented damage, per minute. Mostly relevant for enchanters.",
    get: (v) => (v.me.healShield == null ? null : v.me.healShield / v.min) },

  // ---------- Farming
  { scope: "player", id: "csMin", label: "CS / min", category: "Farming", format: "dec1", better: "higher", minN: 10, roles: ADC, info: "Minions and monsters per minute. The ADC's main gold source and the stat most tied to rank.",
    get: (v) => v.me.cs / v.min, bench: { BOTTOM: [5.75, 7.5, 8.5, 9.5] } },
  { scope: "player", id: "cs10", label: "CS @ 10", category: "Farming", format: "int", better: "higher", minN: 10, roles: ADC, info: "CS at 10 minutes. Pure laning mechanics, independent of how the game unfolds.",
    get: (v) => snapVal(v.m, "10", v.idx, 2) ?? v.me.cs10, bench: { BOTTOM: [60, 80, 90, 97] } },
  { scope: "player", id: "csd10", scale: 8, label: "CS diff @ 10", category: "Farming", format: "signed", better: "higher", minN: 15, roles: ADC, info: "Your CS minus your lane opponent's at 10 minutes.",
    get: (v) => snapDiff(v.m, "10", v.idx, v.oppIdx, 2), bench: { BOTTOM: [3, 5, 5, 5] } },
  { scope: "player", id: "csd15", scale: 12, label: "CS diff @ 15", category: "Farming", format: "signed", better: "higher", minN: 15, roles: ADC, info: "Your CS minus your lane opponent's at 15 minutes.",
    get: (v) => snapDiff(v.m, "15", v.idx, v.oppIdx, 2), bench: { BOTTOM: [6, 10, 10, 10] } },
  { scope: "player", id: "goldMin", label: "Gold / min", category: "Farming", format: "int", better: "higher", minN: 10, info: "Gold earned per minute.",
    get: (v) => v.me.gold / v.min },

  // ---------- Laning
  { scope: "player", id: "gd15", scale: 400, label: "Gold diff @ 15", short: "GD@15", category: "Laning", format: "signed", better: "higher", minN: 15, info: "Your gold minus your lane opponent's at 15 minutes. The best early-game predictor of winning.",
    get: (v) => snapDiff(v.m, "15", v.idx, v.oppIdx, 0), bench: { BOTTOM: [250, 300, 300, 300], UTILITY: [100, 150, 150, 150] } },
  { scope: "player", id: "xpd15", scale: 400, label: "XP diff @ 15", category: "Laning", format: "signed", better: "higher", minN: 15, info: "Your XP minus your lane opponent's at 15 minutes. Level leads win 2v2 fights.",
    get: (v) => snapDiff(v.m, "15", v.idx, v.oppIdx, 1) },
  { scope: "player", id: "deaths14", label: "Deaths before 14:00", category: "Laning", format: "dec1", better: "lower", minN: 10, info: "Early deaths give shutdown gold and plates away.",
    get: (v) => (v.m.tl ? killsBefore(v.m, 840).filter((k) => k[2] === v.idx).length : null), bench: { BOTTOM: [1.8, 1.4, 1.1, 0.9], UTILITY: [2.0, 1.6, 1.3, 1.1] } },
  { scope: "player", id: "laneDom", label: "Lane domination", category: "Laning", format: "pct", better: "higher", minN: 15, rate: true, info: "Games where you ended laning (14:00) with a 20%+ gold and XP lead over your opponent.",
    get: ({ me }) => me.laneDom },
  { scope: "player", id: "plates", label: "Turret plates", category: "Objectives", format: "dec1", better: "higher", minN: 15, info: "Plates taken (250 gold each). Converting lane leads into gold.",
    get: ({ me }) => me.plates, bench: { BOTTOM: [0.7, 1.0, 1.2, 1.4], UTILITY: [0.5, 0.7, 0.9, 1.1] } },
  { scope: "player", id: "firstBlood", label: "First blood involvement", category: "Laning", format: "pct", better: "higher", minN: 20, rate: true, info: "Got or assisted first blood.",
    get: ({ me }) => (me.firstBlood ? 1 : 0), bench: { BOTTOM: [0.2, 0.2, 0.2, 0.2], UTILITY: [0.2, 0.2, 0.2, 0.2] } },

  // ---------- Survival
  { scope: "player", id: "deaths", label: "Deaths", category: "Survival", format: "dec1", better: "lower", minN: 10, info: "Deaths per game. Dying less is the cheapest win-rate gain in low and mid elo.",
    get: ({ me }) => me.d, bench: { BOTTOM: [6.5, 5.5, 4.8, 4.3], UTILITY: [7, 6.3, 5.5, 5] } },
  { scope: "player", id: "deaths10", label: "Deaths / 10 min", category: "Survival", format: "dec2", better: "lower", minN: 10, info: "Deaths normalized by game length.",
    get: (v) => per10(v.me.d, v) },
  { scope: "player", id: "deathShare", label: "Share of team deaths", category: "Survival", format: "pct", better: "lower", minN: 15, info: "Your deaths / your team's deaths. 20% is a fair share.",
    get: ({ me, m }) => { const t = m.parts.filter((p) => p.team === m.team).reduce((s, p) => s + p.d, 0); return t ? me.d / t : null; }, bench: { BOTTOM: [0.2, 0.2, 0.2, 0.2], UTILITY: [0.2, 0.2, 0.2, 0.2] } },
  { scope: "player", id: "timeDead", label: "Time spent dead", category: "Survival", format: "pct", better: "lower", minN: 10, info: "Share of the game spent dead.",
    get: (v) => v.me.timeDead / v.m.dur, bench: { BOTTOM: [0.09, 0.075, 0.065, 0.055], UTILITY: [0.09, 0.075, 0.065, 0.055] } },
  { scope: "player", id: "lateDeaths", label: "Deaths after 25:00", category: "Survival", format: "dec1", better: "lower", minN: 15, info: "Late-game deaths decide games: usually face-checking or farming side lanes alone.",
    get: (v) => (v.m.tl ? v.m.tl.kills.filter((k) => k[0] >= 1500 && k[2] === v.idx).length : null) },

  // ---------- Vision
  { scope: "player", id: "visionMin", label: "Vision / min", category: "Vision", format: "dec2", better: "higher", minN: 10, info: "Vision score per minute.",
    get: (v) => v.me.vision / v.min, bench: { BOTTOM: [0.5, 0.6, 0.75, 0.9], UTILITY: [1.4, 1.85, 2.4, 3.0] } },
  { scope: "player", id: "visionDiff", scale: 10, label: "Vision diff vs opponent", category: "Vision", format: "signed", better: "higher", minN: 15, info: "Your vision score minus your lane opponent's.",
    get: ({ me, opp }) => (opp ? me.vision - opp.vision : null), bench: { BOTTOM: [0, 0, 0, 0], UTILITY: [0, 0, 0, 0] } },
  { scope: "player", id: "pinks", label: "Control wards bought", category: "Vision", format: "dec1", better: "higher", minN: 10, info: "Control wards per game. The cheapest map control in the game.",
    get: ({ me }) => me.pinks, bench: { BOTTOM: [0.8, 1.2, 1.6, 2], UTILITY: [2, 3.5, 5, 6.5] } },
  { scope: "player", id: "wardsMin", label: "Wards placed / min", category: "Vision", format: "dec2", better: "higher", minN: 10, roles: SUP, info: "Wards placed per minute.",
    get: (v) => v.me.wards / v.min, bench: { UTILITY: [0.9, 1.1, 1.3, 1.5] } },
  { scope: "player", id: "wardsKilledMin", label: "Wards cleared / min", category: "Vision", format: "dec2", better: "higher", minN: 10, info: "Enemy wards destroyed per minute.",
    get: (v) => v.me.wardsKilled / v.min, bench: { UTILITY: [0.15, 0.25, 0.35, 0.45] } },

  // ---------- Objectives
  { scope: "player", id: "dragonPart", label: "Dragon participation", category: "Objectives", format: "pct", better: "higher", minN: 15, info: "Share of your team's dragons you took part in. Bot side owns dragon.",
    get: ({ me, m }) => (me.dragonTk == null || !m.teams[m.team].dragons ? null : Math.min(1, me.dragonTk / m.teams[m.team].dragons)), bench: { BOTTOM: [0.5, 0.55, 0.6, 0.65], UTILITY: [0.55, 0.6, 0.65, 0.7] } },
];

// ---------- duo-level metrics
const laneKills = (m: Match, by: number[], on: number[], sec = 840) => killsBefore(m, sec).filter((k) => by.includes(k[1]) && on.includes(k[2])).length;
const bot = (m: Match) => [adcIdx(m), supIdx(m)];
const enemyBot = (m: Match) => [enemyIdx(m, "BOTTOM"), enemyIdx(m, "UTILITY")];
const teamGold15 = (m: Match) => (m.tl && m.tl.goldDiff.length > 16 ? m.tl.goldDiff[15] : null);
const duoGd = (m: Match, at: "10" | "15") => {
  const [a, s] = bot(m), [ea, es] = enemyBot(m);
  const x = snapDiff(m, at, a, ea, 0), y = snapDiff(m, at, s, es, 0);
  return x == null || y == null ? null : x + y;
};

export const DUO_METRICS: DuoMetric[] = [
  { scope: "duo", id: "winrate", label: "Win rate", category: "Game state", format: "pct", better: "higher", minN: 30, rate: true, info: "Needs 30–50 games before a ±10% change means anything. Focus on process stats.",
    get: (m) => (m.win ? 1 : 0) },
  { scope: "duo", id: "duoGd10", scale: 400, label: "Bot lane gold diff @ 10", category: "Laning", format: "signed", better: "higher", minN: 15, info: "(Our ADC + support gold) − (their ADC + support gold) at 10 min.",
    get: (m) => duoGd(m, "10"), bench: [200, 250, 300, 300] },
  { scope: "duo", id: "duoGd15", scale: 600, label: "Bot lane gold diff @ 15", short: "Lane GD@15", category: "Laning", format: "signed", better: "higher", minN: 15, info: "(Our ADC + support gold) − (their ADC + support gold) at 15 min.",
    get: (m) => duoGd(m, "15"), bench: [400, 500, 500, 500] },
  { scope: "duo", id: "botDeaths14", label: "Bot deaths before 14:00", category: "Laning", format: "dec1", better: "lower", minN: 10, info: "Combined early deaths of the duo.",
    get: (m) => (m.tl ? killsBefore(m, 840).filter((k) => bot(m).includes(k[2])).length : null), bench: [3.6, 2.9, 2.3, 1.9] },
  { scope: "duo", id: "laneKillDiff", scale: 1.5, label: "2v2 kill diff before 14:00", category: "Laning", format: "signed", better: "higher", minN: 15, info: "Kills our duo got on their bot lane minus kills their bot lane got on us, before plates fall.",
    get: (m) => (m.tl ? laneKills(m, bot(m), enemyBot(m)) - laneKills(m, enemyBot(m), bot(m)) : null) },
  { scope: "duo", id: "sharedDeaths", label: "Double deaths in lane", category: "Laning", format: "dec2", better: "lower", minN: 15, info: "Times both of you died within 10 s of each other before 14:00. A 2v2 or gank collapse.",
    get: (m) => {
      if (!m.tl) return null;
      const [a, s] = bot(m), early = killsBefore(m, 840);
      const da = early.filter((k) => k[2] === a).map((k) => k[0]), ds = early.filter((k) => k[2] === s).map((k) => k[0]);
      return da.filter((t) => ds.some((u) => Math.abs(t - u) <= 10)).length;
    }, bench: [0.6, 0.5, 0.35, 0.25] },
  { scope: "duo", id: "firstDragon", label: "First dragon", category: "Objectives", format: "pct", better: "higher", minN: 15, rate: true, info: "Games where your team took the first dragon.",
    get: (m) => (m.teams[m.team].firstDragon ? 1 : 0), bench: [0.5, 0.5, 0.5, 0.5] },
  { scope: "duo", id: "dragonShare", label: "Dragon control", category: "Objectives", format: "pct", better: "higher", minN: 15, info: "Your team's dragons / all dragons killed.",
    get: (m) => { const us = m.teams[m.team].dragons, them = m.teams[m.team === 100 ? 200 : 100].dragons; return us + them ? us / (us + them) : null; }, bench: [0.5, 0.5, 0.5, 0.5] },
  { scope: "duo", id: "firstBotTower", label: "First bot tower taken", category: "Objectives", format: "pct", better: "higher", minN: 15, rate: true, info: "Whether your team destroyed the enemy bot outer turret before they destroyed yours.",
    get: (m) => {
      const t = m.tl?.objectives.find((o) => o[1] === "TOWER:BOT_LANE:OUTER_TURRET");
      return t ? (t[2] === m.team ? 1 : 0) : null;
    }, bench: [0.5, 0.5, 0.5, 0.5] },
  { scope: "duo", id: "throwRate", label: "Throw rate", category: "Game state", format: "pct", better: "lower", minN: 10, rate: true, info: "Of games where your team was 1,500+ gold ahead at 15, how many you lost.",
    get: (m) => { const g = teamGold15(m); return g == null || g < 1500 ? null : m.win ? 0 : 1; }, bench: [0.3, 0.25, 0.2, 0.15] },
  { scope: "duo", id: "comebackRate", label: "Comeback rate", category: "Game state", format: "pct", better: "higher", minN: 10, rate: true, info: "Of games where your team was 1,500+ gold behind at 15, how many you won.",
    get: (m) => { const g = teamGold15(m); return g == null || g > -1500 ? null : m.win ? 1 : 0; }, bench: [0.25, 0.22, 0.2, 0.18] },
];

export const ALL_METRICS: Metric[] = [...PLAYER_METRICS, ...DUO_METRICS];
export const metricById = (id: string) => ALL_METRICS.find((m) => m.id === id);

/** Per-game values in the order of `matches`. Player metrics skip games where the role doesn't apply. */
export function series(metric: Metric, matches: Match[], slot?: Slot): (number | null)[] {
  if (metric.scope === "duo") return matches.map((m) => metric.get(m));
  return matches.map((m) => {
    const v = view(m, slot ?? 0);
    if (metric.roles && !metric.roles.includes(v.role)) return null;
    return metric.get(v);
  });
}

export const TIERS = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"];
export const BRACKETS = ["Iron–Silver", "Gold–Plat", "Emerald–Diamond", "Master+"];
export function bracketOf(tier: string | undefined): number {
  const t = TIERS.indexOf(tier ?? "");
  return t < 0 ? 1 : t <= 2 ? 0 : t <= 4 ? 1 : t <= 6 ? 2 : 3;
}

export function benchFor(metric: Metric, role: Role, bracket: number): number | null {
  if (metric.scope === "duo") return metric.bench?.[bracket] ?? null;
  return metric.bench?.[role]?.[bracket] ?? null;
}

/** +1 = at/above target, scaled; negative = below. Used to rank strengths/weaknesses. */
export function relativeToBench(metric: Metric, value: number, bench: number): number {
  const scale = metric.scale ?? (Math.abs(bench) > 1 ? Math.abs(bench) : Math.max(0.05, Math.abs(bench)));
  const d = (value - bench) / scale;
  return metric.better === "higher" ? d : -d;
}
