import type { Format } from "./metrics.ts";

export function formatValue(f: Format, v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "–";
  switch (f) {
    case "dec1": return v.toFixed(1);
    case "dec2": return v.toFixed(2);
    case "int": return Math.round(v).toLocaleString("en-US");
    case "pct": return `${Math.round(v * 100)}%`;
    case "signed": return `${v > 0 ? "+" : ""}${Math.round(v).toLocaleString("en-US")}`;
    case "time": return `${Math.floor(v / 60)}:${String(Math.round(v % 60)).padStart(2, "0")}`;
  }
}
