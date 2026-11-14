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
  great: "#0093ff"
  elite: "#ff8200"
  mvp: "#eb9c00"
  ace: "#7d59ea"
  gold: "#e0b84e"
  player-0: "#9085e9"
  player-0-text: "#b9b2ff"
  player-1: "#c98500"
  player-1-text: "#f2b544"
  page: "#1c1c1f"
  panel: "#31313c"
  panel-inset: "#282830"
  panel-raised: "#424254"
  border: "#424254"
  border-strong: "#515163"
  line: "#26262d"
  detail-well: "#1b1b21"
  text: "#ffffff"
  text-2: "#b7b7c9"
  muted: "#a7a7ba"
  faint: "#9e9eb1"
  chart-grid: "#2e2e38"
  chart-axis: "#4a4a5a"
  chart-tick: "#8a899c"
typography:
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
  title:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.45
  stat:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "0.02em"
    fontFeature: "tnum"
  body:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.45
rounded:
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
  chip-button:
    backgroundColor: "{colors.panel-inset}"
    textColor: "{colors.text-2}"
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
    rounded: "{rounded.lg}"
    padding: "6px 28px 6px 10px"
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
    textColor: "#1b1300"
    rounded: "{rounded.pill}"
    padding: "0 7px"
  grade-badge:
    rounded: "{rounded.md}"
    size: "44px"
  meter-track:
    backgroundColor: "{colors.panel-raised}"
    rounded: "3px"
    height: "6px"
---

# Design System: Duo Q Tracker

## Overview

**Creative North Star: "The Duo's Own op.gg"**

The system is the League stats-site standard played straight: op.gg's dark slate palette and match-row anatomy, dpm.lol's polish, and deeplol/mobalytics-style coaching panels, executed carefully rather than reinvented. League players should read every surface instantly because it looks like the sites they already use. The difference is the subject: two players, framed together, compared against their own past.

Density is high and glance-first. Flat slate panels sit 8px apart on a near-black page, each opened by a bold sentence-case title strip. Colour is a result channel before it is decoration: blue means won, red means lost, teal/blue/orange grade a KDA, and two fixed player hues tell the duo apart everywhere. Official League art (champions, items, runes, rank emblems) carries the imagery; there is no invented illustration.

Rejected: themed gimmicks (no "gamer" neon, no fantasy chrome) and the generic AI dashboard of uppercase-labelled rounded cards.

**Key Characteristics:**
- Dark slate tonal layering, no shadows on panels.
- Saturated brand-blue top navigation bar; everything below is neutral slate until a result colours it.
- Panels opened by 14px bold sentence-case title strips divided by a 1px line.
- Win/loss tinted match rows with a 6px result strip on the left edge.
- Roboto everywhere at a 13px base; numbers in tabular figures.
- Spring motion that never hides content: entrances move, they do not fade in from nothing.

## Colors

An op.gg dark palette: cool blue-grey slates, a blue/red result pair with tinted backgrounds, and a small set of performance tiers.

### Primary
- **Victory Blue** (win): the win colour. Fills the left strip of won match rows, the winning arc of the record donut, win segments in bars, filled squares in the form strip, the active tab ink, and the primary button.
- **Victory Blue Text** (win-text) on **Victory Slate** (win-bg / win-bg-2): queue name on won rows, and the won-row body and expand column.
- **Nav Blue** (brand-nav): the sticky top navigation bar only. White text on it clears 4.6:1.
- **Link Blue** (accent-text): text links, "Try this" lead-ins, focus ring, duo highlight rings in compact rosters.

### Secondary
- **Defeat Red** (loss): loss strip, losing arc of the donut, hollow loss squares, bad meter dot.
- **Defeat Red Text** (loss-text) on **Defeat Wine** (loss-bg / loss-bg-2): queue name on lost rows, deaths in KDA, F grades, fix-rank numbers.
- **Warning Red Text** (bad-text): "Getting worse" trend words on panels.

### Tertiary
- **Performance tiers**: Good Teal (good) for strong win rates, KDA 3+, A-grade tint, met targets and the meter's good zone; Great Blue (great) for KDA 4+; Elite Orange (elite) for KDA 5+ and the R skill row; MVP Amber (mvp) and ACE Violet (ace) for game badges.
- **Player hues**: Lavender (player-0, text variant player-0-text) for the ADC and Ochre (player-1, text variant player-1-text) for the support. Used on who-chips, goal progress fills and rank-graph lines. Chips tint the hue at 18% over the panel and set text in the light variant.
- **Rank tier colours** (in the player card source): Iron #a7a097 through Challenger #fdc06b, used only for the rank name beside the emblem.

### Neutral
- **Page Black** (page): page background.
- **Slate Panel** (panel): every panel and player card.
- **Inset Slate** (panel-inset): cells inside panels (grade cells, swing cards, focus box, segmented track, select, chip buttons) and the profile band.
- **Raised Slate** (panel-raised): segmented thumb, meter and bar tracks, neutral chips, image placeholders. Shares its value with border.
- **Divider Line** (line): title-strip and row dividers inside panels.
- **Border** / **Strong Border** (border, border-strong): table rules, tab baseline, control outlines; strong on hover.
- **Detail Well** (detail-well): the expanded scoreboard under a match row.
- **Text ramp**: white (text) for values and titles, text-2 for secondary copy, muted for labels and inactive tabs, faint for footer and empty skill cells.
- **Chart neutrals** (chart-grid, chart-axis, chart-tick): Recharts gridlines, axes and tick labels. They live as literals in the chart components, not as CSS variables.

### Named Rules
**The Result Colour Rule.** Blue and red mean won and lost, nothing else. Never use win or loss hues for brand, navigation or decoration (the nav bar uses its own Nav Blue).

**The Two Players Rule.** Lavender is always the ADC and ochre is always the support, on every surface. A third person colour is never introduced; "both of you" uses the neutral Raised Slate chip.

**The Hollow Loss Rule.** Win/loss marks must read without colour: wins are filled, losses are hollow outlines.

## Typography

**Display Font:** Roboto (with system-ui, -apple-system, Segoe UI)
**Body Font:** Roboto
**Label/Mono Font:** Roboto, with tabular figures for numbers

**Character:** One neutral grotesque at weights 400/500/700, loaded from Google Fonts. Hierarchy comes from weight and size steps of 1-2px, the way stats sites pack information, not from a second face.

### Hierarchy
- **Display** (700, 22px): headline numbers such as the recent KDA ratio and big summary values.
- **Headline** (700, 20px, -0.01em): player names in the profile band and the brand wordmark.
- **Title** (700, 14px): panel title strips, section sub-titles, category titles. Sentence case. A 12px 400 muted hint can follow on the same baseline.
- **Stat** (700, 15px, 0.02em, tabular): KDA lines in match rows, rank tier names, verdict copy at 15px 400.
- **Body** (400, 13px, line-height 1.45): base text; 12px for table headers, controls and secondary lines.
- **Label** (500, 11px): chips, pills, roster names, levels, meter labels, footnotes.

### Named Rules
**The Sentence Case Rule.** Titles and labels are sentence case at normal tracking. No uppercase letter-spaced labels above content.

**The Tabular Rule.** Any numeric column or stat uses tabular figures and right alignment in tables.

## Layout

A centred 1180px container with 16px side gutters. Below a 52px sticky nav bar sits the profile band (Inset Slate, 20px top padding): two player cards in a `1fr 32px 1fr` grid joined by a "+", then underline tabs flush to the band's bottom. The page body starts 12px below with a filter panel (queue segmented control, period segmented control, game count right-aligned).

The Overview is a 332px aside plus a fluid main column at 8px gap. Everything uses an 8px gap between panels and 16px panel padding; inner rows step at 2/4/6/8/10/12px. Lists inside panels separate rows with 1px Divider Lines and remove the last rule.

Responsive behaviour: at 1000px the aside collapses into the flow (`display: contents`) and reorders as summary first, then the main column (duo report and fixes), then the remaining aside panels. At 900px the player cards stack and the "+" hides. At 700px tabs gain a right fade mask and 12px padding, meter rows stack, and the summary grid goes single-column. Match rows respond to their container, not the viewport: at 1060px they drop side stats and roster names (duo icons get a Link Blue ring), at 640px they keep only meta, the first player and the expand column.

## Elevation & Depth

Flat. Panels carry no shadow; depth is tonal layering from Page Black to Slate Panel to Inset Slate cells to Raised Slate tracks and thumbs. Hover states lift by tint (rgba white 0.025 on rows, Inset Slate on meter rows, Raised Slate on the more-games link), not by shadow.

### Shadow Vocabulary
- **Chart tooltip** (`box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4)`): the one floating surface, on a #111116 tooltip with a strong border.
- **Icon separator ring** (`box-shadow: 0 0 0 2px var(--panel)`): overlapping champion icons in duo stacks; a cut-out, not elevation.

### Named Rules
**The Flat Panel Rule.** Panels never take a drop shadow. Only floating overlays (tooltips) may.

## Shapes

Small, consistent corners: 4px for chips, item icons, segmented thumb and inline code; 6px for panels, grade cells, champion icons and the segmented track; 8px for match rows, buttons, selects, goals and the banner. Pills (99px) for tag pills, chip buttons and trend chips. Avatars are 72px squares at 16px radius with a level pill overlapping the bottom edge. Runes and spell-round icons are circles. Bars and tracks are 6px tall with 3px radius. Match rows clip their content (`overflow: hidden`) so the result strip and expand column follow the corner.

## Components

### Navigation
- **Top bar:** sticky, Nav Blue, 52px, wordmark at 20px 700 plus a 14px 500 section link.
- **Tabs:** underline tabs, 13px 600, muted inactive, text-2 on hover, white when active. The active ink is a 2px Victory Blue bar inset 10px from each side, sliding between tabs with the smooth spring (shared layout id). A 1px border baseline sits under the row except inside the profile band.

### Segmented control
- **Style:** Inset Slate track, 3px padding, 2px gap, 6px radius. Options are 12px 500 muted text; the active option is white over a Raised Slate thumb (4px radius) that slides with the snappy spring. Exposed as a radiogroup.

### Chips
- **Who-chip:** 11px 500 on an 18% tint of the player hue, 4px radius; "Duo" uses Raised Slate with text-2.
- **Tag pills:** 11px 700 pills for MVP (amber, dark text), ACE (violet), multikills (red), and player-tinted name pills in match rows.
- **Role chip / small-sample chip:** Raised Slate, 4px radius, 11px text-2.
- **Chip button:** Inset Slate pill with a 1px border, strong border and white text on hover.

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** Slate Panel; nested cells in Inset Slate.
- **Shadow Strategy:** none (see Elevation).
- **Border:** none on panels; the title strip has a 1px Divider Line under it.
- **Internal Padding:** 16px; the title strip bleeds to the panel edges with 12px 16px padding and a 14px gap below.

### Buttons and inputs
- **Button:** Raised Slate, 1px strong border, 8px radius, 8px 14px, 600 weight; primary is Victory Blue.
- **Link button:** Link Blue text, underline on hover ("Show 5 more").
- **Select:** native select with Inset Slate fill, 1px border, 8px radius, a drawn caret; strong border on hover.
- **Focus:** a 2px Link Blue outline with 2px offset on every focusable element.

### Match row (signature)
The op.gg anatomy, kept as a brand commitment. A row is a tinted block (Victory Slate or Defeat Wine) with a 6px left result strip in Victory Blue or Defeat Red and 8px corners. The strip is a documented exception (recorded in `.impeccable/config.json`) scoped to match rows; it is not a general side-accent device for other panels. The grid runs: meta (queue name in result text colour, age, result word above a hairline, duration) / player one block / player two block / rosters (two columns of ten champions, duo names emphasised) / a 36px expand column in the darker result tint with a chevron. Each player block is champion portrait with level, spells and runes, KDA in the Stat style with deaths in loss text, ratio coloured by KDA tier, name and badge pills, then an item strip whose empty slots use the darker result tint. A one-line story sentence follows, led by a 7px teal, red or neutral dot. Rows sit 8px apart; expanding opens a Detail Well scoreboard with team-tinted rows and the current player highlighted.

### Grade badge
A square at 6px radius, letter at half the size, 700. A teal tint, B blue, C Raised Slate, D orange, F red, each a 18-22% tint with a light text colour. Sits left of a grade cell (Inset Slate, name 13px 700, one-line explanation).

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
Spring presets only: smooth (stiffness 380, damping 34, mass 0.9) for tab ink and layout; snappy (600, 32) for the segmented thumb and toggles; gentle (180, 24) for entrances, bar fills, ring and donut sweeps, meter dots. Panels enter with a 14px upward slide (12px for fadeUp) and no opacity change, staggered 35ms per item capped at 400ms. Reduced motion removes all animation and transitions.

## Do's and Don'ts

### Do:
- **Do** open every panel with a 14px 700 sentence-case title strip and a 1px Divider Line, with an optional muted hint on the same baseline.
- **Do** keep 8px between panels and 16px inside them.
- **Do** colour results only with the win/loss pair, and keep losses hollow where a mark must read without colour.
- **Do** keep the ADC lavender and the support ochre on every new surface.
- **Do** use official League art for champions, items, runes and ranks; round only runes and spells.
- **Do** animate with the shared springs and leave content visible at frame one.
- **Do** let match rows adapt to their container with container queries.

### Don't:
- **Don't** add drop shadows to panels; depth is tonal.
- **Don't** put uppercase letter-spaced labels or eyebrows above content.
- **Don't** use win blue for navigation or decoration; the nav bar has its own Nav Blue.
- **Don't** introduce themed "gamer" styling, neon glows or a second typeface.
- **Don't** fade entrances in from zero opacity.
