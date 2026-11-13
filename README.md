# Duo Q Tracker

A static ADC/support duo tracker, hosted on GitHub Pages. A scheduled GitHub Action pulls your games from the Riot API
and commits them to `data/data.json`. The page reads only that file, so your API key never reaches the browser.

## What it shows
- Record, win rate, streak, duo KDA, current rank and LP change for both players
- **What to work on**: automatic insights (farm, vision, deaths in losses, lane gold at 15, tilt after losses, game length, dragons)
- LP graph and a rolling win rate
- **Duo synergies**: every ADC + support pair you've played, with win rate, duo KDA and lane gold at 15
- Win rate against each enemy ADC and enemy support
- Per-player stats split into wins vs losses, plus each player's champion pool
- "When do you win?" breakdown: game length, lane state, first drake or tower, side, game number in the session
- Match history with items, spells and lane gold at 15

## Setup
1. **Edit `config.json`**: put both Riot IDs (`Name#TAG`), your `region` (`europe`, `americas`, `asia`, `sea`) and `platform`
   (`euw1`, `eun1`, `na1`, `kr`, `br1`, …), and the challenge `startDate`. `queues: [420]` means Ranked Solo/Duo
   (add `440` for Flex or `400` for Normal Draft).
2. **Get an API key** at <https://developer.riotgames.com>.
   - The *development key* expires every 24 hours. That's fine for testing, but the Action will stop working the next day.
   - For a tracker that keeps running, register a **Personal API Key** (Register Product → Personal). It doesn't expire.
3. **Create a GitHub repo** and push this folder.
4. In the repo, go to **Settings → Secrets and variables → Actions → New repository secret**, name it `RIOT_API_KEY` and paste the key.
5. In **Settings → Pages**, choose Source: *Deploy from a branch*, Branch: `main`, folder `/ (root)`.
6. In **Actions → Update matches → Run workflow**, run the first fetch. After that it runs every 30 minutes.

## Local use
```sh
node scripts/demo.mjs                       # fake data to preview the UI
RIOT_API_KEY=RGAPI-... node scripts/fetch.mjs   # real data (PowerShell: $env:RIOT_API_KEY="RGAPI-..."; node scripts/fetch.mjs)
npx serve .                                 # or: python -m http.server
```
The real fetch replaces demo data automatically.

## Notes
- Only games where **both** of you were on the same team are kept. Remakes are skipped.
- Each new game costs 2 requests (match and timeline). The timeline gives the gold and CS diffs at 10 and 15 minutes.
  You can turn it off with `"fetchTimeline": false`.
- Requests are spaced 1.25 s apart to stay under the default rate limit (100 requests per 2 minutes).
