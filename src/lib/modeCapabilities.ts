import type { GameMode } from "@/store/gameStore";

export interface ModeCapabilities {
  isDiscovery: boolean;
  allowsHoverSync: boolean;
  allowsCountryInspection: boolean;
  allowsMapFocusFromList: boolean;
  mapLabelMode: "revealed" | "all";
  listInteraction: "guess" | "discovery";
}

export function getModeCapabilities(mode: GameMode | null): ModeCapabilities {
  if (mode === "discovery") {
    return {
      isDiscovery: true,
      allowsHoverSync: true,
      allowsCountryInspection: true,
      allowsMapFocusFromList: true,
      mapLabelMode: "all",
      listInteraction: "discovery",
    };
  }

  return {
    isDiscovery: false,
    allowsHoverSync: false,
    allowsCountryInspection: false,
    allowsMapFocusFromList: false,
    mapLabelMode: "revealed",
    listInteraction: "guess",
  };
}
