import {
  geoConicConformal,
  geoMercator,
  geoEqualEarth,
  geoPath,
  type GeoProjection,
  type GeoPath,
} from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { ContinentId } from "@/data/continents";
import { COUNTRIES_BY_ID, type CountryMeta } from "@/data/countries";

export type ProjectionKind = "conicConformal" | "mercator" | "equalEarth";

export interface ProjectionSpec {
  kind: ProjectionKind;
  center: [number, number];
  rotate?: [number, number] | [number, number, number];
  parallels?: [number, number];
  scaleHint: number; // multiplier against a default base scale
}

export interface CountryFeature {
  id: string;
  name: string;
  meta: CountryMeta;
  feature: Feature<Geometry, { name: string }>;
  pathD: string;
  centroid: [number, number];
  bbox: [number, number, number, number];
  projectedArea: number;
}

export interface ContinentMapData {
  continent: ContinentId;
  countries: CountryFeature[];
  viewBox: string;
  width: number;
  height: number;
  projection: GeoProjection;
  path: GeoPath;
}

// ————————————————————————————————————————————————
// TopoJSON loading
// ————————————————————————————————————————————————

type WorldTopo = {
  type: "Topology";
  objects: { countries: { type: string; geometries: any[] } };
  arcs: unknown[];
  bbox?: number[];
  transform?: unknown;
};

let topoPromise: Promise<WorldTopo> | null = null;

const TOPO_SOURCES = [
  // Bundled, served from our own origin — primary.
  "/data/countries-50m.json",
  // Well-known public mirrors — fallbacks in case the bundled copy is missing.
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json",
  "https://unpkg.com/world-atlas@2/countries-50m.json",
];

export async function loadWorldTopology(): Promise<WorldTopo> {
  if (topoPromise) return topoPromise;
  topoPromise = (async () => {
    let lastError: unknown;
    for (const url of TOPO_SOURCES) {
      try {
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) {
          lastError = new Error(`${url} → HTTP ${res.status}`);
          continue;
        }
        return (await res.json()) as WorldTopo;
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error("Failed to load world topology");
  })();
  return topoPromise;
}

// ————————————————————————————————————————————————
// Continent map builder
// ————————————————————————————————————————————————

export function makeProjection(spec: ProjectionSpec): GeoProjection {
  switch (spec.kind) {
    case "conicConformal":
      return geoConicConformal()
        .rotate(spec.rotate ?? [0, 0])
        .parallels(spec.parallels ?? [30, 60])
        .center([0, spec.center[1]]);
    case "mercator":
      return geoMercator().center(spec.center).rotate([0, 0]);
    case "equalEarth":
      return geoEqualEarth().rotate(spec.rotate ?? [0, 0]);
  }
}

const CONTINENT_FALLBACK_IDS: Record<ContinentId, string[]> = {
  africa: [],
  europe: [],
  asia: [],
  "north-america": [],
  "south-america": [],
  oceania: [],
};

export function buildContinentMap(
  topo: WorldTopo,
  continent: ContinentId,
  width: number,
  height: number,
  spec: ProjectionSpec,
): ContinentMapData {
  const collection = feature(topo as any, topo.objects.countries as any) as unknown as FeatureCollection<
    Geometry,
    { name: string }
  >;

  // Filter features whose numeric id matches a country in this continent
  const features = collection.features.filter((f) => {
    const raw = f.id;
    if (raw === undefined || raw === null) return false;
    const id = String(raw).padStart(3, "0");
    const meta = COUNTRIES_BY_ID.get(id);
    if (!meta) return false;
    return meta.continent === continent;
  });

  // Fit the projection to the union of features in viewport
  const projection = makeProjection(spec);
  const fitCollection: FeatureCollection<Geometry, { name: string }> = {
    type: "FeatureCollection",
    features,
  };
  // Padding around features so labels and frames don't clip
  const padX = width * 0.04;
  const padY = height * 0.08;
  projection.fitExtent(
    [
      [padX, padY],
      [width - padX, height - padY * 0.5],
    ],
    fitCollection,
  );

  const path = geoPath(projection);

  const countries: CountryFeature[] = features
    .map((f) => {
      const id = String(f.id).padStart(3, "0");
      const meta = COUNTRIES_BY_ID.get(id);
      if (!meta) return null;
      const d = path(f) ?? "";
      const centroid = path.centroid(f) as [number, number];
      const projectedArea = Math.max(0, path.area(f));
      const bounds = path.bounds(f) as [[number, number], [number, number]];
      const bbox: [number, number, number, number] = [
        bounds[0][0],
        bounds[0][1],
        bounds[1][0],
        bounds[1][1],
      ];
      return {
        id,
        name: meta.name,
        meta,
        feature: f,
        pathD: d,
        centroid,
        bbox,
        projectedArea,
      } as CountryFeature;
    })
    .filter((x): x is CountryFeature => Boolean(x) && x!.pathD.length > 0);

  return {
    continent,
    countries,
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    projection,
    path,
  };
}

// Helpers for inset zoom/pan on small states
export interface Viewport {
  x: number;
  y: number;
  w: number;
  h: number;
}

const SMALL_COUNTRY_AREA_RATIO = 0.0006;
const SMALL_COUNTRY_MAX_DIM_PX = 24;
const MIN_TOUCH_HIT_PX = 20;

export function countryBBoxSize(country: Pick<CountryFeature, "bbox">): {
  width: number;
  height: number;
  maxDim: number;
} {
  const width = Math.max(0, country.bbox[2] - country.bbox[0]);
  const height = Math.max(0, country.bbox[3] - country.bbox[1]);
  return { width, height, maxDim: Math.max(width, height) };
}

export function isSmallCountryFeature(
  country: Pick<CountryFeature, "bbox" | "projectedArea">,
  mapWidth: number,
  mapHeight: number,
): boolean {
  const mapArea = Math.max(1, mapWidth * mapHeight);
  const areaThreshold = mapArea * SMALL_COUNTRY_AREA_RATIO;
  const { maxDim } = countryBBoxSize(country);
  return country.projectedArea <= areaThreshold || maxDim <= SMALL_COUNTRY_MAX_DIM_PX;
}

export function getSmallCountryHitStrokeWidth(
  country: Pick<CountryFeature, "bbox">,
): number {
  const { maxDim } = countryBBoxSize(country);
  const boost = Math.max(0, MIN_TOUCH_HIT_PX - maxDim);
  return Math.min(26, Math.max(10, 10 + boost));
}

export function clampViewport(vp: Viewport, width: number, height: number): Viewport {
  const minW = width * 0.15;
  const minH = height * 0.15;
  const w = Math.max(Math.min(vp.w, width), minW);
  const h = Math.max(Math.min(vp.h, height), minH);
  const x = Math.max(0, Math.min(vp.x, width - w));
  const y = Math.max(0, Math.min(vp.y, height - h));
  return { x, y, w, h };
}

export function zoomViewport(
  vp: Viewport,
  width: number,
  height: number,
  factor: number,
  focusX?: number,
  focusY?: number,
): Viewport {
  const fx = focusX ?? vp.x + vp.w / 2;
  const fy = focusY ?? vp.y + vp.h / 2;
  const nw = vp.w / factor;
  const nh = vp.h / factor;
  // Keep focus point roughly steady in screen space
  const nx = fx - (fx - vp.x) * (nw / vp.w);
  const ny = fy - (fy - vp.y) * (nh / vp.h);
  return clampViewport({ x: nx, y: ny, w: nw, h: nh }, width, height);
}
