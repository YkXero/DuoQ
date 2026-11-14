// Writes realistic fake data to public/data/demo.json (the site offers a "view demo" button when
// there are no real games). Never touches data.json.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DATA_VERSION, type DataFile, type FrameSnap, type Match, type Participant, type Position, type Team, type TeamId } from "../shared/types.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(await readFile(join(ROOT, "config.json"), "utf8"));

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const ri = (a: number, b: number) => Math.floor(a + rand() * (b - a + 1));
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

const POOL: Record<Exclude<Position, "">, string[]> = {
  TOP: ["Aatrox", "Darius", "Garen", "Ornn", "Fiora", "Camille", "Sett", "Malphite", "Jax", "KSante"],
  JUNGLE: ["LeeSin", "Viego", "Vi", "Kayn", "Elise", "Graves", "Nocturne", "JarvanIV", "Khazix", "Amumu"],
  MIDDLE: ["Ahri", "Syndra", "Yone", "Orianna", "Viktor", "Sylas", "Akali", "Lux", "Zed", "Hwei"],
  BOTTOM: ["Jinx", "Caitlyn", "Ezreal", "Kaisa", "Jhin", "Ashe", "MissFortune", "Varus", "Xayah", "Lucian", "Draven", "Samira", "Smolder"],
  UTILITY: ["Thresh", "Nautilus", "Lulu", "Leona", "Nami", "Karma", "Braum", "Blitzcrank", "Pyke", "Soraka", "Milio", "Rakan"],
};
const OUR_ADC = ["Jinx", "Caitlyn", "Ezreal", "Kaisa", "Jhin"];
const OUR_SUP = ["Thresh", "Nautilus", "Lulu", "Rakan", "Milio"];
const PAIR_BIAS: Record<string, number> = { "Jinx|Lulu": 0.15, "Caitlyn|Thresh": 0.12, "Kaisa|Nautilus": 0.1, "Ezreal|Rakan": -0.15 };
const ENEMY_BIAS: Record<string, number> = { Draven: -0.15, Blitzcrank: -0.12, Leona: -0.08, Soraka: 0.06 };
const ADC_ITEMS = [6672, 3031, 3094, 3036, 3046, 3072, 3085, 6675, 3033], SUP_ITEMS = [3190, 3109, 6617, 3107, 2065, 3050, 4005];
const BOOTS = [3006, 3009, 3047, 3158], SUPPORT_ITEM = 3869;
const ORDER: Exclude<Position, "">[] = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
const RUNES: Record<string, [number, number, number]> = { BOTTOM: [8008, 8000, 8300], UTILITY: [8439, 8400, 8300], DEFAULT: [8010, 8000, 8400] };
const PERKS: Record<string, number[]> = { BOTTOM: [8008, 9111, 9104, 8017, 8304, 8345], UTILITY: [8439, 8463, 8473, 8242, 8306, 8347], DEFAULT: [8010, 9111, 9105, 8299, 8444, 8451] };
const SHARDS: Record<string, number[]> = { BOTTOM: [5005, 5008, 5011], UTILITY: [5007, 5008, 5011], DEFAULT: [5008, 5008, 5011] };
const tierLadder = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND"], DIVS = ["IV", "III", "II", "I"];

const matches: Match[] = [];
const rankHistory: DataFile["rankHistory"] = [];
let ladder = [3 * 400 + 100 + 40, 3 * 400 + 200 + 10];
let t = Date.now() - 34 * 86400000;
const toRank = (v: number) => ({ tier: tierLadder[Math.floor(v / 400)], div: DIVS[Math.floor((v % 400) / 100)], lp: v % 100, wins: 0, losses: 0 });

for (let g = 0; g < 80; g++) {
  t += g % ri(3, 5) === 0 ? ri(14, 40) * 3600000 : ri(33, 45) * 60000;
  const improving = g / 80; // the duo slowly gets better over time
  const ourTeam: TeamId = rand() < 0.5 ? 100 : 200;
  const adc = pick(OUR_ADC), sup = pick(OUR_SUP);
  const picks = new Set([adc, sup]);
  const champFor = (pos: Exclude<Position, "">) => { let c; do c = pick(POOL[pos]); while (picks.has(c)); picks.add(c); return c; };
  const roster: Record<TeamId, string[]> = { 100: [], 200: [] };
  for (const team of [100, 200] as TeamId[]) for (const pos of ORDER) roster[team].push(team === ourTeam && pos === "BOTTOM" ? adc : team === ourTeam && pos === "UTILITY" ? sup : champFor(pos));
  const enemy = ourTeam === 100 ? 200 : 100;
  const eAdc = roster[enemy][3], eSup = roster[enemy][4];
  const laneSkill = (rand() - 0.5) * 2 + improving * 0.5;
  const gd15 = Math.round(laneSkill * 1100);
  const p = 0.47 + (PAIR_BIAS[`${adc}|${sup}`] ?? 0) + (ENEMY_BIAS[eAdc] ?? 0) + (ENEMY_BIAS[eSup] ?? 0) + gd15 / 5000 + improving * 0.08;
  const win = rand() < p;
  const dur = ri(21 * 60, 38 * 60), min = dur / 60;
  const winner: TeamId = win ? ourTeam : enemy;
  const kills: Record<TeamId, number> = { [winner]: ri(22, 38), [winner === 100 ? 200 : 100]: ri(10, 26) } as Record<TeamId, number>;

  const parts: Participant[] = [];
  for (const team of [100, 200] as TeamId[]) {
    const won = team === winner;
    ORDER.forEach((pos, i) => {
      const isOurs = team === ourTeam && (pos === "BOTTOM" || pos === "UTILITY");
      const k = pos === "UTILITY" ? ri(0, won ? 4 : 2) : ri(won ? 3 : 1, won ? 11 : 6);
      const d = Math.max(0, ri(won ? 1 : 3, won ? 6 : 9) - (isOurs ? Math.round(improving * 2) : 0));
      const a = pos === "UTILITY" ? ri(won ? 12 : 5, won ? 24 : 14) : ri(3, 12);
      const csm = pos === "UTILITY" ? 1 : pos === "JUNGLE" ? 6 : (isOurs ? 6.4 + improving * 1.4 : 6.8) + rand() * 1.2;
      const gold = Math.round(min * (pos === "UTILITY" ? 280 : 420) * (won ? 1.08 : 0.94));
      parts.push({
        name: isOurs ? config.players[pos === "BOTTOM" ? 0 : 1].riotId : `Player${team}${i}#EUW`, team, pos, champ: roster[team][i], lvl: ri(13, 18),
        k, d, a, cs: Math.round(min * csm), gold, dmg: Math.round(min * (pos === "UTILITY" ? 330 : pos === "BOTTOM" ? 860 : 750) * (0.75 + rand() * 0.5)),
        taken: ri(9000, 32000), mitigated: ri(5000, 25000), healShield: pos === "UTILITY" ? ri(1000, 9000) : null,
        vision: Math.round(min * (pos === "UTILITY" ? (isOurs ? 1.6 + improving * 0.8 : 2) + rand() * 0.6 : 0.6 + rand() * 0.3)),
        wards: pos === "UTILITY" ? ri(22, 45) : ri(6, 14), wardsKilled: pos === "UTILITY" ? ri(4, 14) : ri(1, 6), pinks: pos === "UTILITY" ? ri(isOurs ? 1 : 3, 7) : ri(0, 2),
        roleItem: min > 24 && rand() < 0.85 ? (pos === "UTILITY" ? 0 : pick(BOOTS)) : 0,
        items: pos === "UTILITY" ? [SUPPORT_ITEM, pick(BOOTS), ...Array.from({ length: 3 }, () => pick(SUP_ITEMS)), 0, 3364] : [pick(BOOTS), ...Array.from({ length: 4 }, () => pick(ADC_ITEMS)), rand() < 0.5 ? pick(ADC_ITEMS) : 0, 3363],
        spells: pos === "UTILITY" ? [4, pick([14, 3])] : pos === "JUNGLE" ? [4, 11] : pos === "BOTTOM" ? [4, 7] : [4, 12],
        runes: RUNES[pos] ?? RUNES.DEFAULT, perks: PERKS[pos] ?? PERKS.DEFAULT, shards: SHARDS[pos] ?? SHARDS.DEFAULT, timeDead: d * ri(18, 45), firstBlood: false, multi: Math.min(5, ri(1, k > 6 ? 3 : 1)), ccTime: ri(5, 50),
        kp: Math.min(1, Math.round(((k + a) / kills[team]) * 100) / 100), dmgShare: null, takenShare: null,
        cs10: pos === "BOTTOM" ? ri(isOurs ? 50 + Math.round(improving * 15) : 60, 85) : null, maxCsAdv: ri(-10, 30), maxLvlLead: ri(0, 2), visionAdv: null,
        soloKills: ri(0, 2), plates: ri(0, 3), dragonTk: ri(0, 3), pinksPlaced: null, picks: ri(0, 4), immobilize: pos === "UTILITY" ? ri(8, 35) : ri(2, 12),
        saves: ri(0, 2), skillHit: ri(10, 80), skillDodged: ri(10, 60), laneDom: rand() < 0.25 ? 1 : 0,
      });
    });
  }
  parts[ri(0, 9)].firstBlood = true;
  const ourBase = ourTeam === 100 ? 0 : 5, enemyBase = ourTeam === 100 ? 5 : 0;
  const ourAdc = ourBase + 3, ourSup = ourBase + 4, theirAdc = enemyBase + 3, theirSup = enemyBase + 4;

  // ---- timeline
  const frames = Math.floor(min) + 1;
  const goldDiff = Array.from({ length: frames }, (_, i) => Math.round((gd15 * 1.6 * i) / 15 + (win ? 1 : -1) * Math.max(0, i - 18) * 250 + (rand() - 0.5) * 400 * Math.min(1, i / 5)));
  const snap = (at: number): FrameSnap => parts.map((pt, i) => {
    const laneBias = i === ourAdc ? gd15 * 0.6 : i === ourSup ? gd15 * 0.4 : 0;
    const base = pt.pos === "UTILITY" ? 280 : 400;
    const gold = Math.round(500 + base * at + (laneBias * at) / 15 + (rand() - 0.5) * 200);
    return [gold, Math.round(at * 520 + (laneBias * at) / 30), Math.round((pt.cs / min) * at * (i === ourAdc ? 0.95 : 1)), Math.min(18, 1 + Math.floor(at / 1.4))];
  });
  const at = { 5: snap(5), 10: snap(10), 14: snap(14), 15: snap(15), 20: min > 21 ? snap(20) : null };
  const tlKills: [number, number, number, number, number, number[]][] = [];
  const addKill = (sec: number, killer: number, victim: number) => tlKills.push([sec, killer, victim, ri(8000, 13500), ri(800, 5000), [killer === ourAdc ? ourSup : killer === theirAdc ? theirSup : ri(0, 9)].filter((x) => x !== killer && x !== victim)]);
  const earlyOurDeaths = Math.max(0, Math.round(-laneSkill * 1.5 + rand() * 1.5));
  for (let i = 0; i < earlyOurDeaths; i++) addKill(ri(150, 830), pick([theirAdc, theirSup, enemyBase + 1]), pick([ourAdc, ourSup]));
  const earlyTheirDeaths = Math.max(0, Math.round(laneSkill * 1.5 + rand() * 1.5));
  for (let i = 0; i < earlyTheirDeaths; i++) addKill(ri(150, 830), pick([ourAdc, ourSup]), pick([theirAdc, theirSup]));
  for (let i = 0; i < ri(15, 30); i++) addKill(ri(840, dur - 30), ri(0, 9), ri(0, 9));
  tlKills.sort((a, b) => a[0] - b[0]);
  const objectives: [number, string, TeamId][] = [];
  const drakes = ["FIRE", "WATER", "EARTH", "AIR", "HEXTECH", "CHEMTECH"];
  const ourDr = win ? ri(2, 4) : ri(0, 2), theirDr = win ? ri(0, 2) : ri(2, 4);
  const drakeTeams = [...Array(ourDr).fill(ourTeam), ...Array(theirDr).fill(enemy)].sort(() => rand() - 0.5);
  drakeTeams.forEach((tm, i) => objectives.push([300 + i * 330 + ri(0, 60), `DRAGON:${pick(drakes)}`, tm]));
  objectives.push([ri(780, 1000), "TOWER:BOT_LANE:OUTER_TURRET", gd15 + (rand() - 0.5) * 800 > 0 ? ourTeam : enemy]);
  if (min > 22) objectives.push([ri(1250, Math.min(dur - 60, 1700)), "BARON", winner]);
  objectives.sort((a, b) => a[0] - b[0]);
  const build = (p: Participant): [number, number][] => [[0, p.pos === "UTILITY" ? 3865 : 1055], [0, 2003], ...p.items.filter((x) => x && x < 3360).map((it, i): [number, number] => [ri(360 + i * 300, 480 + i * 330), it])];

  const team = (tm: TeamId): Team => ({
    kills: kills[tm], dragons: tm === ourTeam ? ourDr : theirDr, barons: tm === winner && min > 22 ? 1 : 0, heralds: ri(0, 1), grubs: ri(0, 6), towers: tm === winner ? ri(7, 11) : ri(1, 5), inhibs: tm === winner ? ri(1, 3) : 0, atakhan: rand() < 0.3 && tm === winner ? 1 : 0,
    firstDragon: drakeTeams[0] === tm, firstTower: rand() < (tm === winner ? 0.65 : 0.35), firstBlood: parts.findIndex((x) => x.firstBlood) < 5 === (tm === 100), firstBaron: tm === winner && min > 22,
    bans: Array.from({ length: 5 }, () => ri(1, 900)),
  });

  matches.push({
    id: `DEMO_${7000000 + g}`, ts: t, dur, queue: rand() < 0.75 ? 420 : 400, patch: g < 40 ? "25.21" : "25.22", win, team: ourTeam, duo: [ourAdc, ourSup], parts,
    teams: { 100: team(100), 200: team(200) },
    tl: { goldDiff, at, kills: tlKills, objectives, builds: [build(parts[ourAdc]), build(parts[ourSup])], skills: ["QWEQQRQWQWRWWEEREE", "QEWQQRQEQEREEWWRWW"] },
  });
  ladder = ladder.map((v) => Math.max(0, v + (win ? ri(18, 24) : -ri(16, 22))));
  rankHistory.push({ ts: t + dur * 1000 + 60000, solo: ladder.map(toRank), flex: [null, null] });
}

matches.sort((a, b) => b.ts - a.ts);
const data: DataFile = {
  version: DATA_VERSION, demo: true, updated: Date.now(), challengeName: config.challengeName, startDate: new Date(matches.at(-1)!.ts).toISOString().slice(0, 10), goal: { tier: "EMERALD", div: "IV" },
  players: config.players.map((p: { riotId: string; role: "BOTTOM" | "UTILITY" }, i: number) => ({ ...p, profileIcon: [4568, 5367][i], level: [312, 287][i] })),
  matches, skipped: [], rankHistory,
};
await mkdir(join(ROOT, "public", "data"), { recursive: true });
await writeFile(join(ROOT, "public", "data", "demo.json"), JSON.stringify(data));
console.log(`Wrote ${matches.length} demo matches to public/data/demo.json`);
