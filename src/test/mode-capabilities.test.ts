import { describe, expect, it } from "vitest";
import { getModeCapabilities } from "@/lib/modeCapabilities";

describe("mode capabilities", () => {
  it("enables discovery interaction capabilities in discovery mode", () => {
    const caps = getModeCapabilities("discovery");
    expect(caps.isDiscovery).toBe(true);
    expect(caps.allowsHoverSync).toBe(true);
    expect(caps.allowsMapFocusFromList).toBe(true);
    expect(caps.mapLabelMode).toBe("all");
    expect(caps.listInteraction).toBe("discovery");
  });

  it("keeps gameplay capabilities strict in quiz modes", () => {
    const caps = getModeCapabilities("classic");
    expect(caps.isDiscovery).toBe(false);
    expect(caps.allowsHoverSync).toBe(false);
    expect(caps.allowsMapFocusFromList).toBe(false);
    expect(caps.mapLabelMode).toBe("revealed");
    expect(caps.listInteraction).toBe("guess");
  });
});
