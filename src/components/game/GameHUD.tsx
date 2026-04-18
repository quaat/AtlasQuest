import { useEffect, useState } from "react";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { useGame } from "@/store/gameStore";
import { formatDuration } from "@/lib/scoring";
import { Button } from "@/components/ui/Button";
import { getContinent } from "@/data/continents";
import { motion } from "framer-motion";

export function GameHUD() {
  const mode = useGame((s) => s.mode);
  const continent = useGame((s) => s.continent);
  const startedAt = useGame((s) => s.sessionStartedAt);
  const roundStart = useGame((s) => s.roundStartedAt);
  const timedStart = useGame((s) => s.timedStartedAt);
  const timedLimit = useGame((s) => s.timedLimitMs);
  const goHome = useGame((s) => s.goHome);
  const endSessionNow = useGame((s) => s.endSessionNow);
  const tickTimer = useGame((s) => s.tickTimer);
  const streak = useGame((s) => s.sessionStreak);
  const score = useGame((s) => s.sessionScore);
  const roundsPlayed = useGame((s) => s.sessionRoundsPlayed);
  const sessionRoundsWon = useGame((s) => s.sessionRoundsWon);
  const solved = useGame((s) => s.solved);
  const revealed = useGame((s) => s.revealed);

  const [now, setNow] = useState(Date.now());
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setNow(Date.now());
      if (mode === "timed") tickTimer();
    }, 200);
    return () => window.clearInterval(id);
  }, [paused, mode, tickTimer]);

  if (!continent || !mode) return null;
  const meta = getContinent(continent);

  const roundElapsed = roundStart && !solved && !revealed ? now - roundStart : 0;
  const timedRemaining =
    mode === "timed" && timedStart ? Math.max(0, timedLimit - (now - timedStart)) : null;
  const timedProgress =
    mode === "timed" && timedStart ? 1 - timedRemaining! / timedLimit : 0;

  const accuracy = roundsPlayed > 0 ? Math.round((sessionRoundsWon / roundsPlayed) * 100) : null;

  return (
    <div className="glass rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-2 sm:gap-3">
      <Button variant="ghost" size="sm" onClick={goHome} iconLeft={<ArrowLeft size={14} />}>
        Exit
      </Button>
      <div className="hidden sm:flex items-center gap-2 pl-2">
        <span className="text-xl" aria-hidden>{meta.emoji}</span>
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-mist-400 leading-none">
            {mode}
          </div>
          <div className="font-semibold text-sm leading-tight">{meta.name}</div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3 sm:gap-4">
        <Stat label="Score" value={score.toLocaleString()} tint="#22D3EE" />
        {mode === "streak" && (
          <Stat label="Streak" value={`${streak}🔥`} tint="#FB7185" />
        )}
        {mode === "classic" && (
          <Stat label="Round" value={`${Math.min(roundsPlayed + (solved||revealed?0:1), 10)}/10`} />
        )}
        {accuracy !== null && (
          <Stat label="Accuracy" value={`${accuracy}%`} tint="#34D399" />
        )}
        {mode === "timed" ? (
          <div className="min-w-[88px]">
            <div className="text-[10px] uppercase tracking-[0.15em] text-mist-400 leading-none">
              Time
            </div>
            <div className="display-num font-bold text-sm mt-0.5" style={{color: timedRemaining! < 15000 ? "#FB7185" : "#FBBF24"}}>
              {formatDuration(timedRemaining ?? 0)}
            </div>
            <div className="h-1 mt-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: timedRemaining! < 15000
                    ? "linear-gradient(90deg,#FB7185,#E11D48)"
                    : "linear-gradient(90deg,#FBBF24,#F97316)",
                }}
                animate={{ width: `${(1 - timedProgress) * 100}%` }}
                transition={{ duration: 0.2, ease: "linear" }}
              />
            </div>
          </div>
        ) : (
          <Stat
            label="Round time"
            value={roundElapsed ? formatDuration(roundElapsed) : "0s"}
            tint={roundElapsed > 10_000 ? "#FBBF24" : undefined}
          />
        )}
      </div>

      <div className="hidden md:flex gap-1.5 pl-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPaused((p) => !p)}
          iconLeft={paused ? <Play size={12} /> : <Pause size={12} />}
        >
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => void endSessionNow()}>
          End session
        </Button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tint,
}: {
  label: string;
  value: React.ReactNode;
  tint?: string;
}) {
  return (
    <div className="min-w-0 hidden xs:block sm:block">
      <div className="text-[10px] uppercase tracking-[0.15em] text-mist-400 leading-none">
        {label}
      </div>
      <div
        className="display-num font-bold text-sm mt-0.5"
        style={tint ? { color: tint } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
