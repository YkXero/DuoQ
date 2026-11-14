// Rank <-> ladder points (Iron IV 0 LP = 0, each division = 100, Master+ = 2800 + LP).
import type { RankEntry } from "../../shared/types.ts";
import { titleCase } from "./format.ts";

export const TIER_ORDER = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"];
const DIV_INDEX: Record<string, number> = { IV: 0, III: 1, II: 2, I: 3 };
const DIVS = ["IV", "III", "II", "I"];

export function ladder(r: Pick<RankEntry, "tier" | "div" | "lp"> | null | undefined): number | null {
  if (!r) return null;
  const t = TIER_ORDER.indexOf(r.tier);
  if (t < 0) return null;
  return t >= 7 ? 2800 + r.lp : t * 400 + (DIV_INDEX[r.div] ?? 0) * 100 + r.lp;
}

/** Short axis label for a ladder value: "Gold 2", "Plat 4", "Master+". */
export function ladderLabel(v: number): string {
  if (v >= 2800) return "Master+";
  const tier = TIER_ORDER[Math.floor(v / 400)] ?? "";
  const short = tier === "PLATINUM" ? "Plat" : titleCase(tier);
  return `${short} ${4 - Math.floor((v % 400) / 100)}`;
}

export const rankName = (tier: string, div?: string) =>
  TIER_ORDER.indexOf(tier) >= 7 ? titleCase(tier) : `${titleCase(tier)} ${div ?? ""}`.trim();

export const nextDivision = (v: number) => {
  const t = Math.floor(v / 400), d = Math.floor((v % 400) / 100);
  return d < 3 ? { tier: TIER_ORDER[t], div: DIVS[d + 1] } : { tier: TIER_ORDER[t + 1] ?? "MASTER", div: "IV" };
};
