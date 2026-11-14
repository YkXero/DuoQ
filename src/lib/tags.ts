// Short plain-language tags for a single game ("Won lane", "Died early ×3").
import type { Match } from "../../shared/types.ts";
import { adcIdx, enemyIdx, killsBefore, snapDiff, supIdx } from "./views.ts";

export interface Tag { text: string; tone: "good" | "bad" | "neutral"; title: string }

const laneGold = (m: Match, at: "10" | "15") => {
  const a = snapDiff(m, at, adcIdx(m), enemyIdx(m, "BOTTOM"), 0), s = snapDiff(m, at, supIdx(m), enemyIdx(m, "UTILITY"), 0);
  return a == null || s == null ? null : a + s;
};

/** One plain sentence explaining how the game went for the bot lane. */
export function gameStory(m: Match): { text: string; tone: "good" | "bad" | "neutral" } {
  const bits: string[] = [];
  let score = 0;
  const lane = laneGold(m, "15");
  if (lane != null) {
    if (lane >= 500) { bits.push(`won bot lane by ${lane.toLocaleString("en-US")} gold at 15 min`); score++; }
    else if (lane <= -500) { bits.push(`lost bot lane by ${Math.abs(lane).toLocaleString("en-US")} gold at 15 min`); score--; }
    else bits.push("bot lane was even at 15 min");
  }
  if (m.tl) {
    const bot = [adcIdx(m), supIdx(m)], ebot = [enemyIdx(m, "BOTTOM"), enemyIdx(m, "UTILITY")];
    const deaths = killsBefore(m, 840).filter((k) => bot.includes(k[2]));
    if (deaths.length >= 2) {
      const ganks = deaths.filter((k) => !ebot.includes(k[1])).length;
      bits.push(`you died ${deaths.length} times before 14:00${ganks ? ` (${ganks} to ganks)` : ""}`);
      score--;
    } else if (deaths.length === 0) bits.push("nobody in bot died before 14:00");
    const team15 = m.tl.goldDiff.length > 16 ? m.tl.goldDiff[15] : null;
    if (team15 != null && team15 >= 1500 && !m.win) { bits.push("the team threw a lead"); score--; }
    if (team15 != null && team15 <= -1500 && m.win) { bits.push("then came back"); score++; }
  }
  const us = m.teams[m.team], them = m.teams[m.team === 100 ? 200 : 100];
  if (us.dragons >= 4) bits.push("you took dragon soul");
  else if (them.dragons >= 4) bits.push("they took dragon soul");
  if (!bits.length) return { text: m.win ? "Win." : "Loss.", tone: "neutral" };
  const s = bits.slice(0, 3).join(", ");
  return { text: s.charAt(0).toUpperCase() + s.slice(1) + ".", tone: score > 0 ? "good" : score < 0 ? "bad" : "neutral" };
}

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
