// Bullet bar: a filled bar up to your value (coloured by how it compares), a tick at the rank target,
// and the number beside it. Signed stats (leads/deficits) grow left or right from a zero line.
import { motion } from "motion/react";
import type { StatRow } from "../../lib/analysis.ts";
import { formatValue } from "../../lib/formatValue.ts";
import { toneOf, type Grade } from "../../lib/insights.ts";
import { spring } from "../../lib/motion.ts";

export function Meter({ row }: { row: StatRow; compact?: boolean }) {
  const { avg, bench, metric } = row;
  if (avg == null || bench == null) return null;
  const tone = toneOf(row);
  const signed = metric.format === "signed";
  const pct = (v: number, lo: number, hi: number) => Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100));
  let fill: { left: string; width: string }, tick: string, zero: string | null = null;
  if (signed) {
    const span = Math.max(Math.abs(avg), Math.abs(bench), metric.scale ?? 1) * 1.15;
    const z = 50, v = pct(avg, -span, span);
    fill = { left: `${Math.min(z, v)}%`, width: `${Math.abs(v - z)}%` };
    tick = `${pct(bench, -span, span)}%`;
    zero = `${z}%`;
  } else {
    const hi = Math.max(avg, bench) * 1.2 || 1;
    fill = { left: "0%", width: `${pct(avg, 0, hi)}%` };
    tick = `${pct(bench, 0, hi)}%`;
  }
  return (
    <div className="bullet" role="img" aria-label={`${metric.label}: ${formatValue(metric.format, avg)}, target ${formatValue(metric.format, bench)}`}>
      <div className="bullet-track">
        {zero && <span className="bullet-zero" style={{ left: zero }} />}
        <motion.i className={`bullet-fill ${tone}`} initial={{ width: 0, left: fill.left }} animate={fill} transition={spring.gentle} />
        <span className="bullet-target" style={{ left: tick }} title={`Target ${formatValue(metric.format, bench)}`} />
      </div>
      <b className={`bullet-val ${tone}`}>{formatValue(metric.format, avg)}</b>
      <span className="bullet-goal">{formatValue(metric.format, bench)}</span>
    </div>
  );
}

export function GradeBadge({ grade, size = 44 }: { grade: Grade | null; size?: number }) {
  return (
    <span className={`grade g-${grade ?? "na"}`} style={{ width: size, height: size, fontSize: size * 0.5 }} title={grade ? `Grade ${grade}` : "Not enough data"}>
      {grade ?? "–"}
    </span>
  );
}

export function TrendWord({ v }: { v: "better" | "worse" | "stable" | "na" | undefined }) {
  if (!v || v === "na") return null;
  const text = v === "better" ? "Getting better" : v === "worse" ? "Getting worse" : "Steady";
  return <span className={`trend ${v}`}>{text}</span>;
}
