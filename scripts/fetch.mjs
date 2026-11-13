// Pulls duo games from the Riot API and writes data/data.json.
// Usage: RIOT_API_KEY=RGAPI-xxx node scripts/fetch.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = join(ROOT, "data", "data.json");
const KEY = process.env.RIOT_API_KEY;
if (!KEY) {
  console.error("Missing RIOT_API_KEY environment variable.");
  process.exit(1);
}

const config = JSON.parse(await readFile(join(ROOT, "config.json"), "utf8"));
const REGION = `https://${config.region}.api.riotgames.com`;
const PLATFORM = `https://${config.platform}.api.riotgames.com`;

// ---------- HTTP with rate limiting (dev/personal keys: 20 req/s, 100 req/2min) ----------
const MIN_GAP_MS = 1250;
let lastCall = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function riot(url, attempt = 0) {
  const wait = lastCall + MIN_GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
  const res = await fetch(url, { headers: { "X-Riot-Token": KEY } });
  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 5) throw new Error(`${res.status} after retries: ${url}`);
    const retry = Number(res.headers.get("retry-after")) || 2 ** attempt * 2;
    console.warn(`  ${res.status}, retrying in ${retry}s`);
    await sleep(retry * 1000);
    return riot(url, attempt + 1);
  }
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${url}\n${body}${res.status === 401 || res.status === 403 ? "\n(Is your API key expired? Dev keys last 24h.)" : ""}`);
  }
  return res.json();
}

// ---------- Load existing data ----------
let data = { players: [], matches: [], skipped: [], rankHistory: [] };
if (existsSync(DATA_FILE)) {
  const prev = JSON.parse(await readFile(DATA_FILE, "utf8"));
  if (!prev.demo) data = { ...data, ...prev };
  else console.log("Existing data is demo data, starting fresh.");
}
const before = JSON.stringify({ m: data.matches, r: data.rankHistory, s: data.skipped });
const known = new Set([...data.matches.map((m) => m.id), ...data.skipped]);

// ---------- Resolve players (PUUIDs are per-API-key, so resolve every run) ----------
const players = [];
for (const p of config.players) {
  const [gameName, tagLine] = p.riotId.split("#");
  const acc = await riot(`${REGION}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
  if (!acc) throw new Error(`Riot ID not found: ${p.riotId}`);
  players.push({ ...p, puuid: acc.puuid, name: `${acc.gameName}#${acc.tagLine}` });
  console.log(`Resolved ${acc.gameName}#${acc.tagLine}`);
}

// ---------- Find new match ids (from player 1's history; duo filter happens per match) ----------
const startTime = Math.floor(new Date(config.startDate + "T00:00:00Z").getTime() / 1000);
const newIds = [];
for (const queue of config.queues) {
  for (let start = 0; ; start += 100) {
    const ids = await riot(`${REGION}/lol/match/v5/matches/by-puuid/${players[0].puuid}/ids?startTime=${startTime}&queue=${queue}&start=${start}&count=100`);
    if (!ids?.length) break;
    newIds.push(...ids.filter((id) => !known.has(id)));
    if (ids.length < 100) break;
  }
}
// Oldest first, capped so a single run stays short; the next run continues.
const todo = [...new Set(newIds)].reverse().slice(0, config.maxNewMatchesPerRun ?? 150);
console.log(`${newIds.length} unseen matches, processing ${todo.length}`);

// ---------- Build compact match records ----------
const pick = (c, k) => (c && typeof c[k] === "number" ? Math.round(c[k] * 100) / 100 : null);

function playerStats(p) {
  const c = p.challenges || {};
  return {
    champ: p.championName,
    pos: p.teamPosition || p.individualPosition || "",
    k: p.kills, d: p.deaths, a: p.assists,
    cs: p.totalMinionsKilled + p.neutralMinionsKilled,
    gold: p.goldEarned,
    dmg: p.totalDamageDealtToChampions,
    taken: p.totalDamageTaken,
    vision: p.visionScore,
    wards: p.wardsPlaced, wardsKilled: p.wardsKilled, pinks: p.visionWardsBoughtInGame,
    kp: pick(c, "killParticipation"),
    cs10: pick(c, "laneMinionsFirst10Minutes"),
    maxCsAdv: pick(c, "maxCsAdvantageOnLaneOpponent"),
    soloKills: pick(c, "soloKills"),
    skillHit: pick(c, "skillshotsHit"), skillDodged: pick(c, "skillshotsDodged"),
    firstBlood: p.firstBloodKill || p.firstBloodAssist,
    timeDead: p.totalTimeSpentDead,
    items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
    spells: [p.summoner1Id, p.summoner2Id],
  };
}

function laneFromTimeline(tl, ids) {
  // ids: { adc, sup, eAdc, eSup } participantIds (1-10)
  if (!tl?.info?.frames) return null;
  const f = tl.info.frames;
  const at = (min, pid, key) => f[min]?.participantFrames?.[pid]?.[key] ?? null;
  const cs = (min, pid) => (f[min] ? at(min, pid, "minionsKilled") + at(min, pid, "jungleMinionsKilled") : null);
  const diff = (a, b) => (a == null || b == null ? null : a - b);
  const sum = (a, b) => (a == null || b == null ? null : a + b);
  const lane = {};
  for (const min of [10, 15]) {
    lane[`gd${min}`] = diff(sum(at(min, ids.adc, "totalGold"), at(min, ids.sup, "totalGold")), sum(at(min, ids.eAdc, "totalGold"), at(min, ids.eSup, "totalGold")));
    lane[`xpd${min}`] = diff(sum(at(min, ids.adc, "xp"), at(min, ids.sup, "xp")), sum(at(min, ids.eAdc, "xp"), at(min, ids.eSup, "xp")));
    lane[`adcGd${min}`] = diff(at(min, ids.adc, "totalGold"), at(min, ids.eAdc, "totalGold"));
    lane[`supGd${min}`] = diff(at(min, ids.sup, "totalGold"), at(min, ids.eSup, "totalGold"));
  }
  lane.csd10 = diff(cs(10, ids.adc), cs(10, ids.eAdc));
  const kills = f.flatMap((fr) => fr.events || []).filter((e) => e.type === "CHAMPION_KILL" && e.timestamp <= 15 * 60000);
  lane.adcDeaths15 = kills.filter((e) => e.victimId === ids.adc).length;
  lane.supDeaths15 = kills.filter((e) => e.victimId === ids.sup).length;
  lane.botKills15 = kills.filter((e) => [ids.adc, ids.sup].includes(e.killerId) && [ids.eAdc, ids.eSup].includes(e.victimId)).length;
  lane.botDeaths15 = kills.filter((e) => [ids.eAdc, ids.eSup].includes(e.killerId) && [ids.adc, ids.sup].includes(e.victimId)).length;
  return lane;
}

let added = 0;
for (const id of todo) {
  const m = await riot(`${REGION}/lol/match/v5/matches/${id}`);
  if (!m) { data.skipped.push(id); continue; }
  const info = m.info;
  const duo = players.map((pl) => info.participants.find((p) => p.puuid === pl.puuid));
  const remake = info.gameDuration < 300 || duo.some((p) => p?.gameEndedInEarlySurrender && info.gameDuration < 600);
  if (duo.some((p) => !p) || duo[0].teamId !== duo[1].teamId || remake) {
    data.skipped.push(id);
    console.log(`  skip ${id} (${remake ? "remake" : "not together"})`);
    continue;
  }
  const teamId = duo[0].teamId;
  const enemies = info.participants.filter((p) => p.teamId !== teamId);
  const eAdc = enemies.find((p) => p.teamPosition === "BOTTOM");
  const eSup = enemies.find((p) => p.teamPosition === "UTILITY");

  // Who played ADC this game? Prefer in-game position, fall back to configured role.
  let adcIdx = duo.findIndex((p) => p.teamPosition === "BOTTOM");
  if (adcIdx === -1) adcIdx = duo.findIndex((p) => p.teamPosition !== "UTILITY");
  if (adcIdx === -1) adcIdx = config.players.findIndex((p) => p.role === "BOTTOM");
  if (adcIdx === -1) adcIdx = 0;
  const supIdx = 1 - adcIdx;

  let lane = null;
  if (config.fetchTimeline !== false && eAdc && eSup) {
    const tl = await riot(`${REGION}/lol/match/v5/matches/${id}/timeline`);
    lane = laneFromTimeline(tl, { adc: duo[adcIdx].participantId, sup: duo[supIdx].participantId, eAdc: eAdc.participantId, eSup: eSup.participantId });
  }

  const teamObj = (tid) => {
    const t = info.teams.find((x) => x.teamId === tid)?.objectives || {};
    return {
      kills: t.champion?.kills ?? 0, dragons: t.dragon?.kills ?? 0, barons: t.baron?.kills ?? 0,
      heralds: t.riftHerald?.kills ?? 0, grubs: t.horde?.kills ?? 0, towers: t.tower?.kills ?? 0,
      firstDragon: !!t.dragon?.first, firstTower: !!t.tower?.first,
    };
  };
  const enemyBrief = (p) => p && { champ: p.championName, k: p.kills, d: p.deaths, a: p.assists };

  data.matches.push({
    id,
    ts: info.gameStartTimestamp ?? info.gameCreation,
    dur: info.gameDuration,
    queue: info.queueId,
    patch: info.gameVersion.split(".").slice(0, 2).join("."),
    win: duo[0].win,
    side: teamId === 100 ? "blue" : "red",
    adcIdx,
    duo: duo.map(playerStats),
    enemy: { adc: enemyBrief(eAdc), sup: enemyBrief(eSup) },
    team: teamObj(teamId),
    enemyTeam: teamObj(teamId === 100 ? 200 : 100),
    lane,
  });
  added++;
  console.log(`  + ${id} ${duo[0].win ? "W" : "L"} ${duo[adcIdx].championName}/${duo[supIdx].championName}`);
}

// ---------- Rank snapshot ----------
const snap = { ts: Date.now(), ranks: [] };
for (const pl of players) {
  const entries = (await riot(`${PLATFORM}/lol/league/v4/entries/by-puuid/${pl.puuid}`)) || [];
  const solo = entries.find((e) => e.queueType === "RANKED_SOLO_5x5");
  snap.ranks.push(solo ? { tier: solo.tier, div: solo.rank, lp: solo.leaguePoints, wins: solo.wins, losses: solo.losses } : null);
}
const last = data.rankHistory.at(-1);
if (!last || JSON.stringify(last.ranks) !== JSON.stringify(snap.ranks)) data.rankHistory.push(snap);

// ---------- Save ----------
data.matches.sort((a, b) => b.ts - a.ts);
data.players = players.map(({ riotId, role, name }) => ({ riotId: name || riotId, role }));
data.challengeName = config.challengeName;
data.startDate = config.startDate;
delete data.demo;

const after = JSON.stringify({ m: data.matches, r: data.rankHistory, s: data.skipped });
if (after !== before || !existsSync(DATA_FILE)) {
  data.updated = Date.now();
  await mkdir(dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data));
  console.log(`Saved: ${added} new duo games, ${data.matches.length} total.`);
} else {
  console.log("No changes.");
}
