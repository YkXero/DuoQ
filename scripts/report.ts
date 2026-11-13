// Coaching report for reviews. Prints everything needed to judge progress and set goals.
// Usage: npm run report [-- --since 2026-11-20] [--demo] [--queue ranked|normal|all]
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DataFile } from "../shared/types.ts";
import type { GoalsFile } from "../shared/goals.ts";
import { applyFilters, champPool, DEFAULT_FILTERS, duoStats, matchups, playerStats, record, synergies, trendVerdict, type StatRow } from "../src/lib/analysis.ts";
import { formatValue } from "../src/lib/formatValue.ts";
import { goalProgress } from "../src/lib/goals.ts";
import { insights } from "../src/lib/insights.ts";
import { BRACKETS, bracketOf } from "../src/lib/metrics.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const file = join(ROOT, "public", "data", args.includes("--demo") ? "demo.json" : "data.json");
const data: DataFile = JSON.parse(await readFile(file, "utf8"));
const goalsPath = join(ROOT, "public", "data", "goals.json");
const goals: GoalsFile = existsSync(goalsPath) ? JSON.parse(await readFile(goalsPath, "utf8")) : { reviews: [], goals: [] };

const queue = (opt("queue") ?? "all") as "all" | "ranked" | "normal";
let games = applyFilters(data.matches, { ...DEFAULT_FILTERS, queue });
const since = opt("since") ?? goals.reviews.at(-1)?.date;
const names = data.players.map((p) => p.riotId.split("#")[0]);
const lastRank = data.rankHistory.at(-1)?.solo ?? [];
const bracket = bracketOf(lastRank.find(Boolean)?.tier);

const h = (s: string) => console.log(`\n## ${s}`);
const table = (rows: StatRow[]) => {
  console.log("| Stat | All | Wins | Losses | Target | vs target | Last10 | Prev10 | Trend |");
  console.log("|---|---|---|---|---|---|---|---|---|");
  for (const r of rows) {
    const f = (v: number | null) => formatValue(r.metric.format, v);
    console.log(`| ${r.metric.label} (n=${r.n}) | ${f(r.avg)} | ${f(r.inWins)} | ${f(r.inLosses)} | ${f(r.bench)} | ${r.vsBench == null ? "–" : (r.vsBench > 0 ? "+" : "") + r.vsBench.toFixed(2)} | ${f(r.trend.recent)} | ${f(r.trend.previous)} | ${trendVerdict(r)} |`);
  }
};

console.log(`# Duo report — ${new Date().toLocaleDateString("sv")}${data.demo ? " (DEMO DATA)" : ""}`);
console.log(`Players: ${data.players.map((p) => p.riotId).join(" & ")} · queue filter: ${queue} · benchmark bracket: ${BRACKETS[bracket]}`);
console.log(`Ranks: ${lastRank.map((r, i) => `${names[i]} ${r ? `${r.tier} ${r.div} ${r.lp}LP` : "unranked"}`).join(", ")}`);
const all = record(games);
console.log(`All games: ${all.n} (${all.w}W ${all.l}L, ${formatValue("pct", all.wr)})`);
if (since) {
  const recent = games.filter((m) => m.ts >= new Date(since + "T00:00:00").getTime());
  const r = record(recent);
  console.log(`Since last review (${since}): ${r.n} games (${r.w}W ${r.l}L, ${formatValue("pct", r.wr)})`);
}
if (args.includes("--recent-only") && since) games = games.filter((m) => m.ts >= new Date(since + "T00:00:00").getTime());

for (const slot of [0, 1] as const) { h(`${names[slot]} stats`); table(playerStats(games, slot, bracket)); }
h("Duo stats"); table(duoStats(games, bracket));

h("Champion pairs");
for (const p of synergies(games).slice(0, 12)) console.log(`- ${p.adc} + ${p.sup}: ${p.rec.w}W ${p.rec.l}L (${formatValue("pct", p.rec.wr)}, CI ${formatValue("pct", p.rec.lo)}–${formatValue("pct", p.rec.hi)}), duo KDA ${formatValue("dec2", p.kda)}, lane GD@15 ${formatValue("signed", p.gd15)}`);
for (const pos of ["BOTTOM", "UTILITY"] as const) {
  h(`vs enemy ${pos === "BOTTOM" ? "ADC" : "support"}`);
  for (const x of matchups(games, pos).slice(0, 10)) console.log(`- ${x.champ}: ${x.rec.w}W ${x.rec.l}L, GD@15 ${formatValue("signed", x.gd15)}`);
}
for (const slot of [0, 1] as const) {
  h(`${names[slot]} champion pool`);
  for (const c of champPool(games, slot).slice(0, 8)) console.log(`- ${c.champ}: ${c.rec.w}W ${c.rec.l}L, KDA ${formatValue("dec2", c.kda)}, CS/min ${formatValue("dec1", c.csMin)}`);
}

h("Automatic insights");
for (const i of insights(games, names, bracket)) console.log(`- [${i.severity}] ${i.title} — ${i.detail}${i.trend && i.trend !== "na" ? ` (${i.trend})` : ""}`);

h("Goals");
if (!goals.goals.length) console.log("No goals yet.");
for (const g of goals.goals) {
  const p = goalProgress(g, data.matches);
  console.log(`- [${g.status}] ${g.title} (${g.metric}${g.slot != null ? `, ${names[g.slot]}` : ""}) — n=${p.n}, value ${p.value == null ? "–" : p.value.toFixed(2)}, hits ${p.hits}/${p.n}, met=${p.met}`);
}
