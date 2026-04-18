import { ArrowLeft, Volume2, Vibrate, Tag, Lightbulb, Zap, Database, Map } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useGame } from "@/store/gameStore";
import { useSettings } from "@/store/settingsStore";
import { resetDb } from "@/lib/db";
import { useState } from "react";
import type { MapProjectionMode } from "@/data/continents";

const projectionOptions: { value: MapProjectionMode; label: string; hint: string }[] = [
  {
    value: "auto",
    label: "Auto",
    hint: "Use each continent's default best-fit projection.",
  },
  {
    value: "mercator",
    label: "Mercator",
    hint: "Force Mercator projection across all continents.",
  },
  {
    value: "conicConformal",
    label: "Conic",
    hint: "Force Conic Conformal projection across all continents.",
  },
];

export function SettingsScreen() {
  const goHome = useGame((s) => s.goHome);
  const s = useSettings();
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [wiped, setWiped] = useState(false);

  return (
    <div className="relative min-h-screen px-5 py-10">
      <div className="ambient" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={goHome} iconLeft={<ArrowLeft size={14} />}>
            Home
          </Button>
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-mist-300 mt-2">Tune the experience the way you like it.</p>

        <Card className="mt-6 divide-y divide-white/5">
          <div className="py-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 grid place-items-center shrink-0">
                <Map size={16} className="text-cyan-300" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-mist-50">Map projection</div>
                <div className="text-xs text-mist-400 mt-0.5">
                  Auto uses the best projection per continent. Mercator and Conic Conformal force one projection globally.
                </div>
                <SegmentedControl
                  value={s.mapProjectionMode}
                  onChange={s.setMapProjectionMode}
                  options={projectionOptions}
                  size="sm"
                  className="mt-2 max-w-full"
                />
              </div>
            </div>
          </div>
          <SettingRow
            icon={<Volume2 size={16} className="text-cyan-300" />}
            label="Sound effects"
            description="Subtle tones for taps, wins, and celebrations."
          >
            <Toggle checked={s.soundEnabled} onChange={s.setSound} />
          </SettingRow>
          <SettingRow
            icon={<Vibrate size={16} className="text-rose-300" />}
            label="Haptics on mobile"
            description="Light vibrations for feedback."
          >
            <Toggle checked={s.hapticEnabled} onChange={s.setHaptic} />
          </SettingRow>
          <SettingRow
            icon={<Tag size={16} className="text-amber-300" />}
            label="Label revealed countries on the map"
            description="Show names on countries you've already clicked or that have been revealed. Never shows the target before you guess."
          >
            <Toggle checked={s.showLabels} onChange={s.setShowLabels} />
          </SettingRow>
          <SettingRow
            icon={<Lightbulb size={16} className="text-amber-300" />}
            label="Allow hints"
            description="Reveal capital and first letter when stuck."
          >
            <Toggle checked={s.hintsEnabled} onChange={s.setHintsEnabled} />
          </SettingRow>
          <SettingRow
            icon={<Zap size={16} className="text-violet-300" />}
            label="Reduce motion"
            description="Tone down animations and particle effects."
          >
            <Toggle checked={s.reduceMotion} onChange={s.setReduceMotion} />
          </SettingRow>
        </Card>

        <Card className="mt-4">
          <CardTitle
            title={<span className="flex items-center gap-2"><Database size={16} className="text-cyan-300" /> Local data</span>}
            subtitle="All progress is stored on this device via SQLite. You can wipe it anytime."
          />
          {!confirmWipe ? (
            <Button variant="ghost" onClick={() => setConfirmWipe(true)}>
              Reset all progress
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={async () => {
                  await resetDb();
                  setWiped(true);
                  setConfirmWipe(false);
                  setTimeout(() => setWiped(false), 2500);
                }}
              >
                Yes, wipe everything
              </Button>
              <Button variant="ghost" onClick={() => setConfirmWipe(false)}>
                Cancel
              </Button>
            </div>
          )}
          {wiped && <div className="mt-3 text-xs text-emerald-300">Data cleared.</div>}
        </Card>

        <div className="mt-8 text-[11px] text-mist-500 leading-relaxed">
          Map data courtesy of Natural Earth via world-atlas. SQLite runs in your
          browser (sql.js) and persists to IndexedDB. Nothing is sent to a server.
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-3 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 grid place-items-center shrink-0">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-mist-50">{label}</div>
          <div className="text-xs text-mist-400 mt-0.5">{description}</div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
