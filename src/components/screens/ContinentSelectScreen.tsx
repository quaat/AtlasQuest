import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CONTINENTS } from "@/data/continents";
import { useGame } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { getContinentStats } from "@/lib/db";

export function ContinentSelectScreen() {
  const selectContinent = useGame((s) => s.selectContinent);
  const goHome = useGame((s) => s.goHome);
  const [statsByContinent, setStatsByContinent] = useState<Record<string, { plays: number; bestMs: number | null }>>({});

  useEffect(() => {
    getContinentStats()
      .then((rows) => {
        const map: Record<string, { plays: number; bestMs: number | null }> = {};
        rows.forEach((r) => {
          map[r.continent] = { plays: r.rounds_played, bestMs: r.best_time_ms };
        });
        setStatsByContinent(map);
      })
      .catch(() => setStatsByContinent({}));
  }, []);

  return (
    <div className="relative min-h-screen px-5 py-10">
      <div className="ambient" />
      <div className="ambient-grid" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={goHome} iconLeft={<ArrowLeft size={14} />}>
            Home
          </Button>
          <div className="chip">Step 1 of 2 · Continent</div>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight"
        >
          Pick your playground.
        </motion.h2>
        <p className="text-mist-300 mt-2 max-w-2xl">
          Each continent has its own rhythm — Europe is dense and detail-rich,
          Africa is vast, Oceania is scattered. Start where it sparks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {CONTINENTS.map((c, idx) => {
            const s = statsByContinent[c.id];
            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx, duration: 0.35 }}
                whileHover={{ y: -4 }}
                onClick={() => selectContinent(c.id)}
                className="group relative glass rounded-2xl p-5 text-left overflow-hidden hover:border-white/20 transition"
              >
                <div
                  className="absolute -inset-1 opacity-40 blur-2xl transition group-hover:opacity-70"
                  style={{
                    background: `radial-gradient(220px 160px at 80% 10%, ${c.accent}55, transparent 60%)`,
                  }}
                />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="text-4xl">{c.emoji}</div>
                    <div className="mt-3 font-display text-xl font-bold">{c.name}</div>
                    <div className="text-xs text-mist-400">{c.tagline}</div>
                  </div>
                  <div
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold border"
                    style={{
                      background: `${c.accent}14`,
                      borderColor: `${c.accent}55`,
                      color: c.accent,
                    }}
                  >
                    {c.countryCount} countries
                  </div>
                </div>
                <p className="relative mt-4 text-sm text-mist-300 leading-relaxed">
                  {c.description}
                </p>
                <div className="relative mt-5 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-mist-400">
                    <span>
                      {s?.plays
                        ? `${s.plays} rounds played`
                        : "Not yet played"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-mist-300 group-hover:text-white transition">
                    Start <ArrowRight size={14} />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
