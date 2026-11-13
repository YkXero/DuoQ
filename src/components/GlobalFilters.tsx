import type { Filters } from "../lib/analysis.ts";
import { useApp } from "../state.tsx";
import { Segmented } from "./ui/Controls.tsx";

export function GlobalFilters() {
  const { filters, setFilters } = useApp();
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters({ ...filters, [k]: v });
  return (
    <div className="filterbar">
      <Segmented value={String(filters.queue)} onChange={(v) => set("queue", v === "all" || v === "ranked" || v === "normal" ? v : Number(v))}
        options={[{ value: "all", label: "All queues" }, { value: "ranked", label: "Ranked" }, { value: "420", label: "Solo/Duo" }, { value: "440", label: "Flex" }, { value: "normal", label: "Normals" }]} />
      <Segmented value={filters.range} onChange={(v) => set("range", v)}
        options={[{ value: "all", label: "Season" }, { value: "50", label: "Last 50" }, { value: "20", label: "Last 20" }, { value: "30d", label: "30 days" }, { value: "7d", label: "7 days" }]} />
    </div>
  );
}
