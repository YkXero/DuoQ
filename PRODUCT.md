# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Two friends playing League of Legends together on EUW as a bot lane duo: Imsomnia#KOI (ADC) and Sokai#KOI (support). They open the tracker on the same PC they play on, between games or while waiting in queue, to see how the last games went and what to change in the next one.

## Product Purpose
A duo challenge tracker. It pulls every game the two play together from the Riot API and turns it into a running competition: are we climbing, are we beating our past selves, and what is the one thing to fix next game. Success is the duo improving week over week and reaching their goal rank.

## Positioning
op.gg and similar sites track one player against everyone. This tracks one specific bot lane pair against its own past: their shared record, their champion pairs, their lane matchups, and objectives set from their own numbers, in plain language rather than raw stats.

## Operating Context
- Checked on desktop between games and in queue; sessions are short and glance-first.
- Data refreshes about every 30 minutes through a GitHub Action; the site is static on GitHub Pages.
- Periodic coaching reviews (written by Claude into public/data/goals.json) set objectives that the site tracks game by game.
- Ranked Solo/Duo, Flex and normal games are tracked; challenge started 2026-11-14.

## Capabilities and Constraints
- Per game: all 10 players, items, runes, spells, timeline snapshots (gold/XP/CS at 5/10/14/15/20 min), kills with positions, objectives, duo builds and skill orders.
- Stats are compared against rank benchmarks (mostly coaching estimates, marked as such) and against the duo's own previous games.
- Goal rank is configurable in config.json and not yet chosen by the users.
- League assets come from Riot's Data Dragon / CommunityDragon; the site must carry Riot's fan-project disclaimer.

## Brand Commitments
- Match history keeps the op.gg-style row anatomy (champion, spells, runes, KDA, items) that League players read instantly.
- Official League assets (champion, item, rune, rank art) stay.
- Feel: a competition and scoreboard for the two of them. Plain language over jargon.
- Visual direction (chosen 2026-11-14): the League stats-site standard, played straight and executed at full craft. Quality bar: op.gg, dpm.lol, deeplol / mobalytics. Conventions embraced; no themed gimmicks.

## Evidence on Hand
- Real data: public/data/data.json (fills as they play). Demo data: public/data/demo.json (synthetic, labelled as demo in the UI).
- No real reviews or objectives yet.

## Product Principles
1. Say what happened and what to do, in words, before showing numbers.
2. The duo is the unit: everything is framed as the two of them, together.
3. Compare to your past self as much as to the ladder.
4. Small samples are labelled honestly; never overclaim.
