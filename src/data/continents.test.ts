import { describe, expect, it } from "vitest";
import {
  getContinent,
  resolveContinentProjection,
  type MapProjectionMode,
} from "@/data/continents";

describe("resolveContinentProjection", () => {
  it("keeps existing continent defaults in auto mode", () => {
    const europe = getContinent("europe");
    const resolved = resolveContinentProjection(europe, "auto");
    expect(resolved).toBe(europe.projection);
  });

  it("forces mercator while preserving center and scale hints", () => {
    const europe = getContinent("europe");
    const resolved = resolveContinentProjection(europe, "mercator");
    expect(resolved.kind).toBe("mercator");
    expect(resolved.center).toEqual(europe.projection.center);
    expect(resolved.scaleHint).toBe(europe.projection.scaleHint);
  });

  it("forces conic conformal with safe fallbacks when source has no conic params", () => {
    const africa = getContinent("africa");
    const resolved = resolveContinentProjection(africa, "conicConformal");
    expect(resolved.kind).toBe("conicConformal");
    expect(resolved.center).toEqual(africa.projection.center);
    expect(resolved.parallels).toBeDefined();
    expect(resolved.rotate).toBeDefined();
  });

  it("supports all projection modes", () => {
    const modes: MapProjectionMode[] = ["auto", "mercator", "conicConformal"];
    const asia = getContinent("asia");
    modes.forEach((mode) => {
      expect(resolveContinentProjection(asia, mode)).toBeTruthy();
    });
  });
});
