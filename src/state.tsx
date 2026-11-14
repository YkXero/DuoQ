// App-wide state: loaded data, goals, filters, and memoised derived values.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DataFile, Match } from "../shared/types.ts";
import type { GoalsFile } from "../shared/goals.ts";
import { applyFilters, DEFAULT_FILTERS, sessions, type Filters, type SessionInfo } from "./lib/analysis.ts";
import { loadDDragon } from "./lib/ddragon.ts";
import { bracketOf } from "./lib/metrics.ts";
import { shortName } from "./lib/format.ts";

interface AppState {
  data: DataFile;
  goals: GoalsFile;
  filters: Filters;
  setFilters: (f: Filters) => void;
  games: Match[]; // filtered
  names: [string, string];
  bracket: number;
  session: Map<string, SessionInfo>;
}

const Ctx = createContext<AppState | null>(null);
export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
};

type Load = { status: "loading" } | { status: "empty"; reason: string } | { status: "error"; reason: string } | { status: "ready"; data: DataFile; goals: GoalsFile };

const base = import.meta.env.BASE_URL;
/** null = file doesn't exist yet; throws on network or parse errors. */
async function getJson<T>(path: string): Promise<T | null> {
  const r = await fetch(`${base}${path}?t=${Date.now()}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return (await r.json()) as T;
}

export function useLoader(demo: boolean) {
  const [state, setState] = useState<Load>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setState({ status: "loading" });
    (async () => {
      try {
        const [data, goals] = await Promise.all([
          getJson<DataFile>(demo ? "data/demo.json" : "data/data.json"),
          getJson<GoalsFile>("data/goals.json").catch(() => null),
          loadDDragon(),
        ]);
        if (!data || !data.matches?.length) return setState({ status: "empty", reason: "You haven't played a game together since the challenge started." });
        setState({ status: "ready", data, goals: goals ?? { reviews: [], goals: [] } });
      } catch (e) {
        setState({ status: "error", reason: e instanceof Error ? e.message : String(e) });
      }
    })();
  }, [demo, attempt]);
  return { state, retry: () => setAttempt((a) => a + 1) };
}

export function AppProvider({ data, goals, children }: { data: DataFile; goals: GoalsFile; children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const value = useMemo<AppState>(() => {
    const games = applyFilters(data.matches, filters);
    const last = data.rankHistory.at(-1);
    return {
      data, goals, filters, setFilters, games,
      names: [shortName(data.players[0]?.riotId ?? "Player 1"), shortName(data.players[1]?.riotId ?? "Player 2")],
      bracket: bracketOf((last?.solo.find(Boolean) ?? last?.flex.find(Boolean))?.tier),
      session: sessions(data.matches),
    };
  }, [data, goals, filters]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
