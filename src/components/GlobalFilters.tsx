import type { Filters } from "../lib/analysis.ts";
import { useApp } from "../state.tsx";
import { Segmented, Select } from "./ui/Controls.tsx";

export function GlobalFilters() {
  const { filters, setFilters } = useApp();
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters({ ...filters, [k]: v });
  const queueOpts = [{ value: "all", label: "All queues" }, { value: "ranked", label: "Ranked" }, { value: "420", label: "Solo/Duo" }, { value: "440", label: "Flex" }, { value: "normal", label: "Normals" }];
  const rangeOpts: { value: Filters["range"]; label: string }[] = [{ value: "all", label: "Season" }, { value: "50", label: "Last 50" }, { value: "20", label: "Last 20" }, { value: "30d", label: "30 days" }, { value: "7d", label: "7 days" }];
  const setQueue = (v: string) => set("queue", v === "all" || v === "ranked" || v === "normal" ? v : Number(v));
  return (
    <div className="filterbar">
      <span className="only-wide"><Segmented value={String(filters.queue)} onChange={setQueue} options={queueOpts} /></span>
      <span className="only-wide"><Segmented value={filters.range} onChange={(v) => set("range", v)} options={rangeOpts} /></span>
      <span className="only-narrow"><Select label="Queue" value={String(filters.queue)} onChange={setQueue} options={queueOpts} /></span>
      <span className="only-narrow"><Select label="Time period" value={filters.range} onChange={(v) => set("range", v)} options={rangeOpts} /></span>
    </div>
  );
}
