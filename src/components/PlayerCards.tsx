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

export function PlayerCards() {
  const { data } = useApp();
  const rh = data.rankHistory, last = rh.at(-1), first = rh[0];
  return (
    <div className="hero">
      {data.players.map((p, i) => {
        const [name, tag] = p.riotId.split("#");
        const solo = last?.solo[i] ?? null;
        const delta = ladder(solo) != null && ladder(first?.solo[i] ?? null) != null ? ladder(solo)! - ladder(first!.solo[i])! : null;
        return (
          <motion.div key={p.riotId} className="card player-card" style={{ ["--accent" as string]: `var(--p${i})` }}
            initial={{ y: 16 }} animate={{ y: 0 }} transition={{ ...spring.gentle, delay: i * 0.06 }} whileHover={{ y: -2 }}>
            <div className="avatar">
              {p.profileIcon != null ? <img src={profileIcon(p.profileIcon)} alt="" /> : <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--panel-3)" }} />}
              {p.level != null && <span className="lvl">{p.level}</span>}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="row">
                <span className="player-name">{name}<span className="tag"> #{tag}</span></span>
              </div>
              <div className="row" style={{ marginTop: 2 }}>
                <span className="role-chip"><PosIcon pos={p.role} />{p.role === "BOTTOM" ? "ADC" : "Support"}</span>
              </div>
              <div className="rank-line">
                {solo && <Emblem tier={solo.tier} size={48} />}
                <div>
                  <div className="tier">{rankText(solo)}{solo && <span className="muted"> · {solo.lp} LP</span>}</div>
                  <div className="small muted">
                    {solo && solo.wins + solo.losses > 0 ? `${solo.wins}W ${solo.losses}L this season · ${Math.round((solo.wins / (solo.wins + solo.losses)) * 100)}%` : "Solo/Duo"}
                    {delta ? <span className={delta > 0 ? "win-c" : "loss-c"}> · {delta > 0 ? "+" : ""}{delta} LP in challenge</span> : null}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
      <ChallengeCard />
    </div>
  );
}

/** The duo's shared goal: progress toward the target rank, day count, and this week's one focus. */
function ChallengeCard() {
  const { data, games, goals, names, bracket } = useApp();
  const top = useMemo(() => coaching(games, names, bracket).improve[0], [games, names, bracket]);
  const focus = goals.goals.find((g) => g.status === "active")?.title ?? top?.title;
  const start = new Date(data.startDate + "T00:00:00").getTime();
  const day = Math.max(1, Math.ceil((Date.now() - start) / 86400000));
  const goalV = data.goal ? ladder({ tier: data.goal.tier, div: data.goal.div, lp: 0 }) : null;
  const first = data.rankHistory[0], last = data.rankHistory.at(-1);
  return (
    <motion.div className="card challenge" initial={{ y: 16 }} animate={{ y: 0 }} transition={{ ...spring.gentle, delay: 0.12 }}>
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
    </motion.div>
  );
}
