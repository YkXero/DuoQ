// One player's own profile: their record, champions, scores, rank graph and how they compare.
import { useMemo } from "react";
import type { Match } from "../../../shared/types.ts";
import { chrono, playerStats, record } from "../../lib/analysis.ts";
import { champName } from "../../lib/ddragon.ts";
import { duration, timeAgo } from "../../lib/format.ts";
import { formatValue } from "../../lib/formatValue.ts";
import { groupBy, mean } from "../../lib/stats.ts";
import { view } from "../../lib/views.ts";
import { useApp } from "../../state.tsx";
import { LpChart, NetWins } from "../overview/Charts.tsx";
import { MeterList } from "../stats/Stats.tsx";
import { Card } from "../ui/Controls.tsx";
import { Champ, Item, Kda, WinRate } from "../ui/Icons.tsx";

interface Row { m: Match; idx: number }

const rowsFor = (games: Match[], slot: 0 | 1): Row[] => games.map((m) => ({ m, idx: m.duo[slot] }));

export function PlayerProfile({ slot }: { slot: 0 | 1 }) {
  const { games, bracket, data } = useApp();
  const rows = useMemo(() => rowsFor(games, slot), [games, slot]);
  const me = (r: Row) => r.m.parts[r.idx];
  const rec = record(games);
  const k = mean(rows.map((r) => me(r).k)) ?? 0, d = mean(rows.map((r) => me(r).d)) ?? 0, a = mean(rows.map((r) => me(r).a)) ?? 0;
  const kp = mean(rows.map((r) => { const tk = r.m.teams[r.m.team].kills; return tk ? Math.min(1, (me(r).k + me(r).a) / tk) : null; }));
  const dmgMin = mean(rows.map((r) => me(r).dmg / (r.m.dur / 60)));
  const mainRole = rows.filter((r) => view(r.m, slot).role === "BOTTOM").length >= rows.length / 2 ? "BOTTOM" : "UTILITY";
  const roleStat = mainRole === "BOTTOM"
    ? { label: "CS per min", value: formatValue("dec1", mean(rows.map((r) => me(r).cs / (r.m.dur / 60)))) }
    : { label: "Vision per min", value: formatValue("dec2", mean(rows.map((r) => me(r).vision / (r.m.dur / 60)))) };
  const champs = useMemo(() => [...groupBy(rows, (r) => me(r).champ)].map(([champ, rs]) => ({
    champ, n: rs.length, w: rs.filter((r) => r.m.win).length,
    kda: mean(rs.map((r) => (me(r).k + me(r).a) / Math.max(1, me(r).d))), dmg: mean(rs.map((r) => me(r).dmg / (r.m.dur / 60))),
    cs: mean(rs.map((r) => me(r).cs / (r.m.dur / 60))), vis: mean(rs.map((r) => me(r).vision / (r.m.dur / 60))),
  })).sort((x, y) => y.n - x.n), [rows]);
  const stats = useMemo(() => playerStats(games, slot, bracket), [games, slot, bracket]);
  const p = data.players[slot];

  return (
    <div className="stack">
      <section className="tiles">
        <div className="tile"><span>Games</span><b>{rec.n}</b><small>{rec.w}W {rec.l}L</small></div>
        <div className="tile"><span>Win rate</span><b className={(rec.wr ?? 0) >= 0.5 ? "win-c" : "loss-c"}>{formatValue("pct", rec.wr)}</b><small>together with {data.players[1 - slot].riotId.split("#")[0]}</small></div>
        <div className="tile"><span>KDA</span><b>{((k + a) / Math.max(1, d)).toFixed(2)}</b><small>{k.toFixed(1)} / {d.toFixed(1)} / {a.toFixed(1)}</small></div>
        <div className="tile"><span>Kill participation</span><b>{formatValue("pct", kp)}</b><small>of the team's kills</small></div>
        <div className="tile"><span>Damage per min</span><b>{formatValue("int", dmgMin)}</b><small>to champions</small></div>
        <div className="tile"><span>{roleStat.label}</span><b>{roleStat.value}</b><small>{mainRole === "BOTTOM" ? "ADC" : "Support"}</small></div>
      </section>

      <div className="profile-layout">
        <aside className="stack">
          <Card title="Rank"><LpChart only={slot} height={200} /></Card>
          <Card title="Net wins"><NetWins games={chrono(games)} height={130} /></Card>
        </aside>
        <div className="stack main-col">
          <Card title={`${p.riotId.split("#")[0]}'s champions`}>
            <div className="scroll-x">
              <table>
                <thead><tr><th>Champion</th><th className="num">Games</th><th className="num">Win rate</th><th className="num">KDA</th><th className="num">Dmg/min</th><th className="num">{mainRole === "BOTTOM" ? "CS/min" : "Vision/min"}</th></tr></thead>
                <tbody>
                  {champs.map((c) => (
                    <tr key={c.champ}>
                      <td><div className="cell-champ"><Champ name={c.champ} size={28} />{champName(c.champ)}</div></td>
                      <td className="num">{c.n} <span className="small text-2">{c.w}W {c.n - c.w}L</span></td>
                      <td className="num"><WinRate wr={c.w / c.n} n={c.n} /></td>
                      <td className="num">{formatValue("dec2", c.kda)}</td>
                      <td className="num">{formatValue("int", c.dmg)}</td>
                      <td className="num">{mainRole === "BOTTOM" ? formatValue("dec1", c.cs) : formatValue("dec2", c.vis)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Compared to your rank"><MeterList rows={stats} name={p.riotId.split("#")[0]} /></Card>
          <Card title="Recent games">
            <div className="scroll-x">
              <table className="recent-table">
                <tbody>
                  {rows.slice(0, 15).map((r) => {
                    const x = me(r);
                    return (
                      <tr key={r.m.id} className={r.m.win ? "rw" : "rl"}>
                        <td><span className={`res-chip ${r.m.win ? "w" : "l"}`}>{r.m.win ? "Win" : "Loss"}</span></td>
                        <td><div className="cell-champ"><Champ name={x.champ} size={28} /><span>{champName(x.champ)}</span></div></td>
                        <td className="num"><b>{x.k} / <span className="bad-c">{x.d}</span> / {x.a}</b></td>
                        <td className="num"><Kda k={x.k} d={x.d} a={x.a} /></td>
                        <td className="num small text-2">{x.cs} CS · {x.vision} vision</td>
                        <td><div className="items">{x.items.slice(0, 6).map((it, i) => <Item key={i} id={it} size={20} empty="" />)}</div></td>
                        <td className="small text-2">{duration(r.m.dur)}</td>
                        <td className="small text-2">{timeAgo(r.m.ts)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
