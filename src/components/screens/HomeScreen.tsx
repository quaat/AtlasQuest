import { motion } from "framer-motion";
import { Globe2, BarChart3, Settings, Sparkles, Play } from "lucide-react";
import { useGame } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { CONTINENTS } from "@/data/continents";
import { COUNTRIES } from "@/data/countries";
import { useEffect, useState } from "react";
import { getOverallStats } from "@/lib/db";
import { formatDuration } from "@/lib/scoring";

export function HomeScreen() {
  const goScreen = useGame((s) => s.goScreen);
  const [stats, setStats] = useState<{
    rounds: number;
    wins: number;
    totalTime: number;
    sessions: number;
  } | null>(null);

  useEffect(() => {
    getOverallStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="ambient" />
      <div className="ambient-grid" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 max-w-5xl w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl glass-strong grid place-items-center">
              <Globe2 className="text-cyan-300" size={20} />
            </div>
            <div className="font-display font-extrabold text-lg tracking-tight">
              Atlas<span className="text-cyan-300">Quest</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => goScreen("stats")} iconLeft={<BarChart3 size={14} />}>
              Stats
            </Button>
            <Button variant="ghost" size="sm" onClick={() => goScreen("settings")} iconLeft={<Settings size={14} />}>
              Settings
            </Button>
          </div>
        </div>

        {/* Hero */}
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
          <div>
            <div className="chip mb-5 border-white/10">
              <Sparkles size={12} className="text-amber-300" />
              <span>Map the world, one country at a time</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.04] tracking-tight">
              Master every country
              <br />
              <span className="bg-gradient-to-r from-aurora-teal via-aurora-cyan to-aurora-indigo bg-clip-text text-transparent">
                on the world map.
              </span>
            </h1>
            <p className="mt-5 text-mist-300 text-base sm:text-lg max-w-xl leading-relaxed">
              A beautiful, focused geography game. Pick a continent, find the
              target country, and build real fluency — streak by streak, fact by
              fact.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                iconLeft={<Play size={16} />}
                onClick={() => goScreen("continent-select")}
              >
                Start playing
              </Button>
              <Button
                variant="ghost"
                size="lg"
                iconLeft={<BarChart3 size={16} />}
                onClick={() => goScreen("stats")}
              >
                View progress
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-mist-300">
              <HeroStat label="Continents" value="6" />
              <HeroStat label="Countries" value={COUNTRIES.length} />
              <HeroStat label="Game modes" value="6" />
              {stats && stats.rounds > 0 && (
                <>
                  <HeroStat label="Rounds played" value={stats.rounds} />
                  <HeroStat label="Playtime" value={formatDuration(stats.totalTime)} />
                </>
              )}
            </div>
          </div>

          <HeroOrb />
        </div>

        {/* Feature strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-14">
          <FeaturePill
            emoji="⚡"
            title="Fast sessions"
            body="60-second challenges or classic ten-round rounds."
          />
          <FeaturePill
            emoji="🎯"
            title="Mastery mode"
            body="Weighted reviews of the countries you often miss."
          />
          <FeaturePill
            emoji="🧭"
            title="Discovery mode"
            body="Study freely with synced map/list exploration and country details."
          />
          <FeaturePill
            emoji="🧠"
            title="Learn with facts"
            body="Every correct answer unlocks a discovery card."
          />
          <FeaturePill
            emoji="💾"
            title="Local-first"
            body="All progress stored on-device via SQLite."
          />
        </div>

        {/* Continent showcase */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div className="font-display font-bold text-lg">Choose your quest</div>
            <button
              onClick={() => goScreen("continent-select")}
              className="text-xs text-mist-300 hover:text-white"
            >
              See all →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CONTINENTS.map((c) => (
              <motion.button
                key={c.id}
                whileHover={{ y: -4 }}
                onClick={() => {
                  useGame.getState().selectContinent(c.id);
                }}
                className="glass rounded-2xl p-4 text-left group hover:border-white/20 transition"
                style={{
                  backgroundImage: `radial-gradient(120px 80px at 100% 0%, ${c.accent}22, transparent 60%)`,
                }}
              >
                <div className="text-3xl">{c.emoji}</div>
                <div className="font-semibold mt-2 text-mist-50">{c.name}</div>
                <div className="text-xs text-mist-400 mt-0.5">
                  {c.countryCount} countries
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="display-num font-bold text-mist-50">{value}</span>
      <span className="text-mist-500 text-xs">{label}</span>
    </div>
  );
}

function FeaturePill({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="text-xl">{emoji}</div>
      <div className="mt-1 font-semibold text-sm text-mist-50">{title}</div>
      <div className="text-xs text-mist-400 mt-1 leading-relaxed">{body}</div>
    </div>
  );
}

function HeroOrb() {
  return (
    <div className="relative aspect-square max-w-md mx-auto w-full">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/40 via-indigo-500/25 to-violet-500/30 blur-3xl" />
      <div className="absolute inset-6 rounded-full glass-strong flex items-center justify-center animate-float">
        <svg viewBox="0 0 200 200" className="w-2/3 h-2/3 opacity-90">
          <defs>
            <radialGradient id="orb" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#5EEAD4" />
              <stop offset="55%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="78" fill="url(#orb)" />
          {/* stylized meridians */}
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse
              key={i}
              cx="100"
              cy="100"
              rx={80 - i * 14}
              ry={80}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.7"
            />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse
              key={`lat-${i}`}
              cx="100"
              cy="100"
              rx={80}
              ry={80 - i * 14}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.7"
            />
          ))}
          {/* continent blobs */}
          <g fill="rgba(10,12,20,0.55)" stroke="rgba(255,255,255,0.25)">
            <path d="M60 70 Q72 58 88 64 Q100 68 112 62 Q124 66 120 82 Q116 94 104 96 Q92 92 82 96 Q68 92 62 84 Z" />
            <path d="M118 108 Q132 100 142 112 Q148 124 140 136 Q128 140 118 132 Q114 120 118 108 Z" />
            <path d="M74 120 Q86 114 96 126 Q102 140 92 150 Q80 152 72 142 Q66 130 74 120 Z" />
          </g>
          <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,255,255,0.25)" />
        </svg>
      </div>
    </div>
  );
}
