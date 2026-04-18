import { motion } from "framer-motion";
import {
  ArrowLeft,
  Timer,
  Flame,
  BookOpen,
  Target,
  Rocket,
} from "lucide-react";
import { useGame, type GameMode } from "@/store/gameStore";
import { getContinent } from "@/data/continents";
import { Button } from "@/components/ui/Button";

interface ModeInfo {
  id: GameMode;
  name: string;
  tagline: string;
  icon: React.ReactNode;
  body: string;
  accent: string;
}

const MODES: ModeInfo[] = [
  {
    id: "classic",
    name: "Classic",
    tagline: "10 rounds, any pace",
    icon: <Rocket size={18} />,
    body: "Ten carefully-picked countries. Take your time, rack up a high score.",
    accent: "#22D3EE",
  },
  {
    id: "timed",
    name: "Timed Challenge",
    tagline: "90 seconds · beat the clock",
    icon: <Timer size={18} />,
    body: "How many can you nail before the timer runs out?",
    accent: "#FBBF24",
  },
  {
    id: "streak",
    name: "Streak",
    tagline: "3 strikes and you're out",
    icon: <Flame size={18} />,
    body: "Keep your streak alive. Three wrong guesses in a round ends the run.",
    accent: "#FB7185",
  },
  {
    id: "practice",
    name: "Practice",
    tagline: "Zero pressure · relaxed",
    icon: <BookOpen size={18} />,
    body: "No timer, no scoring — just learn the map with helpful hints.",
    accent: "#A78BFA",
  },
  {
    id: "mastery",
    name: "Mastery Review",
    tagline: "Weak spots on loop",
    icon: <Target size={18} />,
    body: "Prioritizes countries you've struggled with most. Smart spaced repetition.",
    accent: "#34D399",
  },
];

export function ModeSelectScreen() {
  const continent = useGame((s) => s.continent);
  const selectMode = useGame((s) => s.selectMode);
  const startSession = useGame((s) => s.startSession);
  const goScreen = useGame((s) => s.goScreen);
  const mode = useGame((s) => s.mode);

  if (!continent) return null;
  const meta = getContinent(continent);

  return (
    <div className="relative min-h-screen px-5 py-10">
      <div className="ambient" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => goScreen("continent-select")} iconLeft={<ArrowLeft size={14} />}>
            Change continent
          </Button>
          <div className="chip">Step 2 of 2 · Mode</div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">{meta.emoji}</div>
          <div>
            <div className="text-xs uppercase tracking-[0.15em] text-mist-400">
              Continent
            </div>
            <div className="font-display font-bold text-xl">{meta.name}</div>
          </div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight"
        >
          How do you want to play?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          {MODES.map((m, i) => {
            const active = mode === m.id;
            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2 }}
                onClick={() => selectMode(m.id)}
                className={`relative text-left rounded-2xl p-5 transition glass hover:border-white/20 ${
                  active ? "ring-2 ring-aurora-cyan/60 border-white/20" : ""
                }`}
              >
                <div
                  className="absolute inset-x-0 top-0 h-[2px] opacity-70 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, transparent, ${m.accent}, transparent)` }}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-9 w-9 rounded-lg grid place-items-center"
                      style={{ background: `${m.accent}22`, color: m.accent }}
                    >
                      {m.icon}
                    </div>
                    <div>
                      <div className="font-display font-bold text-base">{m.name}</div>
                      <div className="text-xs text-mist-400">{m.tagline}</div>
                    </div>
                  </div>
                  {active && (
                    <div className="chip border-cyan-400/30 text-cyan-200">
                      Selected
                    </div>
                  )}
                </div>
                <p className="text-sm text-mist-300 mt-3 leading-relaxed">
                  {m.body}
                </p>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" size="lg" onClick={() => goScreen("continent-select")}>
            Back
          </Button>
          <Button
            variant="primary"
            size="lg"
            disabled={!mode}
            onClick={() => startSession()}
          >
            Begin {meta.name} →
          </Button>
        </div>
      </div>
    </div>
  );
}
