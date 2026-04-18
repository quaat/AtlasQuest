import type { ProjectionSpec } from "@/lib/geo";

export type ContinentId =
  | "africa"
  | "europe"
  | "asia"
  | "north-america"
  | "south-america"
  | "oceania";

export type MapProjectionMode = "auto" | "mercator" | "conicConformal";

export interface ContinentMeta {
  id: ContinentId;
  name: string;
  tagline: string;
  emoji: string;
  gradient: [string, string];
  accent: string;
  countryCount: number;
  description: string;
  projection: ProjectionSpec;
}

export const CONTINENTS: ContinentMeta[] = [
  {
    id: "europe",
    name: "Europe",
    tagline: "Castles, coasts & capitals",
    emoji: "🏰",
    gradient: ["#818CF8", "#22D3EE"],
    accent: "#A78BFA",
    countryCount: 45,
    description:
      "A compact mosaic of nations — dense, diverse, and historically rich.",
    projection: {
      kind: "conicConformal",
      center: [15, 52],
      rotate: [-10, -52],
      parallels: [35, 65],
      scaleHint: 5.2,
    },
  },
  {
    id: "africa",
    name: "Africa",
    tagline: "The vast mother continent",
    emoji: "🦁",
    gradient: ["#FBBF24", "#FB7185"],
    accent: "#FBBF24",
    countryCount: 54,
    description:
      "Fifty-four nations spanning Sahara sands, savannas, and rainforests.",
    projection: {
      kind: "mercator",
      center: [20, 3],
      scaleHint: 1.55,
    },
  },
  {
    id: "asia",
    name: "Asia",
    tagline: "The world’s largest landmass",
    emoji: "🏯",
    gradient: ["#F472B6", "#FBBF24"],
    accent: "#F472B6",
    countryCount: 48,
    description:
      "From the Himalayas to the archipelagos — the most populous continent on Earth.",
    projection: {
      kind: "mercator",
      center: [90, 28],
      scaleHint: 1.15,
    },
  },
  {
    id: "north-america",
    name: "North America",
    tagline: "Tundra to tropics",
    emoji: "🗽",
    gradient: ["#34D399", "#22D3EE"],
    accent: "#34D399",
    countryCount: 23,
    description:
      "Three vast nations plus a constellation of Central American and Caribbean states.",
    projection: {
      kind: "conicConformal",
      center: [-95, 37],
      rotate: [100, -37],
      parallels: [20, 60],
      scaleHint: 1.55,
    },
  },
  {
    id: "south-america",
    name: "South America",
    tagline: "Andes to Amazon",
    emoji: "🗿",
    gradient: ["#34D399", "#FBBF24"],
    accent: "#34D399",
    countryCount: 12,
    description:
      "Twelve nations stretching from Caribbean shores to Patagonian fjords.",
    projection: {
      kind: "mercator",
      center: [-60, -15],
      scaleHint: 1.55,
    },
  },
  {
    id: "oceania",
    name: "Oceania",
    tagline: "Pacific archipelagos",
    emoji: "🏝️",
    gradient: ["#22D3EE", "#A78BFA"],
    accent: "#22D3EE",
    countryCount: 14,
    description:
      "Australia, New Zealand, and the scattered island nations of the blue Pacific.",
    projection: {
      kind: "mercator",
      center: [150, -20],
      scaleHint: 1.15,
    },
  },
];

export function getContinent(id: ContinentId): ContinentMeta {
  const c = CONTINENTS.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown continent: ${id}`);
  return c;
}

function clampLatitude(lat: number): number {
  return Math.max(-80, Math.min(80, lat));
}

function fallbackConicRotate(center: [number, number]): [number, number] {
  const [lon, lat] = center;
  return [-lon, -clampLatitude(lat)];
}

function fallbackConicParallels(center: [number, number]): [number, number] {
  const lat = clampLatitude(center[1]);
  const spread = 18;
  const p1 = clampLatitude(lat - spread);
  const p2 = clampLatitude(lat + spread);
  return p1 < p2 ? [p1, p2] : [p2, p1];
}

export function resolveContinentProjection(
  meta: ContinentMeta,
  mode: MapProjectionMode,
): ProjectionSpec {
  const base = meta.projection;
  if (mode === "auto") return base;

  if (mode === "mercator") {
    return {
      kind: "mercator",
      center: base.center,
      scaleHint: base.scaleHint,
    };
  }

  return {
    kind: "conicConformal",
    center: base.center,
    rotate: base.rotate ?? fallbackConicRotate(base.center),
    parallels: base.parallels ?? fallbackConicParallels(base.center),
    scaleHint: base.scaleHint,
  };
}
