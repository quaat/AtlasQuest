import { describe, expect, it, vi } from "vitest";
import { pick, shuffle, weightedPick } from "@/lib/utils";

describe("pick", () => {
  it("selects an item from a non-empty array", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(pick(["a", "b", "c"])).toBe("c");
  });

  it("throws on empty arrays", () => {
    expect(() => pick([])).toThrow(/non-empty array/i);
  });
});

describe("shuffle", () => {
  it("returns a shuffled copy and does not mutate the source", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.0);

    const source = [1, 2, 3, 4];
    const result = shuffle(source);

    expect(source).toEqual([1, 2, 3, 4]);
    expect(result).toHaveLength(source.length);
    expect([...result].sort()).toEqual([1, 2, 3, 4]);
  });
});

describe("weightedPick", () => {
  it("picks by cumulative weights", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.6);
    const result = weightedPick(
      ["low", "high"],
      (item) => (item === "low" ? 1 : 3),
    );
    expect(result).toBe("high");
  });

  it("ignores invalid and negative weights and falls back to uniform pick", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.0);
    const result = weightedPick([10, 20, 30], () => Number.NaN);
    expect(result).toBe(10);
  });

  it("throws on empty arrays", () => {
    expect(() => weightedPick([], () => 1)).toThrow(/non-empty array/i);
  });
});
