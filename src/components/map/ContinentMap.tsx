import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Maximize2, Crosshair } from "lucide-react";
import {
  buildContinentMap,
  clampViewport,
  getSmallCountryHitStrokeWidth,
  isSmallCountryFeature,
  zoomViewport,
} from "@/lib/geo";
import type { ContinentMapData } from "@/lib/geo";
import type { ContinentId } from "@/data/continents";
import { getContinent, resolveContinentProjection } from "@/data/continents";
import { useWorldTopology } from "./useWorldTopology";
import { cn } from "@/lib/utils";
import { useSettings } from "@/store/settingsStore";
import type { MapColorTheme } from "@/store/settingsStore";

export type MapCountryState =
  | "idle"
  | "hover"
  | "selected"
  | "wrong"
  | "correct"
  | "hint"
  | "reveal";

interface Props {
  continent: ContinentId;
  targetId?: string | null;
  wrongIds?: string[];
  solvedId?: string | null;
  revealedId?: string | null;
  hintId?: string | null;
  hoveredId?: string | null;
  selectedId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  /** Optional: external focus request, e.g. from country list */
  focusId?: string | null;
  interactionMode?: "gameplay" | "discovery";
  labelMode?: "revealed" | "all";
  className?: string;
}

const BASE_W = 1200;
const BASE_H = 720;

type MapThemePalette = {
  seaBaseTop: string;
  seaBaseBottom: string;
  seaGlowInner: string;
  seaGlowOuter: string;
  countryFillTop: string;
  countryFillBottom: string;
  countryHoverTop: string;
  countryHoverBottom: string;
  countryIdleStroke: string;
};

const MAP_THEME_PALETTES: Record<MapColorTheme, MapThemePalette> = {
  aurora: {
    seaBaseTop: "#0A152A",
    seaBaseBottom: "#03060F",
    seaGlowInner: "rgba(129,140,248,0.24)",
    seaGlowOuter: "rgba(5,6,11,0)",
    countryFillTop: "#2F374B",
    countryFillBottom: "#1C2235",
    countryHoverTop: "#3D4A6A",
    countryHoverBottom: "#2A3350",
    countryIdleStroke: "rgba(255,255,255,0.13)",
  },
  atlas: {
    seaBaseTop: "#10263E",
    seaBaseBottom: "#07111F",
    seaGlowInner: "rgba(56,189,248,0.22)",
    seaGlowOuter: "rgba(7,17,31,0)",
    countryFillTop: "#3B4A63",
    countryFillBottom: "#25324A",
    countryHoverTop: "#4A5E7D",
    countryHoverBottom: "#324564",
    countryIdleStroke: "rgba(191,219,254,0.24)",
  },
  emerald: {
    seaBaseTop: "#0B2E2F",
    seaBaseBottom: "#041615",
    seaGlowInner: "rgba(45,212,191,0.22)",
    seaGlowOuter: "rgba(4,22,21,0)",
    countryFillTop: "#2E443D",
    countryFillBottom: "#1B2F29",
    countryHoverTop: "#3F5B52",
    countryHoverBottom: "#2A433B",
    countryIdleStroke: "rgba(187,247,208,0.2)",
  },
  sand: {
    seaBaseTop: "#243447",
    seaBaseBottom: "#121C2B",
    seaGlowInner: "rgba(251,191,36,0.16)",
    seaGlowOuter: "rgba(18,28,43,0)",
    countryFillTop: "#4D463B",
    countryFillBottom: "#342E25",
    countryHoverTop: "#645B4C",
    countryHoverBottom: "#4A4336",
    countryIdleStroke: "rgba(253,230,138,0.2)",
  },
};

export const ContinentMap = memo(function ContinentMap({
  continent,
  targetId,
  wrongIds = [],
  solvedId,
  revealedId,
  hintId,
  hoveredId: hoveredIdProp,
  selectedId,
  onHover,
  onSelect,
  focusId,
  interactionMode = "gameplay",
  labelMode = "revealed",
  className,
}: Props) {
  const { topology, loading, error } = useWorldTopology();
  const { showLabels, mapProjectionMode, mapColorTheme } = useSettings();
  const svgRef = useRef<SVGSVGElement>(null);
  const [internalHover, setInternalHover] = useState<string | null>(null);
  const hoveredId = hoveredIdProp ?? internalHover;
  const palette = MAP_THEME_PALETTES[mapColorTheme];

  const meta = useMemo(() => getContinent(continent), [continent]);
  const projectionSpec = useMemo(
    () => resolveContinentProjection(meta, mapProjectionMode),
    [meta, mapProjectionMode],
  );

  const map: ContinentMapData | null = useMemo(() => {
    if (!topology) return null;
    return buildContinentMap(topology, continent, BASE_W, BASE_H, projectionSpec);
  }, [topology, continent, projectionSpec]);

  const [vp, setVp] = useState({ x: 0, y: 0, w: BASE_W, h: BASE_H });
  useEffect(() => {
    setVp({ x: 0, y: 0, w: BASE_W, h: BASE_H });
  }, [continent]);

  // Focus a given country (zoom to it)
  useEffect(() => {
    if (!focusId || !map) return;
    const c = map.countries.find((x) => x.id === focusId);
    if (!c) return;
    const [x0, y0, x1, y1] = c.bbox;
    const w = x1 - x0;
    const h = y1 - y0;
    const pad = 0.6;
    const targetSize = Math.max(w, h) * (1 + pad * 2);
    const aspect = BASE_W / BASE_H;
    let newW = targetSize * aspect;
    let newH = targetSize;
    if (newW > BASE_W) {
      newW = BASE_W;
      newH = BASE_W / aspect;
    }
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const next = clampViewport(
      { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH },
      BASE_W,
      BASE_H,
    );
    setVp(next);
  }, [focusId, map]);

  const zoomIn = useCallback(() => {
    setVp((v) => zoomViewport(v, BASE_W, BASE_H, 1.5));
  }, []);
  const zoomOut = useCallback(() => {
    setVp((v) => zoomViewport(v, BASE_W, BASE_H, 1 / 1.5));
  }, []);
  const zoomReset = useCallback(() => {
    setVp({ x: 0, y: 0, w: BASE_W, h: BASE_H });
  }, []);

  // Wheel zoom (desktop)
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 1) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const sx = (e.clientX - rect.left) / rect.width;
      const sy = (e.clientY - rect.top) / rect.height;
      const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
      setVp((v) => zoomViewport(v, BASE_W, BASE_H, factor, v.x + v.w * sx, v.y + v.h * sy));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Drag to pan
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origin: { x: number; y: number };
    moved: boolean;
  }>({ active: false, startX: 0, startY: 0, origin: { x: 0, y: 0 }, moved: false });

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 && e.pointerType !== "touch") return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origin: { x: vp.x, y: vp.y },
      moved: false,
    };
    (e.target as SVGElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current.active) return;
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * vp.w;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * vp.h;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragRef.current.moved = true;
    const next = clampViewport(
      { x: dragRef.current.origin.x - dx, y: dragRef.current.origin.y - dy, w: vp.w, h: vp.h },
      BASE_W,
      BASE_H,
    );
    setVp(next);
  };
  const onPointerUp = () => {
    dragRef.current.active = false;
  };

  const orderedCountries = useMemo(
    () =>
      map?.countries
        .slice()
        .sort((a, b) => b.projectedArea - a.projectedArea) ?? [],
    [map?.countries],
  );
  const smallCountryHitTargets = useMemo(() => {
    if (!map) return [];
    return orderedCountries
      .filter((country) => isSmallCountryFeature(country, map.width, map.height))
      .map((country) => ({
        country,
        hitStrokeWidth: getSmallCountryHitStrokeWidth(country),
      }));
  }, [orderedCountries, map]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-center p-8">
        <div>
          <div className="text-rose-300 text-sm font-semibold">
            Couldn’t load world map data.
          </div>
          <div className="text-mist-400 text-xs mt-1">
            Check your internet connection and refresh.
          </div>
        </div>
      </div>
    );
  }
  if (loading || !map) {
    return <MapSkeleton />;
  }

  const zoomLevel = BASE_W / vp.w;

  return (
    <div className={cn("relative h-full w-full", className)}>
      <svg
        ref={svgRef}
        viewBox={`${vp.x} ${vp.y} ${vp.w} ${vp.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          onPointerUp();
          setInternalHover(null);
          onHover?.(null);
        }}
        role="application"
        aria-label={
          interactionMode === "discovery"
            ? `${meta.name} map — explore countries and inspect details`
            : `${meta.name} map — click or tab through countries to guess`
        }
      >
        <defs>
          <linearGradient id="sea-base" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.seaBaseTop} />
            <stop offset="100%" stopColor={palette.seaBaseBottom} />
          </linearGradient>
          <radialGradient id="sea-glow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor={palette.seaGlowInner} />
            <stop offset="100%" stopColor={palette.seaGlowOuter} />
          </radialGradient>
          <linearGradient id="country-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.countryFillTop} />
            <stop offset="100%" stopColor={palette.countryFillBottom} />
          </linearGradient>
          <linearGradient id="country-hover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.countryHoverTop} />
            <stop offset="100%" stopColor={palette.countryHoverBottom} />
          </linearGradient>
          <linearGradient id="country-selected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.26" />
          </linearGradient>
          <linearGradient id="country-wrong" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#BE123C" />
          </linearGradient>
          <linearGradient id="country-correct" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#0F9A6A" />
          </linearGradient>
          <linearGradient id="country-hint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={meta.accent} stopOpacity="0.85" />
            <stop offset="100%" stopColor={meta.accent} stopOpacity="0.55" />
          </linearGradient>
          <filter id="country-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x={vp.x} y={vp.y} width={vp.w} height={vp.h} fill="url(#sea-base)" />
        <rect x={vp.x} y={vp.y} width={vp.w} height={vp.h} fill="url(#sea-glow)" />

        {/* Countries */}
        {orderedCountries.map((c) => {
          const state: MapCountryState = solvedId === c.id
            ? "correct"
            : revealedId === c.id
              ? "reveal"
              : wrongIds.includes(c.id)
                ? "wrong"
                : hintId === c.id
                  ? "hint"
                  : selectedId === c.id
                    ? "selected"
                    : hoveredId === c.id
                      ? "hover"
                      : "idle";

          const fill =
            state === "correct"
              ? "url(#country-correct)"
              : state === "reveal"
                ? "url(#country-correct)"
                : state === "wrong"
                  ? "url(#country-wrong)"
                  : state === "hint"
                    ? "url(#country-hint)"
                    : state === "selected"
                      ? "url(#country-selected)"
                      : state === "hover"
                        ? "url(#country-hover)"
                        : "url(#country-fill)";

          const strokeColor =
            state === "correct"
              ? "#6EE7B7"
              : state === "wrong"
                ? "#FCA5A5"
                : state === "selected"
                  ? "rgba(34,211,238,0.9)"
                  : state === "hover"
                    ? "rgba(255,255,255,0.45)"
                    : state === "hint"
                      ? "rgba(255,255,255,0.5)"
                      : palette.countryIdleStroke;

          const strokeWidth =
            state === "idle" ? 0.7 : state === "hover" ? 1.1 : state === "selected" ? 1.3 : 1.5;

          const filter =
            state === "correct" || state === "reveal" || state === "hint" || state === "selected"
              ? "url(#country-glow)"
              : undefined;

          return (
            <path
              key={c.id}
              d={c.pathD}
              className="country"
              fill={fill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              filter={filter}
              data-id={c.id}
              data-name={c.name}
              tabIndex={dragRef.current.active ? -1 : 0}
              role="button"
              aria-label={c.name}
              onClick={(e) => {
                if (dragRef.current.moved) return;
                e.stopPropagation();
                onSelect?.(c.id);
              }}
              onMouseEnter={() => {
                setInternalHover(c.id);
                onHover?.(c.id);
              }}
              onMouseLeave={() => {
                if (internalHover === c.id) {
                  setInternalHover(null);
                  onHover?.(null);
                }
              }}
              onFocus={() => {
                setInternalHover(c.id);
                onHover?.(c.id);
              }}
              onBlur={() => {
                if (internalHover === c.id) {
                  setInternalHover(null);
                  onHover?.(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.(c.id);
                }
              }}
            />
          );
        })}

        {/* Small-country interaction helpers: invisible expanded stroke hit areas.
            Keeps visuals intact while making enclaves/microstates tappable. */}
        {smallCountryHitTargets.map(({ country, hitStrokeWidth }) => (
          <path
            key={`hit-${country.id}`}
            d={country.pathD}
            fill="none"
            stroke="rgba(0,0,0,0.001)"
            strokeWidth={hitStrokeWidth}
            vectorEffect="non-scaling-stroke"
            pointerEvents="stroke"
            className="cursor-pointer"
            tabIndex={-1}
            aria-hidden
            onClick={(e) => {
              if (dragRef.current.moved) return;
              e.stopPropagation();
              onSelect?.(country.id);
            }}
            onMouseEnter={() => {
              setInternalHover(country.id);
              onHover?.(country.id);
            }}
            onMouseLeave={() => {
              if (internalHover === country.id) {
                setInternalHover(null);
                onHover?.(null);
              }
            }}
          />
        ))}

        {/* Pulse ring at target position on reveal */}
        {revealedId && (
          <RevealPulse
            country={map.countries.find((c) => c.id === revealedId) ?? null}
          />
        )}

        {/* Labels */}
        {showLabels && map.countries.map((c) => {
          let shouldRenderLabel = false;
          if (labelMode === "all") {
            const largeCountry = c.projectedArea >= map.width * map.height * 0.0032;
            shouldRenderLabel =
              largeCountry ||
              zoomLevel >= 1.65 ||
              selectedId === c.id ||
              hoveredId === c.id;
          } else {
            shouldRenderLabel =
              solvedId === c.id || revealedId === c.id || wrongIds.includes(c.id);
          }

          if (!shouldRenderLabel) return null;

          const [cx, cy] = c.centroid;
          if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;

          const fontSize =
            labelMode === "all"
              ? Math.max(7, Math.min(12, (11 / zoomLevel) * 1.12))
              : Math.max(8, Math.min(14, (12 / zoomLevel) * 1.2));

          const color =
            labelMode === "all"
              ? selectedId === c.id
                ? "rgba(186,230,253,0.98)"
                : hoveredId === c.id
                  ? "rgba(240,249,255,0.96)"
                  : "rgba(226,232,240,0.82)"
              : solvedId === c.id || revealedId === c.id
                ? "rgba(209,250,229,0.95)"
                : "rgba(254,205,211,0.9)";

          return (
            <text
              key={`l-${c.id}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              fontSize={fontSize}
              className="pointer-events-none"
              fill={color}
              stroke="rgba(5,6,11,0.75)"
              strokeWidth={0.6}
              paintOrder="stroke"
              fontWeight={600}
            >
              {c.meta.shortName ?? c.name}
            </text>
          );
        })}
      </svg>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <MapControl onClick={zoomIn} title="Zoom in">
          <Plus size={16} />
        </MapControl>
        <MapControl onClick={zoomOut} title="Zoom out">
          <Minus size={16} />
        </MapControl>
        <MapControl onClick={zoomReset} title="Reset view">
          <Maximize2 size={14} />
        </MapControl>
      </div>

      {/* Hover chip */}
      <AnimatePresence>
        {hoveredId && (() => {
          const hc = map.countries.find((c) => c.id === hoveredId);
          if (!hc) return null;
          const alreadyRevealed =
            solvedId === hc.id ||
            revealedId === hc.id ||
            wrongIds.includes(hc.id);
          const showCountryName =
            interactionMode === "discovery" || alreadyRevealed;

          return (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="pointer-events-none absolute bottom-3 left-3 glass-strong rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-2"
            >
              <Crosshair size={12} className="text-cyan-300" />
              <span className="text-mist-100">
                {showCountryName ? (
                  <>
                    {hc.meta.flag} {hc.name}
                  </>
                ) : (
                  <span className="text-mist-300">Click to guess</span>
                )}
              </span>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
});

function MapControl({
  onClick,
  children,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="h-9 w-9 inline-flex items-center justify-center rounded-lg glass-strong hover:bg-white/10 active:bg-white/15 transition text-mist-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-cyan/70"
    >
      {children}
    </button>
  );
}

function RevealPulse({ country }: { country: { centroid: [number, number] } | null }) {
  if (!country) return null;
  const [cx, cy] = country.centroid;
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  return (
    <g className="pointer-events-none">
      <circle cx={cx} cy={cy} r={6} fill="#34D399" />
      <circle cx={cx} cy={cy} r={6} fill="none" stroke="#34D399" strokeWidth={1.5}>
        <animate attributeName="r" from="6" to="26" dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.8" to="0" dur="1.4s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function MapSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-2 border-white/10 border-t-aurora-cyan animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-mist-400 tracking-widest uppercase">
          Map
        </div>
      </div>
    </div>
  );
}
