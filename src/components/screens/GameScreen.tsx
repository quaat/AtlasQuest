import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/store/gameStore";
import { ContinentMap } from "@/components/map/ContinentMap";
import { CountryList } from "@/components/map/CountryList";
import { TargetPanel } from "@/components/game/TargetPanel";
import { GameHUD } from "@/components/game/GameHUD";
import { RoundResult } from "@/components/game/RoundResult";
import { Confetti } from "@/components/ui/Confetti";
import { sfx } from "@/lib/audio";
import { haptic } from "@/store/settingsStore";

export function GameScreen() {
  const continent = useGame((s) => s.continent);
  const target = useGame((s) => s.targetCountry);
  const wrongGuesses = useGame((s) => s.wrongGuesses);
  const solved = useGame((s) => s.solved);
  const revealed = useGame((s) => s.revealed);
  const guess = useGame((s) => s.guess);
  const nextRound = useGame((s) => s.nextRound);

  const [hovered, setHovered] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);

  // When a correct answer lands, fire confetti + fanfare
  useEffect(() => {
    if (solved) {
      setConfetti(true);
      sfx.correct();
      setTimeout(() => sfx.fanfare(), 140);
      haptic([30, 40, 50]);
    }
  }, [solved]);

  useEffect(() => {
    // reset confetti when new round starts
    if (!solved && !revealed) setConfetti(false);
  }, [solved, revealed, target?.id]);

  const onSelect = (id: string) => {
    const result = guess(id);
    if (result === "wrong") {
      sfx.wrong();
      haptic(14);
    } else if (result === "repeat") {
      sfx.tap();
    } else if (result === "correct") {
      // handled by effect above
    }
  };

  const hintId = useMemo(() => {
    // provide gentle hint by flashing the target after many wrongs
    if (!target || solved) return null;
    if (wrongGuesses.length >= 4) return target.id;
    return null;
  }, [wrongGuesses.length, target, solved]);

  if (!continent) return null;

  const solvedId = solved ? target?.id ?? null : null;
  const revealedId = revealed ? target?.id ?? null : null;

  return (
    <div className="relative min-h-screen flex flex-col px-3 sm:px-5 py-3 sm:py-5">
      <div className="ambient pointer-events-none" />
      <Confetti run={confetti} onDone={() => setConfetti(false)} />

      <div className="relative z-10">
        <GameHUD />
      </div>

      <div className="relative z-10 mt-3 sm:mt-4 grid gap-3 sm:gap-4 flex-1 grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3 sm:gap-4 min-h-0">
          <TargetPanel />
          <motion.div
            layout
            className="glass rounded-2xl overflow-hidden flex-1 min-h-[320px] sm:min-h-[520px] relative"
          >
            <ContinentMap
              continent={continent}
              targetId={target?.id}
              wrongIds={wrongGuesses}
              solvedId={solvedId}
              revealedId={revealedId}
              hintId={hintId}
              hoveredId={hovered}
              onHover={setHovered}
              onSelect={onSelect}
              focusId={focus}
            />
          </motion.div>

          <RoundResult onNext={nextRound} />
        </div>

        <aside className="glass rounded-2xl overflow-hidden h-full min-h-[240px] flex flex-col lg:max-h-[calc(100vh-120px)]">
          <CountryList
            continent={continent}
            wrongIds={wrongGuesses}
            correctId={solvedId}
            revealedId={revealedId}
            hoveredId={hovered}
            onHover={setHovered}
            onSelect={onSelect}
            onFocus={setFocus}
            disabled={solved || revealed}
          />
        </aside>
      </div>
    </div>
  );
}
