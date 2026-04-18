import { create } from "zustand";
import type { ContinentId } from "@/data/continents";
import { COUNTRIES_BY_CONTINENT, type CountryMeta } from "@/data/countries";
import { pick, weightedPick } from "@/lib/utils";
import { scoreRound, type RoundScore } from "@/lib/scoring";
import {
  endSession,
  recordRound,
  startSession,
  updateContinentStreak,
  getCountryStats,
} from "@/lib/db";

export type GameMode = "classic" | "timed" | "streak" | "practice" | "mastery";

export type Screen =
  | "home"
  | "continent-select"
  | "mode-select"
  | "game"
  | "round-result"
  | "session-summary"
  | "stats"
  | "settings";

export interface RoundHistoryEntry {
  targetId: string;
  targetName: string;
  wrongIds: string[];
  timeMs: number;
  guesses: number;
  solved: boolean;
  score: RoundScore;
  endedAt: number;
}

export interface GameState {
  screen: Screen;
  mode: GameMode | null;
  continent: ContinentId | null;

  sessionId: number | null;
  sessionStartedAt: number | null;
  sessionPool: CountryMeta[];
  sessionRoundsPlayed: number;
  sessionRoundsWon: number;
  sessionTotalTime: number;
  sessionTotalGuesses: number;
  sessionScore: number;
  sessionStreak: number;
  sessionBestStreak: number;
  sessionHistory: RoundHistoryEntry[];

  // Timed mode
  timedLimitMs: number;
  timedStartedAt: number | null;

  // Current round
  targetCountry: CountryMeta | null;
  wrongGuesses: string[]; // country ids
  roundStartedAt: number | null;
  roundEndedAt: number | null;
  guesses: number;
  solved: boolean;
  revealed: boolean;
  lastRound: RoundHistoryEntry | null;
  countryStats: Map<string, { seen: number; wrongAttempts: number; correct: number }>;

  // Actions
  goHome: () => void;
  goScreen: (s: Screen) => void;
  selectContinent: (c: ContinentId) => void;
  selectMode: (m: GameMode) => void;
  startSession: () => Promise<void>;
  pickTarget: () => void;
  guess: (countryId: string) => "correct" | "wrong" | "repeat" | "ignored";
  reveal: () => void;
  nextRound: () => void;
  endSessionNow: () => Promise<void>;
  tickTimer: () => void;
  setTimedLimit: (ms: number) => void;
}

const DEFAULT_TIMED_LIMIT_MS = 90_000;
const ZERO_SCORE: RoundScore = {
  total: 0,
  base: 0,
  speedBonus: 0,
  accuracyBonus: 0,
  continentBonus: 0,
  grade: "D",
};

function roundsPoolFor(
  continent: ContinentId,
  mode: GameMode,
  countryStats: Map<string, { seen: number; wrongAttempts: number; correct: number }>,
): CountryMeta[] {
  const all = COUNTRIES_BY_CONTINENT[continent];
  if (mode === "mastery") {
    const weak = all.filter((c) => {
      const s = countryStats.get(c.id);
      if (!s || !s.seen) return false;
      return s.wrongAttempts > 0 || s.correct / Math.max(1, s.seen) < 0.7;
    });
    if (weak.length >= 5) return weak;
  }
  return all;
}

export const useGame = create<GameState>((set, get) => ({
  screen: "home",
  mode: null,
  continent: null,

  sessionId: null,
  sessionStartedAt: null,
  sessionPool: [],
  sessionRoundsPlayed: 0,
  sessionRoundsWon: 0,
  sessionTotalTime: 0,
  sessionTotalGuesses: 0,
  sessionScore: 0,
  sessionStreak: 0,
  sessionBestStreak: 0,
  sessionHistory: [],

  timedLimitMs: DEFAULT_TIMED_LIMIT_MS,
  timedStartedAt: null,

  targetCountry: null,
  wrongGuesses: [],
  roundStartedAt: null,
  roundEndedAt: null,
  guesses: 0,
  solved: false,
  revealed: false,
  lastRound: null,
  countryStats: new Map(),

  goHome: () => {
    set({
      screen: "home",
      mode: null,
      continent: null,
      sessionId: null,
      sessionStartedAt: null,
      sessionPool: [],
      targetCountry: null,
      wrongGuesses: [],
      sessionRoundsPlayed: 0,
      sessionRoundsWon: 0,
      sessionTotalTime: 0,
      sessionTotalGuesses: 0,
      sessionScore: 0,
      sessionStreak: 0,
      sessionBestStreak: 0,
      sessionHistory: [],
      timedStartedAt: null,
      roundStartedAt: null,
      roundEndedAt: null,
      guesses: 0,
      lastRound: null,
      solved: false,
      revealed: false,
    });
  },

  goScreen: (s) => set({ screen: s }),

  selectContinent: (c) => set({ continent: c, mode: null, screen: "mode-select" }),

  selectMode: (m) => set({ mode: m }),

  setTimedLimit: (ms) => set({ timedLimitMs: ms }),

  startSession: async () => {
    const { continent, mode } = get();
    if (!continent || !mode) return;

    // load country stats to support mastery mode weighting
    let statsMap = new Map<
      string,
      { seen: number; wrongAttempts: number; correct: number }
    >();
    try {
      const rows = await getCountryStats();
      for (const r of rows) {
        statsMap.set(r.country_id, {
          seen: r.seen,
          wrongAttempts: r.wrong_attempts,
          correct: r.correct,
        });
      }
    } catch {
      /* ignore */
    }

    let sessionId: number | null = null;
    try {
      sessionId = await startSession({ mode, continent });
    } catch {
      // Play should still work even if persistence is unavailable.
    }
    const pool = roundsPoolFor(continent, mode, statsMap);
    const now = Date.now();

    set({
      sessionId,
      sessionStartedAt: now,
      sessionPool: pool,
      sessionRoundsPlayed: 0,
      sessionRoundsWon: 0,
      sessionTotalTime: 0,
      sessionTotalGuesses: 0,
      sessionScore: 0,
      sessionStreak: 0,
      sessionBestStreak: 0,
      sessionHistory: [],
      timedStartedAt: mode === "timed" ? now : null,
      countryStats: statsMap,
      screen: "game",
    });

    get().pickTarget();
  },

  pickTarget: () => {
    const { sessionPool, sessionHistory, mode, countryStats } = get();
    if (!sessionPool.length) return;
    const recentIds = new Set(
      sessionHistory.slice(-Math.min(6, Math.floor(sessionPool.length / 2)))
        .map((h) => h.targetId),
    );
    const candidates = sessionPool.filter((c) => !recentIds.has(c.id));
    const list = candidates.length ? candidates : sessionPool;
    let target: CountryMeta;
    if (mode === "mastery") {
      target = weightedPick(list, (c) => {
        const s = countryStats.get(c.id);
        if (!s) return 1;
        const accuracy = s.correct / Math.max(1, s.seen);
        return 1 + s.wrongAttempts * 1.5 + (1 - accuracy) * 3;
      });
    } else {
      target = pick(list);
    }

    set({
      targetCountry: target,
      wrongGuesses: [],
      roundStartedAt: Date.now(),
      roundEndedAt: null,
      guesses: 0,
      solved: false,
      revealed: false,
    });
  },

  guess: (countryId) => {
    const s = get();
    if (!s.targetCountry || s.solved || s.revealed) return "ignored";
    if (s.wrongGuesses.includes(countryId)) return "repeat";
    const guesses = s.guesses + 1;
    if (countryId === s.targetCountry.id) {
      const endedAt = Date.now();
      const timeMs = endedAt - (s.roundStartedAt ?? endedAt);
      const score = s.mode === "practice"
        ? ZERO_SCORE
        : scoreRound({
            timeMs,
            guesses,
            solved: true,
            continentCountryCount: s.sessionPool.length,
          });
      const entry: RoundHistoryEntry = {
        targetId: s.targetCountry.id,
        targetName: s.targetCountry.name,
        wrongIds: s.wrongGuesses.slice(),
        timeMs,
        guesses,
        solved: true,
        score,
        endedAt,
      };
      const streak = s.sessionStreak + 1;
      set({
        guesses,
        solved: true,
        roundEndedAt: endedAt,
        sessionRoundsPlayed: s.sessionRoundsPlayed + 1,
        sessionRoundsWon: s.sessionRoundsWon + 1,
        sessionTotalTime: s.sessionTotalTime + timeMs,
        sessionTotalGuesses: s.sessionTotalGuesses + guesses,
        sessionScore: s.sessionScore + score.total,
        sessionStreak: streak,
        sessionBestStreak: Math.max(s.sessionBestStreak, streak),
        sessionHistory: [...s.sessionHistory, entry],
        lastRound: entry,
      });

      // persistence
      if (s.sessionId && s.continent) {
        void recordRound({
          sessionId: s.sessionId,
          continent: s.continent,
          targetCountryId: s.targetCountry.id,
          guesses,
          wrongCountryIds: s.wrongGuesses,
          timeMs,
          solved: true,
          score: score.total,
          endedAt,
        });
        void updateContinentStreak(s.continent, Math.max(s.sessionBestStreak, streak));
      }
      return "correct";
    }
    // wrong
    set({
      guesses,
      wrongGuesses: [...s.wrongGuesses, countryId],
    });

    if (s.mode === "streak" && s.wrongGuesses.length + 1 >= 3) {
      // end streak round: record as unsolved and advance
      const endedAt = Date.now();
      const timeMs = endedAt - (s.roundStartedAt ?? endedAt);
      const entry: RoundHistoryEntry = {
        targetId: s.targetCountry.id,
        targetName: s.targetCountry.name,
        wrongIds: [...s.wrongGuesses, countryId],
        timeMs,
        guesses,
        solved: false,
        score: ZERO_SCORE,
        endedAt,
      };
      set({
        roundEndedAt: endedAt,
        revealed: true,
        sessionRoundsPlayed: s.sessionRoundsPlayed + 1,
        sessionTotalTime: s.sessionTotalTime + timeMs,
        sessionTotalGuesses: s.sessionTotalGuesses + guesses,
        sessionStreak: 0,
        sessionHistory: [...s.sessionHistory, entry],
        lastRound: entry,
      });
      if (s.sessionId && s.continent) {
        void recordRound({
          sessionId: s.sessionId,
          continent: s.continent,
          targetCountryId: s.targetCountry.id,
          guesses,
          wrongCountryIds: [...s.wrongGuesses, countryId],
          timeMs,
          solved: false,
          score: 0,
          endedAt,
        });
      }
    }

    return "wrong";
  },

  reveal: () => {
    const s = get();
    if (!s.targetCountry || s.solved || s.revealed) return;
    const endedAt = Date.now();
    const timeMs = endedAt - (s.roundStartedAt ?? endedAt);
    const entry: RoundHistoryEntry = {
      targetId: s.targetCountry.id,
      targetName: s.targetCountry.name,
      wrongIds: s.wrongGuesses.slice(),
      timeMs,
      guesses: s.guesses,
      solved: false,
      score: ZERO_SCORE,
      endedAt,
    };
    set({
      revealed: true,
      roundEndedAt: endedAt,
      sessionRoundsPlayed: s.sessionRoundsPlayed + 1,
      sessionTotalTime: s.sessionTotalTime + timeMs,
      sessionTotalGuesses: s.sessionTotalGuesses + s.guesses,
      sessionStreak: 0,
      sessionHistory: [...s.sessionHistory, entry],
      lastRound: entry,
    });
    if (s.sessionId && s.continent) {
      void recordRound({
        sessionId: s.sessionId,
        continent: s.continent,
        targetCountryId: s.targetCountry.id,
        guesses: s.guesses,
        wrongCountryIds: s.wrongGuesses,
        timeMs,
        solved: false,
        score: 0,
        endedAt,
      });
    }
  },

  nextRound: () => {
    const s = get();
    // End conditions
    if (s.mode === "classic" && s.sessionRoundsPlayed >= 10) {
      void s.endSessionNow();
      return;
    }
    if (s.mode === "timed" && s.timedStartedAt) {
      const remaining = s.timedLimitMs - (Date.now() - s.timedStartedAt);
      if (remaining <= 0) {
        void s.endSessionNow();
        return;
      }
    }
    s.pickTarget();
  },

  tickTimer: () => {
    const s = get();
    if (s.mode !== "timed" || !s.timedStartedAt) return;
    const remaining = s.timedLimitMs - (Date.now() - s.timedStartedAt);
    if (remaining <= 0) {
      void s.endSessionNow();
    }
  },

  endSessionNow: async () => {
    const s = get();
    if (s.sessionId) {
      await endSession(s.sessionId, {
        roundsPlayed: s.sessionRoundsPlayed,
        roundsWon: s.sessionRoundsWon,
        totalTimeMs: s.sessionTotalTime,
        totalGuesses: s.sessionTotalGuesses,
        score: s.sessionScore,
      });
    }
    set({ screen: "session-summary" });
  },
}));
