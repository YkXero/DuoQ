// Pulls duo games from the Riot API into public/data/data.json.
// Usage: RIOT_API_KEY=RGAPI-... npm run fetch
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DATA_VERSION, type DataFile, type RankEntry } from "../shared/types.ts";
import { RiotClient } from "./lib/riot.ts";
import { transform } from "./lib/transform.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = join(ROOT, "public", "data", "data.json");

interface Config {
  challengeName: string; startDate: string; goal?: { tier: string; div: string } | null; region: string; platform: string; queues: number[];
  players: { riotId: string; role: "BOTTOM" | "UTILITY" }[]; fetchTimeline?: boolean; maxNewMatchesPerRun?: number;
}

// --dry --since YYYY-MM-DD --limit N : fetch a few games and validate the transform without saving.
const argv = process.argv.slice(2);
const arg = (n: string) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : undefined; };
const DRY = argv.includes("--dry");

const key = process.env.RIOT_API_KEY;
if (!key) { console.error("Missing RIOT_API_KEY environment variable."); process.exit(1); }
const config: Config = JSON.parse(await readFile(join(ROOT, "config.json"), "utf8"));
const riot = new RiotClient(key, `https://${config.region}.api.riotgames.com`, `https://${config.platform}.api.riotgames.com`);

// ---- load previous data (discard if demo or an older schema)
let data: DataFile = { version: DATA_VERSION, updated: 0, challengeName: config.challengeName, startDate: config.startDate, players: [], matches: [], skipped: [], rankHistory: [] };
if (existsSync(DATA_FILE)) {
  const prev = JSON.parse(await readFile(DATA_FILE, "utf8")) as DataFile;
  if (prev.demo) console.log("Existing data is demo data, starting fresh.");
  else if (prev.version !== DATA_VERSION) { console.log(`Schema v${prev.version} -> v${DATA_VERSION}: refetching matches.`); data.rankHistory = prev.rankHistory ?? []; }
  else data = prev;
}
// Drop matches from before the (possibly changed) start date.
const startMs = new Date((arg("since") ?? config.startDate) + "T00:00:00").getTime();
data.matches = data.matches.filter((m) => m.ts >= startMs);
const before = JSON.stringify([data.matches.length, data.skipped.length, data.rankHistory.at(-1), data.players, data.goal ?? null, data.challengeName]);
const known = new Set([...data.matches.map((m) => m.id), ...data.skipped]);

// ---- resolve players (PUUIDs are per Riot app, so resolve each run)
const players: { puuid: string; riotId: string; role: "BOTTOM" | "UTILITY"; profileIcon?: number; level?: number }[] = [];
for (const p of config.players) {
  const [name, tag] = p.riotId.split("#");
  const acc = await riot.account(name, tag);
  if (!acc) throw new Error(`Riot ID not found: ${p.riotId}`);
  const summ = await riot.summoner(acc.puuid);
  players.push({ puuid: acc.puuid, riotId: `${acc.gameName}#${acc.tagLine}`, role: p.role, profileIcon: summ?.profileIconId, level: summ?.summonerLevel });
  console.log(`Resolved ${acc.gameName}#${acc.tagLine}`);
}

// ---- find unseen match ids (from player 1; duo check happens per match)
const startTime = Math.floor(startMs / 1000);
const ids = new Set<string>();
for (const queue of config.queues) {
  for (let start = 0; ; start += 100) {
    const page = (await riot.matchIds(players[0].puuid, { startTime, queue, start, count: 100 })) ?? [];
    page.filter((id) => !known.has(id)).forEach((id) => ids.add(id));
    if (page.length < 100) break;
  }
}
// Normal runs: oldest first, capped per run. Dry runs: newest first until `limit` duo games are found.
const todo = DRY ? [...ids].sort().reverse() : [...ids].sort().slice(0, config.maxNewMatchesPerRun ?? 150);
const dryLimit = Number(arg("limit") ?? 4); // ids are sequential per region: oldest first
console.log(`${ids.size} unseen matches, processing ${todo.length}`);

let added = 0;
for (const id of todo) {
  if (DRY && added >= dryLimit) break;
  const raw = await riot.match(id);
  if (!raw) { data.skipped.push(id); continue; }
  const quick = transform(raw, null, players.map((p) => p.puuid));
  if (quick.skip) { data.skipped.push(id); console.log(`  skip ${id} (${quick.skip})`); continue; }
  const tl = config.fetchTimeline === false ? null : await riot.timeline(id);
  const { match } = transform(raw, tl, players.map((p) => p.puuid));
  if (DRY) {
    const m = match!;
    const nulls = Object.entries(m.parts[m.duo[0]]).filter(([, v]) => v == null).map(([k]) => k);
    console.log(`  [dry] ${id}: queue ${m.queue}, patch ${m.patch}, ${m.parts.length} parts, positions ${m.parts.map((p) => p.pos || "?").join(",")}`);
    console.log(`        duo idx ${m.duo}, champs ${m.duo.map((i) => m.parts[i].champ)}, runes ${JSON.stringify(m.parts[m.duo[0]].runes)}, null fields: ${nulls.join(", ") || "none"}`);
    console.log(`        timeline: ${m.tl ? `${m.tl.goldDiff.length} frames, @15 ${m.tl.at["15"] ? "ok" : "missing"}, ${m.tl.kills.length} kills, ${m.tl.objectives.length} objectives, builds ${m.tl.builds.map((b) => b.length)}, skills ${m.tl.skills.map((x) => x.length)}` : "none"}`);
    console.log(`        size ${JSON.stringify(m).length} bytes`);
  }
  data.matches.push(match!);
  added++;
  const [a, b] = match!.duo.map((i) => match!.parts[i].champ);
  console.log(`  + ${id} ${match!.win ? "W" : "L"} ${a} / ${b}`);
}

if (DRY) { console.log(`Dry run done: ${added} duo games transformed, nothing saved.`); process.exit(0); }

// ---- rank snapshot
const toEntry = (e?: { tier: string; rank: string; leaguePoints: number; wins: number; losses: number }): RankEntry | null =>
  e ? { tier: e.tier, div: e.rank, lp: e.leaguePoints, wins: e.wins, losses: e.losses } : null;
const solo: (RankEntry | null)[] = [], flex: (RankEntry | null)[] = [];
for (const p of players) {
  const entries = (await riot.leagues(p.puuid)) ?? [];
  solo.push(toEntry(entries.find((e) => e.queueType === "RANKED_SOLO_5x5")));
  flex.push(toEntry(entries.find((e) => e.queueType === "RANKED_FLEX_SR")));
}
const last = data.rankHistory.at(-1);
if (!last || JSON.stringify([last.solo, last.flex]) !== JSON.stringify([solo, flex])) data.rankHistory.push({ ts: Date.now(), solo, flex });

// ---- save only when something changed (avoids a commit every 30 min)
data.matches.sort((x, y) => y.ts - x.ts);
data.players = players.map(({ puuid: _puuid, ...rest }) => rest);
data.challengeName = config.challengeName;
data.startDate = config.startDate;
data.goal = config.goal ?? null;
data.version = DATA_VERSION;
delete data.demo;
const after = JSON.stringify([data.matches.length, data.skipped.length, data.rankHistory.at(-1), data.players, data.goal ?? null, data.challengeName]);
if (after !== before || !existsSync(DATA_FILE)) {
  data.updated = Date.now();
  await mkdir(dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data));
  console.log(`Saved: ${added} new duo games, ${data.matches.length} total.`);
} else console.log("No changes.");
