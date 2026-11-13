# Duo Q Tracker

An ADC + support duo tracker for League of Legends. It shows op.gg-style match history, stats benchmarked against your rank, duo synergies, trends over time, and coaching objectives.

The site is static and hosted on GitHub Pages. A GitHub Action pulls your games from the Riot API every 30 minutes, commits them to `public/data/data.json`, and redeploys. Your API key stays in a repository secret and never reaches the browser.

## Tabs
- **Overview**: record, win-rate donut, last-20 form, current objectives, what to improve and strengths, LP graph, rolling win rate, top duos.
- **Match history**: one row per game with both players' runes, spells, items, KDA, KP, CS, vision, MVP/ACE score, rosters and lane gold at 15. Filter by result, your ADC, your support, enemy bot laner and patch. Expand a row to see:
  - Scoreboard with damage bars and objectives
  - Bot lane gold/CS at 5, 10, 15 and 20 min, plus early kills and deaths
  - Gold graph
  - Item build and skill order
- **Stats & progress**: about 30 stats per player and about 10 for the duo. Each one is split into wins and losses, compared with a target for your rank bracket, and given a trend (the last 10 games against the 10 before, counted only when the change is bigger than normal noise). Also has a smoothed chart for any stat, and a "When do you win?" breakdown by game length, lane state, objectives, side and session.
- **Champions & synergy**: sortable ADC + support pair table, win rate against each enemy ADC and support, and both champion pools.
- **Coach**: objectives with live progress, plus the history of reviews.

## Setup
1. Edit `config.json`. Set the Riot IDs, region (`europe`) and platform (`euw1`), and `startDate`. Queues: 420 Solo/Duo, 440 Flex, 400 Draft, 480 Swiftplay.
2. Get an API key at <https://developer.riotgames.com>. Development keys expire every 24 hours; for something that keeps running, register a **Personal API Key**.
3. Add it in the repo under **Settings → Secrets and variables → Actions** as `RIOT_API_KEY`.
4. In **Settings → Pages**, set Source to **GitHub Actions**. A free account needs a public repo for Pages.
5. Go to **Actions → Update & deploy → Run workflow**.

To check the fetcher works without saving anything, run the workflow with `dry_since` set to a past date.

## Local
```sh
npm install
npm run dev        # open the printed URL; add ?demo for demo data
npm run demo       # regenerate public/data/demo.json
npm run report     # text coaching report
$env:RIOT_API_KEY="RGAPI-..."; npm run fetch   # PowerShell
```

## Adding a stat
Add an entry to `src/lib/metrics.ts` with its formula, direction, benchmarks and minimum sample size. The stats table, trend chart, goals, insights and report all pick it up automatically. If it needs new raw data, add a field to `shared/types.ts`, fill it in `scripts/lib/transform.ts`, and bump `DATA_VERSION` (the fetcher then refetches everything).

Duo Q Tracker isn't endorsed by Riot Games.
