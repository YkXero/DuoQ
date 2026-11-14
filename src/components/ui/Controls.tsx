// Segmented control and tabs with spring-animated indicators (shared layoutId).
import { motion } from "motion/react";
import { useId } from "react";
import { spring } from "../../lib/motion.ts";

export function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div className="seg" role="radiogroup">
      {options.map((o) => (
        <button key={String(o.value)} role="radio" aria-checked={o.value === value} className={o.value === value ? "on" : ""} onClick={() => onChange(o.value)}>
          {o.value === value && <motion.span layoutId={`seg-${id}`} className="thumb" transition={spring.snappy} />}
          <span style={{ position: "relative" }}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div className="tabs" role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} className={`tab${o.value === value ? " on" : ""}`} onClick={() => onChange(o.value)}>
          {o.label}
          {o.value === value && <motion.span layoutId={`tab-${id}`} className="ink" transition={spring.smooth} />}
        </button>
      ))}
    </div>
  );
}

export function Select<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <select className="select" aria-label={label} value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/** Card that springs in when it mounts. */
export function Card({ title, hint, children, delay = 0, className = "" }: { title?: string; hint?: string; children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.section className={`card ${className}`} initial={{ y: 14 }} animate={{ y: 0 }} transition={{ ...spring.gentle, delay }}>
      {title && <h2 className="card-title">{title}{hint && <span className="hint">{hint}</span>}</h2>}
      {children}
    </motion.section>
  );
}

/** Horizontal bar that grows with a spring. */
export function Bar({ value, color = "var(--win)", height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="mini-bar" style={{ height }}>
      <motion.i style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} transition={spring.gentle} />
    </div>
  );
}

/** Win-rate donut, op.gg style. */
export function Donut({ value, size = 88, stroke = 11, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--loss)" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--win)" strokeWidth={stroke} strokeDasharray={c}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value) }} transition={spring.gentle} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="var(--text)" fontSize={size / 5} fontWeight={700}>{Math.round(value * 100)}%</text>
    </svg>
  );
}

/** Ring used for goal progress. */
export function Ring({ value, size = 56, color = "var(--good)" }: { value: number; size?: number; color?: string }) {
  const stroke = 6, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--panel-3)" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - Math.min(1, value)) }} transition={spring.gentle} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="var(--text)" fontSize={13} fontWeight={700}>{Math.round(Math.min(1, value) * 100)}%</text>
    </svg>
  );
}
