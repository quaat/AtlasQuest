import { beforeEach, describe, expect, it, vi } from "vitest";
import { COUNTRIES_BY_CONTINENT } from "@/data/countries";

const dbMocks = vi.hoisted(() => ({
  endSession: vi.fn(async () => {}),
  getCountryStats: vi.fn(async () => []),
  recordRound: vi.fn(async () => {}),
  startSession: vi.fn(async () => 101),
  updateContinentStreak: vi.fn(async () => {}),
}));

vi.mock("@/lib/db", () => dbMocks);

import { useGame } from "./gameStore";

function resetGameStore() {
  const initial = useGame.getInitialState();
  useGame.setState(
    {
      ...initial,
      countryStats: new Map(),
      sessionHistory: [],
      sessionPool: [],
      wrongGuesses: [],
    },
    true,
  );
}

describe("gameStore", () => {
  beforeEach(() => {
    resetGameStore();
    dbMocks.endSession.mockClear();
    dbMocks.getCountryStats.mockReset();
    dbMocks.getCountryStats.mockResolvedValue([] as any);
    dbMocks.recordRound.mockClear();
    dbMocks.startSession.mockReset();
    dbMocks.startSession.mockResolvedValue(101);
    dbMocks.updateContinentStreak.mockClear();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  it("clears selected mode when switching continent", () => {
    const store = useGame.getState();
    store.selectMode("timed");
    store.selectContinent("asia");

    const s = useGame.getState();
    expect(s.mode).toBeNull();
    expect(s.continent).toBe("asia");
    expect(s.screen).toBe("mode-select");
  });

  it("keeps game state intact until home reset is flushed", () => {
    useGame.setState((state) => ({
      ...state,
      screen: "game",
      mode: "classic",
      continent: "europe",
      sessionScore: 1234,
      homeResetPending: false,
    }));

    useGame.getState().exitToHome();
    let s = useGame.getState();
    expect(s.screen).toBe("home");
    expect(s.homeResetPending).toBe(true);
    expect(s.mode).toBe("classic");
    expect(s.continent).toBe("europe");

    useGame.getState().flushHomeReset();
    s = useGame.getState();
    expect(s.homeResetPending).toBe(false);
    expect(s.mode).toBeNull();
    expect(s.continent).toBeNull();
    expect(s.sessionScore).toBe(0);
  });

  it("starts timed sessions and initializes a target", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const store = useGame.getState();
    store.selectContinent("europe");
    store.selectMode("timed");

    await store.startSession();

    const s = useGame.getState();
    expect(dbMocks.startSession).toHaveBeenCalledWith({
      mode: "timed",
      continent: "europe",
    });
    expect(s.screen).toBe("game");
    expect(s.sessionId).toBe(101);
    expect(s.timedStartedAt).toBe(1_000_000);
    expect(s.sessionPool.length).toBe(COUNTRIES_BY_CONTINENT.europe.length);
    expect(s.targetCountry).not.toBeNull();
  });

  it("keeps gameplay working when persistence start fails", async () => {
    dbMocks.startSession.mockRejectedValueOnce(new Error("db unavailable"));
    const store = useGame.getState();
    store.selectContinent("africa");
    store.selectMode("classic");

    await store.startSession();

    const s = useGame.getState();
    expect(s.screen).toBe("game");
    expect(s.sessionId).toBeNull();
    expect(s.targetCountry).not.toBeNull();
  });

  it("uses weak spots as the pool in mastery mode when enough data exists", async () => {
    const weakIds = COUNTRIES_BY_CONTINENT["south-america"]
      .slice(0, 5)
      .map((c) => c.id);
    dbMocks.getCountryStats.mockResolvedValueOnce(
      weakIds.map((id) => ({
        country_id: id,
        seen: 10,
        wrong_attempts: 3,
        correct: 4,
      })) as any,
    );

    const store = useGame.getState();
    store.selectContinent("south-america");
    store.selectMode("mastery");
    await store.startSession();

    const poolIds = useGame
      .getState()
      .sessionPool.map((country) => country.id)
      .sort();
    expect(poolIds).toEqual([...weakIds].sort());
  });

  it("does not award score in practice mode", () => {
    const target = COUNTRIES_BY_CONTINENT.europe[0];
    vi.spyOn(Date, "now").mockReturnValue(2_500);

    useGame.setState((state) => ({
      ...state,
      continent: "europe",
      mode: "practice",
      sessionId: 7,
      sessionPool: [target],
      targetCountry: target,
      roundStartedAt: 1_000,
    }));

    const result = useGame.getState().guess(target.id);
    const s = useGame.getState();

    expect(result).toBe("correct");
    expect(s.sessionScore).toBe(0);
    expect(s.lastRound?.score.total).toBe(0);
    expect(dbMocks.recordRound).toHaveBeenCalledWith(
      expect.objectContaining({ solved: true, score: 0 }),
    );
  });

  it("ignores repeated wrong guesses", () => {
    const target = COUNTRIES_BY_CONTINENT.europe[0];
    const wrong = COUNTRIES_BY_CONTINENT.europe[1].id;

    useGame.setState((state) => ({
      ...state,
      mode: "classic",
      continent: "europe",
      sessionPool: COUNTRIES_BY_CONTINENT.europe,
      targetCountry: target,
      roundStartedAt: 500,
      guesses: 1,
      wrongGuesses: [wrong],
    }));

    const result = useGame.getState().guess(wrong);
    const s = useGame.getState();

    expect(result).toBe("repeat");
    expect(s.guesses).toBe(1);
    expect(s.wrongGuesses).toEqual([wrong]);
  });

  it("ends a streak round after three wrong guesses", () => {
    const [target, wrongA, wrongB, wrongC] = COUNTRIES_BY_CONTINENT.europe;
    vi.spyOn(Date, "now").mockReturnValue(10_000);

    useGame.setState((state) => ({
      ...state,
      mode: "streak",
      continent: "europe",
      sessionId: 3,
      sessionPool: COUNTRIES_BY_CONTINENT.europe,
      targetCountry: target,
      roundStartedAt: 8_000,
      sessionStreak: 4,
    }));

    expect(useGame.getState().guess(wrongA.id)).toBe("wrong");
    expect(useGame.getState().guess(wrongB.id)).toBe("wrong");
    expect(useGame.getState().guess(wrongC.id)).toBe("wrong");

    const s = useGame.getState();
    expect(s.revealed).toBe(true);
    expect(s.sessionStreak).toBe(0);
    expect(s.sessionRoundsPlayed).toBe(1);
    expect(s.lastRound?.solved).toBe(false);
    expect(s.lastRound?.wrongIds).toEqual([wrongA.id, wrongB.id, wrongC.id]);
    expect(dbMocks.recordRound).toHaveBeenCalledTimes(1);
    expect(dbMocks.recordRound).toHaveBeenCalledWith(
      expect.objectContaining({ solved: false }),
    );
  });

  it("ends classic sessions after 10 played rounds", () => {
    const endSessionNow = vi.fn(async () => {});
    const pickTarget = vi.fn();

    useGame.setState((state) => ({
      ...state,
      mode: "classic",
      sessionRoundsPlayed: 10,
      endSessionNow,
      pickTarget,
    }));

    useGame.getState().nextRound();

    expect(endSessionNow).toHaveBeenCalledTimes(1);
    expect(pickTarget).not.toHaveBeenCalled();
  });

  it("ends timed sessions when timer expires", () => {
    const endSessionNow = vi.fn(async () => {});
    vi.spyOn(Date, "now").mockReturnValue(10_000);

    useGame.setState((state) => ({
      ...state,
      mode: "timed",
      timedStartedAt: 8_000,
      timedLimitMs: 1_000,
      endSessionNow,
    }));

    useGame.getState().tickTimer();

    expect(endSessionNow).toHaveBeenCalledTimes(1);
  });
});
