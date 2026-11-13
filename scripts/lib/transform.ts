// Turns raw match-v5 + timeline JSON into our compact Match record.
import type { FrameSnap, Match, Participant, Team, TeamId, TimelineSummary } from "../../shared/types.ts";

/* eslint-disable @typescript-eslint/no-explicit-any */
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);

function participant(p: any): Participant {
  const c = p.challenges ?? {};
  const primary = p.perks?.styles?.find((s: any) => s.description === "primaryStyle");
  const sub = p.perks?.styles?.find((s: any) => s.description === "subStyle");
  return {
    name: p.riotIdGameName ? `${p.riotIdGameName}#${p.riotIdTagline}` : p.summonerName || "Unknown",
    team: p.teamId,
    pos: p.teamPosition || "",
    champ: p.championName,
    lvl: p.champLevel,
    k: p.kills, d: p.deaths, a: p.assists,
    cs: p.totalMinionsKilled + p.neutralMinionsKilled,
    gold: p.goldEarned,
    dmg: p.totalDamageDealtToChampions,
    taken: p.totalDamageTaken,
    mitigated: p.damageSelfMitigated,
    healShield: num(c.effectiveHealAndShielding),
    vision: p.visionScore,
    wards: p.wardsPlaced, wardsKilled: p.wardsKilled, pinks: p.visionWardsBoughtInGame,
    items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
    spells: [p.summoner1Id, p.summoner2Id],
    runes: [primary?.selections?.[0]?.perk ?? 0, primary?.style ?? 0, sub?.style ?? 0],
    timeDead: p.totalTimeSpentDead,
    firstBlood: !!(p.firstBloodKill || p.firstBloodAssist),
    multi: p.largestMultiKill,
    ccTime: p.timeCCingOthers,
    kp: num(c.killParticipation),
    dmgShare: num(c.teamDamagePercentage),
    takenShare: num(c.damageTakenOnTeamPercentage),
    cs10: num(c.laneMinionsFirst10Minutes),
    maxCsAdv: num(c.maxCsAdvantageOnLaneOpponent),
    maxLvlLead: num(c.maxLevelLeadLaneOpponent),
    visionAdv: num(c.visionScoreAdvantageLaneOpponent),
    soloKills: num(c.soloKills),
    plates: num(c.turretPlatesTaken),
    dragonTk: num(c.dragonTakedowns),
    pinksPlaced: num(c.controlWardsPlaced),
    picks: num(c.pickKillWithAlly),
    immobilize: num(c.enemyChampionImmobilizations),
    saves: num(c.saveAllyFromDeath),
    skillHit: num(c.skillshotsHit),
    skillDodged: num(c.skillshotsDodged),
    laneDom: num(c.laningPhaseGoldExpAdvantage),
  };
}

function team(t: any): Team {
  const o = t?.objectives ?? {};
  return {
    kills: o.champion?.kills ?? 0, dragons: o.dragon?.kills ?? 0, barons: o.baron?.kills ?? 0, heralds: o.riftHerald?.kills ?? 0,
    grubs: o.horde?.kills ?? 0, towers: o.tower?.kills ?? 0, inhibs: o.inhibitor?.kills ?? 0, atakhan: o.atakhan?.kills ?? 0,
    firstDragon: !!o.dragon?.first, firstTower: !!o.tower?.first, firstBlood: !!o.champion?.first, firstBaron: !!o.baron?.first,
    bans: (t?.bans ?? []).map((b: any) => b.championId).filter((id: number) => id > 0),
  };
}

function timeline(tl: any, pidToIdx: Map<number, number>, ourTeam: TeamId, duoPids: [number, number]): TimelineSummary | null {
  const frames: any[] = tl?.info?.frames;
  if (!frames?.length) return null;
  const idx = (pid: number) => pidToIdx.get(pid) ?? -1;
  const snap = (min: number): FrameSnap | null => {
    const f = frames[min];
    if (!f || min >= frames.length - 1) return null; // last frame is game end, not a full minute
    const out: FrameSnap = Array.from({ length: 10 }, () => [0, 0, 0, 0]);
    for (const [pid, pf] of Object.entries<any>(f.participantFrames)) {
      const i = idx(Number(pid));
      if (i >= 0) out[i] = [pf.totalGold, pf.xp, pf.minionsKilled + pf.jungleMinionsKilled, pf.level];
    }
    return out;
  };
  const goldDiff = frames.map((f) => {
    let diff = 0;
    for (const [pid, pf] of Object.entries<any>(f.participantFrames)) diff += (Number(pid) <= 5 === (ourTeam === 100) ? 1 : -1) * pf.totalGold;
    return diff;
  });

  const kills: TimelineSummary["kills"] = [];
  const objectives: TimelineSummary["objectives"] = [];
  const builds: TimelineSummary["builds"] = [[], []];
  const skills: [string, string] = ["", ""];
  const KEYS = ["", "Q", "W", "E", "R"];
  for (const e of frames.flatMap((f) => f.events ?? [])) {
    const t = Math.round(e.timestamp / 1000);
    const duoSlot = duoPids.indexOf(e.participantId);
    switch (e.type) {
      case "CHAMPION_KILL":
        kills.push([t, e.killerId > 0 ? idx(e.killerId) : -1, idx(e.victimId), e.position?.x ?? 0, e.position?.y ?? 0, (e.assistingParticipantIds ?? []).map(idx)]);
        break;
      case "ELITE_MONSTER_KILL": {
        const kind = e.monsterType === "DRAGON" ? `DRAGON:${(e.monsterSubType ?? "").replace("_DRAGON", "")}` : e.monsterType === "BARON_NASHOR" ? "BARON" : e.monsterType === "RIFTHERALD" ? "HERALD" : e.monsterType;
        objectives.push([t, kind, e.killerTeamId]);
        break;
      }
      case "BUILDING_KILL":
        // teamId is the team that LOST the building
        objectives.push([t, `${e.buildingType === "TOWER_BUILDING" ? "TOWER" : "INHIB"}:${e.laneType}:${e.towerType ?? ""}`, e.teamId === 100 ? 200 : 100]);
        break;
      case "ITEM_PURCHASED":
        if (duoSlot >= 0) builds[duoSlot].push([t, e.itemId]);
        break;
      case "ITEM_UNDO":
        if (duoSlot >= 0 && e.beforeId) {
          const b = builds[duoSlot];
          for (let i = b.length - 1; i >= 0; i--) if (b[i][1] === e.beforeId) { b.splice(i, 1); break; }
        }
        break;
      case "SKILL_LEVEL_UP":
        if (duoSlot >= 0 && e.levelUpType === "NORMAL") skills[duoSlot] += KEYS[e.skillSlot] ?? "";
        break;
    }
  }
  return { goldDiff, at: { 5: snap(5), 10: snap(10), 14: snap(14), 15: snap(15), 20: snap(20) }, kills, objectives, builds, skills };
}

export interface TransformResult { match?: Match; skip?: string }

export function transform(raw: any, rawTimeline: any | null, puuids: string[]): TransformResult {
  const info = raw.info;
  // Team 100 first so indices 0-4 = blue, 5-9 = red.
  const sorted = [...info.participants].sort((a: any, b: any) => a.teamId - b.teamId || a.participantId - b.participantId);
  const duoIdx = puuids.map((pu) => sorted.findIndex((p: any) => p.puuid === pu));
  if (duoIdx.some((i) => i < 0)) return { skip: "not together" };
  const [a, b] = duoIdx.map((i) => sorted[i]);
  if (a.teamId !== b.teamId) return { skip: "opposite teams" };
  if (info.gameDuration < 300 || a.gameEndedInEarlySurrender) return { skip: "remake" };

  const ourTeam = a.teamId as TeamId;
  const pidToIdx = new Map<number, number>(sorted.map((p: any, i: number) => [p.participantId, i]));
  const teams = Object.fromEntries(info.teams.map((t: any) => [t.teamId, team(t)])) as Record<TeamId, Team>;
  return {
    match: {
      id: raw.metadata.matchId,
      ts: info.gameStartTimestamp ?? info.gameCreation,
      dur: info.gameDuration,
      queue: info.queueId,
      patch: String(info.gameVersion).split(".").slice(0, 2).join("."),
      win: !!a.win,
      team: ourTeam,
      duo: [duoIdx[0], duoIdx[1]],
      parts: sorted.map(participant),
      teams: { 100: teams[100] ?? team(null), 200: teams[200] ?? team(null) },
      tl: rawTimeline ? timeline(rawTimeline, pidToIdx, ourTeam, [a.participantId, b.participantId]) : null,
    },
  };
}
