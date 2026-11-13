import { motion } from "motion/react";
import { useMemo } from "react";
import { chrono, record, synergies } from "../../lib/analysis.ts";
import { champName } from "../../lib/ddragon.ts";
import { goalProgress } from "../../lib/goals.ts";
import { insights, type Insight } from "../../lib/insights.ts";
import { stagger } from "../../lib/motion.ts";
import { mean } from "../../lib/stats.ts";
import { useApp } from "../../state.tsx";
import { GoalCard } from "../coach/Coach.tsx";
import { Card, Donut } from "../ui/Controls.tsx";
import { Champ, WinRate } from "../ui/Icons.tsx";
import { LpChart, RollingWinRate } from "./Charts.tsx";

function Summary() {
  const { games, names } = useApp();
  const rec = record(games);
  const last20 = games.slice(0, 20);
  const avg = (slot: 0 | 1, f: "k" | "d" | "a") => mean(games.map((m) => m.parts[m.duo[slot]][f]));
  let streak = 0;
  for (const m of games) { if (m.win === games[0]?.win) streak++; else break; }
  return (
    <Card title="Summary">
      <div className="summary">
        <Donut value={rec.wr ?? 0} label="win rate" />
        <div className="stack" style={{ gap: 10 }}>
          <div>
            <span className="big">{rec.w}W {rec.l}L</span>
            {games.length > 0 && <span className={`small ${games[0].win ? "win-c" : "loss-c"}`} style={{ marginLeft: 10, fontWeight: 600 }}>{streak}{games[0].win ? "W" : "L"} streak</span>}
          </div>
          <div className="form-strip" title="Last 20 games (newest first)">
            {last20.map((m) => <i key={m.id} className={m.win ? "w" : ""} />)}
          </div>
          <div className="small muted">Win rate 95% range: {Math.round(rec.lo * 100)}–{Math.round(rec.hi * 100)}% (it gets narrower as you play more)</div>
        </div>
        <div className="stack" style={{ gap: 6 }}>
          {([0, 1] as const).map((s) => (
            <div key={s} className="row small">
              <b className={`p${s}`} style={{ width: 80, overflow: "hidden", textOverflow: "ellipsis" }}>{names[s]}</b>
              <span>{avg(s, "k")?.toFixed(1)} / <span className="loss-c">{avg(s, "d")?.toFixed(1)}</span> / {avg(s, "a")?.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function InsightList({ items, empty }: { items: Insight[]; empty: string }) {
  if (!items.length) return <p className="muted small">{empty}</p>;
  return (
    <div className="stack" style={{ gap: 8 }}>
      {items.map((i, n) => (
        <motion.div key={i.title} className={`insight ${i.severity}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={stagger(n)}>
          <span className="bar" />
          <div>
            <div className="who muted">{i.who}</div>
            <div className="t">{i.title}</div>
            <div className="d">{i.detail}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TopPairs() {
  const { games } = useApp();
  const pairs = synergies(games).slice(0, 5);
  return (
    <Card title="Top duos" hint="most played">
      <table>
        <tbody>
          {pairs.map((p) => (
            <tr key={p.adc + p.sup}>
              <td><div className="cell-champ"><Champ name={p.adc} size={26} /><Champ name={p.sup} size={26} /><span className="small">{champName(p.adc)} + {champName(p.sup)}</span></div></td>
              <td className="num small muted">{p.rec.w}W {p.rec.l}L</td>
              <td className="num"><WinRate wr={p.rec.wr} n={p.rec.n} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export function Overview() {
  const { games, names, bracket, goals, data } = useApp();
  const all = useMemo(() => insights(games, names, bracket), [games, names, bracket]);
  const active = goals.goals.filter((g) => g.status === "active").map((g) => goalProgress(g, data.matches));
  return (
    <div className="stack">
      <Summary />
      {active.length > 0 && (
        <Card title="Current objectives" hint={`from review ${goals.reviews.at(-1)?.date ?? ""}`}>
          {active.map((p) => <GoalCard key={p.goal.id} p={p} />)}
        </Card>
      )}
      <div className="grid g2">
        <Card title="To improve" delay={0.04}><InsightList items={all.filter((i) => i.severity === "improve").slice(0, 6)} empty="Nothing flagged. Nice." /></Card>
        <Card title="Strengths" delay={0.08}><InsightList items={all.filter((i) => i.severity !== "improve").slice(0, 6)} empty="Play more games to find your strengths." /></Card>
      </div>
      <div className="grid g2">
        <Card title="LP" hint="Solo/Duo"><LpChart /></Card>
        <Card title="Win rate trend" hint="rolling 10 games"><RollingWinRate games={chrono(games)} /></Card>
      </div>
      <TopPairs />
    </div>
  );
}
