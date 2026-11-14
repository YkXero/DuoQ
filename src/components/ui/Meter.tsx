// "You vs target" meter: one track, a shaded good zone starting at the target, and a marker for you.
import { motion } from "motion/react";
import type { StatRow } from "../../lib/analysis.ts";
import { formatValue } from "../../lib/formatValue.ts";
import { toneOf, type Grade } from "../../lib/insights.ts";
import { spring } from "../../lib/motion.ts";

export function Meter({ row, compact }: { row: StatRow; compact?: boolean }) {
  const { avg, bench, metric } = row;
  if (avg == null || bench == null) return null;
  const centered = metric.format === "signed";
  const span = centered ? Math.max(Math.abs(avg), Math.abs(bench), metric.scale ?? 1) * 1.5 : Math.max(avg, bench) * 1.45 || 1;
  const lo = centered ? -span : 0, hi = centered ? span : span;
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100));
  const tone = toneOf(row);
  const t = pos(bench), y = pos(avg);
  const zone = metric.better === "higher" ? { left: `${t}%`, right: 0 } : { left: 0, right: `${100 - t}%` };
  return (
    <div className={`meter${compact ? " compact" : ""}`} role="img" aria-label={`${metric.label}: ${formatValue(metric.format, avg)}, target ${formatValue(metric.format, bench)}`}>
      <div className="meter-track">
        <span className="meter-zone" style={zone} />
        <span className="meter-target" style={{ left: `${t}%` }} />
        <motion.span className={`meter-dot ${tone}`} initial={{ left: `${t}%` }} animate={{ left: `${y}%` }} transition={spring.gentle} />
      </div>
      {!compact && (
        <div className="meter-labels">
          <motion.span className={`meter-you ${tone === "good" ? "good-c" : tone === "bad" ? "bad-c" : "text-2"}`} initial={{ left: `${t}%` }} animate={{ left: `${y}%` }} transition={spring.gentle}>
            {formatValue(metric.format, avg)}
          </motion.span>
          <span className="meter-tlabel" style={{ left: `${t}%` }}>target {formatValue(metric.format, bench)}</span>
        </div>
      )}
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
  const text = v === "better" ? "↗ getting better" : v === "worse" ? "↘ getting worse" : "→ steady";
  return <span className={`trend ${v}`}>{text}</span>;
}
