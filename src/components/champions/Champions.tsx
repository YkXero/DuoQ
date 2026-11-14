import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { champPool, matchups, synergies, type MatchupRow, type PairRow } from "../../lib/analysis.ts";
import { champName } from "../../lib/ddragon.ts";
import { formatValue } from "../../lib/formatValue.ts";
import { stagger } from "../../lib/motion.ts";
import { useApp } from "../../state.tsx";
import { Bar, Card } from "../ui/Controls.tsx";
import { Champ, WinRate } from "../ui/Icons.tsx";

const MIN_GAMES = 3;
const wl = (w: number, l: number) => `${w} ${w === 1 ? "win" : "wins"}, ${l} ${l === 1 ? "loss" : "losses"}`;
const laneWords = (gd: number | null) => (gd == null ? null : gd > 150 ? "usually ahead in lane" : gd < -150 ? "usually behind in lane" : "lane is usually even");

// ---------------------------------------------------------------- shortlists
function PairItem({ p, n }: { p: PairRow; n: number }) {
  const lane = laneWords(p.gd15);
  return (
    <motion.div className="short-item" initial={{ y: 6 }} animate={{ y: 0 }} transition={stagger(n)}>
      <div className="short-champs"><Champ name={p.adc} size={40} /><Champ name={p.sup} size={40} /></div>
      <div style={{ minWidth: 0 }}>
        <div className="short-name">{champName(p.adc)} + {champName(p.sup)}</div>
        <div className="small text-2">{wl(p.rec.w, p.rec.l)}{lane ? ` · ${lane}` : ""}</div>
      </div>
      <WinRate wr={p.rec.wr} n={p.rec.n} />
    </motion.div>
  );
}

function MatchupItem({ x, n, pos }: { x: MatchupRow; n: number; pos: "BOTTOM" | "UTILITY" }) {
  const lane = laneWords(x.gd15);
  return (
    <motion.div className="short-item" initial={{ y: 6 }} animate={{ y: 0 }} transition={stagger(n)}>
      <div className="short-champs"><Champ name={x.champ} size={40} /></div>
      <div style={{ minWidth: 0 }}>
        <div className="short-name">{champName(x.champ)} <span className="small muted">{pos === "BOTTOM" ? "ADC" : "support"}</span></div>
        <div className="small text-2">{wl(x.rec.w, x.rec.l)}{lane ? ` · ${lane}` : ""}</div>
      </div>
      <WinRate wr={x.rec.wr} n={x.rec.n} />
    </motion.div>
  );
}

function Shortlists() {
  const { games } = useApp();
  const pairs = useMemo(() => synergies(games).filter((p) => p.rec.n >= MIN_GAMES), [games]);
  const play = [...pairs].filter((p) => p.rec.shrunk >= 0.53).sort((a, b) => b.rec.shrunk - a.rec.shrunk).slice(0, 3);
  const avoid = [...pairs].filter((p) => p.rec.shrunk <= 0.47).sort((a, b) => a.rec.shrunk - b.rec.shrunk).slice(0, 3);
  const enemies = useMemo(() => (["BOTTOM", "UTILITY"] as const).flatMap((pos) => matchups(games, pos).filter((x) => x.rec.n >= MIN_GAMES).map((x) => ({ x, pos }))), [games]);
  const tough = [...enemies].filter((e) => e.x.rec.shrunk <= 0.47).sort((a, b) => a.x.rec.shrunk - b.x.rec.shrunk).slice(0, 4);
  const easy = [...enemies].filter((e) => e.x.rec.shrunk >= 0.53).sort((a, b) => b.x.rec.shrunk - a.x.rec.shrunk).slice(0, 4);
  const none = (what: string) => <p className="small muted">No {what} yet. A verdict appears after {MIN_GAMES} games.</p>;
  return (
    <>
      <div className="grid g2">
        <Card title="Duos to play more">{play.length ? play.map((p, n) => <PairItem key={p.adc + p.sup} p={p} n={n} />) : none("clear winners")}</Card>
        <Card title="Duos to avoid">{avoid.length ? avoid.map((p, n) => <PairItem key={p.adc + p.sup} p={p} n={n} />) : none("clear losers")}</Card>
      </div>
      <div className="grid g2">
        <Card title="Tough matchups" hint="consider banning these">{tough.length ? tough.map(({ x, pos }, n) => <MatchupItem key={pos + x.champ} x={x} pos={pos} n={n} />) : none("problem matchups")}</Card>
        <Card title="Easy matchups">{easy.length ? easy.map(({ x, pos }, n) => <MatchupItem key={pos + x.champ} x={x} pos={pos} n={n} />) : none("easy matchups")}</Card>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- full tables
type SortKey = "games" | "wr" | "kda" | "gd15";

function SortTh({ k, sort, setSort, children }: { k: SortKey; sort: SortKey; setSort: (k: SortKey) => void; children: React.ReactNode }) {
  return (
    <th className="num" aria-sort={sort === k ? "descending" : "none"}>
      <button className={`th-sort${sort === k ? " on" : ""}`} onClick={() => setSort(k)}>{children}{sort === k ? " ▾" : ""}</button>
    </th>
  );
}

function PairTable({ rows, sort, setSort }: { rows: PairRow[]; sort: SortKey; setSort: (k: SortKey) => void }) {
  return (
    <div className="scroll-x">
      <table>
        <thead><tr>
          <th>ADC + support</th>
          <SortTh k="games" sort={sort} setSort={setSort}>Games</SortTh>
          <SortTh k="wr" sort={sort} setSort={setSort}>Win rate</SortTh><th style={{ width: 90 }} />
          <SortTh k="gd15" sort={sort} setSort={setSort}>Lane gold at 15 min</SortTh>
          <SortTh k="kda" sort={sort} setSort={setSort}>KDA together</SortTh>
        </tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.adc + p.sup}>
              <td><div className="cell-champ"><Champ name={p.adc} /><Champ name={p.sup} /><span>{champName(p.adc)} + {champName(p.sup)}</span></div></td>
              <td className="num">{p.rec.n} <span className="small muted">({p.rec.w}W {p.rec.l}L)</span></td>
              <td className="num"><WinRate wr={p.rec.wr} n={p.rec.n} /></td>
              <td><Bar value={p.rec.wr ?? 0} color={(p.rec.wr ?? 0) >= 0.5 ? "var(--win)" : "var(--loss)"} /></td>
              <td className={`num ${(p.gd15 ?? 0) >= 0 ? "win-c" : "loss-c"}`}>{formatValue("signed", p.gd15)}</td>
              <td className="num">{formatValue("dec2", p.kda)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AllDuos() {
  const { games } = useApp();
  const [sort, setSort] = useState<SortKey>("games");
  const all = useMemo(() => {
    const r = synergies(games);
    const by: Record<SortKey, (x: PairRow) => number> = { games: (x) => x.rec.n, wr: (x) => x.rec.shrunk, kda: (x) => x.kda ?? 0, gd15: (x) => x.gd15 ?? -1e9 };
    return [...r].sort((a, b) => by[sort](b) - by[sort](a));
  }, [games, sort]);
  const enough = all.filter((p) => p.rec.n >= MIN_GAMES), few = all.filter((p) => p.rec.n < MIN_GAMES);
  return (
    <Card title="Every duo you've played" hint="click a column to sort">
      <PairTable rows={enough} sort={sort} setSort={setSort} />
      {few.length > 0 && (
        <details className="more">
          <summary>{few.length} duos with fewer than {MIN_GAMES} games</summary>
          <div style={{ marginTop: 10 }}><PairTable rows={few} sort={sort} setSort={setSort} /></div>
        </details>
      )}
    </Card>
  );
}

function Pool({ slot }: { slot: 0 | 1 }) {
  const { games, names } = useApp();
  const rows = champPool(games, slot);
  return (
    <Card title={`${names[slot]}'s champions`}>
      <div className="scroll-x">
        <table>
          <thead><tr><th>Champion</th><th className="num">Games</th><th className="num">Win rate</th><th className="num">KDA</th><th className="num">CS per min</th><th className="num">Damage per min</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.champ}>
                <td><div className="cell-champ"><Champ name={c.champ} size={26} />{champName(c.champ)}</div></td>
                <td className="num">{c.rec.n} <span className="small muted">({c.rec.w}W {c.rec.l}L)</span></td>
                <td className="num"><WinRate wr={c.rec.wr} n={c.rec.n} /></td>
                <td className="num">{formatValue("dec2", c.kda)}</td>
                <td className="num">{formatValue("dec1", c.csMin)}</td>
                <td className="num">{formatValue("int", c.dmgMin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function Champions() {
  return (
    <div className="stack">
      <Shortlists />
      <AllDuos />
      <div className="grid g2"><Pool slot={0} /><Pool slot={1} /></div>
    </div>
  );
}
