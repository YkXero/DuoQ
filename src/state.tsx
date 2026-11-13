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

type Load = { status: "loading" } | { status: "empty"; reason: string } | { status: "ready"; data: DataFile; goals: GoalsFile };

const base = import.meta.env.BASE_URL;
async function getJson<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${base}${path}?t=${Date.now()}`);
    return r.ok ? ((await r.json()) as T) : null;
  } catch { return null; }
}

export function useLoader(demo: boolean) {
  const [state, setState] = useState<Load>({ status: "loading" });
  useEffect(() => {
    setState({ status: "loading" });
    (async () => {
      const [data, goals] = await Promise.all([
        getJson<DataFile>(demo ? "data/demo.json" : "data/data.json"),
        getJson<GoalsFile>("data/goals.json"),
        loadDDragon(),
      ]);
      if (!data) return setState({ status: "empty", reason: "data.json wasn't found." });
      if (!data.matches?.length) return setState({ status: "empty", reason: "No duo games since the challenge start date yet." });
      setState({ status: "ready", data, goals: goals ?? { reviews: [], goals: [] } });
    })();
  }, [demo]);
  return state;
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
