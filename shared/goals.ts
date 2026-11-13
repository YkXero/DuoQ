// Coaching reviews and objectives. Written by Claude during reviews into public/data/goals.json,
// read by the site (progress is computed live from match data).
export interface Goal {
  id: string;
  title: string; // "Die at most once before 14:00"
  why: string; // reasoning from the review
  metric: string; // metric id from src/lib/metrics.ts
  slot?: 0 | 1; // which player (omit for duo metrics)
  target: number;
  /** perGame: % of games hitting the target counts. average: the rolling average must reach it. */
  mode: "perGame" | "average";
  /** For perGame goals: share of games that must hit the target (e.g. 0.7). */
  hitRate?: number;
  window: number; // games considered (most recent N since createdAt)
  createdAt: string; // YYYY-MM-DD
  status: "active" | "achieved" | "dropped";
  review: string; // review date that created it
}

export interface Review {
  date: string; // YYYY-MM-DD
  games: number; // games analysed
  headline: string;
  best: string[];
  worst: string[];
  notes?: string;
}

export interface GoalsFile { reviews: Review[]; goals: Goal[] }
