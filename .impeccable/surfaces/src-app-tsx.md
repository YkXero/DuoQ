---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

## Scope
Whole app (Operate mode): the duo profile page and its tabs. Visitors: the two players, on desktop between games.

## Direction contract
THESIS: The duo's own op.gg profile, played straight: the League stats-site standard at full craft (op.gg density, dpm.lol polish, deeplol/mobalytics coaching), refusing themed gimmicks and the generic AI dashboard of uppercase-labelled rounded cards.
OWN-WORLD: op.gg dark palette (page #1c1c1f, panels #31313c, inset #282830, lines #424254, text #fff / #9e9eb1-family, win #5383e8 on #28344e, loss #e84057 on #59343b, KDA tiers teal/blue/orange), Roboto throughout, 4-8px radii, panel headers as bold sentence-case title strips, blue top navigation bar, League art everywhere.
STORY: They see both profiles and ranks, the recent record, what went right and what to fix next game, then scan games row by row and open one to see why it was won or lost.
FIRST VIEWPORT: Blue nav bar; profile band with both player cards joined by "+", rank and LP right-aligned; underline sub-tabs (Overview, Match history, Stats & progress, Champions & synergy, Coach). Overview body: 330px left column (Recent games donut + record + KDA, Road to goal, Most-played duos, What's working) and a right column with queue tabs, a Duo report panel (verdict, area grades, next-game fixes), then op.gg match rows with rosters.
FORM: category standard (canon), chosen by the user on the decision page. seed:49297b08f7a9caac
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
