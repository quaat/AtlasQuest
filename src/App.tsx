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

  useEffect(() => {
    // Warm SQLite up early so the first session insert is fast
    void getDb();
  }, []);

  return (
    <div className="relative min-h-screen bg-ink-950 text-mist-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="min-h-screen"
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
