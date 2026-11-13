# Duo Q Tracker

ADC (Imsomnia#KOI) and support (Sokai#KOI), EUW, playing a duo challenge since 2026-11-14.
Static React site on GitHub Pages; GitHub Actions fetch games from the Riot API every 30 min.

## Layout
- `shared/` – data schema (`types.ts`, bump `DATA_VERSION` on breaking changes) and goals schema (`goals.ts`)
- `scripts/` – Node scripts run with tsx: `fetch.ts` (Riot API → `public/data/data.json`), `demo.ts` (→ `demo.json`), `report.ts` (coaching report)
- `src/lib/` – pure logic, no DOM (shared with scripts):
  - `metrics.ts` – **the metric registry**. Every stat is defined once with formula, benchmarks per rank bracket and direction. Add new stats here.
  - `analysis.ts` – filters, synergies, matchups, stat tables, sessions, game score
  - `insights.ts` – rules that turn stats into advice
  - `goals.ts` – live goal progress
- `src/components/` – UI by tab (overview, history, stats, champions, coach); `ui/` holds shared controls and icons
- `public/data/goals.json` – reviews and objectives written by Claude

## Commands
- `npm run dev` – local site (add `?demo` to the URL for demo data)
- `npm run build` – typecheck and build
- `npm run demo` – regenerate demo data
- `npm run report` – coaching report (`-- --demo`, `-- --queue ranked`, `-- --since YYYY-MM-DD`, `-- --recent-only`)

## Reviews (the user asks "check our games" every few days)
1. `git pull` (the bot commits new data), then `npm run report -- --recent-only` and `npm run report` (whole season) for context.
2. Judge **process stats** (CS@10, deaths before 14, vision, control wards, lane gold diff @15, double deaths), not win rate. Win rate needs 30+ games to mean anything. Respect each metric's `minN`.
3. Compare against the previous review's goals: mark each `achieved` / keep `active` / `dropped` in `public/data/goals.json`.
4. Append a `Review` entry (date, games, headline, best[], worst[], notes) and 2–4 new or updated `Goal`s. Each goal needs a real metric id from `metrics.ts`, a `slot` (0 = ADC player, 1 = support player) for player metrics, a target that's reachable within 10–15 games, and a `why` that cites the numbers.
5. Commit and push (this redeploys the site), then summarise for the user: the best thing, the worst thing, and the new objectives.
