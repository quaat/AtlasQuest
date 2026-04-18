import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Target, Trophy, ArrowRight, Info } from "lucide-react";
import { useGame } from "@/store/gameStore";
import { formatDuration } from "@/lib/scoring";
import { Button } from "@/components/ui/Button";
import { getContinent } from "@/data/continents";

interface Props {
  onNext: () => void;
}

export function RoundResult({ onNext }: Props) {
  const last = useGame((s) => s.lastRound);
  const target = useGame((s) => s.targetCountry);
  const continent = useGame((s) => s.continent);
  const solved = useGame((s) => s.solved);
  const revealed = useGame((s) => s.revealed);

  const showPanel = (solved || revealed) && last && target;
  if (!showPanel) return null;
  const meta = continent ? getContinent(continent) : null;

  return (
    <AnimatePresence>
      {showPanel && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="glass-strong rounded-2xl p-5 relative overflow-hidden"
        >
          <div
            className="absolute -inset-10 opacity-30 blur-3xl pointer-events-none"
            style={{
              background: last.solved
                ? "radial-gradient(340px 200px at 80% 0%, rgba(52,211,153,0.45), transparent 60%)"
                : "radial-gradient(340px 200px at 80% 0%, rgba(251,113,133,0.35), transparent 60%)",
            }}
          />
          <div className="relative flex items-start gap-3">
            <div
              className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${
                last.solved
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {last.solved ? <Check size={20} /> : <X size={20} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h3 className="font-display text-2xl font-extrabold leading-tight">
                  {last.solved ? "Nailed it!" : "Not quite."}
                </h3>
                <span className="text-mist-400 text-sm">
                  {last.solved ? (
                    <>
                      Grade <span className="display-num font-bold">{last.score.grade}</span>
                    </>
                  ) : (
                    "Keep going — you’ll learn it."
                  )}
                </span>
              </div>
              <div className="text-sm text-mist-300 mt-1 flex items-center gap-2">
                <span aria-hidden>{target.flag}</span>
                <span>
                  <strong className="text-mist-50">{target.name}</strong>
                  {" · "}
                  Capital: <span className="text-mist-100">{target.capital}</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <Stat
                  icon={<Clock size={14} />}
                  label="Time"
                  value={formatDuration(last.timeMs)}
                />
                <Stat
                  icon={<Target size={14} />}
                  label="Guesses"
                  value={last.guesses}
                />
                <Stat
                  icon={<Trophy size={14} />}
                  label="Score"
                  value={last.score.total.toLocaleString()}
                  tint={last.solved ? "#34D399" : undefined}
                />
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 flex gap-2">
                <Info size={14} className="text-cyan-300 shrink-0 mt-0.5" />
                <div className="text-xs text-mist-300 leading-relaxed">
                  {target.fact}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-mist-400">
                  {meta && (
                    <>
                      Keep going on <span className="text-mist-200">{meta.name}</span>.
                    </>
                  )}
                </div>
                <Button variant="primary" size="md" onClick={onNext} iconRight={<ArrowRight size={14} />}>
                  Next country
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tint?: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
      <div className="text-[10px] uppercase tracking-[0.15em] text-mist-400 flex items-center gap-1.5">
        {icon} {label}
      </div>
      <div
        className="display-num text-lg font-bold mt-0.5"
        style={tint ? { color: tint } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
