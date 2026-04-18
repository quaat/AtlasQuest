import { motion } from "framer-motion";
import { Home, RotateCcw, BarChart3, Trophy, Flame, Target, Clock } from "lucide-react";
import { useGame } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { Card, Stat } from "@/components/ui/Card";
import { formatDuration } from "@/lib/scoring";
import { getContinent } from "@/data/continents";
import { getCountryById } from "@/data/countries";
import { ProgressRing } from "@/components/ui/ProgressRing";

export function SessionSummaryScreen() {
  const history = useGame((s) => s.sessionHistory);
  const score = useGame((s) => s.sessionScore);
  const roundsPlayed = useGame((s) => s.sessionRoundsPlayed);
  const roundsWon = useGame((s) => s.sessionRoundsWon);
  const totalTime = useGame((s) => s.sessionTotalTime);
  const totalGuesses = useGame((s) => s.sessionTotalGuesses);
  const bestStreak = useGame((s) => s.sessionBestStreak);
  const continent = useGame((s) => s.continent);
  const mode = useGame((s) => s.mode);
  const startSession = useGame((s) => s.startSession);
  const goHome = useGame((s) => s.goHome);
  const goScreen = useGame((s) => s.goScreen);

  const meta = continent ? getContinent(continent) : null;
  const accuracy = roundsPlayed ? Math.round((roundsWon / roundsPlayed) * 100) : 0;
  const avgTime = roundsWon ? totalTime / roundsWon : 0;
  const avgGuesses = roundsPlayed ? totalGuesses / roundsPlayed : 0;

  const misses = history.filter((h) => !h.solved);

  return (
    <div className="relative min-h-screen px-5 py-10">
      <div className="ambient" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="chip mb-5 border-amber-400/30 bg-amber-500/10 text-amber-200">
            <Trophy size={12} /> Session complete
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
            {accuracy >= 90 ? "Mapmaker in the making." : accuracy >= 70 ? "Solid exploration." : "Every round counts."}
          </h1>
          <p className="mt-3 text-mist-300">
            {meta && (
              <>
                {mode ? <span className="capitalize">{mode}</span> : null} · {meta.name}{" "}
                <span className="text-mist-500">
                  — your results below.
                </span>
              </>
            )}
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-4">
          <Card className="flex items-center gap-6">
            <ProgressRing
              value={accuracy / 100}
              size={130}
              stroke={12}
              color="#22D3EE"
              label={`${accuracy}%`}
              sublabel="Accuracy"
            />
            <div>
              <div className="font-display text-2xl font-extrabold display-num">
                {score.toLocaleString()}
              </div>
              <div className="text-xs text-mist-400 uppercase tracking-[0.15em]">
                Total score
              </div>
              <div className="mt-3 text-sm text-mist-300">
                {roundsWon}/{roundsPlayed} correct
              </div>
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-3 gap-4">
              <Stat
                label="Best streak"
                value={<><Flame className="inline" size={16}/> {bestStreak}</>}
                tint="#FB7185"
              />
              <Stat
                label="Avg time"
                value={<><Clock className="inline" size={14}/> {formatDuration(avgTime)}</>}
                tint="#FBBF24"
              />
              <Stat
                label="Avg guesses"
                value={<><Target className="inline" size={14}/> {avgGuesses.toFixed(1)}</>}
                tint="#A78BFA"
              />
            </div>
            <div className="mt-4 text-sm text-mist-300">
              Total playtime this session: <span className="display-num font-semibold text-mist-50">{formatDuration(totalTime)}</span>
            </div>
          </Card>
        </div>

        {/* Round-by-round */}
        <Card className="mt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Round-by-round</div>
              <div className="text-xs text-mist-400">Your last {history.length} attempts</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {history.map((r, i) => (
              <div
                key={i}
                className={`rounded-lg border p-2 min-w-[120px] ${
                  r.solved
                    ? "border-emerald-400/30 bg-emerald-500/10"
                    : "border-rose-400/30 bg-rose-500/10"
                }`}
              >
                <div className="flex items-center justify-between text-xs text-mist-300">
                  <span>#{i + 1}</span>
                  <span className="display-num">{formatDuration(r.timeMs)}</span>
                </div>
                <div className="font-semibold text-sm text-mist-50 mt-1 truncate">
                  {getCountryById(r.targetId)?.flag ?? "🌍"} {r.targetName}
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className={r.solved ? "text-emerald-200" : "text-rose-200"}>
                    {r.solved ? "Correct" : "Revealed"}
                  </span>
                  <span className="text-mist-400 display-num">
                    {r.guesses} try{r.guesses === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-sm text-mist-400">No rounds completed.</div>
            )}
          </div>
        </Card>

        {misses.length > 0 && (
          <Card className="mt-4">
            <div className="text-sm font-semibold">Countries to review</div>
            <div className="text-xs text-mist-400">
              These gave you the most trouble — Mastery mode will prioritize them.
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {misses.map((m) => {
                const c = getCountryById(m.targetId);
                return c ? (
                  <div
                    key={m.targetId}
                    className="chip border-white/10 bg-white/5 text-mist-100 text-xs"
                  >
                    <span>{c.flag}</span> {c.name}
                  </div>
                ) : null;
              })}
            </div>
          </Card>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="lg"
            iconLeft={<RotateCcw size={16} />}
            onClick={() => void startSession()}
          >
            Play again
          </Button>
          <Button
            variant="ghost"
            size="lg"
            iconLeft={<BarChart3 size={16} />}
            onClick={() => goScreen("stats")}
          >
            See all-time stats
          </Button>
          <Button variant="ghost" size="lg" iconLeft={<Home size={16} />} onClick={goHome}>
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
