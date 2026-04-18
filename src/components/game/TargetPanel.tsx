import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Lightbulb, HelpCircle } from "lucide-react";
import { useGame } from "@/store/gameStore";
import { getContinent } from "@/data/continents";
import { speakCountryName } from "@/lib/utils";
import { useSettings } from "@/store/settingsStore";
import { useState } from "react";

export function TargetPanel() {
  const target = useGame((s) => s.targetCountry);
  const guesses = useGame((s) => s.guesses);
  const wrong = useGame((s) => s.wrongGuesses);
  const mode = useGame((s) => s.mode);
  const continent = useGame((s) => s.continent);
  const reveal = useGame((s) => s.reveal);
  const revealed = useGame((s) => s.revealed);
  const solved = useGame((s) => s.solved);
  const { hintsEnabled } = useSettings();
  const [hintLevel, setHintLevel] = useState(0);

  if (!target || !continent) return null;
  const meta = getContinent(continent);

  const canHint = hintsEnabled && (mode === "practice" || mode === "classic" || mode === "mastery");
  const showCapital = hintLevel >= 1 && canHint;
  const showFirstLetter = hintLevel >= 2 && canHint;

  return (
    <div className="glass-strong rounded-2xl p-4 sm:p-5 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(320px 200px at 100% 0%, ${meta.accent}44, transparent 60%)`,
        }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-mist-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-aurora-cyan animate-pulse" />
            Find this country
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={target.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-2 flex items-center gap-3"
            >
              <div className="text-3xl" aria-hidden>
                {target.flag}
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight truncate">
                  {target.name}
                </h2>
                {target.shortName && (
                  <div className="text-xs text-mist-400 mt-0.5">
                    also known as {target.shortName}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              className="chip hover:bg-white/10 transition"
              onClick={() => speakCountryName(target.name)}
              aria-label="Pronounce country name"
            >
              <Volume2 size={12} /> Pronounce
            </button>
            {canHint && (
              <button
                className="chip border-amber-400/30 text-amber-200 bg-amber-500/10 hover:bg-amber-500/20"
                onClick={() => setHintLevel((l) => Math.min(2, l + 1))}
                disabled={hintLevel >= 2}
              >
                <Lightbulb size={12} /> Hint{hintLevel >= 2 ? " (max)" : ""}
              </button>
            )}
            {!solved && !revealed && wrong.length >= 2 && (
              <button
                className="chip hover:bg-white/10 transition"
                onClick={reveal}
              >
                <HelpCircle size={12} /> Reveal answer
              </button>
            )}
          </div>

          <AnimatePresence>
            {(showCapital || showFirstLetter) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 rounded-lg border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-100"
              >
                {showCapital && (
                  <div>
                    💡 The capital is{" "}
                    <span className="font-semibold">{target.capital}</span>.
                  </div>
                )}
                {showFirstLetter && (
                  <div className="mt-1">
                    🔤 It starts with{" "}
                    <span className="font-semibold display-num">
                      {target.name[0]}
                    </span>
                    .
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden sm:flex flex-col items-end shrink-0 gap-1">
          <div className="text-[10px] uppercase tracking-[0.15em] text-mist-400">
            Guesses
          </div>
          <div className="display-num text-2xl font-bold">{guesses}</div>
          {wrong.length > 0 && (
            <div className="text-xs text-rose-300 mt-1">
              {wrong.length} wrong
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
