/**
 * Scoring rules — tuned so first-try answers under 3s feel crisp, but
 * careful exploration still feels rewarded. Each round is scored out of 1000.
 */

export interface RoundScoreInput {
  timeMs: number;
  guesses: number;
  solved: boolean;
  continentCountryCount: number;
}

export interface RoundScore {
  total: number;
  base: number;
  speedBonus: number;
  accuracyBonus: number;
  continentBonus: number;
  grade: "S" | "A" | "B" | "C" | "D";
}

export function scoreRound(r: RoundScoreInput): RoundScore {
  if (!r.solved) {
    return {
      total: 0,
      base: 0,
      speedBonus: 0,
      accuracyBonus: 0,
      continentBonus: 0,
      grade: "D",
    };
  }
  // Base 500 for a correct answer
  const base = 500;

  // Speed bonus: up to 300 pts. Linear falloff 0–15 seconds.
  const t = Math.max(0, r.timeMs);
  const speedBonus = Math.round(Math.max(0, 300 * (1 - t / 15000)));

  // Accuracy bonus: 200 for first try, scaled down by wrong guesses
  const wrong = Math.max(0, r.guesses - 1);
  const accuracyBonus = Math.round(200 * Math.pow(0.55, wrong));

  // Continent bonus: harder continents (more countries) get a small multiplier
  const continentBonus = Math.round(
    Math.min(60, 60 * (r.continentCountryCount / 54)),
  );

  const total = base + speedBonus + accuracyBonus + continentBonus;

  let grade: RoundScore["grade"];
  if (total >= 980) grade = "S";
  else if (total >= 850) grade = "A";
  else if (total >= 700) grade = "B";
  else if (total >= 550) grade = "C";
  else grade = "D";

  return { total, base, speedBonus, accuracyBonus, continentBonus, grade };
}

export function formatDuration(ms: number): string {
  if (!isFinite(ms) || ms < 0) return "—";
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(s < 10 ? 1 : 0)}s`;
  const m = Math.floor(s / 60);
  const r = Math.floor(s - m * 60);
  return `${m}m ${r.toString().padStart(2, "0")}s`;
}

export function accuracyPercent(correct: number, total: number): number {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export function efficiencyPercent(guesses: number, possible: number): number {
  if (!Number.isFinite(guesses) || !Number.isFinite(possible)) return 0;
  if (guesses <= 0 || possible <= 0) return 0;
  if (possible === 1) return guesses === 1 ? 100 : 0;
  const boundedGuesses = Math.min(Math.max(guesses, 1), possible);
  return Math.round(((possible - boundedGuesses) / (possible - 1)) * 100);
}
