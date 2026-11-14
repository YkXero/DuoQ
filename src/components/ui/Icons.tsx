// Game asset icons with graceful fallbacks.
import { champIcon, champName, itemIcon, itemName, positionIcon, runeIcon, runeName, spellIcon, tierEmblem } from "../../lib/ddragon.ts";

const hide = (e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.visibility = "hidden"; };

export function Champ({ name, size = 28, level, round }: { name: string; size?: number; level?: number; round?: boolean }) {
  const img = <img className={`ic${round ? " round" : ""}`} src={champIcon(name)} width={size} height={size} alt={champName(name)} title={champName(name)} loading="lazy" onError={hide} />;
  if (level == null) return img;
  return <span className="champ-wrap">{img}<span className="lvl">{level}</span></span>;
}

export function Item({ id, size = 22, empty = "slot-empty" }: { id: number; size?: number; empty?: string }) {
  if (!id) return <span className={`ic ic-empty ${empty}`} style={{ width: size, height: size }} />;
  return <img className="ic" src={itemIcon(id)} width={size} height={size} alt="" title={itemName(id)} loading="lazy" onError={hide} />;
}

/** The role-quest slot (e.g. the bot laner's boots slot). Shown only when the quest was completed. */
export function RoleSlot({ id, size = 22 }: { id?: number; size?: number }) {
  if (!id) return null;
  return (
    <span className="role-slot" title={`Role quest reward: ${itemName(id)}`}>
      <img className="ic" src={itemIcon(id)} width={size} height={size} alt="" loading="lazy" onError={hide} />
    </span>
  );
}

export function Spell({ id, size = 22 }: { id: number; size?: number }) {
  const src = spellIcon(id);
  return src ? <img className="ic" src={src} width={size} height={size} alt="" loading="lazy" onError={hide} /> : <span className="ic ic-empty" style={{ width: size, height: size }} />;
}

export function Rune({ id, size = 22, dim }: { id: number; size?: number; dim?: boolean }) {
  const src = runeIcon(id);
  return src
    ? <img className="ic round" style={{ background: "#000", padding: dim ? 3 : 1, opacity: dim ? 0.85 : 1 }} src={src} width={size} height={size} alt="" title={runeName(id)} loading="lazy" onError={hide} />
    : <span className="ic round ic-empty" style={{ width: size, height: size }} />;
}

export const Emblem = ({ tier, size = 40 }: { tier: string; size?: number }) => (
  <img src={tierEmblem(tier)} width={size} height={size} alt={tier} style={{ objectFit: "contain" }} onError={hide} />
);
export const PosIcon = ({ pos, size = 14 }: { pos: string; size?: number }) => {
  const src = positionIcon(pos);
  return src ? <img src={src} width={size} height={size} alt={pos} onError={hide} /> : null;
};

export function Kda({ k, d, a }: { k: number; d: number; a: number }) {
  const r = (k + a) / Math.max(1, d);
  const cls = d === 0 || r >= 5 ? "kda-5" : r >= 4 ? "kda-4" : r >= 3 ? "kda-3" : "kda-0";
  return <span className={cls}>{d === 0 ? "Perfect KDA" : `${r.toFixed(2)}:1`}</span>;
}

export function WinRate({ wr, n }: { wr: number | null; n?: number }) {
  if (wr == null) return <span className="wr na">–</span>;
  const cls = n != null && n < 3 ? "na" : wr >= 0.55 ? "hi" : wr >= 0.45 ? "ok" : "lo";
  return <span className={`wr ${cls}`}>{Math.round(wr * 100)}%</span>;
}
