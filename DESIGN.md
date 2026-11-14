---
name: Duo Q Tracker
description: A bot lane duo's own op.gg profile, played straight at full stats-site craft.
colors:
  brand-nav: "#4171d6"
  win: "#5383e8"
  win-text: "#81acff"
  win-bg: "#28344e"
  win-bg-2: "#2f436e"
  loss: "#e84057"
  loss-text: "#ff8a9a"
  loss-bg: "#59343b"
  loss-bg-2: "#703c47"
  accent-text: "#7aa2ff"
  bad-text: "#ff5f74"
  good: "#00bba3"
  good-text: "#5fe0cc"
  great: "#0093ff"
  elite: "#ff8200"
  multi: "#c62c44"
  gold: "#e0b84e"
  grade-a-text: "#4be0c8"
  grade-b-text: "#6cbcff"
  grade-d-text: "#ffa24d"
  player-0: "#9085e9"
  player-0-text: "#b9b2ff"
  player-1: "#c98500"
  player-1-text: "#f2b544"
  tier-iron: "#a7a097"
  tier-bronze: "#c0aa9b"
  tier-silver: "#b7bbcb"
  tier-gold: "#dbc798"
  tier-platinum: "#97cbc4"
  tier-emerald: "#7fd6a7"
  tier-diamond: "#a7cdf2"
  tier-master: "#d3b3ea"
  tier-grandmaster: "#ebb4c4"
  tier-challenger: "#fdc06b"
  banner-bg: "#2a2312"
  banner-border: "#5a4a22"
  banner-text: "#f0d999"
  page: "#1c1c1f"
  panel: "#31313c"
  panel-inset: "#282830"
  panel-raised: "#424254"
  border: "#424254"
  border-strong: "#515163"
  line: "#26262d"
  detail-well: "#1b1b21"
  tooltip-bg: "#111116"
  level-badge: "#111111"
  icon-backing: "#000000"
  text: "#ffffff"
  text-2: "#b7b7c9"
  muted: "#a7a7ba"
  faint: "#9e9eb1"
  neutral-mark: "#8a899c"
  chart-grid: "#2c2c35"
  chart-zero: "#6d6d80"
typography:
  stat:
    fontFamily: "Geist, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.45
    fontFeature: "tnum"
  page:
    fontFamily: "Geist, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.3
  data:
    fontFamily: "Geist, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "0.01em"
    fontFeature: "tnum"
  body:
    fontFamily: "Geist, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
  label:
    fontFamily: "Geist, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.01em"
    fontFeature: "tnum"
  micro:
    fontFamily: "Geist, Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.02em"
    fontFeature: "tnum"
rounded:
  hairline: "1px"
  ink: "2px"
  bar: "3px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  avatar: "16px"
  pill: "99px"
spacing:
  s-1: "4px"
  s-2: "8px"
  s-3: "12px"
  s-4: "16px"
  s-5: "20px"
  s-6: "24px"
  s-8: "32px"
components:
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "16px"
  panel-title:
    textColor: "{colors.text}"
    typography: "{typography.title}"
    padding: "12px 16px"
  nav-bar:
    backgroundColor: "{colors.brand-nav}"
    textColor: "{colors.text}"
    height: "52px"
  tab:
    textColor: "{colors.muted}"
    padding: "12px 16px"
  tab-active:
    textColor: "{colors.text}"
  segmented:
    backgroundColor: "{colors.panel-inset}"
    rounded: "{rounded.md}"
    padding: "3px"
  segmented-thumb:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "5px 11px"
  inset-cell:
    backgroundColor: "{colors.panel-inset}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
  stat-tile:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  build-col:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  chip-button:
    backgroundColor: "{colors.panel-inset}"
    textColor: "{colors.text-2}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  button:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "8px 14px"
  button-primary:
    backgroundColor: "{colors.win}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "8px 14px"
  select:
    backgroundColor: "{colors.panel-inset}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "6px 28px 6px 10px"
  banner:
    backgroundColor: "{colors.banner-bg}"
    textColor: "{colors.banner-text}"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
  match-row-win:
    backgroundColor: "{colors.win-bg}"
    textColor: "{colors.win-text}"
    rounded: "{rounded.lg}"
  match-row-loss:
    backgroundColor: "{colors.loss-bg}"
    textColor: "{colors.loss-text}"
    rounded: "{rounded.lg}"
  role-chip:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.sm}"
    padding: "1px 6px"
  tag-pill-multi:
    backgroundColor: "{colors.multi}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "0 7px"
  goal-state:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.sm}"
    padding: "1px 7px"
  goal-state-met:
    textColor: "{colors.good-text}"
    rounded: "{rounded.sm}"
    padding: "1px 7px"
  grade-badge:
    rounded: "{rounded.md}"
    size: "44px"
  level-badge:
    backgroundColor: "{colors.level-badge}"
    textColor: "{colors.text}"
    typography: "{typography.micro}"
    rounded: "{rounded.sm}"
    size: "16px"
  scoreboard-team:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.md}"
  scoreboard-head:
    textColor: "{colors.text}"
    padding: "12px 16px"
  scoreboard-th:
    backgroundColor: "{colors.panel-inset}"
    textColor: "{colors.text-2}"
    typography: "{typography.label}"
    padding: "8px 12px"
  scoreboard-cell:
    padding: "6px 12px"
  bullet-track:
    backgroundColor: "{colors.panel-inset}"
    rounded: "{rounded.bar}"
    height: "10px"
  bar-track:
    backgroundColor: "{colors.panel-raised}"
    rounded: "{rounded.bar}"
    height: "6px"
  skill-cell:
    backgroundColor: "{colors.panel-inset}"
    textColor: "{colors.faint}"
    typography: "{typography.micro}"
    rounded: "{rounded.bar}"
    size: "22px"
  skill-cell-on:
    backgroundColor: "{colors.win}"
    textColor: "{colors.text}"
    rounded: "{rounded.bar}"
    size: "22px"
  chart-tooltip:
    backgroundColor: "{colors.tooltip-bg}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
---

# Design System: Duo Q Tracker

## Overview

**Creative North Star: "The Duo's Own op.gg"**

The system is the League stats-site standard played straight: op.gg's dark slate palette and match-row anatomy, dpm.lol's polish, and deeplol/mobalytics-style coaching panels, executed carefully rather than reinvented. League players should read every surface instantly because it looks like the sites they already use. The difference is the subject: two players, framed together, compared against their own past.

Density is high and glance-first, set on a 4px spacing grid. Flat slate panels sit 16px apart on a near-black page, each opened by a bold sentence-case title strip; inside a panel, list items and tiles step at 8px. Colour is a result channel before it is decoration: blue means won, red means lost, teal/blue/orange grade a KDA, and two fixed player hues tell the duo apart in charts and progress. Charts speak the same language: series are labelled directly at their ends, wins sit above a zero line in blue and losses below it in red, and rank is drawn over the League tier bands. Official League art (champions, items, runes, rank emblems) carries the imagery; there is no invented illustration.

Rejected: themed gimmicks (no "gamer" neon, no fantasy chrome) and the generic AI dashboard of uppercase-labelled rounded cards.

**Key Characteristics:**
- Dark slate tonal layering, no shadows on panels.
- Saturated brand-blue top navigation bar; everything below is neutral slate until a result colours it.
- Panels opened by 15px bold sentence-case title strips divided by a 1px line.
- Win/loss tinted match rows with a 6px result strip on the left edge.
- Geist everywhere at a 13px base, seven named type roles, tabular figures on every number.
- A 4px spacing grid: 16px between panels and sections, 8px within lists and tiles.
- Charts labelled at the line end, never by a legend box; recessive grids, no axis lines.
- Spring motion that never hides content: entrances move, they do not fade in from nothing.

## Colors

An op.gg dark palette: cool blue-grey slates, a blue/red result pair with tinted backgrounds, a small set of performance tiers, and the League rank-tier hues.

### Primary
- **Victory Blue** (win): the win colour. Fills the left strip of won match rows, the winning arc of the record donut, win segments in bars, filled squares in the form strip, levelled cells in the skill grid, the area above zero in Net wins and gold graphs, the active tab ink, and the primary button. At 7% it tints the winning team's scoreboard rows, at 17% the duo's rows on that team.
- **Victory Blue Text** (win-text) on **Victory Slate** (win-bg / win-bg-2): queue name on won rows, the won-row body and expand column, "Victory" in scoreboard headers, "W" result chips, a positive Net wins number.
- **Nav Blue** (brand-nav): the sticky top navigation bar and the champion picker's count badge. White text on it clears 4.6:1.
- **Link Blue** (accent-text): text links, "Try this" lead-ins, profile links on player cards, the picker's clear action, focus ring.

### Secondary
- **Defeat Red** (loss): loss strip, losing arc of the donut, hollow loss squares, the area below zero in charts, bad bullet fills. At 7% and 17% it tints the losing team's scoreboard rows and the duo's rows on that team.
- **Defeat Red Text** (loss-text) on **Defeat Wine** (loss-bg / loss-bg-2): queue name on lost rows, deaths in KDA, F grades, fix-rank numbers, "Defeat" in scoreboard headers, "L" result chips, a negative Net wins number.
- **Warning Red Text** (bad-text): "Getting worse" trend words on panels.

### Tertiary
- **Performance tiers**: Good Teal (good) for strong win rates, KDA 3+, met targets and good bullet fills; Light Teal (good-text) for good lane headlines, good bullet values and the met goal-state chip; Great Blue (great) for KDA 4+; Elite Orange (elite) for KDA 5+ and the levelled R row of the skill grid.
- **Multikill Red** (multi): the multikill pill on match rows, with white text.
- **Grade text**: each grade badge sets its letter in a light tint over an 18-22% fill of its tier: A in grade-a-text over teal, B in grade-b-text over Great Blue, D in grade-d-text over Elite Orange. C uses Raised Slate with white, F uses Defeat Red Text.
- **Gold** (gold): the chosen-rune ring, the role-quest item ring, and the shared "Bot lane" series in progress charts.
- **Player hues**: Lavender (player-0, text variant player-0-text) for the ADC and Ochre (player-1, text variant player-1-text) for the support. Used on goal progress fills, rank lines and progress-chart series.
- **Rank tier hues** (tier-iron through tier-challenger): the rank name beside the emblem on player cards, and the tier bands of the rank chart (7% fill, 35% boundary line).

### Neutral
- **Page Black** (page): page background and the avatar level pill.
- **Slate Panel** (panel): every panel, player card, stat tile, build column, scoreboard team block and the champion picker popover.
- **Inset Slate** (panel-inset): cells inside panels (grade cells, swing cards, goals, focus box, segmented track, select, chip buttons, picker button, bullet tracks, empty skill cells), scoreboard header cells, and the profile band.
- **Raised Slate** (panel-raised): segmented thumb, 6px bar tracks, role chips, goal-state chips, rune shard chips, image placeholders, hovered player cards and picker items. Shares its value with border.
- **Divider Line** (line): title-strip, scoreboard-header and row dividers inside panels.
- **Border** / **Strong Border** (border, border-strong): table rules, tab baseline, control outlines; strong on hover, chart hover cursors and the tooltip outline.
- **Detail Well** (detail-well): the expanded game detail under a match row.
- **Tooltip Black** (tooltip-bg): the chart tooltip ground.
- **Level Badge Black** (level-badge): the level badge on champion portraits.
- **Icon Backing** (icon-backing): the black disc behind rune shard icons, which ship with transparent corners.
- **Text ramp**: white (text) for values, titles and chart end labels; text-2 for secondary copy and table headers; muted for hints, inactive tabs, chart ticks and target lines; faint for footer and empty skill cells.
- **Neutral Mark** (neutral-mark): the select caret, neutral bullet fills and the damage-taken bars in the scoreboard, where a bar must stay out of the result colours.
- **Chart neutrals** (chart-grid, chart-zero): horizontal gridlines and the zero reference line in charts and signed bullet bars. Axis lines and tick marks are off; ticks use muted.
- **Demo banner** (banner-bg, banner-border, banner-text): the dark-amber notice shown while sample data is active. Its only use.

### Named Rules
**The Result Colour Rule.** Blue and red mean won and lost, nothing else. Never use win or loss hues for brand, navigation or decoration (the nav bar uses its own Nav Blue). In charts, blue is above zero and red below.

**The Two Players Rule.** Lavender is always the ADC and ochre is always the support, on every surface. A third person colour is never introduced; "both of you" uses neutral text-2, or Gold where a chart needs a shared series.

**The Hollow Loss Rule.** Win/loss marks must read without colour: wins are filled, losses are hollow outlines.

## Typography

**Display Font:** Geist (with Roboto, system-ui, -apple-system, Segoe UI)
**Body Font:** Geist
**Label/Mono Font:** Geist, with tabular figures set on html and body so every number aligns

**Character:** One clean geometric grotesque at weights 400/500/700, loaded from Google Fonts. Hierarchy comes from seven named size roles and weight, the way stats sites pack information, not from a second face.

### Hierarchy
- **Stat** (700, 24px, tabular): big numbers: stat tile values, the recent KDA ratio, the Net wins headline number, goal values.
- **Page** (700, 20px, -0.01em): player names in the profile band and the brand wordmark.
- **Title** (700, 15px, line-height 1.3): panel title strips, section sub-titles, category titles, the scoreboard result word. Sentence case. A 12px muted hint can follow on the same baseline. Verdict copy uses this size at 400 (line-height 1.5).
- **Data** (700, 14px, +0.01em): emphasised data: scoreboard K/D/A lines, lane headlines, bullet values (at 400). Match-row KDA and rank tier names sit one step up at 15px 700.
- **Body** (400, 13px, line-height 1.45; 1.3 in tables): base text, table data, story lines, links.
- **Label** (500, 12px, +0.01em): table headers in text-2, segmented options, select, chip buttons, title hints and tile labels (400), trend words, legends, build labels, objective strips, result chips (700), chart tooltips.
- **Micro** (500, 11px, +0.02em): meta: ratios, per-minute lines, chips and pills (700), roster names, level badges, chart ticks and end labels (700), footnotes, skill-grid cells.

### Named Rules
**The Sentence Case Rule.** Titles and labels are sentence case at normal tracking. No uppercase letter-spaced labels above content.

**The Tabular Rule.** Any numeric column or stat uses tabular figures and right alignment in tables.

## Layout

A centred 1180px container with 16px side gutters. Spacing follows a 4px base (4, 8, 12, 16, 20, 24, 32). Below a 52px sticky nav bar sits the profile band (Inset Slate, 20px top padding): two player cards in a `1fr 32px 1fr` grid joined by a "+", then underline tabs flush to the band's bottom. Player cards are links to each player's profile. The page body starts 12px below with a filter panel (queue segmented control, period segmented control, game count right-aligned) 8px above the content.

The Overview is a 332px aside plus a fluid main column at 16px gap. The player profile opens with a row of six stat tiles (8px gap), then the same aside-plus-main layout with champion and recent-games tables. Panels and sections stack 16px apart and carry 16px padding; the title strip bleeds to the panel edges at 12px 16px with 16px below it. Within a panel, list rows, tiles and match rows step at 8px; inset cells (grade cells, swings) sit 6px apart. Lists inside panels separate rows with 1px Divider Lines and remove the last rule. Expanded match details pad 16px, stack the two scoreboard teams 16px apart, and place the two players' builds in a two-column grid at 16px gap.

Responsive behaviour: at 1000px the aside collapses into the flow (`display: contents`) and reorders as summary first, then the main column (duo report and fixes), then the remaining aside panels; stat tiles drop to three columns. At 900px the player cards stack, the "+" hides, two- and three-column grids and build columns go single-column. At 760px the fix rows drop their visual column under the text and profile tabs wrap. At 700px tabs gain a right fade mask and 12px padding, meter rows stack, and the summary grid goes single-column. At 560px stat tiles drop to two columns. The scoreboard table keeps a fixed 860px minimum and scrolls horizontally inside its team block. Match rows respond to their container, not the viewport: at 1060px they drop side stats and roster names (duo icons get a 1px text-2 ring), at 640px they keep only meta, the first player and the expand column.

### Named Rules
**The Sixteen-Eight Rule.** 16px separates panels and sections; 8px separates items within a list or tile row. Every gap is a step of the 4px scale.

## Elevation & Depth

Flat. Panels carry no shadow; depth is tonal layering from Page Black to Slate Panel to Inset Slate cells to Raised Slate tracks and thumbs. Hover states lift by tint (rgba white 0.025 on rows, Inset Slate on meter rows, Raised Slate on player cards, picker items and the more-games link), not by shadow.

### Shadow Vocabulary
- **Chart tooltip** (`box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4)`): on Tooltip Black with a strong border.
- **Picker popover** (`box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5)`): the champion picker, a Slate Panel popover at 8px radius.
- **Icon separator ring** (`box-shadow: 0 0 0 2px var(--panel)`): overlapping champion icons in duo stacks; a cut-out, not elevation.
- **Chosen-rune ring** (`box-shadow: 0 0 0 2px var(--gold)`): marks the runes a player took on the rune page; untaken runes sit at 28% opacity in greyscale. A 1px Gold ring marks the role-quest item.

### Named Rules
**The Flat Panel Rule.** Panels never take a drop shadow. Only floating overlays (tooltips, the picker popover) may.

## Shapes

Small, consistent corners: 4px for chips, item icons, segmented thumb, champion level badges, rune shard chips and inline code; 6px for panels, tiles, build columns, scoreboard team blocks, grade cells, champion icons, the tooltip and the segmented track; 8px for match rows, buttons, selects and the banner. Pills (99px) for tag pills, chip buttons and the avatar level. Avatars are 72px squares at 16px radius with a level pill overlapping the bottom edge. Runes and spell-round icons are circles. Bars and tracks take 3px ends (6px tall bars, 10px bullet tracks); skill-grid cells and form squares also use 3px. Thin marks take the smallest corners: 2px for the tab ink, legend swatches and goal-strip marks, 1px for target ticks. Match rows and scoreboard team blocks clip their content (`overflow: hidden`) so strips and tints follow the corner.

## Components

### Navigation
- **Top bar:** sticky, Nav Blue, 52px, wordmark in the Page role plus a 14px 500 section link.
- **Tabs:** underline tabs, 13px 700, muted inactive, text-2 on hover, white when active. The active ink is a 2px Victory Blue bar inset 10px from each side, sliding between tabs with the smooth spring (shared layout id). A 1px border baseline sits under the row except inside the profile band.
- **Profile link:** inside each player card, a 12px "Profile" in Link Blue at 85% opacity with a drawn chevron; full opacity and underlined while the card is hovered.

### Segmented control
- **Style:** Inset Slate track, 3px padding, 2px gap, 6px radius. Options are 12px 500 muted text; the active option is white over a Raised Slate thumb (4px radius) that slides with the snappy spring. Exposed as a radiogroup.

### Chips
- **Role chip / small-sample chip:** Raised Slate, 4px radius, 11px text-2.
- **Multikill pill:** 11px 700 pill, 17px line, Multikill Red with white text.
- **Goal state:** 11px 700 at 4px radius: "Not yet" on Raised Slate in text-2, "On track" on a 20% teal tint in Light Teal.
- **Chip button:** Inset Slate pill with a 1px border, strong border and white text on hover.
- **Result chip:** 12px 700 "W"/"L" in win or loss text, no fill, in recent-games tables.

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** Slate Panel; nested cells in Inset Slate.
- **Shadow Strategy:** none (see Elevation).
- **Border:** none on panels; the title strip has a 1px Divider Line under it.
- **Internal Padding:** 16px; the title strip bleeds to the panel edges with 12px 16px padding and 16px below.

### Stat tile
A Slate Panel tile at 6px radius, 12px 16px padding: a 12px text-2 label, a 24px 700 tabular value, and an optional 12px muted sub-line that truncates. Six across on the player profile, 8px apart.

### Buttons and inputs
- **Button:** Raised Slate, 1px strong border, 8px radius, 8px 14px, 700 weight; primary is Victory Blue.
- **Link button:** Link Blue text, underline on hover ("Show 5 more").
- **Select:** native select with Inset Slate fill, 1px border, 8px radius, a drawn caret in Neutral Mark; strong border on hover.
- **Champion picker:** a 34px Inset Slate button (Raised Slate when hover or set) opening a Slate Panel popover with a search field and a grid of 40px champion icons; a Nav Blue count badge marks games played.
- **Focus:** a 2px Link Blue outline with 2px offset on every focusable element.

### Banner
The demo-data notice: dark amber ground, 1px amber border, pale amber text, 8px radius, 10px 14px padding, with an inline button. One per page, at the top of the profile band.

### Match row (signature)
The op.gg anatomy, kept as a brand commitment. A row is a tinted block (Victory Slate or Defeat Wine) with a 6px left result strip in Victory Blue or Defeat Red and 8px corners. The strip is a documented exception (recorded in `.impeccable/config.json`) scoped to match rows; it is not a general side-accent device for other panels. The grid runs: meta (queue name in result text colour, age, result word above a hairline, duration) / player one block / player two block / rosters (two columns of ten champions, duo names emphasised) / a 36px expand column in the darker result tint with a chevron. Each player block is a 46px champion portrait with level badge, spells and runes, KDA at 15px 700 with deaths in loss text, ratio coloured by KDA tier, name and multikill pill, then an item strip whose empty slots use the darker result tint. A one-line story sentence follows, led by a 7px teal, red or neutral dot. Rows sit 8px apart; expanding opens a Detail Well with Scoreboard, Builds, Bot lane and Gold graph tabs.

### Scoreboard (match detail)
One Slate Panel block per team, the player's team first, 16px apart.
- **Team header bar:** 12px 16px with a Divider Line under it. Left: the result word ("Victory"/"Defeat", 15px 700 in win or loss text), the side ("Blue side · your team") in text-2, and the team's total K/D/A in white 700. Right: the objective strip (grubs, herald, dragons, baron, towers, inhibitors, Atakhan when taken) in 12px 500 muted with white counts, 12px apart.
- **Fixed column grid:** a fixed-layout table, minimum 860px: player 250px, KDA 120px centred, damage 170px, wards 96px and CS 76px right-aligned, items fluid. Header cells sit on Inset Slate at 8px 12px in the Label role; body cells at 6px 12px.
- **Player cell:** a 36px champion portrait with its level badge, two stacked 17px spells, two stacked 17px runes (secondary tree dimmed), then the name in text-2, truncating.
- **KDA:** centred; the K/D/A line in the Data role with deaths in loss text, under it an 11px 500 muted line of KDA ratio (coloured by tier) and kill participation.
- **Damage grid:** a two-column grid (40px right-aligned number, bar) pairing damage dealt and damage taken, 12px text; taken value muted and its 6px bar in Neutral Mark.
- **Items:** six 24px items, the trinket set apart by 4px, then the role-quest slot ringed in Gold.
- **Team tint:** every row carries a 7% tint of its team's result colour; the duo's rows deepen to 17% within that same colour and set their name in white 700.

### Build column (match detail)
One Slate Panel column per player (6px radius, 12px 14px padding) headed by a 32px portrait, name and champion. 12px 500 text-2 sub-labels introduce three blocks: the item build as timed steps (28px items, minute under each), the skill grid (fluid cells 20px tall at 3px radius, 2px gap, Inset Slate with faint text; levelled cells Victory Blue with white 700, R row Elite Orange), and the rune page (primary and secondary trees, 34px keystones and 26px runes, chosen runes ringed in Gold, others greyed at 28%, shard row under a Divider Line).

### Charts
Recharts, styled as one family:
- **Frame:** horizontal gridlines only in Chart Grid; no axis lines or tick marks; ticks 11px muted. Hover cursor is a Strong Border line. Tooltip is the Chart tooltip: Tooltip Black, 1px strong border, 6px radius, 8px 10px padding, 12px text, a muted header line, values coloured by result or player.
- **Labels:** each line is labelled at its last point with the player or series name and current value (11px 700), with no legend box. A legend row (10x3px swatches, 12px text-2) is used only where end labels cannot fit.
- **Net wins:** a 24px hero number (win or loss text) with a muted caption "after N games · peak +N" on the same baseline, over a step area of wins minus losses. The fill and line split at zero: Victory Blue above (45% fading to 5%), Defeat Red below, with a Chart Zero reference line.
- **Gold graph:** the same zero-split area on a smooth curve, with dragon and baron moments as dashed 50% lines in the taking team's result colour, labelled.
- **Rank chart:** the duo's ladder position as 2px player-hue lines over the League tier bands, each band a 7% fill of its tier hue with a 35% boundary line and a tier label; each line ends in a 4px dot ringed in panel colour and a white "name · rank LP" label.
- **Progress chart:** per-game values as dots at 28% opacity of the series colour, a smoothed 2.5px average line on top, and the rank target as a dashed muted line labelled at the right.

### Grade badge
A square at 6px radius (44px default, 36px in the duo report, 30px beside stat categories), letter at half the size, 700. A teal, B blue, C Raised Slate, D orange, F red, each an 18-22% tint with its light grade-text colour. Sits left of a grade cell (Inset Slate, name 13px 700, one-line explanation).

### Bullet bar (you vs target)
A 10px Inset Slate track at 3px radius. A fill grows from the left (or from a 1px Chart Zero line at the centre for signed stats) to the player's value with the gentle spring, coloured by tone: Good Teal good, Defeat Red bad, Neutral Mark neutral. A 2px white tick marks the rank target. Beside it, the value in 14px tabular (Light Teal good, loss text bad) and "/ target" in 12px muted.

### Progress and record marks
- **Record donut:** 88px, 11px stroke, loss ring under a win arc that springs in; percentage at size/5.
- **Form strip:** 12px squares, wins filled blue, losses hollow red outlines.
- **Goal bars:** 6px tracks filled with the player hue.
- **Goal strip:** 18x8px marks at 2px radius, Good Teal met, Defeat Red missed, Raised Slate pending.
- **Trend words:** 12px 500 with a 6px dot in currentColor: teal "Getting better", red "Getting worse", muted "Steady".

### Fix list
Numbered rows: a 22px circle in Defeat Wine with loss-text numeral, a title with trend word, a text-2 explanation, a "Try this:" lead in Link Blue, and a 240px visual column (bullet bar or champion icons) that drops under the text below 760px.

### Motion
Spring presets only: smooth (stiffness 380, damping 34, mass 0.9) for tab ink and layout; snappy (600, 32) for the segmented thumb and toggles; gentle (180, 24) for entrances, bar and bullet fills, ring and donut sweeps. Panels enter with a 14px upward slide (12px for fadeUp) and no opacity change, staggered 35ms per item capped at 400ms. Charts draw without animation. Reduced motion removes all animation and transitions.

## Do's and Don'ts

### Do:
- **Do** open every panel with a 15px 700 sentence-case title strip and a 1px Divider Line, with an optional muted hint on the same baseline.
- **Do** keep 16px between panels and sections, 8px between items within lists and tiles, and 16px inside panels.
- **Do** set type with the seven roles (11, 12, 13, 14, 15, 20, 24px) and keep numbers tabular.
- **Do** colour results only with the win/loss pair, and keep losses hollow where a mark must read without colour.
- **Do** keep the ADC lavender and the support ochre on every new surface.
- **Do** label chart series at their ends and split result charts at zero, blue above and red below.
- **Do** use official League art for champions, items, runes and ranks; round only runes and spells.
- **Do** animate with the shared springs and leave content visible at frame one.
- **Do** let match rows adapt to their container with container queries.

### Don't:
- **Don't** add drop shadows to panels; depth is tonal.
- **Don't** put uppercase letter-spaced labels or eyebrows above content.
- **Don't** use win blue for navigation or decoration; the nav bar has its own Nav Blue.
- **Don't** introduce themed "gamer" styling, neon glows or a second typeface.
- **Don't** fade entrances in from zero opacity.
- **Don't** set type off the role scale or space off the 4px grid.
