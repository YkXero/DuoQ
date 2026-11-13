// Live progress for goals set during reviews.
import type { Match } from "../../shared/types.ts";
import type { Goal } from "../../shared/goals.ts";
import { metricById, series } from "./metrics.ts";
import { clean, mean } from "./stats.ts";

export interface GoalProgress {
  goal: Goal;
  n: number; // games counted
  value: number | null; // average (average mode) or hit share (perGame mode)
  hits: number;
  progress: number; // 0..1 toward the goal
  met: boolean;
  recent: (boolean | null)[]; // per game: hit target? (chronological, last `window`)
}

export function goalProgress(goal: Goal, matches: Match[]): GoalProgress {
  const metric = metricById(goal.metric);
  const since = new Date(goal.createdAt + "T00:00:00").getTime();
  const games = matches.filter((m) => m.ts >= since).sort((a, b) => a.ts - b.ts).slice(-goal.window);
  const vals = metric ? series(metric, games, goal.slot) : [];
  const higher = metric?.better !== "lower";
  const hit = (v: number | null) => (v == null ? null : higher ? v >= goal.target : v <= goal.target);
  const recent = vals.map(hit);
  const n = clean(vals).length;
  const hits = recent.filter((x) => x === true).length;
  if (goal.mode === "perGame") {
    const need = goal.hitRate ?? 0.7;
    const share = n ? hits / n : null;
    return { goal, n, value: share, hits, recent, progress: share == null ? 0 : Math.min(1, share / need), met: share != null && share >= need && n >= Math.min(5, goal.window) };
  }
  const avg = mean(vals);
  let progress = 0;
  if (avg != null) progress = higher ? Math.min(1, Math.max(0, avg / goal.target)) : Math.min(1, Math.max(0, goal.target / Math.max(1e-6, avg)));
  return { goal, n, value: avg, hits, recent, progress, met: avg != null && (hit(avg) ?? false) && n >= Math.min(5, goal.window) };
}
