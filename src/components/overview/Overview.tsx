// Overview: the duo's op.gg-style profile page. Left column = summary panels, right = coaching + recent games.
import { useMemo, useState } from "react";
import { duoStats, playerStats, record, synergies } from "../../lib/analysis.ts";
import { champName } from "../../lib/ddragon.ts";
import { formatValue } from "../../lib/formatValue.ts";
import { goalProgress } from "../../lib/goals.ts";
import { CATEGORY_NAME, coaching, reportCard, verdict, winLossSwings, type Insight, type Who } from "../../lib/insights.ts";
import { mean } from "../../lib/stats.ts";
import { plain } from "../../lib/plain.ts";
import { useApp } from "../../state.tsx";
import { GoalCard } from "../coach/Coach.tsx";
import { MatchRow } from "../history/MatchHistory.tsx";
import { ChallengeCard } from "../PlayerCards.tsx";
import { Card, Donut, Segmented } from "../ui/Controls.tsx";
import { Champ, Kda } from "../ui/Icons.tsx";
import { GradeBadge, Meter, TrendWord } from "../ui/Meter.tsx";
import { LpChart } from "./Charts.tsx";

export const WhoChip = ({ who }: { who: Who }) => {
  const { names } = useApp();
  return who === "duo" ? <span className="who-chip duo">Duo</span> : <span className={`who-chip w${who}`}>{names[who]}</span>;
};

// ---------------------------------------------------------------- left column
function RecentSummary() {
  const { games } = useApp();
  const last = games.slice(0, 20), rec = record(last);
  const sum = (f: (m: (typeof games)[number]) => number) => mean(last.map(f)) ?? 0;
  const k = sum((m) => m.parts[m.duo[0]].k + m.parts[m.duo[1]].k), d = sum((m) => m.parts[m.duo[0]].d + m.parts[m.duo[1]].d), a = sum((m) => m.parts[m.duo[0]].a + m.parts[m.duo[1]].a);
  let streak = 0;
  for (const m of games) { if (m.win === games[0]?.win) streak++; else break; }
  return (
    <Card title={`Last ${last.length} games together`}>
      <div className="recent">
        <Donut value={rec.wr ?? 0} size={92} stroke={11} label="win rate" />
        <div>
          <div className="small text-2">{rec.n} games · {rec.w}W {rec.l}L</div>
          <div className="recent-kda"><Kda k={k} d={d} a={a} /></div>
          <div className="small text-2">{k.toFixed(1)} / <span className="bad-c">{d.toFixed(1)}</span> / {a.toFixed(1)} as a duo</div>
          {games.length > 0 && <div className={`small ${games[0].win ? "win-c" : "loss-c"}`} style={{ marginTop: 4, fontWeight: 500 }}>{streak} {games[0].win ? (streak === 1 ? "win" : "wins") : (streak === 1 ? "loss" : "losses")} in a row</div>}
        </div>
      </div>
      <div className="form-strip" title="Last 20 games, newest first" style={{ marginTop: 12 }}>
        {last.map((m) => <i key={m.id} className={m.win ? "w" : ""} />)}
      </div>
    </Card>
  );
}

function MostPlayedDuos() {
  const { games } = useApp();
  const pairs = synergies(games).slice(0, 5);
  return (
    <Card title="Most-played duos">
      {pairs.map((p) => (
        <div key={p.adc + p.sup} className="duo-row">
          <div className="duo-icons"><Champ name={p.adc} size={32} round /><Champ name={p.sup} size={32} round /></div>
          <div style={{ minWidth: 0 }}>
            <div className="duo-name">{champName(p.adc)} + {champName(p.sup)}</div>
            <div className="small text-2">{p.rec.n} games · {formatValue("dec1", p.kda)} KDA</div>
          </div>
          <div className="duo-wr">
            <div className={(p.rec.wr ?? 0) >= 0.6 && p.rec.n >= 3 ? "good-c" : (p.rec.wr ?? 1) < 0.45 && p.rec.n >= 3 ? "bad-c" : ""} style={{ fontWeight: 700 }}>{Math.round((p.rec.wr ?? 0) * 100)}%</div>
            <div className="small text-2">{p.rec.w}W {p.rec.l}L</div>
          </div>
        </div>
      ))}
    </Card>
  );
}

function Strength({ i }: { i: Insight }) {
  return (
    <div className="strength">
      <svg className="check" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" /><path d="M5.5 10.5l3 3 6-6.5" /></svg>
      <div style={{ minWidth: 0 }}>
        <div className="row wrap-row" style={{ gap: 6 }}><b>{i.title}</b><WhoChip who={i.who} /></div>
        <div className="small text-2">{i.detail}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- right column
function DuoReport() {
  const { games, names, bracket } = useApp();
  const c = useMemo(() => coaching(games, names, bracket), [games, names, bracket]);
  const [who, setWho] = useState<"0" | "1" | "duo">("0");
  const [showAll, setShowAll] = useState(false);
  const rows = useMemo(() => (who === "duo" ? duoStats(games, bracket) : playerStats(games, Number(who) as 0 | 1, bracket)), [games, who, bracket]);
  const cells = reportCard(rows).filter((x) => x.grade);
  const name = who === "duo" ? "You" : names[Number(who)];
  const wr = Math.round((record(games).wr ?? 0) * 100);
  const top = c.improve[0], best = c.strengths[0];
  return (
    <Card title="Duo report" hint="graded against players at your rank">
      <p className="report-verdict">
        {wr >= 52 ? "You're winning more than you lose." : wr >= 48 ? "You're winning about half your games." : "You're losing more than you win."}
        {best && <> Best: <b className="good-c">{best.title}</b>.</>}
        {top && <> Fix first: <b className="bad-c">{top.title}</b>.</>}
      </p>

      <div className="report-head">
        <Segmented value={who} onChange={setWho} options={[{ value: "0", label: names[0] }, { value: "1", label: names[1] }, { value: "duo", label: "Bot lane" }]} />
        <span className="small muted">A = well above your rank · C = normal · F = well below</span>
      </div>
      <div className="grades">
        {cells.map((g) => {
          const v = verdict(g.worst!, name);
          return (
            <div key={g.category} className="grade-cell" title={v.text}>
              <GradeBadge grade={g.grade} size={36} />
              <div style={{ minWidth: 0 }}>
                <div className="grade-name">{CATEGORY_NAME[g.category]}</div>
                <div className="small text-2 clamp1">{v.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="sub-title">Fix next game</h3>
      <div className="fix-list">
        {(showAll ? c.improve.slice(0, 8) : c.improve.slice(0, 3)).map((i, n) => (
          <div key={i.title} className="fix-row">
            <span className="fix-rank">{n + 1}</span>
            <div style={{ minWidth: 0 }}>
              <div className="row wrap-row" style={{ gap: 6 }}><b>{i.title}</b><WhoChip who={i.who} /><TrendWord v={i.trend} /></div>
              <div className="small text-2">{i.detail}</div>
              {i.tip && <div className="small fix-tip"><b>Try this:</b> {i.tip}</div>}
            </div>
            <div className="fix-visual">
              {i.row ? <Meter row={i.row} /> : i.champs ? <div className="row" style={{ gap: 4, justifyContent: "flex-end" }}>{i.champs.map((ch) => <Champ key={ch} name={ch} size={32} />)}</div> : null}
            </div>
          </div>
        ))}
        {!c.improve.length && <p className="small muted">Nothing is clearly below target right now.</p>}
      </div>
      {c.improve.length > 3 && <button className="link-btn" onClick={() => setShowAll(!showAll)}>{showAll ? "Show fewer" : `Show ${Math.min(8, c.improve.length) - 3} more`}</button>}
    </Card>
  );
}

export function WinsVsLosses() {
  const { games, names, bracket } = useApp();
  const swings = useMemo(() => winLossSwings(games, names, bracket, 4), [games, names, bracket]);
  if (!swings.length) return null;
  return (
    <Card title="What changes when you lose" hint="biggest differences between your wins and losses">
      <div className="swings">
        {swings.map((s) => {
          const { metric, inWins, inLosses } = s.row;
          const max = Math.max(Math.abs(inWins!), Math.abs(inLosses!)) || 1;
          return (
            <div key={metric.id + String(s.who)} className="swing">
              <div className="row wrap-row" style={{ gap: 6 }}><b>{plain(metric.id).name}</b><WhoChip who={s.who} />{metric.better === "lower" && <span className="small muted">lower is better</span>}</div>
              <div className="swing-bars">
                <span className="small text-2">Wins</span>
                <div className="swing-track"><i className="w" style={{ width: `${(Math.abs(inWins!) / max) * 100}%` }} /></div>
                <span className="small num">{formatValue(metric.format, inWins)}</span>
                <span className="small text-2">Losses</span>
                <div className="swing-track"><i className="l" style={{ width: `${(Math.abs(inLosses!) / max) * 100}%` }} /></div>
                <span className="small num">{formatValue(metric.format, inLosses)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function RecentGames() {
  const { games } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section>
      {games.slice(0, 10).map((m) => <MatchRow key={m.id} m={m} open={open === m.id} toggle={() => setOpen(open === m.id ? null : m.id)} />)}
      {games.length > 10 && <a className="more-games" href="#history">See all {games.length} games in Match history</a>}
    </section>
  );
}

export function Overview() {
  const { games, names, bracket, goals, data } = useApp();
  const c = useMemo(() => coaching(games, names, bracket), [games, names, bracket]);
  const active = goals.goals.filter((g) => g.status === "active").map((g) => goalProgress(g, data.matches));
  return (
    <div className="profile-layout">
      <aside className="stack">
        <RecentSummary />
        <ChallengeCard />
        <MostPlayedDuos />
        {c.strengths.length > 0 && (
          <Card title="What's working">
            <div className="stack" style={{ gap: 12 }}>{c.strengths.slice(0, 4).map((i) => <Strength key={i.title} i={i} />)}</div>
          </Card>
        )}
        <Card title="Rank graph"><LpChart /></Card>
      </aside>
      <div className="stack main-col">
        {active.length > 0 && (
          <Card title="Your objectives" hint={`set in the review on ${goals.reviews.at(-1)?.date ?? ""}`}>
            {active.map((p, i) => <GoalCard key={p.goal.id} p={p} i={i} />)}
          </Card>
        )}
        <DuoReport />
        <RecentGames />
      </div>
    </div>
  );
}
