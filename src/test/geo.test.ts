import { describe, expect, it } from "vitest";
import {
  getSmallCountryHitStrokeWidth,
  isSmallCountryFeature,
  type CountryFeature,
} from "@/lib/geo";

function mockCountry(
  bbox: [number, number, number, number],
  projectedArea: number,
): Pick<CountryFeature, "bbox" | "projectedArea"> {
  return { bbox, projectedArea };
}

describe("small-country hit target helpers", () => {
  it("marks tiny projected areas as small features", () => {
    const c = mockCountry([10, 10, 14, 14], 30);
    expect(isSmallCountryFeature(c, 1200, 720)).toBe(true);
  });

  it("does not flag clearly large countries", () => {
    const c = mockCountry([0, 0, 240, 180], 22_000);
    expect(isSmallCountryFeature(c, 1200, 720)).toBe(false);
  });

  it("expands hit stroke more for smaller countries", () => {
    const tiny = getSmallCountryHitStrokeWidth(mockCountry([0, 0, 6, 6], 20));
    const medium = getSmallCountryHitStrokeWidth(mockCountry([0, 0, 20, 20], 300));
    expect(tiny).toBeGreaterThan(medium);
    expect(tiny).toBeGreaterThanOrEqual(10);
  });
});
