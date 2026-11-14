// Charts. Rules: direct labels instead of legend boxes, one accent per series, recessive axes,
// no captions explaining how to read them. Colours come from the CSS tokens.
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Match } from "../../../shared/types.ts";
import { champName } from "../../lib/ddragon.ts";
import { ladder, ladderLabel, TIER_ORDER } from "../../lib/rank.ts";
import { titleCase } from "../../lib/format.ts";
import { useApp } from "../../state.tsx";
import { rankText } from "../PlayerCards.tsx";

export const AXIS = { stroke: "#424254", tick: { fill: "#a7a7ba", fontSize: 11 }, tickLine: false, axisLine: false } as const;
const GRID = <CartesianGrid stroke="#2c2c35" vertical={false} />;
const TIER_TINT: Record<string, string> = {
  IRON: "#a7a097", BRONZE: "#c0aa9b", SILVER: "#b7bbcb", GOLD: "#dbc798", PLATINUM: "#97cbc4",
  EMERALD: "#7fd6a7", DIAMOND: "#a7cdf2", MASTER: "#d3b3ea", GRANDMASTER: "#ebb4c4", CHALLENGER: "#fdc06b",
};

export function Legend({ items }: { items: { label: string; color: string; has?: boolean }[] }) {
  return <div className="legend">{items.map((i) => <span key={i.label}><i style={{ background: i.color }} />{i.label}</span>)}</div>;
}

/** Rank over time with tier bands; each line is labelled at its end with the current rank. */
export function LpChart({ only, height = 230 }: { only?: 0 | 1; height?: number }) {
  const { data, names } = useApp();
  const slots = only == null ? ([0, 1] as const) : ([only] as const);
  const rows = data.rankHistory.map((s) => ({ ts: s.ts, p0: ladder(s.solo[0]), p1: ladder(s.solo[1]), r0: s.solo[0], r1: s.solo[1] }));
  if (rows.length < 2) return <p className="small muted">No rank changes recorded yet.</p>;
  const vals = rows.flatMap((r) => slots.map((i) => r[`p${i}`])).filter((v): v is number => v != null);
  const lo = Math.floor((Math.min(...vals) - 30) / 100) * 100, hi = Math.ceil((Math.max(...vals) + 30) / 100) * 100;
  const bands = TIER_ORDER.slice(0, 7).map((tier, t) => ({ tier, y1: Math.max(lo, t * 400), y2: Math.min(hi, (t + 1) * 400) })).filter((b) => b.y2 > b.y1);
  const lastIdx = rows.length - 1;
  const endLabel = (i: 0 | 1) => (props: { x?: number | string; y?: number | string; index?: number }) => {
    const x = Number(props.x), y = Number(props.y);
    if (props.index !== lastIdx || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    const r = rows[lastIdx][`r${i}`];
    return (
      <g>
        <circle cx={x} cy={y} r={4} fill={`var(--p${i})`} stroke="var(--panel)" strokeWidth={2} />
        <text x={x - 8} y={i === 0 ? y - 10 : y + 18} textAnchor="end" fill="#fff" fontSize={11} fontWeight={700}>{names[i]} · {r ? `${rankText(r)} ${r.lp}` : ""}</text>
      </g>
    );
  };
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 24, right: 12, left: 0, bottom: 4 }}>
          {bands.map((b) => <ReferenceArea key={b.tier} y1={b.y1} y2={b.y2} fill={TIER_TINT[b.tier]} fillOpacity={0.07} stroke="none" ifOverflow="hidden" />)}
          {bands.map((b) => (b.y2 - b.y1 >= 100 ? <ReferenceLine key={b.tier + "l"} y={b.y1} stroke={TIER_TINT[b.tier]} strokeOpacity={0.35} label={{ value: titleCase(b.tier), position: "insideBottomLeft", fill: TIER_TINT[b.tier], fontSize: 11, fontWeight: 700 }} /> : null))}
          <XAxis dataKey="ts" {...AXIS} type="number" domain={["dataMin", "dataMax"]} scale="time" tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" })} minTickGap={50} />
          <YAxis {...AXIS} domain={[lo, hi]} ticks={Array.from({ length: (hi - lo) / 100 + 1 }, (_, i) => lo + i * 100)} tickFormatter={ladderLabel} width={52} />
          <Tooltip cursor={{ stroke: "#515163" }} content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const r = payload[0].payload as (typeof rows)[number];
            return <div className="chart-tip"><div className="h">{new Date(r.ts).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</div>
              {slots.map((i) => { const x = r[`r${i}`]; return <div key={i}><b className={`p${i}`}>{names[i]}</b> {x ? `${rankText(x)} · ${x.lp} LP` : "Unranked"}</div>; })}</div>;
          }} />
          {slots.map((i) => <Line key={i} dataKey={`p${i}`} stroke={`var(--p${i})`} strokeWidth={2} dot={false} activeDot={{ r: 4 }} type="linear" connectNulls isAnimationActive={false} label={endLabel(i)} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Net wins (wins minus losses) over the games: above zero = winning more than losing. */
export function NetWins({ games, height = 160 }: { games: Match[]; height?: number }) {
  if (games.length < 3) return <p className="small muted">Play a few more games to see this.</p>;
  let net = 0;
  const rows = [{ i: 0, net: 0, m: null as Match | null }, ...games.map((m, i) => ({ i: i + 1, net: (net += m.win ? 1 : -1), m }))];
  const max = Math.max(...rows.map((r) => r.net)), min = Math.min(...rows.map((r) => r.net));
  const top = Math.max(1, max), bottom = Math.min(-1, min);
  const zero = top / (top - bottom);
  const end = rows.at(-1)!;
  const best = rows.reduce((a, b) => (b.net > a.net ? b : a));
  return (
    <>
      <div className="netwins-head">
        <span className={`netwins-now ${end.net >= 0 ? "win-c" : "loss-c"}`}>{end.net > 0 ? "+" : ""}{end.net}</span>
        <span className="small text-2">after {games.length} games · peak {best.net > 0 ? "+" : ""}{best.net}</span>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer>
          <AreaChart data={rows} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="nw-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset={0} stopColor="var(--win)" stopOpacity={0.45} />
                <stop offset={zero} stopColor="var(--win)" stopOpacity={0.05} />
                <stop offset={zero} stopColor="var(--loss)" stopOpacity={0.05} />
                <stop offset={1} stopColor="var(--loss)" stopOpacity={0.45} />
              </linearGradient>
              <linearGradient id="nw-line" x1="0" y1="0" x2="0" y2="1">
                <stop offset={zero} stopColor="var(--win)" /><stop offset={zero} stopColor="var(--loss)" />
              </linearGradient>
            </defs>
            {GRID}
            <XAxis dataKey="i" {...AXIS} minTickGap={30} />
            <YAxis {...AXIS} domain={[bottom, top]} allowDecimals={false} width={28} tickFormatter={(v) => (v > 0 ? `+${v}` : `${v}`)} />
            <ReferenceLine y={0} stroke="#6d6d80" />
            <Tooltip cursor={{ stroke: "#515163" }} content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const r = payload[0].payload as (typeof rows)[number];
              if (!r.m) return null;
              const [a, s] = r.m.duo.map((d) => champName(r.m!.parts[d].champ));
              return <div className="chart-tip"><div className="h">Game {r.i} · {new Date(r.m.ts).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</div>
                <div><b className={r.m.win ? "win-c" : "loss-c"}>{r.m.win ? "Victory" : "Defeat"}</b> · {a} + {s}</div><div>Net {r.net > 0 ? "+" : ""}{r.net}</div></div>;
            }} />
            <Area dataKey="net" type="stepAfter" stroke="url(#nw-line)" strokeWidth={2} fill="url(#nw-fill)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

/** Team gold difference over time, blue above zero and red below, with dragon and baron marks. */
export function GoldGraph({ m }: { m: Match }) {
  const diff = m.tl?.goldDiff ?? [];
  if (diff.length < 3) return <p className="muted small">No minute-by-minute data for this game.</p>;
  const rows = diff.map((g, i) => ({ min: i, g }));
  const max = Math.max(...diff), min = Math.min(...diff);
  const zero = max <= 0 ? 0 : min >= 0 ? 1 : max / (max - min);
  const gid = `gg-${m.id}`;
  const marks = (m.tl?.objectives ?? []).filter((o) => o[1].startsWith("DRAGON") || o[1] === "BARON");
  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer>
        <AreaChart data={rows} margin={{ top: 18, right: 8, left: -6, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="var(--win)" stopOpacity={0.5} />
              <stop offset={zero} stopColor="var(--win)" stopOpacity={0.06} />
              <stop offset={zero} stopColor="var(--loss)" stopOpacity={0.06} />
              <stop offset={1} stopColor="var(--loss)" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id={`${gid}-s`} x1="0" y1="0" x2="0" y2="1">
              <stop offset={zero} stopColor="var(--win)" /><stop offset={zero} stopColor="var(--loss)" />
            </linearGradient>
          </defs>
          {GRID}
          <XAxis dataKey="min" {...AXIS} tickFormatter={(v) => `${v}m`} minTickGap={24} />
          <YAxis {...AXIS} tickFormatter={(v) => `${v > 0 ? "+" : ""}${(v / 1000).toFixed(0)}k`} width={44} />
          <ReferenceLine y={0} stroke="#6d6d80" />
          {marks.map((o, i) => (
            <ReferenceLine key={i} x={Math.round(o[0] / 60)} stroke={o[2] === m.team ? "var(--win)" : "var(--loss)"} strokeOpacity={0.5} strokeDasharray="2 3"
              label={{ value: o[1] === "BARON" ? "Baron" : "Drake", position: "top", fill: o[2] === m.team ? "var(--win-text)" : "var(--loss-text)", fontSize: 11 }} />
          ))}
          <Tooltip cursor={{ stroke: "#515163" }} content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const r = payload[0].payload as (typeof rows)[number];
            return <div className="chart-tip"><div className="h">{r.min} min</div><b className={r.g >= 0 ? "win-c" : "loss-c"}>{r.g >= 0 ? "+" : ""}{r.g.toLocaleString()} gold</b></div>;
          }} />
          <Area dataKey="g" type="monotone" stroke={`url(#${gid}-s)`} strokeWidth={2} fill={`url(#${gid})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
