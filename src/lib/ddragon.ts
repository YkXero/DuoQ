import { setChampNameResolver } from "./names.ts";

// Data Dragon / CommunityDragon asset helpers. Loaded once at startup.
const DD = "https://ddragon.leagueoflegends.com";

interface Rune { id: number; key: string; name: string; icon: string }
interface RuneStyle extends Rune { slots: { runes: Rune[] }[] }

const state = {
  version: "15.1.1",
  champIds: new Map<string, string>(), // lowercase -> canonical id ("fiddlesticks" -> "Fiddlesticks")
  champNames: new Map<string, string>(), // id -> display name ("MonkeyKing" -> "Wukong")
  items: new Map<number, string>(),
  runes: new Map<number, Rune>(),
};

export async function loadDDragon(): Promise<void> {
  try {
    const versions: string[] = await (await fetch(`${DD}/api/versions.json`)).json();
    state.version = versions[0];
    const base = `${DD}/cdn/${state.version}/data/en_US`;
    const [champs, items, runes] = await Promise.all([
      fetch(`${base}/champion.json`).then((r) => r.json()),
      fetch(`${base}/item.json`).then((r) => r.json()),
      fetch(`${base}/runesReforged.json`).then((r) => r.json()) as Promise<RuneStyle[]>,
    ]);
    for (const c of Object.values(champs.data) as { id: string; name: string }[]) {
      state.champIds.set(c.id.toLowerCase(), c.id);
      state.champNames.set(c.id, c.name);
    }
    for (const [id, it] of Object.entries(items.data) as [string, { name: string }][]) state.items.set(Number(id), it.name);
    setChampNameResolver(champName);
    for (const style of runes) {
      state.runes.set(style.id, style);
      for (const slot of style.slots) for (const r of slot.runes) state.runes.set(r.id, r);
    }
  } catch (e) {
    console.warn("Data Dragon unavailable", e);
  }
}

/** Every champion in the current patch, as { id, name }. */
export const allChampions = () => [...state.champNames].map(([id, name]) => ({ id, name }));

export const champId = (name: string) => state.champIds.get(name.toLowerCase()) ?? name;
export const champName = (name: string) => state.champNames.get(champId(name)) ?? name;
export const itemName = (id: number) => state.items.get(id) ?? "";
export const runeName = (id: number) => state.runes.get(id)?.name ?? "";
/** A rune tree with its slots (keystones first), for drawing a full rune page. */
export const runeTree = (styleId: number): RuneStyle | null => {
  const s = state.runes.get(styleId) as RuneStyle | undefined;
  return s && "slots" in s ? s : null;
};
const SHARD_NAMES: Record<number, string> = {
  5001: "Health scaling", 5002: "Armor", 5003: "Magic resist", 5005: "Attack speed", 5007: "Ability haste", 5008: "Adaptive force",
  5010: "Move speed", 5011: "Health", 5013: "Tenacity and slow resist",
};
export const shardName = (id: number) => SHARD_NAMES[id] ?? `Shard ${id}`;
const SHARD_ICONS: Record<number, string> = {
  5008: "StatModsAdaptiveForceIcon.png", 5005: "StatModsAttackSpeedIcon.png", 5007: "StatModsCDRScalingIcon.png",
  5010: "StatModsMovementSpeedIcon.png", 5001: "StatModsHealthScalingIcon.png", 5011: "StatModsHealthPlusIcon.png",
  5013: "StatModsTenacityIcon.png", 5002: "StatModsArmorIcon.png", 5003: "StatModsMagicResIcon.MagicResist_Fix.png",
};
export const shardIcon = (id: number) => (SHARD_ICONS[id] ? `${DD}/cdn/img/perk-images/StatMods/${SHARD_ICONS[id]}` : "");
/** The three shard rows as the client shows them: offense, flex, defense. */
export const SHARD_ROWS = [[5008, 5005, 5007], [5008, 5010, 5001], [5011, 5013, 5001]];

export const champIcon = (name: string) => `${DD}/cdn/${state.version}/img/champion/${champId(name)}.png`;
export const itemIcon = (id: number) => `${DD}/cdn/${state.version}/img/item/${id}.png`;
export const profileIcon = (id: number) => `${DD}/cdn/${state.version}/img/profileicon/${id}.png`;
export const runeIcon = (id: number) => {
  const r = state.runes.get(id);
  return r ? `${DD}/cdn/img/${r.icon}` : "";
};

const SPELLS: Record<number, string> = {
  1: "SummonerBoost", 3: "SummonerExhaust", 4: "SummonerFlash", 6: "SummonerHaste", 7: "SummonerHeal",
  11: "SummonerSmite", 12: "SummonerTeleport", 13: "SummonerMana", 14: "SummonerDot", 21: "SummonerBarrier", 32: "SummonerSnowball",
};
export const spellIcon = (id: number) => (SPELLS[id] ? `${DD}/cdn/${state.version}/img/spell/${SPELLS[id]}.png` : "");

// Rank emblems and position icons are stored in public/assets (CommunityDragon is slow/flaky).
const ASSETS = `${import.meta.env.BASE_URL}assets`;
export const tierEmblem = (tier: string) => `${ASSETS}/tiers/${tier.toLowerCase()}.png`;
const POS: Record<string, string> = { TOP: "top", JUNGLE: "jungle", MIDDLE: "middle", BOTTOM: "bottom", UTILITY: "utility" };
export const positionIcon = (pos: string) => (POS[pos] ? `${ASSETS}/positions/${POS[pos]}.svg` : "");
