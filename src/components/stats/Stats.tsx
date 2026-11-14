import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import type { Match } from "../../../shared/types.ts";
import { chrono, duoStats, playerStats, record, trendVerdict, type StatRow } from "../../lib/analysis.ts";
import { formatValue } from "../../lib/formatValue.ts";
import { ALL_METRICS, BRACKETS, benchFor, metricById, series, type Category } from "../../lib/metrics.ts";
import { stagger } from "../../lib/motion.ts";
import { ewma } from "../../lib/stats.ts";
import { adcIdx, enemyIdx, minutes, snapDiff, supIdx } from "../../lib/views.ts";
import { useApp } from "../../state.tsx";
import { AXIS } from "../overview/Charts.tsx";
import { Card, Segmented, Select } from "../ui/Controls.tsx";
import { WinRate } from "../ui/Icons.tsx";
import { GradeBadge, Meter, TrendWord } from "../ui/Meter.tsx";
import { WinsVsLosses } from "../overview/Overview.tsx";
import { CATEGORY_NAME, reportCard, verdict } from "../../lib/insights.ts";
import { plain } from "../../lib/plain.ts";

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
  return <TrendWord v={trendVerdict(r)} />;
}

function StatTable({ rows }: { rows: StatRow[] }) {
  const cats = [...new Set(rows.map((r) => r.metric.category))] as Category[];
  return (
    <div className="scroll-x">
      <table>
        <thead><tr><th>Stat</th><th className="num">Avg</th><th className="num">Wins</th><th className="num">Losses</th><th className="num">Target</th><th>vs target</th><th>Trend (last 10)</th></tr></thead>
        <tbody>
          {cats.map((c) => [
            <tr key={c}><td colSpan={7} className="small muted" style={{ paddingTop: 14, fontWeight: 700, color: "var(--text)" }}>{c}</td></tr>,
            ...rows.filter((r) => r.metric.category === c).map((r, i) => (
              <motion.tr key={r.metric.id} transition={stagger(i, 0.02)}>
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

function MeterRows({ rows, name }: { rows: StatRow[]; name: string }) {
  return (
    <div className="meter-list">
      {rows.map((r) => {
        const p = plain(r.metric.id), v = verdict(r, name);
        return (
          <div key={r.metric.id} className="meter-row" title={p.why}>
            <div style={{ minWidth: 0 }}>
              <div className="meter-name">{p.name}</div>
              <div className={`small ${v.tone === "good" ? "good-c" : v.tone === "bad" ? "bad-c" : "text-2"}`}>{v.text}</div>
            </div>
            <Meter row={r} />
            <TrendWord v={trendVerdict(r)} />
          </div>
        );
      })}
    </div>
  );
}

export function MeterList({ rows, name }: { rows: StatRow[]; name: string }) {
  const cells = reportCard(rows).filter((c) => c.rows.length);
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="meter-head small">
        <span className="meter-head-cols"><span>vs your rank</span><span>vs your previous 10 games</span></span>
      </div>
      {cells.map((c) => {
        const head = <><GradeBadge grade={c.grade} size={30} /><h3 className="cat-title">{CATEGORY_NAME[c.category]}</h3><span className="small text-2">{c.grade === "A" || c.grade === "B" ? "going well" : c.grade === "C" ? "about normal" : "needs work"}</span></>;
        return c.grade === "A" || c.grade === "B" ? (
          <details key={c.category} className="cat">
            <summary className="row" style={{ gap: 10 }}>{head}<span className="cat-toggle small muted">show</span></summary>
            <div style={{ marginTop: 8 }}><MeterRows rows={c.rows} name={name} /></div>
          </details>
        ) : (
          <section key={c.category} className="cat open">
            <div className="row" style={{ gap: 10, marginBottom: 8 }}>{head}</div>
            <MeterRows rows={c.rows} name={name} />
          </section>
        );
      })}
    </div>
  );
}

/** One stat over time: each game as a faint dot, the smoothed average as the line, the rank target labelled. */
function TrendExplorer() {
  const { games, names, bracket } = useApp();
  const [id, setId] = useState("csMin");
  const metric = metricById(id)!;
  const c = useMemo(() => chrono(games), [games]);
  const rows = useMemo(() => {
    const raw = metric.scope === "duo" ? [series(metric, c), [] as (number | null)[]] : [series(metric, c, 0), series(metric, c, 1)];
    const sm = raw.map((r) => ewma(r));
    return c.map((m, i) => ({ i: i + 1, ts: m.ts, a: sm[0][i], b: sm[1][i] ?? null, ra: raw[0][i], rb: raw[1][i] ?? null }));
  }, [metric, c]);
  const hasA = rows.some((r) => r.ra != null), hasB = rows.some((r) => r.rb != null);
  const role = metric.scope === "player" ? (metric.roles?.[0] ?? (hasA ? "BOTTOM" : "UTILITY")) : "BOTTOM";
  const target = benchFor(metric, role, bracket);
  const fmt = (v: number) => formatValue(metric.format, v);
  const lastIdx = rows.length - 1;
  const series_ = [
    hasA && { key: "a", raw: "ra", color: metric.scope === "duo" ? "var(--gold)" : "var(--p0)", name: metric.scope === "duo" ? "Bot lane" : names[0] },
    hasB && { key: "b", raw: "rb", color: "var(--p1)", name: names[1] },
  ].filter(Boolean) as { key: "a" | "b"; raw: "ra" | "rb"; color: string; name: string }[];
  const end = (s: (typeof series_)[number]) => (props: { x?: number | string; y?: number | string; index?: number }) => {
    const x = Number(props.x), y = Number(props.y);
    if (props.index !== lastIdx || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    const v = rows[lastIdx][s.key];
    return <text x={x + 6} y={y + 4} fill={s.color} fontSize={11} fontWeight={700}>{s.name} {v != null ? fmt(v) : ""}</text>;
  };
  return (
    <Card title="Progress over time">
      <div className="row wrap-row" style={{ marginBottom: 12, justifyContent: "space-between" }}>
        <Select label="Stat" value={id} onChange={setId} options={ALL_METRICS.filter((m) => m.id !== "winrate").map((m) => ({ value: m.id, label: m.label }))} />
        <span className="small text-2">{metric.better === "higher" ? "Higher is better" : "Lower is better"}</span>
      </div>
      <div style={{ height: 260 }}>
        <ResponsiveContainer>
          <ComposedChart data={rows} margin={{ top: 10, right: 110, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#2c2c35" vertical={false} />
            <XAxis dataKey="i" {...AXIS} minTickGap={30} />
            <YAxis {...AXIS} tickFormatter={fmt} width={48} domain={["auto", "auto"]} />
            {target != null && <ReferenceLine y={target} stroke="#a7a7ba" strokeDasharray="4 4" label={{ value: `Target ${fmt(target)}`, position: "right", fill: "#a7a7ba", fontSize: 11 }} />}
            <Tooltip cursor={{ stroke: "#515163" }} content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const r = payload[0].payload as (typeof rows)[number];
              return <div className="chart-tip"><div className="h">Game {r.i} · {new Date(r.ts).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</div>
                {series_.map((s) => <div key={s.key}><b style={{ color: s.color }}>{s.name}</b> {r[s.raw] != null ? fmt(r[s.raw]!) : "–"} <span className="text-2">(avg {r[s.key] != null ? fmt(r[s.key]!) : "–"})</span></div>)}</div>;
            }} />
            {series_.map((s) => <Scatter key={s.raw} dataKey={s.raw} fill={s.color} fillOpacity={0.28} shape="circle" isAnimationActive={false} />)}
            {series_.map((s) => <Line key={s.key} dataKey={s.key} stroke={s.color} strokeWidth={2.5} dot={false} connectNulls type="monotone" isAnimationActive={false} label={end(s)} />)}
          </ComposedChart>
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
    <Card title="When do you win?">
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
      <Card title="Compared to your rank" hint={BRACKETS[bracket]}>
        <div className="row wrap-row" style={{ marginBottom: 16, justifyContent: "space-between" }}>
          <Segmented value={who} onChange={setWho} options={[{ value: "0", label: names[0] }, { value: "1", label: names[1] }, { value: "duo", label: "Bot lane together" }]} />
          <Segmented value={raw ? "raw" : "simple"} onChange={(v) => setRaw(v === "raw")} options={[{ value: "simple", label: "Simple" }, { value: "raw", label: "Exact numbers" }]} />
        </div>
        {raw ? <StatTable rows={rows} /> : <MeterList rows={rows} name={who === "duo" ? "You" : names[Number(who)]} />}
        
      </Card>
      <WinsVsLosses />
      <TrendExplorer />
      <Breakdown />
    </div>
  );
}
