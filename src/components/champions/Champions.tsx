import { useMemo, useState } from "react";
import { champPool, matchups, synergies } from "../../lib/analysis.ts";
import { champName } from "../../lib/ddragon.ts";
import { formatValue } from "../../lib/formatValue.ts";
import { useApp } from "../../state.tsx";
import { Bar, Card } from "../ui/Controls.tsx";
import { Champ, WinRate } from "../ui/Icons.tsx";

type SortKey = "games" | "wr" | "kda" | "gd15";

function SortTh({ k, sort, setSort, children }: { k: SortKey; sort: SortKey; setSort: (k: SortKey) => void; children: React.ReactNode }) {
  return <th className={`num sort${sort === k ? " text-2" : ""}`} onClick={() => setSort(k)}>{children}{sort === k ? " ▾" : ""}</th>;
}

/** Plain verdict that accounts for sample size (shrunk win rate pulls small samples toward 50%). */
function PairVerdict({ n, shrunk }: { n: number; shrunk: number }) {
  if (n < 3) return <span className="mtag">Too few games</span>;
  if (shrunk >= 0.56) return <span className="mtag good">Play more</span>;
  if (shrunk <= 0.44) return <span className="mtag bad">Avoid</span>;
  return <span className="mtag">Fine</span>;
}

function Synergies() {
  const { games } = useApp();
  const [sort, setSort] = useState<SortKey>("games");
  const rows = useMemo(() => {
    const r = synergies(games);
    const by: Record<SortKey, (x: (typeof r)[number]) => number> = { games: (x) => x.rec.n, wr: (x) => x.rec.shrunk, kda: (x) => x.kda ?? 0, gd15: (x) => x.gd15 ?? -1e9 };
    return [...r].sort((a, b) => by[sort](b) - by[sort](a));
  }, [games, sort]);
  return (
    <Card title="Which duos work?" hint="the verdict accounts for how many games you've played">
      <div className="scroll-x">
        <table>
          <thead><tr><th>ADC + Support</th><SortTh k="games" sort={sort} setSort={setSort}>Games</SortTh><th>Verdict</th><th className="num">Record</th><SortTh k="wr" sort={sort} setSort={setSort}>Win rate</SortTh><th style={{ width: 90 }} /><SortTh k="kda" sort={sort} setSort={setSort}>Duo KDA</SortTh><SortTh k="gd15" sort={sort} setSort={setSort}>Lane GD@15</SortTh></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.adc + p.sup}>
                <td><div className="cell-champ"><Champ name={p.adc} /><span className="muted">+</span><Champ name={p.sup} /><span>{champName(p.adc)} + {champName(p.sup)}</span></div></td>
                <td className="num">{p.rec.n}</td>
                <td><PairVerdict n={p.rec.n} shrunk={p.rec.shrunk} /></td>
                <td className="num small muted">{p.rec.w}W {p.rec.l}L</td>
                <td className="num"><WinRate wr={p.rec.wr} n={p.rec.n} /></td>
                <td><Bar value={p.rec.wr ?? 0} color={(p.rec.wr ?? 0) >= 0.5 ? "var(--win)" : "var(--loss)"} /></td>
                <td className="num">{formatValue("dec2", p.kda)}</td>
                <td className={`num ${(p.gd15 ?? 0) >= 0 ? "win-c" : "loss-c"}`}>{formatValue("signed", p.gd15)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Matchups({ pos, title }: { pos: "BOTTOM" | "UTILITY"; title: string }) {
  const { games } = useApp();
  const rows = matchups(games, pos).slice(0, 20);
  return (
    <Card title={title}>
      <div className="scroll-x">
        <table>
          <thead><tr><th>Enemy</th><th className="num">Games</th><th className="num">Record</th><th className="num">Our WR</th><th className="num" title="Our laner's gold minus theirs at 15 min">GD@15</th></tr></thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.champ}>
                <td><div className="cell-champ"><Champ name={x.champ} size={26} />{champName(x.champ)}</div></td>
                <td className="num">{x.rec.n}</td>
                <td className="num small muted">{x.rec.w}W {x.rec.l}L</td>
                <td className="num"><WinRate wr={x.rec.wr} n={x.rec.n} /></td>
                <td className={`num ${(x.gd15 ?? 0) >= 0 ? "win-c" : "loss-c"}`}>{formatValue("signed", x.gd15)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Pool({ slot }: { slot: 0 | 1 }) {
  const { games, names } = useApp();
  const rows = champPool(games, slot);
  return (
    <Card title={`${names[slot]} · champion pool`}>
      <div className="scroll-x">
        <table>
          <thead><tr><th>Champion</th><th className="num">Games</th><th className="num">WR</th><th className="num">KDA</th><th className="num">CS/min</th><th className="num">DPM</th></tr></thead>
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
      <Synergies />
      <div className="grid g2"><Matchups pos="BOTTOM" title="Against enemy ADCs" /><Matchups pos="UTILITY" title="Against enemy supports" /></div>
      <div className="grid g2"><Pool slot={0} /><Pool slot={1} /></div>
    </div>
  );
}
