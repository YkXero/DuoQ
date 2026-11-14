import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Champions } from "./components/champions/Champions.tsx";
import { Coach } from "./components/coach/Coach.tsx";
import { GlobalFilters } from "./components/GlobalFilters.tsx";
import { MatchHistory } from "./components/history/MatchHistory.tsx";
import { Overview } from "./components/overview/Overview.tsx";
import { PlayerCards } from "./components/PlayerCards.tsx";
import { Stats } from "./components/stats/Stats.tsx";
import { Tabs } from "./components/ui/Controls.tsx";
import { spring } from "./lib/motion.ts";
import { AppProvider, useApp, useLoader } from "./state.tsx";

type Tab = "overview" | "history" | "stats" | "champions" | "coach";
const TABS: { value: Tab; label: string }[] = [
  { value: "overview", label: "Overview" }, { value: "history", label: "Match history" }, { value: "stats", label: "Stats & progress" },
  { value: "champions", label: "Champions & synergy" }, { value: "coach", label: "Coach" },
];
const initialTab = (): Tab => (TABS.find((t) => t.value === location.hash.slice(1))?.value ?? "overview");

function Shell({ demo, setDemo }: { demo: boolean; setDemo: (v: boolean) => void }) {
  const { games, data } = useApp();
  const [tab, setTab] = useState<Tab>(initialTab);
  useEffect(() => { history.replaceState(null, "", `#${tab}`); }, [tab]);
  return (
    <main className="wrap">
      {demo && (
        <div className="banner" style={{ marginTop: 16 }}>
          <span>You're viewing <b>demo data</b>. Real games appear once you've played together.</span>
          <button className="btn" onClick={() => setDemo(false)}>Back to real data</button>
        </div>
      )}
      <PlayerCards />
      <div className="row wrap-row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
        <GlobalFilters />
        <span className="small muted">{games.length} of {data.matches.length} games</span>
      </div>
      <div style={{ marginTop: 12 }}><Tabs value={tab} onChange={setTab} options={TABS} /></div>
      {games.length === 0 ? <div className="card empty muted">No games for these filters.</div> : (
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ y: 8 }} animate={{ y: 0 }} exit={{ opacity: 0, y: -6 }} transition={spring.smooth}>
            {tab === "overview" && <Overview />}
            {tab === "history" && <MatchHistory />}
            {tab === "stats" && <Stats />}
            {tab === "champions" && <Champions />}
            {tab === "coach" && <Coach />}
          </motion.div>
        </AnimatePresence>
      )}
    </main>
  );
}

export function App() {
  const [demo, setDemo] = useState(() => new URLSearchParams(location.search).has("demo"));
  const { state, retry } = useLoader(demo);
  const setDemoUrl = (v: boolean) => {
    const u = new URL(location.href);
    if (v) u.searchParams.set("demo", ""); else u.searchParams.delete("demo");
    history.replaceState(null, "", u);
    setDemo(v);
  };
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <div className="brand"><img src={`${import.meta.env.BASE_URL}assets/lol-icon.png`} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />Duo Q Tracker <span className="sub">ADC + Support</span></div>
        </div>
      </header>
      {state.status === "loading" && (
        <main className="wrap" style={{ paddingTop: 20 }}>
          <div className="hero">{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 104 }} />)}</div>
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 96, marginBottom: 8 }} />)}
        </main>
      )}
      {state.status === "empty" && (
        <main className="wrap">
          <motion.div className="card empty" style={{ marginTop: 40 }} initial={{ scale: 0.97 }} animate={{ scale: 1 }} transition={spring.gentle}>
            <h2 style={{ marginTop: 0 }}>No games yet</h2>
            <p className="muted">{state.reason} New games show up here within about 30 minutes of finishing.</p>
            <button className="btn primary" onClick={() => setDemoUrl(true)}>Preview with demo data</button>
          </motion.div>
        </main>
      )}
      {state.status === "error" && (
        <main className="wrap">
          <div className="card empty" style={{ marginTop: 40 }}>
            <h2 style={{ marginTop: 0 }}>Couldn't load your games</h2>
            <p className="muted">The page couldn't read the match data ({state.reason}). Check your connection and try again.</p>
            <button className="btn primary" onClick={retry}>Try again</button>
          </div>
        </main>
      )}
      {state.status === "ready" && (
        <AppProvider data={state.data} goals={state.goals}>
          <Shell demo={demo} setDemo={setDemoUrl} />
        </AppProvider>
      )}
      <footer>Duo Q Tracker isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends.</footer>
    </>
  );
}
