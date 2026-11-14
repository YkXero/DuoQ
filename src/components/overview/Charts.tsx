// All charts (Recharts). Recessive axes, 2px lines, a legend for 2+ series, hover tooltips.
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Match } from "../../../shared/types.ts";
import { champName } from "../../lib/ddragon.ts";
import { ladder, ladderLabel } from "../../lib/rank.ts";
import { useApp } from "../../state.tsx";
import { rankText } from "../PlayerCards.tsx";

const AXIS = { stroke: "#4a4a5a", tick: { fill: "#8a899c", fontSize: 11 }, tickLine: false, axisLine: false } as const;
const GRID = <CartesianGrid stroke="#2e2e38" vertical={false} />;

const tierTick = (v: number) => ladderLabel(v);

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return <div className="legend">{items.map((i) => <span key={i.label}><i style={{ background: i.color }} />{i.label}</span>)}</div>;
}

export function LpChart() {
  const { data, names } = useApp();
  const rows = data.rankHistory.map((s) => ({ ts: s.ts, p0: ladder(s.solo[0]), p1: ladder(s.solo[1]), r0: s.solo[0], r1: s.solo[1] }));
  if (rows.length < 2) return <p className="muted small">The LP graph fills in as the tracker records rank changes.</p>;
  const vals = rows.flatMap((r) => [r.p0, r.p1]).filter((v): v is number => v != null);
  const lo = Math.floor((Math.min(...vals) - 20) / 100) * 100, hi = Math.ceil((Math.max(...vals) + 20) / 100) * 100;
  const delta = (i: 0 | 1) => { const a = rows.find((r) => r[`p${i}`] != null)?.[`p${i}`], b = [...rows].reverse().find((r) => r[`p${i}`] != null)?.[`p${i}`]; return a != null && b != null ? b - a : null; };
  const d = [delta(0), delta(1)];
  return (
    <>
      <p className="chart-cap">{d.map((x, i) => x == null ? null : <span key={i}><b className={`p${i}`}>{names[i]}</b> {x >= 0 ? <b className="good-c">+{x} LP</b> : <b className="bad-c">{x} LP</b>}{i === 0 ? " · " : ""}</span>)} since the challenge started.</p>
      <Legend items={[{ label: names[0], color: "var(--p0)" }, { label: names[1], color: "var(--p1)" }]} />
      <div style={{ height: 220, marginTop: 8 }}>
        <ResponsiveContainer>
          <LineChart data={rows} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
            {GRID}
            <XAxis dataKey="ts" {...AXIS} type="number" domain={["dataMin", "dataMax"]} scale="time" tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" })} minTickGap={40} />
            <YAxis {...AXIS} domain={[lo, hi]} ticks={Array.from({ length: (hi - lo) / 100 + 1 }, (_, i) => lo + i * 100)} tickFormatter={tierTick} width={58} />
            <Tooltip cursor={{ stroke: "#4a4a5a" }} content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const r = payload[0].payload as (typeof rows)[number];
              return <div className="chart-tip"><div className="h">{new Date(r.ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</div>
                {[r.r0, r.r1].map((x, i) => <div key={i}><b className={`p${i}`}>{names[i]}</b> {rankText(x)}{x ? ` · ${x.lp} LP` : ""}</div>)}</div>;
            }} />
            <Line dataKey="p0" stroke="var(--p0)" strokeWidth={2} dot={false} type="monotone" connectNulls isAnimationActive={false} />
            <Line dataKey="p1" stroke="var(--p1)" strokeWidth={2} dot={false} type="monotone" connectNulls isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export function RollingWinRate({ games }: { games: Match[] }) {
  if (games.length < 3) return <p className="muted small">Needs a few more games.</p>;
  // Start once there are 5 games, so the first point isn't a meaningless 0% or 100%.
  const rows = games.map((m, i) => {
    const w = games.slice(Math.max(0, i - 9), i + 1);
    return { i: i + 1, wr: Math.round((w.filter((x) => x.win).length / w.length) * 100), m };
  }).filter((r) => r.i >= Math.min(5, games.length));
  const last = rows.at(-1)!.wr;
  return (
    <>
    <p className="chart-cap">Right now you win <b>{last}%</b> of your last 10 games. Each dot is a game (blue win, red loss); above the dashed line means winning more than losing.</p>
    <div style={{ height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
          {GRID}
          <XAxis dataKey="i" {...AXIS} minTickGap={24} />
          <YAxis {...AXIS} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} />
          <ReferenceLine y={50} stroke="#4a4a5a" strokeDasharray="4 4" />
          <Tooltip cursor={{ stroke: "#4a4a5a" }} content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const r = payload[0].payload as (typeof rows)[number];
            const [a, s] = r.m.duo.map((d) => champName(r.m.parts[d].champ));
            return <div className="chart-tip"><div className="h">Game {r.i} · {new Date(r.m.ts).toLocaleDateString()}</div>
              <div><b className={r.m.win ? "win-c" : "loss-c"}>{r.m.win ? "Victory" : "Defeat"}</b> · {a} + {s}</div><div>Last 10: <b>{r.wr}%</b></div></div>;
          }} />
          <Line dataKey="wr" stroke="var(--gold)" strokeWidth={2} type="monotone" isAnimationActive={false}
            dot={(props) => { const { cx, cy, payload, index } = props as { cx: number; cy: number; payload: (typeof rows)[number]; index: number }; return <circle key={index} cx={cx} cy={cy} r={3.5} fill={payload.m.win ? "var(--win)" : "var(--loss)"} stroke="var(--panel)" strokeWidth={1.5} />; }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    </>
  );
}

/** Team gold difference over time, blue above zero and red below. */
export function GoldGraph({ m }: { m: Match }) {
  const diff = m.tl?.goldDiff ?? [];
  if (diff.length < 3) return <p className="muted small">No timeline for this game.</p>;
  const rows = diff.map((g, i) => ({ min: i, g }));
  const max = Math.max(...diff), min = Math.min(...diff);
  const zero = max <= 0 ? 0 : min >= 0 ? 1 : max / (max - min);
  const gid = `gg-${m.id}`;
  return (
    <>
    <p className="chart-cap">Blue means your team had more gold, red means the enemy did. The dashed line is 15 minutes, roughly when laning ends.</p>
    <div style={{ height: 200 }}>
      <ResponsiveContainer>
        <AreaChart data={rows} margin={{ top: 6, right: 8, left: -6, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="var(--win)" stopOpacity={0.55} />
              <stop offset={zero} stopColor="var(--win)" stopOpacity={0.08} />
              <stop offset={zero} stopColor="var(--loss)" stopOpacity={0.08} />
              <stop offset={1} stopColor="var(--loss)" stopOpacity={0.55} />
            </linearGradient>
            <linearGradient id={`${gid}-s`} x1="0" y1="0" x2="0" y2="1">
              <stop offset={zero} stopColor="var(--win)" /><stop offset={zero} stopColor="var(--loss)" />
            </linearGradient>
          </defs>
          {GRID}
          <XAxis dataKey="min" {...AXIS} tickFormatter={(v) => `${v}m`} minTickGap={20} />
          <YAxis {...AXIS} tickFormatter={(v) => `${v > 0 ? "+" : ""}${(v / 1000).toFixed(0)}k`} width={44} />
          <ReferenceLine y={0} stroke="#4a4a5a" />
          {[15].map((x) => <ReferenceLine key={x} x={x} stroke="#3a3a48" strokeDasharray="3 3" label={{ value: "15m", fill: "#8a899c", fontSize: 10, position: "insideTopRight" }} />)}
          <Tooltip cursor={{ stroke: "#4a4a5a" }} content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const r = payload[0].payload as (typeof rows)[number];
            return <div className="chart-tip"><div className="h">{r.min}:00</div><b className={r.g >= 0 ? "win-c" : "loss-c"}>{r.g >= 0 ? "+" : ""}{r.g.toLocaleString()} gold</b> for your team</div>;
          }} />
          <Area dataKey="g" type="monotone" stroke={`url(#${gid}-s)`} strokeWidth={2} fill={`url(#${gid})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    </>
  );
}
