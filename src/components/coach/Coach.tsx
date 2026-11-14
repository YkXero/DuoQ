import { motion } from "motion/react";
import { useMemo } from "react";
import type { Goal } from "../../../shared/goals.ts";
import { coaching } from "../../lib/insights.ts";
import { plain } from "../../lib/plain.ts";
import { formatValue } from "../../lib/formatValue.ts";
import { goalProgress, type GoalProgress } from "../../lib/goals.ts";
import { metricById } from "../../lib/metrics.ts";
import { stagger } from "../../lib/motion.ts";
import { useApp } from "../../state.tsx";
import { Card } from "../ui/Controls.tsx";

export function GoalCard({ p, i = 0 }: { p: GoalProgress; i?: number }) {
  const { names } = useApp();
  const m = metricById(p.goal.metric);
  const g = p.goal, f = m?.format ?? "dec1";
  const games = p.recent.slice(-g.window);
  const counted = games.filter((x) => x != null).length;
  const cells = [...Array(Math.max(0, g.window - games.length)).fill(undefined), ...games];
  return (
    <motion.div className="goal" initial={{ y: 8 }} animate={{ y: 0 }} transition={stagger(i)}>
      <div className="goal-main">
        <div className="goal-title">
          <b>{g.title}</b>
          {g.slot != null && <span className="small text-2">{names[g.slot]}</span>}
          <span className={`goal-state ${p.met ? "met" : ""}`}>{p.met ? "On track" : "Not yet"}</span>
        </div>
        <div className="goal-strip" aria-label={`${p.hits} of ${counted} recent games on target`}>
          {cells.map((x, j) => <i key={j} className={x === true ? "y" : x === false ? "n" : ""} />)}
          <span className="small text-2">{p.hits} of {counted} games on target</span>
        </div>
      </div>
      <div className="goal-num">
        <b className={p.met ? "good-c" : ""}>{g.mode === "perGame" ? `${p.hits}/${counted}` : formatValue(f, p.value)}</b>
        <span className="small text-2">target {m?.better === "lower" ? "≤" : "≥"} {formatValue(f, g.target)}</span>
      </div>
    </motion.div>
  );
}

/** Turn the top problems into temporary objectives: reach the rank target over the last 10 games. */
function useStarterGoals(): Goal[] {
  const { games, names, bracket, data } = useApp();
  return useMemo(() => coaching(games, names, bracket).improve
    .filter((i) => i.row && i.row.bench != null)
    .slice(0, 2)
    .map((i) => {
      const r = i.row!;
      return {
        id: `starter-${r.metric.id}-${String(i.who)}`,
        title: `${plain(r.metric.id).name}: get to ${formatValue(r.metric.format, r.bench)}`,
        why: i.title + ".",
        metric: r.metric.id,
        slot: i.who === "duo" ? undefined : i.who,
        target: r.bench!,
        mode: "average" as const,
        window: 10,
        createdAt: data.startDate,
        status: "active" as const,
        review: "",
      };
    }), [games, names, bracket, data.startDate]);
}

export function Coach() {
  const { goals, data } = useApp();
  const starters = useStarterGoals();
  const active = goals.goals.filter((g) => g.status === "active");
  const past = goals.goals.filter((g) => g.status !== "active");
  const reviews = [...goals.reviews].reverse();
  return (
    <div className="stack">
      <Card title="Objectives">
        {active.length ? active.map((g, i) => <GoalCard key={g.id} p={goalProgress(g, data.matches)} i={i} />) : (
          <>
            <p className="small text-2" style={{ marginTop: 0 }}>Starter objectives until your first review.</p>
            {starters.map((g, i) => <GoalCard key={g.id} p={goalProgress(g, data.matches)} i={i} />)}
            {!starters.length && <p className="muted">Play a few more games together to get your first objectives.</p>}
          </>
        )}
      </Card>
      {reviews.map((r, i) => (
        <Card key={r.date} title={`Review · ${r.date}`} hint={`${r.games} games analysed`} delay={i * 0.04}>
          <p style={{ marginTop: 0, fontWeight: 700 }}>{r.headline}</p>
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
