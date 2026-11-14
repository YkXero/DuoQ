// One player's own profile: their record, champions, scores, rank graph and how they compare.
import { useMemo } from "react";
import type { Match } from "../../../shared/types.ts";
import { chrono, gameScores, playerStats, record } from "../../lib/analysis.ts";
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

interface Row { m: Match; idx: number; score: number; rank: number; mvp: boolean; ace: boolean }

function rowsFor(games: Match[], slot: 0 | 1): Row[] {
  return games.map((m) => {
    const idx = m.duo[slot], s = gameScores(m);
    const sameTeam = m.parts.map((_, i) => i).filter((i) => m.parts[i].team === m.parts[idx].team);
    const best = sameTeam.sort((a, b) => s.score[b] - s.score[a])[0] === idx;
    return { m, idx, score: s.score[idx], rank: s.rank[idx], mvp: best && m.win, ace: best && !m.win };
  });
}

export function PlayerProfile({ slot }: { slot: 0 | 1 }) {
  const { games, bracket, data } = useApp();
  const rows = useMemo(() => rowsFor(games, slot), [games, slot]);
  const me = (r: Row) => r.m.parts[r.idx];
  const rec = record(games);
  const k = mean(rows.map((r) => me(r).k)) ?? 0, d = mean(rows.map((r) => me(r).d)) ?? 0, a = mean(rows.map((r) => me(r).a)) ?? 0;
  const avgScore = mean(rows.map((r) => r.score));
  const mainRole = rows.filter((r) => view(r.m, slot).role === "BOTTOM").length >= rows.length / 2 ? "BOTTOM" : "UTILITY";
  const roleStat = mainRole === "BOTTOM"
    ? { label: "CS per min", value: formatValue("dec1", mean(rows.map((r) => me(r).cs / (r.m.dur / 60)))) }
    : { label: "Vision per min", value: formatValue("dec2", mean(rows.map((r) => me(r).vision / (r.m.dur / 60)))) };
  const champs = useMemo(() => [...groupBy(rows, (r) => me(r).champ)].map(([champ, rs]) => ({
    champ, n: rs.length, w: rs.filter((r) => r.m.win).length,
    kda: mean(rs.map((r) => (me(r).k + me(r).a) / Math.max(1, me(r).d))), score: mean(rs.map((r) => r.score)),
    cs: mean(rs.map((r) => me(r).cs / (r.m.dur / 60))), vis: mean(rs.map((r) => me(r).vision / (r.m.dur / 60))), mvp: rs.filter((r) => r.mvp).length,
  })).sort((x, y) => y.n - x.n), [rows]);
  const stats = useMemo(() => playerStats(games, slot, bracket), [games, slot, bracket]);
  const p = data.players[slot];

  return (
    <div className="stack">
      <section className="tiles">
        <div className="tile"><span>Games</span><b>{rec.n}</b><small>{rec.w}W {rec.l}L</small></div>
        <div className="tile"><span>Win rate</span><b className={(rec.wr ?? 0) >= 0.5 ? "win-c" : "loss-c"}>{formatValue("pct", rec.wr)}</b><small>together with {data.players[1 - slot].riotId.split("#")[0]}</small></div>
        <div className="tile"><span>KDA</span><b>{((k + a) / Math.max(1, d)).toFixed(2)}</b><small>{k.toFixed(1)} / {d.toFixed(1)} / {a.toFixed(1)}</small></div>
        <div className="tile"><span>Average score</span><b>{formatValue("dec1", avgScore)}</b><small>out of 10</small></div>
        <div className="tile"><span>MVP · ACE</span><b>{rows.filter((r) => r.mvp).length} · {rows.filter((r) => r.ace).length}</b><small>best on their team</small></div>
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
                <thead><tr><th>Champion</th><th className="num">Games</th><th className="num">Win rate</th><th className="num">KDA</th><th className="num">Score</th><th className="num">{mainRole === "BOTTOM" ? "CS/min" : "Vision/min"}</th><th className="num">MVP</th></tr></thead>
                <tbody>
                  {champs.map((c) => (
                    <tr key={c.champ}>
                      <td><div className="cell-champ"><Champ name={c.champ} size={28} />{champName(c.champ)}</div></td>
                      <td className="num">{c.n} <span className="small text-2">{c.w}W {c.n - c.w}L</span></td>
                      <td className="num"><WinRate wr={c.w / c.n} n={c.n} /></td>
                      <td className="num">{formatValue("dec2", c.kda)}</td>
                      <td className="num">{formatValue("dec1", c.score)}</td>
                      <td className="num">{mainRole === "BOTTOM" ? formatValue("dec1", c.cs) : formatValue("dec2", c.vis)}</td>
                      <td className="num">{c.mvp}</td>
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
                        <td className="num">{r.score.toFixed(1)}{r.mvp ? <span className="tagpill mvp" style={{ marginLeft: 6 }}>MVP</span> : r.ace ? <span className="tagpill ace" style={{ marginLeft: 6 }}>ACE</span> : null}</td>
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
