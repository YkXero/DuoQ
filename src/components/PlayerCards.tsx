import { motion } from "motion/react";
import type { RankEntry } from "../../shared/types.ts";
import { useMemo } from "react";
import { coaching } from "../lib/insights.ts";
import { ladder, rankName } from "../lib/rank.ts";
import { profileIcon } from "../lib/ddragon.ts";
import { titleCase } from "../lib/format.ts";
import { spring } from "../lib/motion.ts";
import { TIERS } from "../lib/metrics.ts";
import { useApp } from "../state.tsx";
import { Emblem, PosIcon } from "./ui/Icons.tsx";

export const rankText = (r: RankEntry | null) => (!r ? "Unranked" : TIERS.indexOf(r.tier) >= 7 ? `${titleCase(r.tier)} ${r.lp} LP` : `${titleCase(r.tier)} ${r.div}`);

const TIER_COLOR: Record<string, string> = {
  IRON: "#a7a097", BRONZE: "#c0aa9b", SILVER: "#b7bbcb", GOLD: "#dbc798", PLATINUM: "#97cbc4",
  EMERALD: "#7fd6a7", DIAMOND: "#a7cdf2", MASTER: "#d3b3ea", GRANDMASTER: "#ebb4c4", CHALLENGER: "#fdc06b",
};

export function PlayerCards() {
  const { data } = useApp();
  const rh = data.rankHistory, last = rh.at(-1), first = rh[0];
  const cards = data.players.map((p, i) => {
    const [name, tag] = p.riotId.split("#");
    const solo = last?.solo[i] ?? null;
    const delta = ladder(solo) != null && ladder(first?.solo[i] ?? null) != null ? ladder(solo)! - ladder(first!.solo[i])! : null;
    const wr = solo && solo.wins + solo.losses > 0 ? Math.round((solo.wins / (solo.wins + solo.losses)) * 100) : null;
    return (
      <div key={p.riotId} className="player-card">
        <div className="avatar">
          {p.profileIcon != null ? <img src={profileIcon(p.profileIcon)} alt="" /> : <div className="avatar-empty" />}
          {p.level != null && <span className="lvl">{p.level}</span>}
        </div>
        <div className="player-id">
          <div className="player-name">{name}<span className="tag"> #{tag}</span></div>
          <div className="row" style={{ gap: 4, marginTop: 4 }}>
            <span className="role-chip"><PosIcon pos={p.role} />{p.role === "BOTTOM" ? "ADC" : "Support"}</span>
            <span className="role-chip">EUW</span>
          </div>
          {delta ? <div className="small text-2" style={{ marginTop: 6 }}><span className={delta > 0 ? "win-c" : "loss-c"}>{delta > 0 ? "+" : ""}{delta} LP</span> since the challenge started</div> : null}
        </div>
        <div className="player-rank">
          <div className="tier" style={solo ? { color: TIER_COLOR[solo.tier] } : undefined}>{rankText(solo)}</div>
          <div className="small text-2">{solo ? `${solo.lp} LP` : "Solo/Duo"}{wr != null ? ` · ${wr}% WR` : ""}</div>
        </div>
        {solo && <Emblem tier={solo.tier} size={52} />}
      </div>
    );
  });
  return (
    <div className="profile-row">
      {cards[0]}
      <span className="plus" aria-hidden="true">+</span>
      {cards[1]}
    </div>
  );
}

/** The duo's shared goal: progress toward the target rank, day count, and this week's one focus. */
export function ChallengeCard() {
  const { data, games, goals, names, bracket } = useApp();
  const top = useMemo(() => coaching(games, names, bracket).improve[0], [games, names, bracket]);
  const focus = goals.goals.find((g) => g.status === "active")?.title ?? top?.title;
  const start = new Date(data.startDate + "T00:00:00").getTime();
  const day = Math.max(1, Math.ceil((Date.now() - start) / 86400000));
  const goalV = data.goal ? ladder({ tier: data.goal.tier, div: data.goal.div, lp: 0 }) : null;
  const first = data.rankHistory[0], last = data.rankHistory.at(-1);
  return (
    <section className="card challenge">
      <div className="challenge-head">
        <h2 className="challenge-title">{data.goal ? `Road to ${rankName(data.goal.tier, data.goal.div)}` : data.challengeName}</h2>
        <span className="small text-2">Day {day} · {data.matches.length} games</span>
      </div>
      {goalV != null ? (
        <div className="goal-bars">
          {data.players.map((p, i) => {
            const s = ladder(first?.solo[i]), c = ladder(last?.solo[i]);
            if (s == null || c == null) return <div key={p.riotId} className="small muted">{names[i]}: unranked</div>;
            const done = c >= goalV;
            const pct = done ? 1 : Math.max(0.02, Math.min(1, (c - Math.min(s, c)) / Math.max(1, goalV - Math.min(s, c))));
            return (
              <div key={p.riotId} className="goal-bar">
                <div className="row small" style={{ justifyContent: "space-between" }}>
                  <b className={`p${i}`}>{names[i]}</b>
                  <span className={done ? "good-c" : "text-2"}>{done ? "Goal reached" : `${goalV - c} LP to go`}</span>
                </div>
                <div className="gb-track"><motion.i className={`gb-fill f${i}`} initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={spring.gentle} /></div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="small text-2" style={{ margin: "8px 0 0" }}>No goal rank yet. Add one as <code>goal</code> in config.json to track your progress here.</p>
      )}
      {focus && <p className="focus"><span className="focus-label">This week's focus</span>{focus}</p>}
    </section>
  );
}
