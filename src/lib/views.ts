// Convenience views over a Match: "me", my lane opponent, my duo partner, enemy bot lane.
import type { FrameSnap, Match, Participant } from "../../shared/types.ts";

export type Slot = 0 | 1; // config player index
export type Role = "BOTTOM" | "UTILITY";

export interface PlayerView {
  m: Match;
  slot: Slot;
  idx: number; // index in m.parts
  me: Participant;
  role: Role; // what they actually played this game (falls back to BOTTOM/UTILITY by duo order)
  oppIdx: number; // lane opponent index, -1 if unknown
  opp: Participant | null;
  partnerIdx: number;
  min: number; // game minutes
}

export const minutes = (m: Match) => m.dur / 60;
export const ourParts = (m: Match) => m.parts.filter((p) => p.team === m.team);
export const enemyParts = (m: Match) => m.parts.filter((p) => p.team !== m.team);

/** Index (into parts) of whoever played ADC for us this game. */
export function adcIdx(m: Match): number {
  const [a, b] = m.duo;
  if (m.parts[a].pos === "BOTTOM" || m.parts[b].pos === "UTILITY") return a;
  if (m.parts[b].pos === "BOTTOM" || m.parts[a].pos === "UTILITY") return b;
  return a;
}
export const supIdx = (m: Match) => (adcIdx(m) === m.duo[0] ? m.duo[1] : m.duo[0]);
export const enemyIdx = (m: Match, pos: Role) => m.parts.findIndex((p) => p.team !== m.team && p.pos === pos);

export function view(m: Match, slot: Slot): PlayerView {
  const idx = m.duo[slot];
  const role: Role = adcIdx(m) === idx ? "BOTTOM" : "UTILITY";
  const oppIdx = enemyIdx(m, role);
  return { m, slot, idx, me: m.parts[idx], role, oppIdx, opp: oppIdx >= 0 ? m.parts[oppIdx] : null, partnerIdx: m.duo[1 - slot], min: minutes(m) };
}

/** Value at minute `at` for participant i: 0 gold, 1 xp, 2 cs, 3 level. */
export function snapVal(m: Match, at: keyof NonNullable<Match["tl"]>["at"], i: number, field: 0 | 1 | 2 | 3): number | null {
  const s: FrameSnap | null | undefined = m.tl?.at[at];
  return s && i >= 0 ? s[i][field] : null;
}
export function snapDiff(m: Match, at: keyof NonNullable<Match["tl"]>["at"], a: number, b: number, field: 0 | 1 | 2 | 3): number | null {
  const x = snapVal(m, at, a, field), y = snapVal(m, at, b, field);
  return x == null || y == null ? null : x - y;
}

/** Champion kills before `sec` seconds. */
export const killsBefore = (m: Match, sec: number) => (m.tl?.kills ?? []).filter((k) => k[0] < sec);
