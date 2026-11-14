// Champion filter: a button that opens a searchable icon grid of every champion,
// the ones you've played first (with game counts).
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { allChampions, champName } from "../../lib/ddragon.ts";
import { spring } from "../../lib/motion.ts";
import { Champ } from "./Icons.tsx";

export function ChampionPicker({ value, onChange, counts }: { value: string | null; onChange: (c: string | null) => void; counts: Map<string, number> }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return allChampions()
      .filter((c) => !term || c.name.toLowerCase().includes(term))
      .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) || a.name.localeCompare(b.name));
  }, [q, counts]);
  const pick = (c: string | null) => { onChange(c); setOpen(false); setQ(""); };
  return (
    <div className="champ-picker" ref={ref}>
      <button className={`picker-btn${value ? " set" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="dialog">
        {value ? <><Champ name={value} size={20} round /><span>{champName(value)}</span></> : <span>All champions</span>}
        <svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" /></svg>
      </button>
      {value && <button className="picker-clear" onClick={() => pick(null)} aria-label="Clear champion filter">Clear</button>}
      <AnimatePresence>
        {open && (
          <motion.div className="picker-pop" role="dialog" aria-label="Choose a champion" initial={{ y: -6, opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -4, opacity: 0 }} transition={spring.snappy}>
            <input className="picker-search" autoFocus placeholder="Search champions" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search champions" />
            <div className="picker-grid">
              {list.map((c) => {
                const n = counts.get(c.id) ?? 0;
                return (
                  <button key={c.id} className={`picker-item${n ? "" : " unplayed"}${value === c.id ? " on" : ""}`} onClick={() => pick(c.id)} title={c.name}>
                    <Champ name={c.id} size={40} />
                    <span className="picker-name">{c.name}</span>
                    {n > 0 && <span className="picker-count">{n}</span>}
                  </button>
                );
              })}
              {!list.length && <p className="small muted">No champion matches "{q}".</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
