import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { setMuted } from "@/lib/audio";

export interface SettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  theme: "aurora" | "slate";
  showLabels: boolean;
  reduceMotion: boolean;
  hintsEnabled: boolean;
  setSound: (v: boolean) => void;
  setHaptic: (v: boolean) => void;
  setTheme: (v: SettingsState["theme"]) => void;
  setShowLabels: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setHintsEnabled: (v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      hapticEnabled: true,
      theme: "aurora",
      showLabels: true,
      reduceMotion: false,
      hintsEnabled: true,
      setSound: (v) => {
        setMuted(!v);
        set({ soundEnabled: v });
      },
      setHaptic: (v) => set({ hapticEnabled: v }),
      setTheme: (v) => set({ theme: v }),
      setShowLabels: (v) => set({ showLabels: v }),
      setReduceMotion: (v) => set({ reduceMotion: v }),
      setHintsEnabled: (v) => set({ hintsEnabled: v }),
    }),
    {
      name: "atlas-quest.settings",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) setMuted(!state.soundEnabled);
      },
    },
  ),
);

export function haptic(pattern: number | number[] = 8) {
  try {
    if (!useSettings.getState().hapticEnabled) return;
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    /* noop */
  }
}
