import { motion } from "motion/react";
import type { RankEntry } from "../../shared/types.ts";
import { record } from "../lib/analysis.ts";
import { profileIcon } from "../lib/ddragon.ts";
import { titleCase } from "../lib/format.ts";
import { spring } from "../lib/motion.ts";
import { TIERS } from "../lib/metrics.ts";
import { useApp } from "../state.tsx";
import { Emblem, PosIcon } from "./ui/Icons.tsx";

const ladder = (r: RankEntry | null) => {
  if (!r) return null;
  const t = TIERS.indexOf(r.tier);
  return t >= 7 ? 2800 + r.lp : t * 400 + ({ IV: 0, III: 1, II: 2, I: 3 }[r.div] ?? 0) * 100 + r.lp;
};
export const rankText = (r: RankEntry | null) => (!r ? "Unranked" : TIERS.indexOf(r.tier) >= 7 ? `${titleCase(r.tier)} ${r.lp} LP` : `${titleCase(r.tier)} ${r.div}`);

export function PlayerCards() {
  const { data, games } = useApp();
  const rh = data.rankHistory, last = rh.at(-1), first = rh[0];
  const rec = record(games);
  return (
    <div className="hero">
      {data.players.map((p, i) => {
        const [name, tag] = p.riotId.split("#");
        const solo = last?.solo[i] ?? null;
        const delta = ladder(solo) != null && ladder(first?.solo[i] ?? null) != null ? ladder(solo)! - ladder(first!.solo[i])! : null;
        return (
          <motion.div key={p.riotId} className="card player-card" style={{ ["--accent" as string]: `var(--p${i})` }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.gentle, delay: i * 0.06 }} whileHover={{ y: -2 }}>
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
      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.gentle, delay: 0.12 }}>
        <div className="small muted" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>{data.challengeName}</div>
        <div className="big" style={{ marginTop: 4 }}>{rec.w}W <span className="muted">–</span> {rec.l}L</div>
        <div className="small text-2">
          {rec.n} games together · since {new Date(data.startDate).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
        </div>
        <div className="small muted" style={{ marginTop: 6 }}>Updated {new Date(data.updated).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</div>
      </motion.div>
    </div>
  );
}
