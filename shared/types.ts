// Data schema shared by the fetcher (scripts/) and the site (src/).
// Bump DATA_VERSION when the shape changes; the fetcher re-downloads everything on a mismatch.
export const DATA_VERSION = 3;

export type Position = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY" | "";
export type TeamId = 100 | 200;

export interface DataFile {
  version: number;
  demo?: boolean;
  updated: number;
  challengeName: string;
  startDate: string;
  /** Rank the duo is aiming for, e.g. { tier: "EMERALD", div: "IV" }. Null = no goal set. */
  goal?: { tier: string; div: string } | null;
  players: PlayerInfo[]; // same order as config.json
  matches: Match[]; // newest first
  skipped: string[]; // match ids that aren't duo games (not refetched)
  rankHistory: RankSnapshot[];
}

export interface PlayerInfo {
  riotId: string;
  role: "BOTTOM" | "UTILITY";
  profileIcon?: number;
  level?: number;
}

export interface RankEntry { tier: string; div: string; lp: number; wins: number; losses: number }
export interface RankSnapshot { ts: number; solo: (RankEntry | null)[]; flex: (RankEntry | null)[] }

export interface Match {
  id: string;
  ts: number; // game start, ms
  dur: number; // seconds
  queue: number;
  patch: string; // "25.22"
  win: boolean;
  team: TeamId;
  duo: [number, number]; // index into parts[] for config player 0 and 1
  parts: Participant[]; // all 10, team 100 first
  teams: Record<TeamId, Team>;
  tl: TimelineSummary | null;
}

export interface Participant {
  name: string;
  team: TeamId;
  pos: Position;
  champ: string;
  lvl: number;
  k: number; d: number; a: number;
  cs: number;
  gold: number;
  dmg: number; // to champions
  taken: number;
  mitigated: number;
  healShield: number | null; // effectiveHealAndShielding
  vision: number;
  wards: number; wardsKilled: number; pinks: number;
  items: number[]; // 7, last is trinket, 0 = empty
  spells: [number, number];
  runes: [number, number, number]; // keystone, primary style, sub style
  perks: number[]; // full rune page: 4 primary + 2 secondary rune ids
  shards: number[]; // stat shards: offense, flex, defense
  timeDead: number;
  firstBlood: boolean;
  multi: number; // largest multikill
  ccTime: number;
  // challenges (null when Riot didn't send it)
  kp: number | null;
  dmgShare: number | null;
  takenShare: number | null;
  cs10: number | null;
  maxCsAdv: number | null;
  maxLvlLead: number | null;
  visionAdv: number | null;
  soloKills: number | null;
  plates: number | null;
  dragonTk: number | null;
  pinksPlaced: number | null;
  picks: number | null; // pickKillWithAlly
  immobilize: number | null; // enemyChampionImmobilizations
  saves: number | null; // saveAllyFromDeath
  skillHit: number | null;
  skillDodged: number | null;
  laneDom: number | null; // 0/1: 20% gold+xp lead at 14:00
}

export interface Team {
  kills: number; dragons: number; barons: number; heralds: number; grubs: number; towers: number; inhibs: number; atakhan: number;
  firstDragon: boolean; firstTower: boolean; firstBlood: boolean; firstBaron: boolean;
  bans: number[]; // champion keys (numeric ids)
}

/** [gold, xp, cs, level] for each of the 10 participants. */
export type FrameSnap = [number, number, number, number][];

export interface TimelineSummary {
  goldDiff: number[]; // per minute: our team gold minus enemy team gold
  at: Record<"5" | "10" | "14" | "15" | "20", FrameSnap | null>;
  /** [seconds, killerIdx (-1 = not a champion), victimIdx, x, y, assistIdx[]] */
  kills: [number, number, number, number, number, number[]][];
  /** [seconds, kind, teamOfKiller] kind: DRAGON:FIRE, BARON, HERALD, HORDE, ATAKHAN, TOWER:BOT_LANE:OUTER_TURRET, INHIB:... */
  objectives: [number, string, TeamId][];
  /** per duo player: [seconds, itemId] purchases (undos removed) */
  builds: [[number, number][], [number, number][]];
  /** per duo player: skill order, e.g. "QWEQQRQ..." */
  skills: [string, string];
}

export const QUEUES: Record<number, { name: string; short: string; ranked: boolean }> = {
  420: { name: "Ranked Solo/Duo", short: "Solo/Duo", ranked: true },
  440: { name: "Ranked Flex", short: "Flex", ranked: true },
  400: { name: "Normal Draft", short: "Draft", ranked: false },
  480: { name: "Swiftplay", short: "Swiftplay", ranked: false },
  490: { name: "Quickplay", short: "Quickplay", ranked: false },
  430: { name: "Normal Blind", short: "Blind", ranked: false },
};
