// Short plain-language tags for a single game ("Won lane", "Died early ×3").
import type { Match } from "../../shared/types.ts";
import { adcIdx, enemyIdx, killsBefore, snapDiff, supIdx } from "./views.ts";

export interface Tag { text: string; tone: "good" | "bad" | "neutral"; title: string }

export function matchTags(m: Match): Tag[] {
  const tags: Tag[] = [];
  const a = adcIdx(m), s = supIdx(m);
  const ga = snapDiff(m, "15", a, enemyIdx(m, "BOTTOM"), 0), gs = snapDiff(m, "15", s, enemyIdx(m, "UTILITY"), 0);
  const lane = ga == null || gs == null ? null : ga + gs;
  if (lane != null) {
    if (lane >= 500) tags.push({ text: "Won lane", tone: "good", title: `Bot lane +${lane} gold at 15 min` });
    else if (lane <= -500) tags.push({ text: "Lost lane", tone: "bad", title: `Bot lane ${lane} gold at 15 min` });
    else tags.push({ text: "Even lane", tone: "neutral", title: `Bot lane ${lane >= 0 ? "+" : ""}${lane} gold at 15 min` });
  }
  if (m.tl) {
    const early = killsBefore(m, 840).filter((k) => k[2] === a || k[2] === s).length;
    if (early >= 3) tags.push({ text: `Died early ×${early}`, tone: "bad", title: "Bot lane deaths before 14:00" });
    const team15 = m.tl.goldDiff.length > 16 ? m.tl.goldDiff[15] : null;
    if (team15 != null && team15 >= 1500 && !m.win) tags.push({ text: "Threw a lead", tone: "bad", title: `Team was +${team15} gold at 15 and lost` });
    if (team15 != null && team15 <= -1500 && m.win) tags.push({ text: "Comeback", tone: "good", title: `Team was ${team15} gold at 15 and won` });
  }
  const us = m.teams[m.team], them = m.teams[m.team === 100 ? 200 : 100];
  if (us.dragons >= 4) tags.push({ text: "Dragon soul", tone: "good", title: `${us.dragons} dragons` });
  else if (them.dragons >= 4) tags.push({ text: "Gave dragon soul", tone: "bad", title: `Enemy took ${them.dragons} dragons` });
  return tags.slice(0, 3);
}
