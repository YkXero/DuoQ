// Turns stat rows + rules into human advice. Pure, also used by scripts/report.ts.
import type { Match } from "../../shared/types.ts";
import { champName } from "./names.ts";
import { duoStats, matchups, playerStats, sessions, synergies, trendVerdict, winRate, type StatRow } from "./analysis.ts";
import { formatValue } from "./formatValue.ts";
import type { Slot } from "./views.ts";

export type Severity = "strength" | "improve" | "note";
export interface Insight { severity: Severity; who: string; title: string; detail: string; metricId?: string; weight: number }

const ADVICE: Record<string, string> = {
  csMin: "Catch side waves between objectives and don't leave a wave crashing into tower when you recall.",
  cs10: "Do last-hit practice for 10 minutes before queueing. The support should stop auto-attacking the wave unless you're setting up a freeze or slow push.",
  csd10: "You're losing the farm war. Trade when the enemy ADC goes for a last hit, and freeze when you're behind.",
  deaths: "Dying less is the cheapest win-rate gain. Before every fight, check where the enemy jungler was last seen.",
  deaths14: "Respect level 2 and 6 power spikes and the enemy support's engage cooldowns. Ward the tri-bush or river at 2:45.",
  deathShare: "You're dying more than a fair 20% share. Play around your flash timer and stay with the team.",
  timeDead: "Too much time dead. Avoid the deaths that start fights 4v5.",
  lateDeaths: "Late-game deaths throw games. Don't farm side lanes alone without vision; move with your support to objectives.",
  visionMin: "Buy a control ward every back, and set up dragon vision 60–90 s before it spawns.",
  pinks: "Keep one control ward on the map at all times. It's 75 gold for safe lanes and objectives.",
  wardsMin: "Swap to Oracle Lens after the support item quest, and ward on every rotation.",
  visionDiff: "You're being out-warded by your lane opponent. Clear their wards before objectives.",
  kp: "Join more fights. After you shove the wave, roam mid with the jungler or ward the enemy jungle.",
  dmgShare: "You have the gold but aren't using it. Stand at max auto range in fights and check your build fits the game.",
  dmgMin: "Look for more safe auto-attacks in trades and fights, and kite back instead of walking away.",
  gd15: "You're behind your lane opponent at 15. Review wave states and recall timings.",
  plates: "Turn lane leads into plates (250g each) before 14:00. Push and hit the tower after every kill or enemy back.",
  duoGd15: "Your bot lane is behind at 15 as a duo. Track the enemy jungler, avoid bad 2v2s and freeze when behind.",
  botDeaths14: "Too many early deaths in bot. Ward before the enemy jungler arrives and back off when your summoners are down.",
  sharedDeaths: "You keep dying together. If one of you gets caught, the other should back off instead of following.",
  throwRate: "You throw leads. After getting ahead, group for dragon and Baron with vision instead of chasing kills.",
  dragonShare: "Bot lane priority wins dragons. Shove before it spawns and ping your jungler.",
  firstBotTower: "Convert lane leads into the first tower. Push with the support item and use plates.",
};

const who = (names: string[], slot?: Slot) => (slot == null ? "Duo" : names[slot]);

function fromRows(rows: StatRow[], names: string[], slot?: Slot): Insight[] {
  const out: Insight[] = [];
  for (const r of rows) {
    if (r.vsBench == null || r.n < Math.max(5, Math.ceil(r.metric.minN / 2)) || r.metric.id === "winrate") continue;
    const v = formatValue(r.metric.format, r.avg), b = formatValue(r.metric.format, r.bench);
    if (r.vsBench <= -0.15)
      out.push({ severity: "improve", who: who(names, slot), metricId: r.metric.id, weight: -r.vsBench,
        title: `${r.metric.label}: ${v} (target ${b})`, detail: ADVICE[r.metric.id] ?? r.metric.info });
    else if (r.vsBench >= 0.15)
      out.push({ severity: "strength", who: who(names, slot), metricId: r.metric.id, weight: r.vsBench,
        title: `${r.metric.label}: ${v} (target ${b})`, detail: r.metric.info });
    const t = trendVerdict(r);
    if (t === "better" || t === "worse")
      out.push({ severity: t === "better" ? "strength" : "improve", who: who(names, slot), metricId: r.metric.id, weight: 0.3,
        title: `${r.metric.label} is getting ${t}: ${formatValue(r.metric.format, r.trend.previous)} → ${formatValue(r.metric.format, r.trend.recent)}`,
        detail: `Last ${r.trend.nRecent} games compared with the ${r.trend.nPrevious} before.` });
  }
  return out;
}

export function insights(g: Match[], names: string[], bracket: number): Insight[] {
  if (g.length < 5) return [{ severity: "note", who: "Duo", title: "Not enough games yet", detail: "Play at least 5 games together to unlock coaching.", weight: 1 }];
  const out: Insight[] = [
    ...fromRows(playerStats(g, 0, bracket), names, 0),
    ...fromRows(playerStats(g, 1, bracket), names, 1),
    ...fromRows(duoStats(g, bracket), names),
  ];

  // Synergy pairs
  const pairs = synergies(g).filter((p) => p.rec.n >= 4);
  const best = [...pairs].sort((a, b) => b.rec.lo - a.rec.lo)[0];
  if (best && (best.rec.wr ?? 0) >= 0.6)
    out.push({ severity: "strength", who: "Duo", weight: 0.8, title: `${champName(best.adc)} + ${champName(best.sup)} is your best pair (${best.rec.w}W ${best.rec.l}L)`, detail: "Pick it more when the draft allows." });
  const worst = [...pairs].sort((a, b) => a.rec.hi - b.rec.hi)[0];
  if (worst && worst !== best && (worst.rec.wr ?? 1) <= 0.35)
    out.push({ severity: "improve", who: "Duo", weight: 0.7, title: `${champName(worst.adc)} + ${champName(worst.sup)} isn't working (${worst.rec.w}W ${worst.rec.l}L)`, detail: "Practise it in normals or swap to a pair that works." });

  // Matchups
  for (const pos of ["BOTTOM", "UTILITY"] as const) {
    const bad = matchups(g, pos).filter((x) => x.rec.n >= 3 && (x.rec.wr ?? 1) <= 0.34).sort((a, b) => a.rec.shrunk - b.rec.shrunk)[0];
    if (bad) out.push({ severity: "improve", who: "Duo", weight: 0.6, title: `Struggling vs ${champName(bad.champ)} (${bad.rec.w}W ${bad.rec.l}L)`, detail: `Plan the matchup in champ select, or ban it.${bad.gd15 != null ? ` You average ${Math.round(bad.gd15)} gold at 15 against it.` : ""}` });
  }

  // Tilt
  const s = sessions(g);
  const late = g.filter((m) => (s.get(m.id)?.game ?? 1) >= 4), wr = winRate(g) ?? 0.5;
  if (late.length >= 5 && (winRate(late) ?? 1) < wr - 0.1)
    out.push({ severity: "improve", who: "Duo", weight: 0.9, title: `Game 4+ of a session: ${Math.round((winRate(late) ?? 0) * 100)}% WR`, detail: `That's below your ${Math.round(wr * 100)}% overall. Stop after 3 games.` });
  const after2L = g.filter((m) => { const i = s.get(m.id); return i?.prev === false && i?.prev2 === false; });
  if (after2L.length >= 4 && (winRate(after2L) ?? 1) < 0.4)
    out.push({ severity: "improve", who: "Duo", weight: 0.9, title: `After 2 losses in a row: ${after2L.filter((m) => m.win).length}W ${after2L.filter((m) => !m.win).length}L`, detail: "Take a break after two losses." });

  if (!out.length) out.push({ severity: "note", who: "Duo", title: "Nothing stands out yet", detail: "Keep playing; trends show up after about 15 games.", weight: 0 });
  return out.sort((a, b) => b.weight - a.weight);
}
