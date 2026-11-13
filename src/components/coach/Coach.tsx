import { motion } from "motion/react";
import { formatValue } from "../../lib/formatValue.ts";
import { goalProgress, type GoalProgress } from "../../lib/goals.ts";
import { metricById } from "../../lib/metrics.ts";
import { stagger } from "../../lib/motion.ts";
import { useApp } from "../../state.tsx";
import { Card, Ring } from "../ui/Controls.tsx";

export function GoalCard({ p, i = 0 }: { p: GoalProgress; i?: number }) {
  const { names } = useApp();
  const m = metricById(p.goal.metric);
  const g = p.goal;
  const val = g.mode === "perGame" ? `${p.hits}/${p.n} games hit` : `now ${formatValue(m?.format ?? "dec1", p.value)}`;
  return (
    <motion.div className="goal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={stagger(i)}>
      <Ring value={p.progress} color={p.met ? "var(--good)" : "var(--gold)"} />
      <div>
        <div className="row wrap-row">
          <span className="t">{g.title}</span>
          {g.slot != null && <span className={`tagpill who${g.slot}`}>{names[g.slot]}</span>}
          {g.status === "achieved" || p.met ? <span className="tagpill" style={{ background: "var(--good)", color: "#062" }}>On track</span> : null}
        </div>
        <div className="why">{g.why}</div>
        <div className="small muted" style={{ marginTop: 4 }}>
          Target {g.mode === "perGame" ? `${m?.better === "lower" ? "≤" : "≥"} ${formatValue(m?.format ?? "dec1", g.target)} in ${Math.round((g.hitRate ?? 0.7) * 100)}% of games` : `average ${m?.better === "lower" ? "≤" : "≥"} ${formatValue(m?.format ?? "dec1", g.target)}`} · {val} · last {g.window} games since {g.createdAt}
        </div>
        {p.recent.length > 0 && <div className="dots">{p.recent.map((x, j) => <i key={j} className={x === true ? "y" : x === false ? "n" : ""} />)}</div>}
      </div>
    </motion.div>
  );
}

export function Coach() {
  const { goals, data } = useApp();
  const active = goals.goals.filter((g) => g.status === "active");
  const past = goals.goals.filter((g) => g.status !== "active");
  const reviews = [...goals.reviews].reverse();
  return (
    <div className="stack">
      <Card title="Objectives" hint="set during reviews, progress updates after every game">
        {active.length ? active.map((g, i) => <GoalCard key={g.id} p={goalProgress(g, data.matches)} i={i} />) : (
          <p className="muted">No objectives yet. Ask Claude for a review once you have 10–15 games, and it will set them here.</p>
        )}
      </Card>
      {reviews.map((r, i) => (
        <Card key={r.date} title={`Review · ${r.date}`} hint={`${r.games} games analysed`} delay={i * 0.04}>
          <p style={{ marginTop: 0, fontWeight: 600 }}>{r.headline}</p>
          <div className="grid g2">
            <div><div className="small good-c" style={{ fontWeight: 700, marginBottom: 4 }}>DOING WELL</div><ul style={{ margin: 0, paddingLeft: 18 }}>{r.best.map((b) => <li key={b}>{b}</li>)}</ul></div>
            <div><div className="small bad-c" style={{ fontWeight: 700, marginBottom: 4 }}>NEEDS WORK</div><ul style={{ margin: 0, paddingLeft: 18 }}>{r.worst.map((b) => <li key={b}>{b}</li>)}</ul></div>
          </div>
          {r.notes && <p className="small text-2" style={{ marginBottom: 0 }}>{r.notes}</p>}
        </Card>
      ))}
      {past.length > 0 && (
        <Card title="Past objectives">
          {past.map((g, i) => <GoalCard key={g.id} p={goalProgress(g, data.matches)} i={i} />)}
        </Card>
      )}
    </div>
  );
}
