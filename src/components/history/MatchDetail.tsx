import { useMemo, useState } from "react";
import type { Match, TeamId } from "../../../shared/types.ts";
import { badge, gameScores } from "../../lib/analysis.ts";
import { itemName } from "../../lib/ddragon.ts";
import { adcIdx, enemyIdx, snapVal, supIdx } from "../../lib/views.ts";
import { useApp } from "../../state.tsx";
import { GoldGraph } from "../overview/Charts.tsx";
import { Bar, Tabs } from "../ui/Controls.tsx";
import { Champ, Item, Kda, Rune, Spell } from "../ui/Icons.tsx";

type Tab = "overview" | "lane" | "gold" | "build";

function Objectives({ m, team }: { m: Match; team: TeamId }) {
  const t = m.teams[team];
  const items: [string, number][] = [["Kills", t.kills], ["Grubs", t.grubs], ["Herald", t.heralds], ["Dragons", t.dragons], ["Baron", t.barons], ["Towers", t.towers], ["Inhibs", t.inhibs]];
  if (t.atakhan) items.push(["Atakhan", t.atakhan]);
  return <div className="objstrip">{items.map(([k, v]) => <span key={k}>{k} <b>{v}</b></span>)}</div>;
}

function Scoreboard({ m }: { m: Match }) {
  const scores = useMemo(() => gameScores(m), [m]);
  const maxDmg = Math.max(...m.parts.map((p) => p.dmg)), maxTaken = Math.max(...m.parts.map((p) => p.taken));
  const min = m.dur / 60;
  return (
    <>
      {([m.team, m.team === 100 ? 200 : 100] as TeamId[]).map((team) => {
        const won = team === m.team ? m.win : !m.win;
        const idxs = m.parts.map((_, i) => i).filter((i) => m.parts[i].team === team);
        const teamKills = m.teams[team].kills;
        return (
          <div key={team} className={`sb-team ${won ? "w" : "l"}`}>
            <div className="scroll-x">
              <table>
                <thead><tr>
                  <th><span className={won ? "win-c" : "loss-c"}>{won ? "Victory" : "Defeat"}</span> <span className="muted">({team === 100 ? "Blue" : "Red"} side{team === m.team ? ", your team" : ""})</span></th>
                  <th className="num">Score</th><th>KDA</th><th>Damage</th><th className="num">Wards</th><th className="num">CS</th><th>Items</th>
                </tr></thead>
                <tbody>
                  {idxs.map((i) => {
                    const p = m.parts[i], b = badge(m, i, scores);
                    return (
                      <tr key={i} className={m.duo.includes(i) ? "me" : ""}>
                        <td>
                          <div className="cell-champ">
                            <Champ name={p.champ} size={32} level={p.lvl} />
                            <div style={{ display: "grid", gap: 2 }}><Spell id={p.spells[0]} size={15} /><Spell id={p.spells[1]} size={15} /></div>
                            <div style={{ display: "grid", gap: 2 }}><Rune id={p.runes[0]} size={15} /><Rune id={p.runes[2]} size={15} dim /></div>
                            <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", fontWeight: m.duo.includes(i) ? 700 : 400 }}>{p.name.split("#")[0]}</span>
                          </div>
                        </td>
                        <td className="num">{scores.score[i].toFixed(1)} {b ? <span className={`tagpill ${b === "MVP" ? "mvp" : "ace"}`}>{b}</span> : <span className="muted small">#{scores.rank[i]}</span>}</td>
                        <td><div>{p.k}/<span className="loss-c">{p.d}</span>/{p.a} <span className="small muted">({teamKills ? Math.min(100, Math.round(((p.k + p.a) / teamKills) * 100)) : 0}%)</span></div><div className="small"><Kda k={p.k} d={p.d} a={p.a} /></div></td>
                        <td>
                          <div className="dmg-bars" title={`Dealt ${p.dmg.toLocaleString()} · Taken ${p.taken.toLocaleString()}`}>
                            <div className="row small" style={{ gap: 6 }}><span style={{ width: 40 }}>{(p.dmg / 1000).toFixed(1)}k</span><div style={{ flex: 1 }}><Bar value={p.dmg / maxDmg} color="var(--loss)" /></div></div>
                            <div className="row small muted" style={{ gap: 6 }}><span style={{ width: 40 }}>{(p.taken / 1000).toFixed(1)}k</span><div style={{ flex: 1 }}><Bar value={p.taken / maxTaken} color="#8a899c" /></div></div>
                          </div>
                        </td>
                        <td className="num small">{p.pinks} / {p.wards} / {p.wardsKilled}</td>
                        <td className="num">{p.cs} <div className="small muted">{(p.cs / min).toFixed(1)}/m</div></td>
                        <td><div className="items">{p.items.map((it, j) => <Item key={j} id={it} size={22} empty="" />)}</div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Objectives m={m} team={team} />
          </div>
        );
      })}
    </>
  );
}

function Lane({ m }: { m: Match }) {
  const { names } = useApp();
  const rows = [["Our ADC", adcIdx(m), "Their ADC", enemyIdx(m, "BOTTOM")], ["Our support", supIdx(m), "Their support", enemyIdx(m, "UTILITY")]] as const;
  if (!m.tl) return <p className="muted small">No timeline for this game.</p>;
  const cols = ["5", "10", "15", "20"] as const;
  const kills = m.tl.kills.filter((k) => k[0] < 840);
  const bot = [adcIdx(m), supIdx(m)], ebot = [enemyIdx(m, "BOTTOM"), enemyIdx(m, "UTILITY")];
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="scroll-x">
        <table>
          <thead><tr><th>Matchup</th>{cols.map((c) => <th key={c} className="num">Gold @{c}</th>)}{cols.slice(0, 3).map((c) => <th key={c} className="num">CS @{c}</th>)}</tr></thead>
          <tbody>
            {rows.map(([l1, a, l2, b]) => (
              <tr key={l1}>
                <td><div className="cell-champ"><Champ name={m.parts[a].champ} size={24} /><span className="small">{l1}</span><span className="muted small">vs</span>{b >= 0 && <Champ name={m.parts[b].champ} size={24} />}<span className="small muted">{l2}</span></div></td>
                {cols.map((c) => { const x = snapVal(m, c, a, 0), y = b >= 0 ? snapVal(m, c, b, 0) : null; const d = x != null && y != null ? x - y : null; return <td key={c} className={`num ${d == null ? "" : d >= 0 ? "win-c" : "loss-c"}`}>{d == null ? "–" : `${d > 0 ? "+" : ""}${d}`}</td>; })}
                {cols.slice(0, 3).map((c) => { const x = snapVal(m, c, a, 2), y = b >= 0 ? snapVal(m, c, b, 2) : null; return <td key={c} className="num small">{x ?? "–"} <span className="muted">vs {y ?? "–"}</span></td>; })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <div className="small muted" style={{ marginBottom: 6 }}>Bot lane kills and deaths before 14:00</div>
        {kills.filter((k) => bot.includes(k[2]) || bot.includes(k[1])).map((k, i) => {
          const ourDeath = bot.includes(k[2]);
          const victim = m.parts[k[2]], killer = k[1] >= 0 ? m.parts[k[1]] : null;
          const slot = m.duo.indexOf(ourDeath ? k[2] : k[1]);
          return (
            <div key={i} className="row small" style={{ padding: "3px 0" }}>
              <span className="muted" style={{ width: 40 }}>{Math.floor(k[0] / 60)}:{String(k[0] % 60).padStart(2, "0")}</span>
              {killer && <Champ name={killer.champ} size={20} />}<span className="muted">→</span><Champ name={victim.champ} size={20} />
              <span className={ourDeath ? "loss-c" : "win-c"}>{ourDeath ? `${names[slot] ?? "Ally"} died` : `${names[slot] ?? "Ally"} got a kill`}</span>
              {ourDeath && ebot.includes(k[1]) ? <span className="muted">(2v2)</span> : ourDeath && killer ? <span className="muted">(gank / roam)</span> : null}
            </div>
          );
        })}
        {!kills.some((k) => bot.includes(k[2]) || bot.includes(k[1])) && <div className="small muted">No bot lane kills before 14:00.</div>}
      </div>
    </div>
  );
}

function Build({ m }: { m: Match }) {
  const { names } = useApp();
  if (!m.tl) return <p className="muted small">No timeline for this game.</p>;
  return (
    <div className="stack" style={{ gap: 16 }}>
      {([0, 1] as const).map((slot) => {
        const buys = m.tl!.builds[slot].filter(([, id]) => id !== 2003 && id !== 2055 && id !== 3340 && id !== 3364 && id !== 3363);
        const groups: { t: number; items: number[] }[] = [];
        for (const [t, id] of buys) { const g = groups.at(-1); if (g && t - g.t < 45) g.items.push(id); else groups.push({ t, items: [id] }); }
        const skills = m.tl!.skills[slot];
        return (
          <div key={slot}>
            <div className={`small p${slot}`} style={{ fontWeight: 700, marginBottom: 8 }}>{names[slot]} · {m.parts[m.duo[slot]].champ}</div>
            <div className="build-row">
              {groups.map((g, i) => (
                <div key={i} className="build-step"><div className="items">{g.items.map((id, j) => <span key={j} title={itemName(id)}><Item id={id} size={26} /></span>)}</div>{Math.floor(g.t / 60)}m</div>
              ))}
            </div>
            {skills && (
              <div className="scroll-x" style={{ marginTop: 10 }}>
                <div className="skill-grid">
                  {(["Q", "W", "E", "R"] as const).map((k) => [
                    <div key={k} className="k">{k}</div>,
                    ...Array.from({ length: 18 }, (_, lvl) => <div key={k + lvl} className={`${skills[lvl] === k ? "on" : ""} ${k === "R" ? "r" : ""}`}>{skills[lvl] === k ? lvl + 1 : ""}</div>),
                  ])}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function MatchDetail({ m }: { m: Match }) {
  const [tab, setTab] = useState<Tab>("overview");
  return (
    <div className="detail-inner">
      <Tabs value={tab} onChange={setTab} options={[{ value: "overview", label: "Scoreboard" }, { value: "lane", label: "Bot lane" }, { value: "gold", label: "Gold graph" }, { value: "build", label: "Build" }]} />
      {tab === "overview" && <Scoreboard m={m} />}
      {tab === "lane" && <Lane m={m} />}
      {tab === "gold" && <GoldGraph m={m} />}
      {tab === "build" && <Build m={m} />}
    </div>
  );
}
