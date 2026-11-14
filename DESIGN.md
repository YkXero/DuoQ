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
  good-ink: "#032b26"
  great: "#0093ff"
  elite: "#ff8200"
  mvp: "#eb9c00"
  mvp-ink: "#1b1300"
  ace: "#6a45d9"
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
  hero-number:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: "tnum"
  display:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  stat:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "0.02em"
    fontFeature: "tnum"
  title:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.45
  body:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  caption:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.45
  micro:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
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
  xxs: "2px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
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
    padding: "12px 14px"
  build-col:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  chip-button:
    backgroundColor: "{colors.panel-inset}"
    textColor: "{colors.text-2}"
    typography: "{typography.caption}"
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
    typography: "{typography.caption}"
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
  who-chip-p0:
    textColor: "{colors.player-0-text}"
    rounded: "{rounded.sm}"
    padding: "1px 6px"
  who-chip-p1:
    textColor: "{colors.player-1-text}"
    rounded: "{rounded.sm}"
    padding: "1px 6px"
  tag-pill-mvp:
    backgroundColor: "{colors.mvp}"
    textColor: "{colors.mvp-ink}"
    rounded: "{rounded.pill}"
    padding: "0 7px"
  tag-pill-ace:
    backgroundColor: "{colors.ace}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "0 7px"
  tag-pill-multi:
    backgroundColor: "{colors.multi}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "0 7px"
  tag-pill-on-track:
    backgroundColor: "{colors.good}"
    textColor: "{colors.good-ink}"
    rounded: "{rounded.pill}"
    padding: "0 7px"
  grade-badge:
    rounded: "{rounded.md}"
    size: "44px"
  level-badge:
    backgroundColor: "{colors.level-badge}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    size: "18px"
  meter-track:
    backgroundColor: "{colors.panel-raised}"
    rounded: "{rounded.bar}"
    height: "6px"
  skill-cell:
    backgroundColor: "{colors.panel-inset}"
    textColor: "{colors.faint}"
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
    typography: "{typography.caption}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
---

# Design System: Duo Q Tracker

## Overview

**Creative North Star: "The Duo's Own op.gg"**

The system is the League stats-site standard played straight: op.gg's dark slate palette and match-row anatomy, dpm.lol's polish, and deeplol/mobalytics-style coaching panels, executed carefully rather than reinvented. League players should read every surface instantly because it looks like the sites they already use. The difference is the subject: two players, framed together, compared against their own past.

Density is high and glance-first. Flat slate panels sit 8px apart on a near-black page, each opened by a bold sentence-case title strip. Colour is a result channel before it is decoration: blue means won, red means lost, teal/blue/orange grade a KDA, and two fixed player hues tell the duo apart everywhere. Charts speak the same language: series are labelled directly at their ends, wins sit above a zero line in blue and losses below it in red, and rank is drawn over the League tier bands. Official League art (champions, items, runes, rank emblems) carries the imagery; there is no invented illustration.

Rejected: themed gimmicks (no "gamer" neon, no fantasy chrome) and the generic AI dashboard of uppercase-labelled rounded cards.

**Key Characteristics:**
- Dark slate tonal layering, no shadows on panels.
- Saturated brand-blue top navigation bar; everything below is neutral slate until a result colours it.
- Panels opened by 14px bold sentence-case title strips divided by a 1px line.
- Win/loss tinted match rows with a 6px result strip on the left edge.
- Roboto everywhere at a 13px base; numbers in tabular figures.
- Charts labelled at the line end, never by a legend box; recessive grids, no axis lines.
- Spring motion that never hides content: entrances move, they do not fade in from nothing.

## Colors

An op.gg dark palette: cool blue-grey slates, a blue/red result pair with tinted backgrounds, a small set of performance tiers, and the League rank-tier hues.

### Primary
- **Victory Blue** (win): the win colour. Fills the left strip of won match rows, the winning arc of the record donut, win segments in bars, filled squares in the form strip, levelled cells in the skill grid, the area above zero in Net wins and gold graphs, the active tab ink, and the primary button.
- **Victory Blue Text** (win-text) on **Victory Slate** (win-bg / win-bg-2): queue name on won rows, the won-row body and expand column, "W" result chips, a positive Net wins number.
- **Nav Blue** (brand-nav): the sticky top navigation bar only. White text on it clears 4.6:1.
- **Link Blue** (accent-text): text links, "Try this" lead-ins, profile links on player cards, focus ring.

### Secondary
- **Defeat Red** (loss): loss strip, losing arc of the donut, hollow loss squares, the area below zero in charts, bad meter dot.
- **Defeat Red Text** (loss-text) on **Defeat Wine** (loss-bg / loss-bg-2): queue name on lost rows, deaths in KDA, F grades, fix-rank numbers, "L" result chips, a negative Net wins number.
- **Warning Red Text** (bad-text): "Getting worse" trend words on panels.

### Tertiary
- **Performance tiers**: Good Teal (good) for strong win rates, KDA 3+, met targets, the meter's good zone and the On-track pill (with Deep Teal Ink, good-ink, as its text); Light Teal (good-text) for a good lane headline on panels; Great Blue (great) for KDA 4+; Elite Orange (elite) for KDA 5+ and the levelled R row of the skill grid.
- **Game badges**: MVP Amber (mvp) with Amber Ink (mvp-ink) text, ACE Violet (ace) and Multikill Red (multi), both with white text.
- **Grade text**: each grade badge sets its letter in a light tint over an 18-22% fill of its tier: A in grade-a-text over teal, B in grade-b-text over Great Blue, D in grade-d-text over Elite Orange. C uses Raised Slate with white, F uses Defeat Red Text.
- **Gold** (gold): the chosen-rune ring, the shared "Bot lane" series in progress charts, and coaching accents.
- **Player hues**: Lavender (player-0, text variant player-0-text) for the ADC and Ochre (player-1, text variant player-1-text) for the support. Used on who-chips, goal progress fills, rank lines and progress-chart series. Chips tint the hue at 18% over the panel and set text in the light variant.
- **Rank tier hues** (tier-iron through tier-challenger): the rank name beside the emblem on player cards, and the tier bands of the rank chart (7% fill, 35% boundary line, 10px tier label).

### Neutral
- **Page Black** (page): page background and the avatar level pill.
- **Slate Panel** (panel): every panel, player card, stat tile and build column.
- **Inset Slate** (panel-inset): cells inside panels (grade cells, swing cards, focus box, segmented track, select, chip buttons, empty skill cells) and the profile band.
- **Raised Slate** (panel-raised): segmented thumb, meter and bar tracks, neutral chips, rune shard chips, image placeholders, hovered player cards. Shares its value with border.
- **Divider Line** (line): title-strip and row dividers inside panels.
- **Border** / **Strong Border** (border, border-strong): table rules, tab baseline, control outlines; strong on hover, chart hover cursors and the tooltip outline.
- **Detail Well** (detail-well): the expanded scoreboard under a match row.
- **Tooltip Black** (tooltip-bg): the chart tooltip ground, the one floating surface.
- **Level Badge Black** (level-badge): the round level badge on champion portraits.
- **Icon Backing** (icon-backing): the black disc behind rune icons, which ship with transparent corners.
- **Text ramp**: white (text) for values, titles and chart end labels; text-2 for secondary copy; muted for labels, inactive tabs, chart ticks and target lines; faint for footer and empty skill cells.
- **Neutral Mark** (neutral-mark): the select caret and the damage-taken bars in the scoreboard, where a bar must stay out of the result colours.
- **Chart neutrals** (chart-grid, chart-zero): horizontal gridlines and the zero reference line in Recharts charts. Axis lines and tick marks are off; ticks use muted.
- **Demo banner** (banner-bg, banner-border, banner-text): the dark-amber notice shown while sample data is active. Its only use.

### Named Rules
**The Result Colour Rule.** Blue and red mean won and lost, nothing else. Never use win or loss hues for brand, navigation or decoration (the nav bar uses its own Nav Blue). In charts, blue is above zero and red below.

**The Two Players Rule.** Lavender is always the ADC and ochre is always the support, on every surface. A third person colour is never introduced; "both of you" uses the neutral Raised Slate chip, or Gold where a chart needs a shared series.

**The Hollow Loss Rule.** Win/loss marks must read without colour: wins are filled, losses are hollow outlines.

## Typography

**Display Font:** Roboto (with system-ui, -apple-system, Segoe UI)
**Body Font:** Roboto
**Label/Mono Font:** Roboto, with tabular figures for numbers

**Character:** One neutral grotesque at weights 400/500/700, loaded from Google Fonts. Hierarchy comes from weight and size steps of 1-2px, the way stats sites pack information, not from a second face.

### Hierarchy
- **Hero number** (700, 26px, tabular): the headline number above a chart (the current Net wins figure), coloured by result.
- **Display** (700, 22px): headline numbers such as the recent KDA ratio, stat tile values and big summary values.
- **Headline** (700, 20px, -0.01em): player names in the profile band and the brand wordmark.
- **Stat** (700, 15px, 0.02em, tabular): KDA lines in match rows, rank tier names, lane headlines; verdict copy at 15px 400.
- **Title** (700, 14px): panel title strips, section sub-titles, category titles. Sentence case. A caption-size muted hint can follow on the same baseline.
- **Body** (400, 13px, line-height 1.45): base text, story lines, links.
- **Caption** (400, 12px): table headers, controls (segmented options at 500, select, chip buttons), title hints, tile labels, trend words, legends, build labels, result chips, chart tooltips, profile links.
- **Label** (500, 11px): chips, pills, roster names, levels, meter labels, chart ticks and end labels (700), footnotes.
- **Micro** (700, 10px): rank-tier band labels and objective marks inside charts, and the skill-grid cells.

### Named Rules
**The Sentence Case Rule.** Titles and labels are sentence case at normal tracking. No uppercase letter-spaced labels above content.

**The Tabular Rule.** Any numeric column or stat uses tabular figures and right alignment in tables.

## Layout

A centred 1180px container with 16px side gutters. Below a 52px sticky nav bar sits the profile band (Inset Slate, 20px top padding): two player cards in a `1fr 32px 1fr` grid joined by a "+", then underline tabs flush to the band's bottom. Player cards are links to each player's profile. The page body starts 12px below with a filter panel (queue segmented control, period segmented control, game count right-aligned).

The Overview is a 332px aside plus a fluid main column at 8px gap. The player profile opens with a row of six stat tiles (8px gap), then the same aside-plus-main layout with champion and recent-games tables. Expanded match details place the two players' builds in a two-column grid at 16px gap. Everything uses an 8px gap between panels and 16px panel padding; inner rows step at 2/4/6/8/10/12/14px. Lists inside panels separate rows with 1px Divider Lines and remove the last rule.

Responsive behaviour: at 1000px the aside collapses into the flow (`display: contents`) and reorders as summary first, then the main column (duo report and fixes), then the remaining aside panels; stat tiles drop to three columns. At 900px the player cards stack, the "+" hides, two- and three-column grids and build columns go single-column. At 700px tabs gain a right fade mask and 12px padding, meter rows stack, and the summary grid goes single-column. At 560px stat tiles drop to two columns. Match rows respond to their container, not the viewport: at 1060px they drop side stats and roster names (duo icons get a 1px text-2 ring), at 640px they keep only meta, the first player and the expand column.

## Elevation & Depth

Flat. Panels carry no shadow; depth is tonal layering from Page Black to Slate Panel to Inset Slate cells to Raised Slate tracks and thumbs. Hover states lift by tint (rgba white 0.025 on rows, Inset Slate on meter rows, Raised Slate on player cards and the more-games link), not by shadow.

### Shadow Vocabulary
- **Chart tooltip** (`box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4)`): the one floating surface, on Tooltip Black with a strong border.
- **Icon separator ring** (`box-shadow: 0 0 0 2px var(--panel)`): overlapping champion icons in duo stacks; a cut-out, not elevation.
- **Chosen-rune ring** (`box-shadow: 0 0 0 2px var(--gold)`): marks the runes a player took on the rune page; untaken runes sit at 28% opacity in greyscale.

### Named Rules
**The Flat Panel Rule.** Panels never take a drop shadow. Only floating overlays (tooltips) may.

## Shapes

Small, consistent corners: 4px for chips, item icons, segmented thumb, rune shard chips and inline code; 6px for panels, tiles, build columns, grade cells, champion icons, the tooltip and the segmented track; 8px for match rows, buttons, selects, goals and the banner. Pills (99px) for tag pills, chip buttons, trend chips and the avatar level. Avatars are 72px squares at 16px radius with a level pill overlapping the bottom edge. Runes, spell-round icons and champion level badges are circles. Bars and tracks are 6px tall with 3px ends; skill-grid cells and form squares also use 3px. Thin marks take the smallest corners: 2px for the tab ink and legend swatches, 1px for the meter target tick. Match rows clip their content (`overflow: hidden`) so the result strip and expand column follow the corner.

## Components

### Navigation
- **Top bar:** sticky, Nav Blue, 52px, wordmark at 20px 700 plus a 14px 500 section link.
- **Tabs:** underline tabs, 13px 600, muted inactive, text-2 on hover, white when active. The active ink is a 2px Victory Blue bar inset 10px from each side, sliding between tabs with the smooth spring (shared layout id). A 1px border baseline sits under the row except inside the profile band.
- **Profile link:** inside each player card, a caption "Profile" in Link Blue at 85% opacity with a drawn chevron; full opacity and underlined while the card is hovered.

### Segmented control
- **Style:** Inset Slate track, 3px padding, 2px gap, 6px radius. Options are 12px 500 muted text; the active option is white over a Raised Slate thumb (4px radius) that slides with the snappy spring. Exposed as a radiogroup.

### Chips
- **Who-chip:** 11px 500 on an 18% tint of the player hue, 4px radius; "Duo" uses Raised Slate with text-2.
- **Tag pills:** 11px 700 pills, 17px line: MVP (amber, Amber Ink text), ACE (violet), multikills (Multikill Red), On track (Good Teal, Deep Teal Ink text), and player-tinted name pills.
- **Role chip / small-sample chip:** Raised Slate, 4px radius, 11px text-2.
- **Chip button:** Inset Slate pill with a 1px border, strong border and white text on hover.
- **Result chip:** 12px 700 "W"/"L" in win or loss text, no fill, in recent-games tables.

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** Slate Panel; nested cells in Inset Slate.
- **Shadow Strategy:** none (see Elevation).
- **Border:** none on panels; the title strip has a 1px Divider Line under it.
- **Internal Padding:** 16px; the title strip bleeds to the panel edges with 12px 16px padding and a 14px gap below.

### Stat tile
A Slate Panel tile at 6px radius, 12px 14px padding: a 12px text-2 label, a 22px 700 tabular value, and an optional 12px muted sub-line that truncates. Six across on the player profile.

### Buttons and inputs
- **Button:** Raised Slate, 1px strong border, 8px radius, 8px 14px, 700 weight; primary is Victory Blue.
- **Link button:** Link Blue text, underline on hover ("Show 5 more").
- **Select:** native select with Inset Slate fill, 1px border, 8px radius, a drawn caret in Neutral Mark; strong border on hover.
- **Focus:** a 2px Link Blue outline with 2px offset on every focusable element.

### Banner
The demo-data notice: dark amber ground, 1px amber border, pale amber text, 8px radius, 10px 14px padding, with an inline button. One per page, at the top of the profile band.

### Match row (signature)
The op.gg anatomy, kept as a brand commitment. A row is a tinted block (Victory Slate or Defeat Wine) with a 6px left result strip in Victory Blue or Defeat Red and 8px corners. The strip is a documented exception (recorded in `.impeccable/config.json`) scoped to match rows; it is not a general side-accent device for other panels. The grid runs: meta (queue name in result text colour, age, result word above a hairline, duration) / player one block / player two block / rosters (two columns of ten champions, duo names emphasised) / a 36px expand column in the darker result tint with a chevron. Each player block is champion portrait with level badge, spells and runes, KDA in the Stat style with deaths in loss text, ratio coloured by KDA tier, name and badge pills, then an item strip whose empty slots use the darker result tint. A one-line story sentence follows, led by a 7px teal, red or neutral dot. Rows sit 8px apart; expanding opens a Detail Well scoreboard with team-tinted rows, the current player highlighted, and damage bars.

### Build column (match detail)
One Slate Panel column per player (6px radius, 12px 14px padding) headed by a 32px portrait, name and champion. Caption-weight text-2 sub-labels introduce three blocks: the item build as timed steps (28px items, minute under each), the skill grid (22px cells at 3px radius, 2px gap, Inset Slate with faint text; levelled cells Victory Blue with white 700, R row Elite Orange), and the rune page (primary and secondary trees, 34px keystones and 26px runes on black discs, chosen runes ringed in Gold, others greyed at 28%, shard chips in Raised Slate).

### Charts
Recharts, styled as one family:
- **Frame:** horizontal gridlines only in Chart Grid; no axis lines or tick marks; ticks 11px muted. Hover cursor is a Strong Border line. Tooltip is the Chart tooltip: Tooltip Black, 1px strong border, 6px radius, 8px 10px padding, 12px text, a muted header line, values coloured by result or player.
- **Labels:** each line is labelled at its last point with the player or series name and current value (11px 700), with no legend box. A legend row (10x3px swatches, 12px text-2) is used only where end labels cannot fit.
- **Net wins:** a 26px hero number (win or loss text) with a caption "after N games · peak +N" on the same baseline, over a step area of wins minus losses. The fill and line split at zero: Victory Blue above (45% fading to 5%), Defeat Red below, with a Chart Zero reference line.
- **Gold graph:** the same zero-split area on a smooth curve, with dragon and baron moments as dashed 50% lines in the taking team's result colour and a 10px label.
- **Rank chart:** the duo's ladder position as 2px player-hue lines over the League tier bands, each band a 7% fill of its tier hue with a 35% boundary line and a 10px tier label; each line ends in a 4px dot ringed in panel colour and a white "name · rank LP" label.
- **Progress chart:** per-game values as dots at 28% opacity of the series colour, a smoothed 2.5px average line on top, and the rank target as a dashed muted line labelled at the right.

### Grade badge
A square at 6px radius, letter at half the size, 700. A teal, B blue, C Raised Slate, D orange, F red, each an 18-22% tint with its light grade-text colour. Sits left of a grade cell (Inset Slate, name 13px 700, one-line explanation).

### Meter (you vs target)
A 6px Raised Slate track with a 30% teal good zone starting at the target, a 2px text-2 target tick, and a 12px dot (teal good, red bad, text-2 neutral) ringed in panel colour. The dot and its value label spring from the target to the player's value. Labels: value above in 11px 700 tone colour, "target N" below in muted.

### Progress and record marks
- **Record donut:** 88px, 11px stroke, loss ring under a win arc that springs in; percentage at size/5.
- **Form strip:** 12px squares, wins filled blue, losses hollow red outlines.
- **Goal bars:** 6px tracks filled with the player hue.
- **Trend words:** 12px 500 with a 6px dot in currentColor: teal "Getting better", red "Getting worse", muted "Steady".

### Fix list
Numbered rows: a 22px circle in Defeat Wine with loss-text numeral, a title with who-chip and trend word, a text-2 explanation, a "Try this:" lead in Link Blue, and a 220px visual column (meter or champion icons) that drops under the text below 760px.

### Motion
Spring presets only: smooth (stiffness 380, damping 34, mass 0.9) for tab ink and layout; snappy (600, 32) for the segmented thumb and toggles; gentle (180, 24) for entrances, bar fills, ring and donut sweeps, meter dots. Panels enter with a 14px upward slide (12px for fadeUp) and no opacity change, staggered 35ms per item capped at 400ms. Charts draw without animation. Reduced motion removes all animation and transitions.

## Do's and Don'ts

### Do:
- **Do** open every panel with a 14px 700 sentence-case title strip and a 1px Divider Line, with an optional muted hint on the same baseline.
- **Do** keep 8px between panels and 16px inside them.
- **Do** colour results only with the win/loss pair, and keep losses hollow where a mark must read without colour.
- **Do** keep the ADC lavender and the support ochre on every new surface.
- **Do** label chart series at their ends and split result charts at zero, blue above and red below.
- **Do** use official League art for champions, items, runes and ranks; round only runes, spells and level badges.
- **Do** animate with the shared springs and leave content visible at frame one.
- **Do** let match rows adapt to their container with container queries.

### Don't:
- **Don't** add drop shadows to panels; depth is tonal.
- **Don't** put uppercase letter-spaced labels or eyebrows above content.
- **Don't** use win blue for navigation or decoration; the nav bar has its own Nav Blue.
- **Don't** introduce themed "gamer" styling, neon glows or a second typeface.
- **Don't** fade entrances in from zero opacity.
