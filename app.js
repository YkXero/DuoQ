"use strict";

// ---------------------------------------------------------------- state & helpers
let DATA = null;
let RANGE = "all";
let HISTORY_SHOWN = 20;
const charts = {};
const DD = { v: null, ids: {}, names: {} };
const SPELLS = { 1: "SummonerBoost", 3: "SummonerExhaust", 4: "SummonerFlash", 6: "SummonerHaste", 7: "SummonerHeal", 11: "SummonerSmite", 12: "SummonerTeleport", 14: "SummonerDot", 21: "SummonerBarrier" };
const TIERS = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"];
const DIVS = { IV: 0, III: 1, II: 2, I: 3 };

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const nums = (arr) => arr.filter((x) => typeof x === "number" && !Number.isNaN(x));
const avg = (arr) => { const a = nums(arr); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; };
const fmt = (x, d = 1) => (x == null ? "–" : x.toFixed(d));
const signed = (x, d = 0) => (x == null ? "–" : (x > 0 ? "+" : "") + x.toFixed(d));
const pct = (x) => (x == null ? "–" : Math.round(x * 100) + "%");
const wins = (g) => g.filter((m) => m.win).length;
const wr = (g) => (g.length ? wins(g) / g.length : null);
const adjWr = (g) => (wins(g) + 2.5) / (g.length + 5); // shrinks small samples toward 50%
const kda = (k, d, a) => (k + a) / Math.max(1, d);
const mins = (m) => m.dur / 60;
const adc = (m) => m.duo[m.adcIdx];
const sup = (m) => m.duo[1 - m.adcIdx];
const isAdc = (m, i) => m.adcIdx === i;
const shortName = (riotId) => String(riotId).split("#")[0];
const record = (g) => `${wins(g)}W ${g.length - wins(g)}L`;
const wrClass = (x) => (x == null ? "" : x >= 0.55 ? "win" : x < 0.45 ? "loss" : "");

function groupBy(list, keyFn) {
  const map = new Map();
  for (const x of list) {
    const k = keyFn(x);
    if (k == null) continue;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(x);
  }
  return [...map.entries()].map(([key, games]) => ({ key, games }));
}

// ---------------------------------------------------------------- Data Dragon
async function loadDDragon() {
  try {
    const versions = await (await fetch("https://ddragon.leagueoflegends.com/api/versions.json")).json();
    DD.v = versions[0];
    const champs = (await (await fetch(`https://ddragon.leagueoflegends.com/cdn/${DD.v}/data/en_US/champion.json`)).json()).data;
    for (const c of Object.values(champs)) { DD.ids[c.id.toLowerCase()] = c.id; DD.names[c.id] = c.name; }
  } catch (e) { console.warn("Data Dragon unavailable", e); }
}
const champId = (name) => DD.ids[String(name).toLowerCase()] || name;
const champName = (name) => DD.names[champId(name)] || name;
const img = (path, cls, title) => (DD.v ? `<img class="icon ${cls || ""}" loading="lazy" src="https://ddragon.leagueoflegends.com/cdn/${DD.v}/img/${path}" alt="" title="${esc(title || "")}" onerror="this.style.visibility='hidden'">` : "");
const champIcon = (name, cls) => img(`champion/${champId(name)}.png`, cls, champName(name));
const champCell = (name) => `<span class="champ">${champIcon(name)}${esc(champName(name))}</span>`;
const itemIcon = (id) => (id ? img(`item/${id}.png`, "xs") : `<span class="icon xs" style="display:inline-block"></span>`);
const spellIcon = (id) => (SPELLS[id] ? img(`spell/${SPELLS[id]}.png`, "xs") : "");

// ---------------------------------------------------------------- filtering & sessions
function filtered() {
  const all = DATA.matches; // newest first
  if (RANGE === "all") return all;
  if (RANGE === "7d") return all.filter((m) => m.ts > Date.now() - 7 * 86400000);
  return all.slice(0, Number(RANGE));
}

// Annotate chronological context: game number within the session, previous result.
function annotateSessions(matches) {
  const chrono = [...matches].sort((a, b) => a.ts - b.ts);
  let prev = null, n = 0;
  for (const m of chrono) {
    const gap = prev ? m.ts - (prev.ts + prev.dur * 1000) : Infinity;
    if (gap > 60 * 60000) { n = 0; m._prev = null; m._prev2 = null; }
    else { m._prev = prev.win; m._prev2 = n >= 1 ? prev._prev : null; }
    m._sessionGame = ++n;
    prev = m;
  }
}

// ---------------------------------------------------------------- insights
function insights(g) {
  const out = [];
  const add = (type, text) => out.push({ type, text });
  if (g.length < 5) return [{ type: "info", text: "Play at least 5 games together to unlock insights." }];
  const W = g.filter((m) => m.win), L = g.filter((m) => !m.win);
  const [n0, n1] = DATA.players.map((p) => shortName(p.riotId));

  // Synergies
  const combos = groupBy(g, (m) => `${adc(m).champ}|${sup(m).champ}`).filter((c) => c.games.length >= 3);
  combos.sort((a, b) => adjWr(b.games) - adjWr(a.games));
  const label = (k) => k.split("|").map(champName).join(" + ");
  if (combos.length && wr(combos[0].games) >= 0.55)
    add("good", `<b>${label(combos[0].key)}</b> is your best duo: ${record(combos[0].games)} (${pct(wr(combos[0].games))}). Pick it more.`);
  const worst = combos.at(-1);
  if (worst && combos.length > 1 && wr(worst.games) <= 0.4)
    add("bad", `<b>${label(worst.key)}</b> isn't working: ${record(worst.games)} (${pct(wr(worst.games))}). Try a different pairing or practise it in normals.`);

  // Matchups
  for (const [role, get] of [["ADC", (m) => m.enemy.adc?.champ], ["support", (m) => m.enemy.sup?.champ]]) {
    const bad = groupBy(g, get).filter((x) => x.games.length >= 3 && wr(x.games) <= 0.35).sort((a, b) => wr(a.games) - wr(b.games))[0];
    if (bad) add("bad", `Your hardest enemy ${role} is <b>${champName(bad.key)}</b>: ${record(bad.games)}. Plan the matchup in champ select (or ban it).`);
  }

  // ADC farming
  const csm = avg(g.map((m) => adc(m).cs / mins(m)));
  const cs10 = avg(g.map((m) => adc(m).cs10));
  if (csm != null) {
    if (csm < 6.5) add("bad", `ADC farm is low at <b>${fmt(csm)} CS/min</b>. Aim for 7.5+; catch side waves between objectives.`);
    else if (csm >= 8) add("good", `ADC farm is great at <b>${fmt(csm)} CS/min</b>.`);
  }
  if (cs10 != null) {
    if (cs10 < 60) add("bad", `Only <b>${fmt(cs10, 0)} CS at 10 min</b> on average. 70+ is a solid target, and last-hitting under pressure is something you can practise as a duo.`);
    else if (cs10 >= 75) add("good", `Strong early farm: <b>${fmt(cs10, 0)} CS at 10</b>.`);
  }

  // Support vision
  const vpm = avg(g.map((m) => sup(m).vision / mins(m)));
  const pinks = avg(g.map((m) => sup(m).pinks));
  if (vpm != null) {
    if (vpm < 1.8) add("bad", `Support vision is low at <b>${fmt(vpm, 2)}/min</b>. Aim for 2.2+, and swap to the sweeper after your support item completes.`);
    else if (vpm >= 2.5) add("good", `Support vision is excellent at <b>${fmt(vpm, 2)}/min</b>.`);
  }
  if (pinks != null && pinks < 2) add("bad", `Support buys <b>${fmt(pinks)} control wards</b> per game. Keep one on the map at all times (3+ per game).`);

  // Deaths in losses
  for (const [who, get] of [["ADC", adc], ["Support", sup]]) {
    const dW = avg(W.map((m) => get(m).d)), dL = avg(L.map((m) => get(m).d));
    if (dW != null && dL != null && dL - dW >= 2)
      add("bad", `${who} dies <b>${fmt(dL)}</b> times in losses vs <b>${fmt(dW)}</b> in wins. Survival is the biggest swing factor here.`);
  }

  // Lane phase
  const laned = g.filter((m) => m.lane?.gd15 != null);
  if (laned.length >= 5) {
    const ahead = laned.filter((m) => m.lane.gd15 > 500), behind = laned.filter((m) => m.lane.gd15 < -500);
    const gd = avg(laned.map((m) => m.lane.gd15));
    if (gd >= 400) add("good", `You win lane: <b>${signed(gd)} gold</b> on average at 15 min as a duo.`);
    if (behind.length / laned.length >= 0.4) add("bad", `You're behind by more than 500 gold at 15 in <b>${pct(behind.length / laned.length)}</b> of games. Focus on wave management and recall timings.`);
    if (ahead.length >= 3 && behind.length >= 3)
      add("info", `Ahead at 15 → <b>${pct(wr(ahead))}</b> win rate. Behind at 15 → <b>${pct(wr(behind))}</b>. ${wr(ahead) - wr(behind) > 0.3 ? "Lane decides most of your games." : "Your games are often decided after lane, so mid-game macro matters."}`);
    const d15L = avg(L.filter((m) => m.lane).map((m) => m.lane.botDeaths15));
    if (d15L != null && d15L >= 3) add("bad", `In losses your bot lane dies <b>${fmt(d15L)}</b> times before 15 min. Track the enemy jungler and ward the tri-bush and river.`);
  }

  // Game length
  const short = g.filter((m) => mins(m) < 25), long = g.filter((m) => mins(m) >= 32);
  if (short.length >= 4 && long.length >= 4) {
    const diff = wr(short) - wr(long);
    if (Math.abs(diff) >= 0.15)
      add("info", diff > 0
        ? `You're an <b>early-game duo</b>: ${pct(wr(short))} in games under 25 min vs ${pct(wr(long))} past 32. Snowball and close games out with Baron.`
        : `You <b>scale well</b>: ${pct(wr(long))} in games past 32 min vs ${pct(wr(short))} under 25. Play safe early and lean on scaling picks.`);
  }

  // Dragons
  const fd = g.filter((m) => m.team.firstDragon), nfd = g.filter((m) => !m.team.firstDragon);
  if (fd.length >= 4 && nfd.length >= 4 && wr(fd) - wr(nfd) >= 0.2)
    add("info", `First dragon matters: <b>${pct(wr(fd))}</b> with it vs <b>${pct(wr(nfd))}</b> without. Push for bot lane priority before drake spawns.`);

  // Tilt / sessions
  const late = g.filter((m) => m._sessionGame >= 4);
  if (late.length >= 5 && wr(late) < wr(g) - 0.1)
    add("bad", `Game 4+ of a session: <b>${pct(wr(late))}</b> win rate vs ${pct(wr(g))} overall. Consider stopping after 3.`);
  const afterTwoL = g.filter((m) => m._prev === false && m._prev2 === false);
  if (afterTwoL.length >= 4 && wr(afterTwoL) < 0.4)
    add("bad", `After 2 losses in a row you go <b>${record(afterTwoL)}</b>. Take a break when that happens.`);

  // Side
  const blue = g.filter((m) => m.side === "blue"), red = g.filter((m) => m.side === "red");
  if (blue.length >= 8 && red.length >= 8 && Math.abs(wr(blue) - wr(red)) >= 0.15)
    add("info", `Blue side ${pct(wr(blue))}, red side ${pct(wr(red))}.`);

  // KP
  const kp = avg(g.map((m) => sup(m).kp));
  if (kp != null && kp < 0.5) add("bad", `Support kill participation is <b>${pct(kp)}</b>. Roam mid after recalls and join the jungler for skirmishes.`);

  if (!out.length) add("info", `Nothing stands out yet across ${g.length} games. Keep playing.`);
  const order = { bad: 0, good: 1, info: 2 };
  return out.sort((a, b) => order[a.type] - order[b.type]);
}

// ---------------------------------------------------------------- sections
function rankValue(r) {
  if (!r) return null;
  const t = TIERS.indexOf(r.tier);
  return t >= 7 ? 2800 + r.lp : t * 400 + (DIVS[r.div] ?? 0) * 100 + r.lp;
}
const rankLabel = (r) => (!r ? "Unranked" : TIERS.indexOf(r.tier) >= 7 ? `${r.tier[0] + r.tier.slice(1).toLowerCase()} ${r.lp} LP` : `${r.tier[0] + r.tier.slice(1).toLowerCase()} ${r.div} · ${r.lp} LP`);

function heroSection(g) {
  const k = g.reduce((s, m) => s + m.duo[0].k + m.duo[1].k, 0), d = g.reduce((s, m) => s + m.duo[0].d + m.duo[1].d, 0), a = g.reduce((s, m) => s + m.duo[0].a + m.duo[1].a, 0);
  let streak = 0;
  for (const m of DATA.matches) { if (m.win === DATA.matches[0]?.win) streak++; else break; }
  const rh = DATA.rankHistory || [], cur = rh.at(-1), first = rh[0];
  const ranks = DATA.players.map((p, i) => {
    const r = cur?.ranks?.[i], f = first?.ranks?.[i];
    const delta = r && f ? rankValue(r) - rankValue(f) : null;
    return `<div class="rank"><div><div class="tier">${esc(rankLabel(r))}</div><div class="sub muted">${esc(shortName(p.riotId))}${delta ? ` · <span class="${delta > 0 ? "win" : "loss"}">${signed(delta)} LP</span> since start` : ""}</div></div></div>`;
  }).join("");
  return `<section class="grid g4">
    <div class="card stat"><div class="label">Record</div><div class="value">${wins(g)}<span class="muted"> – </span>${g.length - wins(g)}</div><div class="sub">${g.length} games together</div></div>
    <div class="card stat"><div class="label">Win rate</div><div class="value ${wrClass(wr(g))}">${pct(wr(g))}</div><div class="sub">${DATA.matches.length ? `Current streak: <span class="${DATA.matches[0].win ? "win" : "loss"}">${streak}${DATA.matches[0].win ? "W" : "L"}</span>` : ""}</div></div>
    <div class="card stat"><div class="label">Duo KDA</div><div class="value">${fmt(kda(k, d, a), 2)}</div><div class="sub">${fmt(k / Math.max(1, g.length))} / ${fmt(d / Math.max(1, g.length))} / ${fmt(a / Math.max(1, g.length))} per game</div></div>
    <div class="card stat"><div class="label">Solo/Duo rank</div><div style="margin-top:6px">${ranks}</div></div>
  </section>`;
}

function insightsSection(g) {
  const tags = { good: "Strength", bad: "Improve", info: "Note" };
  return `<section class="card" style="margin-bottom:16px"><h2>What to work on</h2><div class="insights">${insights(g).map((i) => `<div class="insight ${i.type}"><span class="tag">${tags[i.type]}</span><span>${i.text}</span></div>`).join("")}</div></section>`;
}

function chartsSection() {
  return `<section class="grid g2">
    <div class="card"><h2>LP over time</h2><div class="chart-box"><canvas id="lpChart"></canvas></div></div>
    <div class="card"><h2>Win rate trend (rolling 10)</h2><div class="chart-box"><canvas id="wrChart"></canvas></div></div>
  </section>`;
}

function synergySection(g) {
  const rows = groupBy(g, (m) => `${adc(m).champ}|${sup(m).champ}`)
    .sort((a, b) => b.games.length - a.games.length || adjWr(b.games) - adjWr(a.games))
    .map(({ key, games }) => {
      const [a, s] = key.split("|");
      const w = wr(games);
      const dk = avg(games.map((m) => kda(adc(m).k + sup(m).k, adc(m).d + sup(m).d, adc(m).a + sup(m).a)));
      const gd = avg(games.map((m) => m.lane?.gd15));
      return `<tr><td><span class="pair">${champIcon(a)}<span class="plus">+</span>${champIcon(s)}</span> ${esc(champName(a))} + ${esc(champName(s))}</td>
        <td class="num">${games.length}</td><td class="num">${record(games)}</td>
        <td class="num"><span class="${wrClass(w)}">${pct(w)}</span><span class="bar"><i style="width:${Math.round(w * 100)}%"></i></span></td>
        <td class="num">${fmt(dk, 2)}</td><td class="num ${gd > 0 ? "win" : gd < 0 ? "loss" : ""}">${signed(gd)}</td></tr>`;
    }).join("");
  return `<section class="card" style="margin-bottom:16px"><h2>Duo synergies</h2><div class="scroll"><table>
    <thead><tr><th>ADC + Support</th><th class="num">Games</th><th class="num">Record</th><th class="num">Win rate</th><th class="num">Duo KDA</th><th class="num">Lane gold @15</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="6" class="muted">No games yet</td></tr>`}</tbody></table></div></section>`;
}

function matchupTable(g, title, get) {
  const rows = groupBy(g, get).sort((a, b) => b.games.length - a.games.length || wr(a.games) - wr(b.games)).slice(0, 15).map(({ key, games }) => {
    const w = wr(games), gd = avg(games.map((m) => m.lane?.gd15));
    return `<tr><td>${champCell(key)}</td><td class="num">${games.length}</td><td class="num ${wrClass(w)}">${pct(w)}</td><td class="num ${gd > 0 ? "win" : gd < 0 ? "loss" : ""}">${signed(gd)}</td></tr>`;
  }).join("");
  return `<div class="card"><h2>${title}</h2><div class="scroll"><table>
    <thead><tr><th>Enemy</th><th class="num">Games</th><th class="num">Our WR</th><th class="num">Lane gold @15</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="4" class="muted">No data</td></tr>`}</tbody></table></div></div>`;
}

function playerSection(g, i) {
  const p = DATA.players[i];
  const W = g.filter((m) => m.win), L = g.filter((m) => !m.win);
  const me = (m) => m.duo[i];
  const gd15 = (m) => (m.lane ? (isAdc(m, i) ? m.lane.adcGd15 : m.lane.supGd15) : null);
  const d15 = (m) => (m.lane ? (isAdc(m, i) ? m.lane.adcDeaths15 : m.lane.supDeaths15) : null);
  const stats = [
    ["KDA", (x) => avg(x.map((m) => kda(me(m).k, me(m).d, me(m).a))), 2],
    ["Deaths", (x) => avg(x.map((m) => me(m).d)), 1],
    ["Kill participation", (x) => avg(x.map((m) => me(m).kp)), "%"],
    ["CS / min", (x) => avg(x.map((m) => me(m).cs / mins(m))), 1],
    ["CS @ 10", (x) => avg(x.map((m) => me(m).cs10)), 0],
    ["Damage / min", (x) => avg(x.map((m) => me(m).dmg / mins(m))), 0],
    ["Gold / min", (x) => avg(x.map((m) => me(m).gold / mins(m))), 0],
    ["Vision / min", (x) => avg(x.map((m) => me(m).vision / mins(m))), 2],
    ["Control wards", (x) => avg(x.map((m) => me(m).pinks)), 1],
    ["Gold vs opponent @15", (x) => avg(x.map(gd15)), "±"],
    ["Deaths before 15", (x) => avg(x.map(d15)), 1],
  ];
  const cell = (v, f) => (f === "%" ? pct(v) : f === "±" ? signed(v) : fmt(v, f));
  const statRows = stats.map(([name, f, d]) => `<tr><td>${name}</td><td class="num">${cell(f(g), d)}</td><td class="num win">${cell(f(W), d)}</td><td class="num loss">${cell(f(L), d)}</td></tr>`).join("");
  const pool = groupBy(g, (m) => me(m).champ).sort((a, b) => b.games.length - a.games.length).slice(0, 8).map(({ key, games }) => {
    const w = wr(games);
    return `<tr><td>${champCell(key)}</td><td class="num">${games.length}</td><td class="num ${wrClass(w)}">${pct(w)}</td><td class="num">${fmt(avg(games.map((m) => kda(me(m).k, me(m).d, me(m).a))), 2)}</td></tr>`;
  }).join("");
  const roleLabel = p.role === "UTILITY" ? "Support" : p.role === "BOTTOM" ? "ADC" : p.role;
  return `<div class="card"><h2>${esc(shortName(p.riotId))} <span class="muted small">· ${esc(roleLabel)}</span></h2>
    <div class="scroll"><table class="compare"><thead><tr><th></th><th class="num">Avg</th><th class="num">Wins</th><th class="num">Losses</th></tr></thead><tbody>${statRows}</tbody></table></div>
    <h3 style="margin-top:16px">Champion pool</h3>
    <div class="scroll"><table><thead><tr><th>Champion</th><th class="num">Games</th><th class="num">WR</th><th class="num">KDA</th></tr></thead><tbody>${pool}</tbody></table></div>
  </div>`;
}

function breakdownSection(g) {
  const rows = [];
  const row = (label, games) => games.length && rows.push(`<tr><td>${label}</td><td class="num">${games.length}</td><td class="num">${record(games)}</td><td class="num ${wrClass(wr(games))}">${pct(wr(games))}</td></tr>`);
  const head = (t) => rows.push(`<tr><td colspan="4" class="muted small" style="padding-top:14px">${t}</td></tr>`);
  head("Game length");
  row("Under 25 min", g.filter((m) => mins(m) < 25));
  row("25–32 min", g.filter((m) => mins(m) >= 25 && mins(m) < 32));
  row("32+ min", g.filter((m) => mins(m) >= 32));
  head("Lane state at 15 min");
  row("Ahead (> +500g)", g.filter((m) => m.lane?.gd15 > 500));
  row("Even", g.filter((m) => m.lane?.gd15 != null && Math.abs(m.lane.gd15) <= 500));
  row("Behind (< −500g)", g.filter((m) => m.lane?.gd15 < -500));
  head("Objectives");
  row("Got first dragon", g.filter((m) => m.team.firstDragon));
  row("Got first tower", g.filter((m) => m.team.firstTower));
  head("Side");
  row("Blue", g.filter((m) => m.side === "blue"));
  row("Red", g.filter((m) => m.side === "red"));
  head("Session");
  row("1st game", g.filter((m) => m._sessionGame === 1));
  row("2nd–3rd game", g.filter((m) => m._sessionGame === 2 || m._sessionGame === 3));
  row("4th+ game", g.filter((m) => m._sessionGame >= 4));
  row("After a win", g.filter((m) => m._prev === true));
  row("After a loss", g.filter((m) => m._prev === false));
  return `<div class="card"><h2>When do you win?</h2><div class="scroll"><table><tbody>${rows.join("")}</tbody></table></div></div>`;
}

function historySection(g) {
  const list = g.slice(0, HISTORY_SHOWN).map((m) => {
    const d = new Date(m.ts);
    const line = (p) => `<div class="row">${champIcon(p.champ, "sm")}<span class="pair">${p.spells.map(spellIcon).join("")}</span><b>${p.k}/${p.d}/${p.a}</b><span class="muted small">${p.cs} cs · ${p.vision} vs</span><span class="items">${p.items.map(itemIcon).join("")}</span></div>`;
    const e = (p) => (p ? `<div class="row">${champIcon(p.champ, "sm")}<span>${esc(champName(p.champ))}</span><span class="muted small">${p.k}/${p.d}/${p.a}</span></div>` : "");
    return `<div class="match ${m.win ? "w" : "l"}"><div class="strip"></div>
      <div class="meta"><b class="${m.win ? "win" : "loss"}">${m.win ? "Victory" : "Defeat"}</b><span class="muted small">${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span><br><span class="muted small">${Math.floor(m.dur / 60)}:${String(m.dur % 60).padStart(2, "0")}</span></div>
      <div class="side">${line(adc(m))}${line(sup(m))}</div>
      <div class="side vs"><span class="muted small">vs</span>${e(m.enemy.adc)}${e(m.enemy.sup)}</div>
      <div class="lane small"><span class="muted">Lane @15</span><br><b class="${m.lane?.gd15 > 0 ? "win" : m.lane?.gd15 < 0 ? "loss" : ""}">${signed(m.lane?.gd15)}g</b></div>
    </div>`;
  }).join("");
  const more = g.length > HISTORY_SHOWN ? `<button class="btn" id="more">Show more (${g.length - HISTORY_SHOWN} left)</button>` : "";
  return `<section class="card" style="margin-bottom:16px"><h2>Match history</h2>${list || `<p class="muted">No games in this range.</p>`}${more}</section>`;
}

// ---------------------------------------------------------------- charts
function drawCharts(g) {
  if (!window.Chart) return;
  Object.values(charts).forEach((c) => c.destroy());
  Chart.defaults.color = "#8b95a7";
  Chart.defaults.borderColor = "#222c3d";
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  const colors = ["#4c9dff", "#c8aa6e"];
  const since = RANGE === "all" ? 0 : Math.min(...g.map((m) => m.ts), Date.now());
  const rh = (DATA.rankHistory || []).filter((s) => s.ts >= since - 3600000);
  const tierTick = (v) => (v >= 2800 ? "Master+" : `${TIERS[Math.floor(v / 400)]?.[0]}${4 - Math.floor((v % 400) / 100)}`);
  charts.lp = new Chart($("#lpChart"), {
    type: "line",
    data: {
      labels: rh.map((s) => new Date(s.ts).toLocaleDateString(undefined, { month: "short", day: "numeric" })),
      datasets: DATA.players.map((p, i) => ({ label: shortName(p.riotId), data: rh.map((s) => rankValue(s.ranks?.[i])), borderColor: colors[i], backgroundColor: colors[i], pointRadius: 0, borderWidth: 2, tension: 0.25, spanGaps: true })),
    },
    options: {
      maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
      scales: { y: { ticks: { stepSize: 100, callback: tierTick } }, x: { ticks: { maxTicksLimit: 8 } } },
      plugins: { tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${rankLabel((rh[c.dataIndex].ranks || [])[c.datasetIndex])}` } } },
    },
  });
  const chrono = [...g].reverse();
  const roll = chrono.map((_, i) => { const w = chrono.slice(Math.max(0, i - 9), i + 1); return Math.round(wr(w) * 100); });
  charts.wr = new Chart($("#wrChart"), {
    type: "line",
    data: {
      labels: chrono.map((_, i) => i + 1),
      datasets: [
        { label: "Rolling WR", data: roll, borderColor: "#c8aa6e", pointRadius: 3, pointBackgroundColor: chrono.map((m) => (m.win ? "#4c9dff" : "#ef5a5f")), pointBorderWidth: 0, borderWidth: 2, tension: 0.25 },
        { label: "50%", data: chrono.map(() => 50), borderColor: "#3a4458", borderDash: [4, 4], pointRadius: 0, borderWidth: 1 },
      ],
    },
    options: {
      maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
      scales: { y: { min: 0, max: 100, ticks: { callback: (v) => v + "%" } }, x: { title: { display: true, text: "Game #" }, ticks: { maxTicksLimit: 10 } } },
      plugins: { legend: { display: false }, tooltip: { callbacks: { title: (c) => { const m = chrono[c[0].dataIndex]; return `Game ${c[0].dataIndex + 1}: ${m.win ? "W" : "L"} · ${champName(adc(m).champ)} + ${champName(sup(m).champ)}`; }, label: (c) => (c.datasetIndex === 0 ? `Last 10: ${c.raw}%` : null) } } },
    },
  });
}

// ---------------------------------------------------------------- render
function render() {
  const g = filtered();
  annotateSessions(DATA.matches);
  $("#title").textContent = DATA.challengeName || "Duo Q Tracker";
  const start = DATA.startDate ? new Date(DATA.startDate) : null;
  const day = start ? Math.max(1, Math.ceil((Date.now() - start) / 86400000)) : null;
  $("#subtitle").innerHTML = `${DATA.players.map((p) => esc(p.riotId)).join(" &amp; ")}${day ? ` · Day ${day}` : ""}${DATA.updated ? ` · Updated ${new Date(DATA.updated).toLocaleString()}` : ""}`;
  const banner = DATA.demo ? `<div class="banner">This is <b>demo data</b>. Add your API key as a GitHub secret and run the workflow to load your real games.</div>` : "";
  $("#app").innerHTML = banner + heroSection(g) + insightsSection(g) + chartsSection() + synergySection(g)
    + `<section class="grid g2">${matchupTable(g, "vs enemy ADC", (m) => m.enemy.adc?.champ)}${matchupTable(g, "vs enemy support", (m) => m.enemy.sup?.champ)}</section>`
    + `<section class="grid g2">${playerSection(g, 0)}${playerSection(g, 1)}</section>`
    + `<section class="grid g2">${breakdownSection(g)}<div></div></section>`
    + historySection(g);
  $("#more")?.addEventListener("click", () => { HISTORY_SHOWN += 20; render(); });
  drawCharts(g);
}

function emptyState(msg) {
  $("#app").innerHTML = `<div class="card empty"><h2>No data yet</h2><p class="muted">${msg}</p>
    <p class="muted">Run <code>node scripts/demo.mjs</code> for preview data, or set the <code>RIOT_API_KEY</code> secret and run the <b>Update matches</b> workflow.</p></div>`;
}

document.querySelectorAll("#range button").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll("#range button").forEach((x) => x.classList.toggle("on", x === b));
  RANGE = b.dataset.range; HISTORY_SHOWN = 20;
  if (DATA?.matches.length) render();
}));

(async function init() {
  const [res] = await Promise.all([fetch(`data/data.json?t=${Date.now()}`).catch(() => null), loadDDragon()]);
  if (!res || !res.ok) return emptyState("data/data.json wasn't found.");
  DATA = await res.json();
  if (!DATA.matches?.length) return emptyState("No duo games found since the start date yet.");
  render();
})();
