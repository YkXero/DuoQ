import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { chrono, duoStats, playerStats, record, synergies } from "../../lib/analysis.ts";
import { champName } from "../../lib/ddragon.ts";
import { formatValue } from "../../lib/formatValue.ts";
import { goalProgress } from "../../lib/goals.ts";
import { CATEGORY_NAME, coaching, reportCard, verdict, winLossSwings, type Insight, type Who } from "../../lib/insights.ts";
import { stagger } from "../../lib/motion.ts";
import { plain } from "../../lib/plain.ts";
import { useApp } from "../../state.tsx";
import { GoalCard } from "../coach/Coach.tsx";
import { Card, Donut, Segmented } from "../ui/Controls.tsx";
import { Champ, WinRate } from "../ui/Icons.tsx";
import { GradeBadge, Meter, TrendWord } from "../ui/Meter.tsx";
import { LpChart, RollingWinRate } from "./Charts.tsx";

const WhoChip = ({ who }: { who: Who }) => {
  const { names } = useApp();
  return who === "duo" ? <span className="who-chip duo">Duo</span> : <span className={`who-chip w${who}`}>{names[who]}</span>;
};

/** One sentence that sums up the selection. */
function Verdict() {
  const { games, names, bracket } = useApp();
  const c = useMemo(() => coaching(games, names, bracket), [games, names, bracket]);
  const rec = record(games);
  const top = c.improve[0], best = c.strengths[0];
  const wr = Math.round((rec.wr ?? 0) * 100);
  const last10 = games.slice(0, 10), w10 = last10.filter((m) => m.win).length;
  let streak = 0;
  for (const m of games) { if (m.win) streak++; else break; }
  const cheer = streak >= 3 ? `${streak} wins in a row` : last10.length === 10 && w10 >= 7 ? `${w10} of your last 10 games won` : null;
  const mood = wr >= 55 ? "You're winning more than you lose" : wr >= 48 ? "You're winning about half your games" : "You're losing more than you win";
  return (
    <div className="verdict">
      <Donut value={rec.wr ?? 0} size={76} stroke={9} label="win rate" />
      <div style={{ minWidth: 0 }}>
        {cheer && <span className="cheer">{cheer}</span>}
        <h2 className="verdict-title">{mood}: {rec.w} wins, {rec.l} losses.</h2>
        <p className="verdict-sub">
          {best && <>Best thing: <b className="good-c">{best.title}</b>. </>}
          {top && <>Biggest problem: <b className="bad-c">{top.title}</b>.</>}
          {!top && !best && "Play a few more games to get coaching."}
        </p>
        <div className="form-strip" title="Last 20 games, newest first" style={{ marginTop: 8 }}>
          {games.slice(0, 20).map((m) => <i key={m.id} className={m.win ? "w" : ""} />)}
          <span className="small muted" style={{ marginLeft: 6 }}>last 20 games, newest first</span>
        </div>
      </div>
    </div>
  );
}

function ReportCard() {
  const { games, names, bracket } = useApp();
  const [who, setWho] = useState<"0" | "1" | "duo">("0");
  const rows = useMemo(() => (who === "duo" ? duoStats(games, bracket) : playerStats(games, Number(who) as 0 | 1, bracket)), [games, who, bracket]);
  const cells = reportCard(rows).filter((c) => c.grade);
  const name = who === "duo" ? "You" : names[Number(who)];
  return (
    <Card title="Report card" hint="graded against players at your rank">
      <div style={{ marginBottom: 14 }}>
        <Segmented value={who} onChange={setWho} options={[{ value: "0", label: names[0] }, { value: "1", label: names[1] }, { value: "duo", label: "Bot lane together" }]} />
      </div>
      <div className="report">
        {cells.map((c, i) => {
          const v = verdict(c.worst!, name);
          return (
            <motion.div key={c.category} className="report-cell" initial={{ y: 8 }} animate={{ y: 0 }} transition={stagger(i, 0.04)}>
              <GradeBadge grade={c.grade} />
              <div style={{ minWidth: 0 }}>
                <div className="report-name">{CATEGORY_NAME[c.category]}</div>
                <div className="small text-2">{v.text}</div>
              </div>
            </motion.div>
          );
        })}
        {!cells.length && <p className="muted">Not enough games to grade yet.</p>}
      </div>
      <div className="grade-key small muted">A = well above your rank · C = normal for your rank · F = well below</div>
    </Card>
  );
}

function FixCard({ i, n }: { i: Insight; n: number }) {
  return (
    <motion.article className="fix" initial={{ y: 10 }} animate={{ y: 0 }} transition={stagger(n, 0.06)}>
      <div className="fix-head">
        <span className="fix-rank" aria-label={`Priority ${n + 1}`}>{n + 1}</span>
        <WhoChip who={i.who} />
        <TrendWord v={i.trend} />
      </div>
      <h3 className="fix-title">{i.title}</h3>
      {i.row && <Meter row={i.row} />}
      {i.champs && (
        <div className="fix-champs">
          {i.champs.map((c, k) => <span key={c} className="row" style={{ gap: 6 }}>{k > 0 && <span className="plus">+</span>}<Champ name={c} size={44} /></span>)}
        </div>
      )}
      <p className="fix-detail">{i.detail}</p>
      {i.why && <p className="fix-why">{i.why}</p>}
      {i.tip && <p className="fix-tip"><b>Try this:</b> {i.tip}</p>}
    </motion.article>
  );
}

function Strength({ i, n }: { i: Insight; n: number }) {
  return (
    <motion.div className="strength" initial={{ x: -6 }} animate={{ x: 0 }} transition={stagger(n)}>
      <span className="check" aria-hidden>✓</span>
      <div style={{ minWidth: 0 }}>
        <div className="row wrap-row" style={{ gap: 6 }}><b>{i.title}</b><WhoChip who={i.who} /></div>
        <div className="small text-2">{i.detail}</div>
      </div>
    </motion.div>
  );
}

function WinsVsLosses() {
  const { games, names, bracket } = useApp();
  const swings = useMemo(() => winLossSwings(games, names, bracket, 4), [games, names, bracket]);
  if (!swings.length) return null;
  return (
    <Card title="What changes when you lose" hint="the biggest differences between your wins and losses">
      <div className="swings">
        {swings.map((s, n) => {
          const { metric, inWins, inLosses } = s.row;
          const max = Math.max(Math.abs(inWins!), Math.abs(inLosses!)) || 1;
          return (
            <motion.div key={metric.id + String(s.who)} className="swing" transition={stagger(n)}>
              <div className="row wrap-row" style={{ gap: 6 }}><b>{plain(metric.id).name}</b><WhoChip who={s.who} />{metric.better === "lower" && <span className="small muted">lower is better</span>}</div>
              <div className="swing-bars">
                <span className="small muted">Wins</span>
                <div className="swing-track"><motion.i className="w" initial={{ width: 0 }} animate={{ width: `${(Math.abs(inWins!) / max) * 100}%` }} /></div>
                <span className="small num">{formatValue(metric.format, inWins)}</span>
                <span className="small muted">Losses</span>
                <div className="swing-track"><motion.i className="l" initial={{ width: 0 }} animate={{ width: `${(Math.abs(inLosses!) / max) * 100}%` }} /></div>
                <span className="small num">{formatValue(metric.format, inLosses)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

function TopPairs() {
  const { games } = useApp();
  const pairs = synergies(games).filter((p) => p.rec.n >= 2).sort((a, b) => b.rec.shrunk - a.rec.shrunk);
  if (!pairs.length) return null;
  const best = pairs.slice(0, 3), worst = pairs.length > 4 ? pairs.slice(-2).reverse() : [];
  const Row = ({ p }: { p: (typeof pairs)[number] }) => (
    <div className="pair-row">
      <div className="cell-champ"><Champ name={p.adc} size={30} /><Champ name={p.sup} size={30} /><span>{champName(p.adc)} + {champName(p.sup)}</span></div>
      <span className="small muted">{p.rec.w}W {p.rec.l}L</span>
      <WinRate wr={p.rec.wr} n={p.rec.n} />
    </div>
  );
  return (
    <Card title="Your duos">
      <div className="small muted" style={{ marginBottom: 6 }}>Best together</div>
      {best.map((p) => <Row key={p.adc + p.sup} p={p} />)}
      {worst.length > 0 && <><div className="small muted" style={{ margin: "12px 0 6px" }}>Worst together</div>{worst.map((p) => <Row key={p.adc + p.sup} p={p} />)}</>}
    </Card>
  );
}

export function Overview() {
  const { games, names, bracket, goals, data } = useApp();
  const c = useMemo(() => coaching(games, names, bracket), [games, names, bracket]);
  const active = goals.goals.filter((g) => g.status === "active").map((g) => goalProgress(g, data.matches));
  return (
    <div className="stack">
      <Verdict />
      {active.length > 0 && (
        <Card title="Your objectives" hint={`set in the review on ${goals.reviews.at(-1)?.date ?? ""}`}>
          {active.map((p, i) => <GoalCard key={p.goal.id} p={p} i={i} />)}
        </Card>
      )}
      {c.strengths.length > 0 && (
        <Card title="What's working">
          <div className="strengths">{c.strengths.slice(0, 3).map((i, n) => <Strength key={i.title} i={i} n={n} />)}</div>
        </Card>
      )}
      <section>
        <h2 className="section-title">Fix these first</h2>
        <p className="section-sub">The things costing you the most games, worst first.</p>
        <div className="fixes">
          {c.improve.slice(0, 3).map((i, n) => <FixCard key={i.title} i={i} n={n} />)}
          {!c.improve.length && <div className="card muted">Nothing is clearly below target. Keep it up.</div>}
        </div>
        {c.improve.length > 3 && (
          <details className="more">
            <summary>{c.improve.length - 3} more things to work on</summary>
            <div className="fixes" style={{ marginTop: 12 }}>{c.improve.slice(3, 9).map((i, n) => <FixCard key={i.title} i={i} n={n + 3} />)}</div>
          </details>
        )}
      </section>
      <ReportCard />
      <WinsVsLosses />
      <div className="grid g2">
        <Card title="Are you climbing?"><LpChart /></Card>
        <Card title="Are you winning more lately?"><RollingWinRate games={chrono(games)} /></Card>
      </div>
      <TopPairs />
    </div>
  );
}
