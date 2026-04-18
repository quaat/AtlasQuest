import { describe, expect, it } from "vitest";
import {
  accuracyPercent,
  efficiencyPercent,
  formatDuration,
  scoreRound,
} from "@/lib/scoring";

describe("scoreRound", () => {
  it("returns zero score for unsolved rounds", () => {
    const result = scoreRound({
      timeMs: 4_000,
      guesses: 3,
      solved: false,
      continentCountryCount: 54,
    });

    expect(result).toEqual({
      total: 0,
      base: 0,
      speedBonus: 0,
      accuracyBonus: 0,
      continentBonus: 0,
      grade: "D",
    });
  });

  it("rewards fast first-try answers with max grade", () => {
    const result = scoreRound({
      timeMs: 0,
      guesses: 1,
      solved: true,
      continentCountryCount: 54,
    });

    expect(result.total).toBe(1060);
    expect(result.grade).toBe("S");
  });

  it("degrades score for slow multi-guess answers", () => {
    const result = scoreRound({
      timeMs: 15_000,
      guesses: 3,
      solved: true,
      continentCountryCount: 12,
    });

    expect(result).toMatchObject({
      base: 500,
      speedBonus: 0,
      accuracyBonus: 61,
      continentBonus: 13,
      total: 574,
      grade: "C",
    });
  });
});

describe("formatDuration", () => {
  it("formats invalid values as em dash", () => {
    expect(formatDuration(-1)).toBe("—");
    expect(formatDuration(Number.NaN)).toBe("—");
  });

  it("formats milliseconds and seconds", () => {
    expect(formatDuration(350)).toBe("350 ms");
    expect(formatDuration(1_500)).toBe("1.5s");
    expect(formatDuration(13_000)).toBe("13s");
  });

  it("formats minutes with padded seconds", () => {
    expect(formatDuration(65_000)).toBe("1m 05s");
  });
});

describe("percentage helpers", () => {
  it("computes accuracy safely", () => {
    expect(accuracyPercent(8, 10)).toBe(80);
    expect(accuracyPercent(3, 0)).toBe(0);
  });

  it("computes efficiency using both guesses and possible values", () => {
    expect(efficiencyPercent(1, 5)).toBe(100);
    expect(efficiencyPercent(5, 5)).toBe(0);
    expect(efficiencyPercent(0, 5)).toBe(0);
    expect(efficiencyPercent(3, 1)).toBe(0);
  });
});
