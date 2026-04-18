import topo from "../../public/data/countries-50m.json";
import { describe, expect, it } from "vitest";
import { getContinent } from "@/data/continents";
import { buildContinentMap, isSmallCountryFeature } from "@/lib/geo";

describe("small-country hit targeting on real map data", () => {
  it("classifies Vatican City and microstates as small hit targets", () => {
    const map = buildContinentMap(
      topo as any,
      "europe",
      1200,
      720,
      getContinent("europe").projection,
    );

    const byId = new Map(map.countries.map((c) => [c.id, c]));

    // Vatican City should be present and get an expanded hit target.
    const vatican = byId.get("336");
    expect(vatican).toBeTruthy();
    expect(isSmallCountryFeature(vatican!, map.width, map.height)).toBe(true);

    // Other tiny European states should also be flagged when present.
    const tinyEuropeanStates = ["674", "492", "438", "020", "470", "442"];
    tinyEuropeanStates.forEach((id) => {
      const c = byId.get(id);
      if (!c) return;
      expect(isSmallCountryFeature(c, map.width, map.height)).toBe(true);
    });

    // Larger neighbors should remain normal hit behavior.
    const italy = byId.get("380");
    expect(italy).toBeTruthy();
    expect(isSmallCountryFeature(italy!, map.width, map.height)).toBe(false);
  });
});
