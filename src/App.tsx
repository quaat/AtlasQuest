import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useGame } from "@/store/gameStore";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { ContinentSelectScreen } from "@/components/screens/ContinentSelectScreen";
import { ModeSelectScreen } from "@/components/screens/ModeSelectScreen";
import { GameScreen } from "@/components/screens/GameScreen";
import { SessionSummaryScreen } from "@/components/screens/SessionSummaryScreen";
import { StatsScreen } from "@/components/screens/StatsScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { getDb } from "@/lib/db";

export default function App() {
  const screen = useGame((s) => s.screen);
  const flushHomeReset = useGame((s) => s.flushHomeReset);
  const viewportLocked = screen === "game";

  useEffect(() => {
    // Warm SQLite up early so the first session insert is fast
    void getDb();
  }, []);

  return (
    <div
      className={`relative bg-ink-950 text-mist-50 ${
        viewportLocked ? "h-[100dvh] overflow-hidden" : "min-h-screen"
      }`}
    >
      <AnimatePresence mode="wait" onExitComplete={flushHomeReset}>
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={viewportLocked ? "h-full min-h-0" : "min-h-screen"}
        >
          {screen === "home" && <HomeScreen />}
          {screen === "continent-select" && <ContinentSelectScreen />}
          {screen === "mode-select" && <ModeSelectScreen />}
          {screen === "game" && <GameScreen />}
          {screen === "session-summary" && <SessionSummaryScreen />}
          {screen === "stats" && <StatsScreen />}
          {screen === "settings" && <SettingsScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
