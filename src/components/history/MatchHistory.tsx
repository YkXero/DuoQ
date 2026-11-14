import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { QUEUES, type Match } from "../../../shared/types.ts";
import { applyFilters, DEFAULT_FILTERS, record, type Filters } from "../../lib/analysis.ts";
import { duration, timeAgo } from "../../lib/format.ts";
import { spring } from "../../lib/motion.ts";
import { mean } from "../../lib/stats.ts";
import { adcIdx, supIdx } from "../../lib/views.ts";
import { gameStory } from "../../lib/tags.ts";
import { useApp } from "../../state.tsx";
import { Card, Segmented } from "../ui/Controls.tsx";
import { ChampionPicker } from "../ui/ChampionPicker.tsx";
import { Champ, Item, Kda, RoleSlot, Rune, Spell } from "../ui/Icons.tsx";
import { MatchDetail } from "./MatchDetail.tsx";

const PAGE = 20;
const MULTI = ["", "", "Double", "Triple", "Quadra", "Penta"];

function PlayerBlock({ m, idx, slot }: { m: Match; idx: number; slot: 0 | 1 }) {
  const p = m.parts[idx];
  const tk = m.teams[m.team].kills;
  return (
    <div className={`pblock${slot === 1 ? " p2" : ""}`}>
      <div className="top">
        <Champ name={p.champ} size={46} level={p.lvl} />
        <div className="col"><Spell id={p.spells[0]} /><Spell id={p.spells[1]} /></div>
        <div className="col"><Rune id={p.runes[0]} /><Rune id={p.runes[2]} dim /></div>
        <div className="kda-block">
          <div className="kda">{p.k} / <span className="d">{p.d}</span> / {p.a}</div>
          <div className="ratio"><Kda k={p.k} d={p.d} a={p.a} /></div>
          <div className="row" style={{ gap: 4, marginTop: 2 }}>
            <span className="pname">{p.name.split("#")[0]}</span>
            {p.multi >= 2 && <span className="tagpill multi">{MULTI[p.multi]}</span>}
          </div>
        </div>
        <div className="side-stats">
          <span>P/Kill {tk ? Math.min(100, Math.round(((p.k + p.a) / tk) * 100)) : 0}%</span>
          <span>CS {p.cs} ({(p.cs / (m.dur / 60)).toFixed(1)})</span>
          <span>Vision {p.vision}</span>
          <span>Dmg {(p.dmg / 1000).toFixed(1)}k</span>
        </div>
      </div>
      <div className="items">{p.items.map((it, i) => <Item key={i} id={it} />)}<RoleSlot id={p.roleItem} /></div>
    </div>
  );
}

export function MatchRow({ m, open, toggle }: { m: Match; open: boolean; toggle: () => void }) {
  const q = QUEUES[m.queue]?.name ?? `Queue ${m.queue}`;
  const story = gameStory(m);
  return (
    <motion.div layout="position" className={`match ${m.win ? "w" : "l"}`} transition={spring.smooth}>
      <div className="match-row" onClick={toggle}>
        <div className="meta">
          <div className="q">{q}</div>
          <div className="small muted" title={new Date(m.ts).toLocaleString()}>{timeAgo(m.ts)}</div>
          <div className="res">{m.win ? "Victory" : "Defeat"}</div>
          <div className="small muted">{duration(m.dur)}</div>
        </div>
        <PlayerBlock m={m} idx={m.duo[0]} slot={0} />
        <PlayerBlock m={m} idx={m.duo[1]} slot={1} />
        <div className="rosters">
          {[0, 1, 2, 3, 4].flatMap((i) => [i, i + 5]).map((i) => {
            const p = m.parts[i];
            return <div key={i} className={`r${m.duo.includes(i) ? " duo" : ""}`} title={p.name}><Champ name={p.champ} size={16} /><span>{p.name.split("#")[0]}</span></div>;
          })}
        </div>
        <button className="expand" aria-expanded={open} aria-label={open ? "Hide game details" : "Show game details"} onClick={(e) => { e.stopPropagation(); toggle(); }}>
          <motion.svg width="12" height="12" viewBox="0 0 12 12" animate={{ rotate: open ? 180 : 0 }} transition={spring.snappy} aria-hidden="true"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" /></motion.svg>
        </button>
      </div>
      <p className={`story ${story.tone}`} onClick={toggle}>{story.text}</p>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div className="detail" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring.smooth}>
            <MatchDetail m={m} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

type Local = Pick<Filters, "result" | "champ">;
const NONE: Local = { result: "all", champ: null };

export function MatchHistory() {
  const { games } = useApp();
  const [f, setF] = useState<Local>(NONE);
  const [shown, setShown] = useState(PAGE);
  // ?game=<match id> opens that game (shareable link)
  const [open, setOpen] = useState<string | null>(() => (typeof location === "undefined" ? null : new URLSearchParams(location.search).get("game")));
  const list = useMemo(() => applyFilters(games, { ...DEFAULT_FILTERS, ...f }), [games, f]);
  const rec = record(list);
  const counts = useMemo(() => {
    const c = new Map<string, number>();
    for (const m of games) for (const i of m.duo) c.set(m.parts[i].champ, (c.get(m.parts[i].champ) ?? 0) + 1);
    return c;
  }, [games]);
  const set = <K extends keyof Local>(k: K, v: Local[K]) => { setF({ ...f, [k]: v }); setShown(PAGE); };
  const avg = (fn: (m: Match) => number) => mean(list.map(fn));

  return (
    <div className="stack">
      <Card>
        <div className="filterbar">
          <Segmented value={f.result} onChange={(v) => set("result", v)} options={[{ value: "all", label: "All" }, { value: "win", label: "Wins" }, { value: "loss", label: "Losses" }]} />
          <ChampionPicker value={f.champ} onChange={(c) => set("champ", c)} counts={counts} />
        </div>
        <div className="row wrap-row small text-2" style={{ marginTop: 12, gap: 18 }}>
          <span><b>{rec.n}</b> games · <b className="win-c">{rec.w}W</b> <b className="loss-c">{rec.l}L</b> · {rec.wr != null ? Math.round(rec.wr * 100) : 0}%</span>
          <span>ADC avg {avg((m) => m.parts[adcIdx(m)].k)?.toFixed(1)}/{avg((m) => m.parts[adcIdx(m)].d)?.toFixed(1)}/{avg((m) => m.parts[adcIdx(m)].a)?.toFixed(1)}</span>
          <span>Support avg {avg((m) => m.parts[supIdx(m)].k)?.toFixed(1)}/{avg((m) => m.parts[supIdx(m)].d)?.toFixed(1)}/{avg((m) => m.parts[supIdx(m)].a)?.toFixed(1)}</span>
          <span>Avg length {duration(avg((m) => m.dur) ?? 0)}</span>
        </div>
      </Card>
      <div>
        {list.slice(0, shown).map((m) => <MatchRow key={m.id} m={m} open={open === m.id} toggle={() => setOpen(open === m.id ? null : m.id)} />)}
        {!list.length && <div className="card empty muted">No games match these filters.</div>}
      </div>
      {list.length > shown && <button className="btn" style={{ justifySelf: "center" }} onClick={() => setShown(shown + PAGE)}>Show more ({list.length - shown} left)</button>}
    </div>
  );
}
