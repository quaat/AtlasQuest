import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Tag } from "lucide-react";
import { useGame } from "@/store/gameStore";
import { useSettings, haptic } from "@/store/settingsStore";
import { ContinentMap } from "@/components/map/ContinentMap";
import { CountryList } from "@/components/map/CountryList";
import { TargetPanel } from "@/components/game/TargetPanel";
import { GameHUD } from "@/components/game/GameHUD";
import { RoundResult } from "@/components/game/RoundResult";
import { CountryDetailsPanel } from "@/components/game/CountryDetailsPanel";
import { Confetti } from "@/components/ui/Confetti";
import { Button } from "@/components/ui/Button";
import { getCountryById } from "@/data/countries";
import { getContinent } from "@/data/continents";
import { getModeCapabilities } from "@/lib/modeCapabilities";
import { sfx } from "@/lib/audio";

const DISCOVERY_DETAILS_MIN_HEIGHT = 170;
const DISCOVERY_LIST_MIN_HEIGHT = 190;

export function GameScreen() {
  const mode = useGame((s) => s.mode);
  const continent = useGame((s) => s.continent);
  const target = useGame((s) => s.targetCountry);
  const wrongGuesses = useGame((s) => s.wrongGuesses);
  const solved = useGame((s) => s.solved);
  const revealed = useGame((s) => s.revealed);
  const guess = useGame((s) => s.guess);
  const nextRound = useGame((s) => s.nextRound);
  const goScreen = useGame((s) => s.goScreen);

  const showLabels = useSettings((s) => s.showLabels);
  const setShowLabels = useSettings((s) => s.setShowLabels);

  const [sharedHoverId, setSharedHoverId] = useState<string | null>(null);
  const [mapFocusId, setMapFocusId] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [detailsPanelHeight, setDetailsPanelHeight] = useState(236);
  const [isResizingDiscoveryPanels, setIsResizingDiscoveryPanels] = useState(false);

  const discoveryAsideRef = useRef<HTMLElement | null>(null);

  const capabilities = useMemo(() => getModeCapabilities(mode), [mode]);

  // When a correct answer lands, fire confetti + fanfare.
  useEffect(() => {
    if (solved && !capabilities.isDiscovery) {
      setConfetti(true);
      sfx.correct();
      setTimeout(() => sfx.fanfare(), 140);
      haptic([30, 40, 50]);
    }
  }, [solved, capabilities.isDiscovery]);

  useEffect(() => {
    // reset confetti when new round starts
    if (!solved && !revealed) setConfetti(false);
  }, [solved, revealed, target?.id]);

  useEffect(() => {
    setSharedHoverId(null);
    setMapFocusId(null);
    setSelectedCountryId(null);
    setDetailsPanelHeight(236);
  }, [continent, mode]);

  useEffect(() => {
    if (!isResizingDiscoveryPanels) return;

    const onPointerMove = (event: PointerEvent) => {
      const container = discoveryAsideRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const maxHeight = rect.height - DISCOVERY_LIST_MIN_HEIGHT;
      if (maxHeight <= DISCOVERY_DETAILS_MIN_HEIGHT) return;

      const nextHeight = Math.min(
        maxHeight,
        Math.max(DISCOVERY_DETAILS_MIN_HEIGHT, event.clientY - rect.top),
      );
      setDetailsPanelHeight(nextHeight);
    };

    const onPointerUp = () => setIsResizingDiscoveryPanels(false);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isResizingDiscoveryPanels]);

  const onGuessSelect = (id: string) => {
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

  const selectedCountry = useMemo(() => {
    if (!selectedCountryId) return null;
    return getCountryById(selectedCountryId) ?? null;
  }, [selectedCountryId]);

  if (!continent || !mode) return null;

  const solvedId = solved ? target?.id ?? null : null;
  const revealedId = revealed ? target?.id ?? null : null;
  const continentMeta = getContinent(continent);

  if (capabilities.isDiscovery) {
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden px-3 py-3 sm:px-5 sm:py-5">
        <div className="ambient pointer-events-none" />

        <div className="relative z-10 glass rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goScreen("mode-select")}
            iconLeft={<ArrowLeft size={14} />}
          >
            Modes
          </Button>

          <div className="hidden sm:flex items-center gap-2 pl-2">
            <span className="text-xl" aria-hidden>
              {continentMeta.emoji}
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-mist-400 leading-none">
                Discovery
              </div>
              <div className="font-semibold text-sm leading-tight">{continentMeta.name}</div>
            </div>
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setShowLabels(!showLabels)}
            className="chip hover:bg-white/10 transition"
            aria-label="Toggle map labels"
            aria-pressed={showLabels}
          >
            <Tag size={12} /> Labels {showLabels ? "On" : "Off"}
          </button>
        </div>

        <div className="relative z-10 mt-3 sm:mt-4 flex-1 min-h-0 min-w-0 grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:grid-rows-[minmax(0,1fr)]">
          <motion.div
            layout
            className="glass relative min-h-[260px] sm:min-h-[320px] lg:min-h-0 overflow-hidden rounded-2xl"
          >
            <ContinentMap
              continent={continent}
              selectedId={selectedCountryId}
              hoveredId={capabilities.allowsHoverSync ? sharedHoverId : null}
              onHover={capabilities.allowsHoverSync ? setSharedHoverId : undefined}
              onSelect={(id) => setSelectedCountryId(id)}
              focusId={capabilities.allowsMapFocusFromList ? mapFocusId : null}
              interactionMode="discovery"
              labelMode={capabilities.mapLabelMode}
            />
          </motion.div>

          <aside
            ref={discoveryAsideRef}
            className="min-h-0 min-w-0 h-full overflow-hidden rounded-2xl flex flex-col"
          >
            <div
              className="min-h-0 overflow-auto"
              style={{ height: detailsPanelHeight }}
            >
              <CountryDetailsPanel country={selectedCountry} continentName={continentMeta.name} />
            </div>

            <div
              role="separator"
              aria-label="Resize country details and country list"
              aria-orientation="horizontal"
              onPointerDown={(event) => {
                if (event.button !== 0 && event.pointerType !== "touch") return;
                event.preventDefault();
                setIsResizingDiscoveryPanels(true);
              }}
              className="h-4 shrink-0 cursor-row-resize touch-none select-none px-2"
            >
              <div
                className={`mt-1.5 h-1 rounded-full transition ${
                  isResizingDiscoveryPanels
                    ? "bg-cyan-300/60"
                    : "bg-white/15 hover:bg-white/25"
                }`}
              />
            </div>

            <div className="glass min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl flex flex-col">
              <CountryList
                continent={continent}
                wrongIds={[]}
                correctId={null}
                revealedId={null}
                selectedId={selectedCountryId}
                hoveredId={capabilities.allowsHoverSync ? sharedHoverId : null}
                onHover={capabilities.allowsHoverSync ? setSharedHoverId : undefined}
                onSelect={(id) => {
                  setSelectedCountryId(id);
                  setMapFocusId(id);
                }}
                onFocus={capabilities.allowsMapFocusFromList ? setMapFocusId : undefined}
                mode={capabilities.listInteraction}
              />
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden px-3 py-3 sm:px-5 sm:py-5">
      <div className="ambient pointer-events-none" />
      <Confetti run={confetti} onDone={() => setConfetti(false)} />

      <div className="relative z-10">
        <GameHUD />
      </div>

      <div className="relative z-10 mt-3 sm:mt-4 flex-1 min-h-0 min-w-0 grid gap-3 sm:gap-4 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,220px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:grid-rows-[minmax(0,1fr)]">
        <div className="flex min-h-0 min-w-0 flex-col gap-3 sm:gap-4 overflow-y-auto pr-1">
          <TargetPanel />
          <motion.div
            layout
            className="glass relative flex-1 min-h-[220px] sm:min-h-[260px] overflow-hidden rounded-2xl"
          >
            <ContinentMap
              continent={continent}
              targetId={target?.id}
              wrongIds={wrongGuesses}
              solvedId={solvedId}
              revealedId={revealedId}
              hintId={hintId}
              onSelect={onGuessSelect}
              interactionMode="gameplay"
              labelMode={capabilities.mapLabelMode}
            />
          </motion.div>

          <RoundResult onNext={nextRound} />
        </div>

        <aside className="glass min-h-0 min-w-0 h-full overflow-hidden rounded-2xl flex flex-col">
          {/* Keep gameplay fair: list interactions are click-to-guess only. */}
          <CountryList
            continent={continent}
            wrongIds={wrongGuesses}
            correctId={solvedId}
            revealedId={revealedId}
            onSelect={onGuessSelect}
            disabled={solved || revealed}
            mode={capabilities.listInteraction}
          />
        </aside>
      </div>
    </div>
  );
}
