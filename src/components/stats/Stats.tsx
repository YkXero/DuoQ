import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Match } from "../../../shared/types.ts";
import { chrono, duoStats, playerStats, record, trendVerdict, type StatRow } from "../../lib/analysis.ts";
import { formatValue } from "../../lib/formatValue.ts";
import { ALL_METRICS, BRACKETS, benchFor, metricById, series, type Category } from "../../lib/metrics.ts";
import { stagger } from "../../lib/motion.ts";
import { ewma } from "../../lib/stats.ts";
import { adcIdx, enemyIdx, minutes, snapDiff, supIdx } from "../../lib/views.ts";
import { useApp } from "../../state.tsx";
import { Legend } from "../overview/Charts.tsx";
import { Card, Segmented, Select } from "../ui/Controls.tsx";
import { WinRate } from "../ui/Icons.tsx";
import { GradeBadge, Meter, TrendWord } from "../ui/Meter.tsx";
import { CATEGORY_NAME, reportCard } from "../../lib/insights.ts";
import { fill, plain } from "../../lib/plain.ts";

function BenchBar({ r }: { r: StatRow }) {
  if (r.vsBench == null) return <span className="muted small">–</span>;
  const v = Math.max(-1, Math.min(1, r.vsBench));
  const good = v >= 0;
  return (
    <div className="bench" title={`Target for your rank: ${formatValue(r.metric.format, r.bench)}`}>
      <div className="track" />
      <motion.div className="fill" style={{ background: good ? "var(--good)" : "var(--loss)", [good ? "left" : "right"]: "50%" }}
        initial={{ width: 0 }} animate={{ width: `${Math.abs(v) * 50}%` }} transition={{ type: "spring", stiffness: 200, damping: 26 }} />
    </div>
  );
}

function TrendPill({ r }: { r: StatRow }) {
  const v = trendVerdict(r);
  if (v === "na") return <span className="muted small">–</span>;
  const d = r.trend.delta ?? 0, f = r.metric.format;
  const amount = (d > 0 ? "+" : "−") + (f === "pct" ? `${Math.abs(Math.round(d * 100))}pp` : f === "int" || f === "signed" ? Math.abs(Math.round(d)) : Math.abs(d).toFixed(f === "dec2" ? 2 : 1));
  return (
    <span className={`trend ${v}`} title={`Last ${r.trend.nRecent}: ${formatValue(f, r.trend.recent)} · previous ${r.trend.nPrevious}: ${formatValue(f, r.trend.previous)}`}>
      {v === "stable" ? "≈ stable" : `${r.trend.dir === "up" ? "▲" : "▼"} ${amount}`}
    </span>
  );
}

function StatTable({ rows }: { rows: StatRow[] }) {
  const cats = [...new Set(rows.map((r) => r.metric.category))] as Category[];
  return (
    <div className="scroll-x">
      <table>
        <thead><tr><th>Stat</th><th className="num">Avg</th><th className="num">Wins</th><th className="num">Losses</th><th className="num">Target</th><th>vs target</th><th>Trend (last 10)</th></tr></thead>
        <tbody>
          {cats.map((c) => [
            <tr key={c}><td colSpan={7} className="small muted" style={{ paddingTop: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>{c}</td></tr>,
            ...rows.filter((r) => r.metric.category === c).map((r, i) => (
              <motion.tr key={r.metric.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={stagger(i, 0.02)}>
                <td title={r.metric.info}>{r.metric.label} {r.n < r.metric.minN && <span className="small muted" title={`Only ${r.n} games: needs ${r.metric.minN} to be reliable`}>(n={r.n})</span>}</td>
                <td className="num"><b>{formatValue(r.metric.format, r.avg)}</b></td>
                <td className="num win-c">{formatValue(r.metric.format, r.inWins)}</td>
                <td className="num loss-c">{formatValue(r.metric.format, r.inLosses)}</td>
                <td className="num muted">{formatValue(r.metric.format, r.bench)}</td>
                <td><BenchBar r={r} /></td>
                <td><TrendPill r={r} /></td>
              </motion.tr>
            )),
          ])}
        </tbody>
      </table>
    </div>
  );
}

function MeterList({ rows, name }: { rows: StatRow[]; name: string }) {
  const cells = reportCard(rows);
  const extra = rows.filter((r) => r.vsBench == null && r.avg != null);
  return (
    <div className="stack" style={{ gap: 22 }}>
      {cells.filter((c) => c.rows.length).map((c) => (
        <div key={c.category}>
          <div className="row" style={{ gap: 10, marginBottom: 8 }}><GradeBadge grade={c.grade} size={30} /><h3 className="cat-title">{CATEGORY_NAME[c.category]}</h3></div>
          <div className="meter-list">
            {c.rows.map((r) => {
              const good = (r.vsBench ?? 0) >= 0;
              const p = plain(r.metric.id);
              return (
                <div key={r.metric.id} className="meter-row" title={p.why}>
                  <div style={{ minWidth: 0 }}>
                    <div className="meter-name">{p.name}</div>
                    <div className={`small ${good ? "good-c" : "bad-c"}`}>{fill(good ? p.good : p.bad, name)}</div>
                  </div>
                  <Meter row={r} />
                  <TrendWord v={trendVerdict(r)} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {extra.length > 0 && (
        <p className="small muted">Also tracked without a rank target: {extra.map((r) => `${plain(r.metric.id).name} ${formatValue(r.metric.format, r.avg)}`).join(" · ")}</p>
      )}
    </div>
  );
}

/** Pick any metric and see it game by game (EWMA) or per week, for both players. */
function TrendExplorer() {
  const { games, names, bracket } = useApp();
  const [id, setId] = useState("csMin");
  const metric = metricById(id)!;
  const c = useMemo(() => chrono(games), [games]);
  const rows = useMemo(() => {
    if (metric.scope === "duo") {
      const s = ewma(series(metric, c));
      return c.map((m, i) => ({ i: i + 1, ts: m.ts, a: s[i], b: null as number | null }));
    }
    const s0 = ewma(series(metric, c, 0)), s1 = ewma(series(metric, c, 1));
    return c.map((m, i) => ({ i: i + 1, ts: m.ts, a: s0[i], b: s1[i] }));
  }, [metric, c]);
  const bench0 = benchFor(metric, metric.scope === "player" ? (metric.roles?.[0] ?? "BOTTOM") : "BOTTOM", bracket);
  const fmt = (v: number) => formatValue(metric.format, v);
  return (
    <Card title="Are you improving?" hint="pick a stat; the line is smoothed so one bad game doesn't hide the trend">
      <div className="row wrap-row" style={{ marginBottom: 10 }}>
        <Select label="Metric" value={id} onChange={setId} options={ALL_METRICS.filter((m) => m.id !== "winrate").map((m) => ({ value: m.id, label: `${m.category} · ${m.label}` }))} />
        {metric.scope === "player" ? <Legend items={[{ label: names[0], color: "var(--p0)" }, { label: names[1], color: "var(--p1)" }]} /> : <Legend items={[{ label: "Duo", color: "var(--gold)" }]} />}
        {bench0 != null && <span className="small muted">Dashed line: {BRACKETS[bracket]} target ({fmt(bench0)})</span>}
      </div>
      <div className="small muted" style={{ marginBottom: 6 }}>{metric.info} <b className="text-2">{metric.better === "higher" ? "Higher is better." : "Lower is better."}</b></div>
      <div style={{ height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={rows} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#2e2e38" vertical={false} />
            <XAxis dataKey="i" stroke="#4a4a5a" tick={{ fill: "#8a899c", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis stroke="#4a4a5a" tick={{ fill: "#8a899c", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmt} width={50} domain={["auto", "auto"]} />
            {bench0 != null && <ReferenceLine y={bench0} stroke="#8a899c" strokeDasharray="4 4" />}
            <Tooltip cursor={{ stroke: "#4a4a5a" }} content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const r = payload[0].payload as (typeof rows)[number];
              return <div className="chart-tip"><div className="h">Game {r.i} · {new Date(r.ts).toLocaleDateString()}</div>
                {r.a != null && <div><b className={metric.scope === "duo" ? "" : "p0"}>{metric.scope === "duo" ? "Duo" : names[0]}</b> {fmt(r.a)}</div>}
                {r.b != null && <div><b className="p1">{names[1]}</b> {fmt(r.b)}</div>}</div>;
            }} />
            <Line dataKey="a" stroke={metric.scope === "duo" ? "var(--gold)" : "var(--p0)"} strokeWidth={2} dot={false} connectNulls type="monotone" animationDuration={600} />
            {metric.scope === "player" && <Line dataKey="b" stroke="var(--p1)" strokeWidth={2} dot={false} connectNulls type="monotone" animationDuration={600} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/** Win-rate bar with a 50% mark: blue past the mark = winning more than losing. */
function WrBar({ wr }: { wr: number }) {
  return (
    <div className="wrbar">
      <motion.i className={wr >= 0.5 ? "w" : "l"} initial={{ width: 0 }} animate={{ width: `${wr * 100}%` }} transition={{ type: "spring", stiffness: 200, damping: 26 }} />
      <span className="half" />
    </div>
  );
}

function Breakdown() {
  const { games, session } = useApp();
  const lane = (m: Match) => { const a = snapDiff(m, "15", adcIdx(m), enemyIdx(m, "BOTTOM"), 0), s = snapDiff(m, "15", supIdx(m), enemyIdx(m, "UTILITY"), 0); return a == null || s == null ? null : a + s; };
  const groups: [string, [string, Match[]][]][] = [
    ["Game length", [["Under 25 min", games.filter((m) => minutes(m) < 25)], ["25–32 min", games.filter((m) => minutes(m) >= 25 && minutes(m) < 32)], ["32+ min", games.filter((m) => minutes(m) >= 32)]]],
    ["Bot lane at 15", [["Ahead (+500g)", games.filter((m) => (lane(m) ?? 0) > 500)], ["Even", games.filter((m) => lane(m) != null && Math.abs(lane(m)!) <= 500)], ["Behind (−500g)", games.filter((m) => (lane(m) ?? 0) < -500)]]],
    ["Objectives", [["First dragon", games.filter((m) => m.teams[m.team].firstDragon)], ["No first dragon", games.filter((m) => !m.teams[m.team].firstDragon)], ["First tower", games.filter((m) => m.teams[m.team].firstTower)], ["First blood", games.filter((m) => m.teams[m.team].firstBlood)]]],
    ["Side", [["Blue", games.filter((m) => m.team === 100)], ["Red", games.filter((m) => m.team === 200)]]],
    ["Session", [["1st game", games.filter((m) => session.get(m.id)?.game === 1)], ["2nd–3rd game", games.filter((m) => [2, 3].includes(session.get(m.id)?.game ?? 0))], ["4th+ game", games.filter((m) => (session.get(m.id)?.game ?? 0) >= 4)], ["After a win", games.filter((m) => session.get(m.id)?.prev === true)], ["After a loss", games.filter((m) => session.get(m.id)?.prev === false)]]],
  ];
  return (
    <Card title="When do you win?" hint="the line in each bar is 50%">
      <div className="grid g2" style={{ gap: "4px 24px" }}>
        {groups.map(([title, rows]) => (
          <table key={title}>
            <thead><tr><th>{title}</th><th className="num">Record</th><th /><th className="num">Win rate</th></tr></thead>
            <tbody>{rows.filter(([, g]) => g.length).map(([label, g]) => { const r = record(g); return <tr key={label}><td>{label}</td><td className="num small muted">{r.w}W {r.l}L</td><td style={{ width: "40%" }}><WrBar wr={r.wr ?? 0} /></td><td className="num"><WinRate wr={r.wr} n={r.n} /></td></tr>; })}</tbody>
          </table>
        ))}
      </div>
    </Card>
  );
}

export function Stats() {
  const { games, names, bracket } = useApp();
  const [who, setWho] = useState<"0" | "1" | "duo">("0");
  const [raw, setRaw] = useState(false);
  const rows = useMemo(() => (who === "duo" ? duoStats(games, bracket) : playerStats(games, Number(who) as 0 | 1, bracket)), [games, who, bracket]);
  return (
    <div className="stack">
      <Card title="How you compare" hint={`against ${BRACKETS[bracket]} players`}>
        <div className="row wrap-row" style={{ marginBottom: 16, justifyContent: "space-between" }}>
          <Segmented value={who} onChange={setWho} options={[{ value: "0", label: names[0] }, { value: "1", label: names[1] }, { value: "duo", label: "Bot lane together" }]} />
          <Segmented value={raw ? "raw" : "simple"} onChange={(v) => setRaw(v === "raw")} options={[{ value: "simple", label: "Simple" }, { value: "raw", label: "Exact numbers" }]} />
        </div>
        {raw ? <StatTable rows={rows} /> : <MeterList rows={rows} name={who === "duo" ? "You" : names[Number(who)]} />}
        <p className="small muted" style={{ marginTop: 16 }}>
          The dot is you, the line is the target for your rank, and the green area is where you want to be.
          
          A trend only counts as better or worse when the last 10 games differ from the 10 before by more than normal game-to-game noise.
          Targets come from coaching benchmarks and are a rough guide.
        </p>
      </Card>
      <TrendExplorer />
      <Breakdown />
    </div>
  );
}
