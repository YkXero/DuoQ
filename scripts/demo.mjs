// Writes fake data to data/data.json so you can preview the site. The real fetch replaces it.
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(await readFile(join(ROOT, "config.json"), "utf8"));

let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const ri = (a, b) => Math.floor(a + rand() * (b - a + 1));
const pickOne = (arr) => arr[Math.floor(rand() * arr.length)];

const ourAdcs = ["Jinx", "Caitlyn", "Ezreal", "Kaisa", "Jhin"];
const ourSups = ["Thresh", "Nautilus", "Lulu", "Rakan", "Milio"];
const enemyAdcs = ["Jinx", "Caitlyn", "Ezreal", "Kaisa", "Jhin", "Ashe", "MissFortune", "Varus", "Xayah", "Lucian", "Draven", "Samira"];
const enemySups = ["Thresh", "Nautilus", "Lulu", "Leona", "Nami", "Karma", "Braum", "Blitzcrank", "Pyke", "Soraka"];
// Some built-in "synergy" so the demo shows something interesting.
const comboBias = { "Jinx|Lulu": 0.15, "Caitlyn|Thresh": 0.1, "Kaisa|Nautilus": 0.12, "Ezreal|Rakan": -0.12, "Jhin|Milio": 0.05 };
const enemyBias = { Draven: -0.15, Blitzcrank: -0.12, Leona: -0.08, Soraka: 0.08 };

const matches = [];
let t = Date.now() - 40 * 86400000;
let lp = [40, 60];
const tiers = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND"];
const divs = ["IV", "III", "II", "I"];
let ladder = [3 * 400 + 100 + 40, 3 * 400 + 200 + 10]; // Gold III / Gold II
const rankHistory = [];
const toRank = (v) => ({ tier: tiers[Math.floor(v / 400)], div: divs[Math.floor((v % 400) / 100)], lp: v % 100 });

for (let i = 0; i < 70; i++) {
  if (i % ri(3, 5) === 0) t += ri(12, 30) * 3600000; else t += ri(30, 45) * 60000;
  const adc = pickOne(ourAdcs), sup = pickOne(ourSups);
  const eAdc = pickOne(enemyAdcs), eSup = pickOne(enemySups);
  const gd15 = Math.round((rand() - 0.45) * 3000);
  let p = 0.5 + (comboBias[`${adc}|${sup}`] || 0) + (enemyBias[eAdc] || 0) + (enemyBias[eSup] || 0) + gd15 / 6000;
  const win = rand() < p;
  const dur = ri(20 * 60, 38 * 60);
  const min = dur / 60;
  const kills = ri(15, 40);
  const stat = (champ, pos, isAdc) => {
    const k = isAdc ? ri(win ? 5 : 1, win ? 14 : 8) : ri(0, win ? 5 : 3);
    const d = ri(win ? 1 : 3, win ? 6 : 10);
    const a = isAdc ? ri(3, 12) : ri(win ? 10 : 4, win ? 25 : 14);
    return {
      champ, pos, k, d, a,
      cs: isAdc ? Math.round(min * (6 + rand() * 2.5)) : ri(15, 50),
      gold: Math.round(min * (isAdc ? 450 : 290)), dmg: Math.round(min * (isAdc ? 900 : 350) * (0.7 + rand() * 0.6)),
      taken: ri(8000, 25000), vision: isAdc ? Math.round(min * 0.6) : Math.round(min * (1.5 + rand() * 1.4)),
      wards: isAdc ? ri(6, 14) : ri(20, 45), wardsKilled: isAdc ? ri(1, 5) : ri(4, 14), pinks: isAdc ? ri(0, 2) : ri(1, 7),
      kp: Math.min(1, Math.round(((k + a) / kills) * 100) / 100),
      cs10: isAdc ? ri(48, 82) : ri(0, 12), maxCsAdv: ri(-10, 30), soloKills: isAdc ? ri(0, 3) : 0,
      skillHit: ri(10, 80), skillDodged: ri(10, 60), firstBlood: rand() < 0.12, timeDead: d * ri(18, 40),
      items: isAdc ? [6672, 3006, 3031, 3094, 3036, 0, 3363] : [3869, 3117, 3190, 3109, 0, 0, 3364],
      spells: isAdc ? [4, 7] : [4, pickOne([14, 3])],
    };
  };
  const duo = [stat(adc, "BOTTOM", true), stat(sup, "UTILITY", false)];
  const dr = win ? ri(2, 4) : ri(0, 2);
  matches.push({
    id: `DEMO_${1000 + i}`, ts: t, dur, queue: 420, patch: "25.22", win, side: rand() < 0.5 ? "blue" : "red", adcIdx: 0, duo,
    enemy: { adc: { champ: eAdc, k: ri(1, 10), d: ri(1, 9), a: ri(2, 10) }, sup: { champ: eSup, k: ri(0, 4), d: ri(1, 9), a: ri(4, 20) } },
    team: { kills: win ? kills : Math.round(kills * 0.7), dragons: dr, barons: win ? ri(0, 2) : 0, heralds: ri(0, 1), grubs: ri(0, 6), towers: win ? ri(6, 11) : ri(1, 5), firstDragon: rand() < (win ? 0.65 : 0.35), firstTower: rand() < (win ? 0.6 : 0.4) },
    enemyTeam: { kills: win ? Math.round(kills * 0.7) : kills, dragons: win ? ri(0, 2) : ri(2, 4), barons: win ? 0 : ri(0, 2), heralds: ri(0, 1), grubs: ri(0, 6), towers: win ? ri(1, 5) : ri(6, 11), firstDragon: false, firstTower: false },
    lane: {
      gd10: Math.round(gd15 * 0.6), xpd10: Math.round(gd15 * 0.4), adcGd10: Math.round(gd15 * 0.4), supGd10: Math.round(gd15 * 0.2),
      gd15, xpd15: Math.round(gd15 * 0.6), adcGd15: Math.round(gd15 * 0.65), supGd15: Math.round(gd15 * 0.35),
      csd10: Math.round(gd15 / 150 + ri(-6, 6)), adcDeaths15: ri(0, gd15 < 0 ? 3 : 1), supDeaths15: ri(0, gd15 < 0 ? 3 : 2),
      botKills15: ri(0, gd15 > 0 ? 4 : 1), botDeaths15: ri(0, gd15 < 0 ? 4 : 1),
    },
  });
  ladder = ladder.map((v) => Math.max(0, v + (win ? ri(18, 24) : -ri(17, 23))));
  rankHistory.push({ ts: t + dur * 1000 + 60000, ranks: ladder.map((v) => ({ ...toRank(v), wins: 0, losses: 0 })) });
}

matches.sort((a, b) => b.ts - a.ts);
const data = {
  demo: true, updated: Date.now(), challengeName: config.challengeName + " (demo data)", startDate: config.startDate,
  players: config.players.map((p) => ({ riotId: p.riotId, role: p.role })), matches, skipped: [], rankHistory,
};
await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(join(ROOT, "data", "data.json"), JSON.stringify(data));
console.log(`Wrote ${matches.length} demo matches to data/data.json`);
