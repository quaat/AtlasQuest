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
import { buildContinentMap, clampViewport, zoomViewport } from "@/lib/geo";
import type { ContinentMapData } from "@/lib/geo";
import type { ContinentId } from "@/data/continents";
import { getContinent } from "@/data/continents";
import { useWorldTopology } from "./useWorldTopology";
import { cn } from "@/lib/utils";
import { useSettings } from "@/store/settingsStore";

export type MapCountryState =
  | "idle"
  | "hover"
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
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  /** Optional: external focus request, e.g. from country list */
  focusId?: string | null;
  className?: string;
}

const BASE_W = 1200;
const BASE_H = 720;

export const ContinentMap = memo(function ContinentMap({
  continent,
  targetId,
  wrongIds = [],
  solvedId,
  revealedId,
  hintId,
  hoveredId: hoveredIdProp,
  onHover,
  onSelect,
  focusId,
  className,
}: Props) {
  const { topology, loading, error } = useWorldTopology();
  const { showLabels } = useSettings();
  const svgRef = useRef<SVGSVGElement>(null);
  const [internalHover, setInternalHover] = useState<string | null>(null);
  const hoveredId = hoveredIdProp ?? internalHover;

  const meta = useMemo(() => getContinent(continent), [continent]);

  const map: ContinentMapData | null = useMemo(() => {
    if (!topology) return null;
    return buildContinentMap(topology, continent, BASE_W, BASE_H, meta.projection);
  }, [topology, continent, meta.projection]);

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
        aria-label={`${meta.name} map — click or tab through countries to guess`}
      >
        <defs>
          <radialGradient id="sea-glow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(129,140,248,0.12)" />
            <stop offset="100%" stopColor="rgba(5,6,11,0)" />
          </radialGradient>
          <linearGradient id="country-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2F374B" />
            <stop offset="100%" stopColor="#1C2235" />
          </linearGradient>
          <linearGradient id="country-hover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3D4A6A" />
            <stop offset="100%" stopColor="#2A3350" />
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

        <rect x={vp.x} y={vp.y} width={vp.w} height={vp.h} fill="url(#sea-glow)" />

        {/* Countries */}
        {map.countries.map((c) => {
          const state: MapCountryState = solvedId === c.id
            ? "correct"
            : revealedId === c.id
              ? "reveal"
              : wrongIds.includes(c.id)
                ? "wrong"
                : hintId === c.id
                  ? "hint"
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
                    : state === "hover"
                      ? "url(#country-hover)"
                      : "url(#country-fill)";
          const strokeColor =
            state === "correct"
              ? "#6EE7B7"
              : state === "wrong"
                ? "#FCA5A5"
                : state === "hover"
                  ? "rgba(255,255,255,0.45)"
                  : state === "hint"
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(255,255,255,0.13)";
          const strokeWidth = state === "idle" ? 0.7 : state === "hover" ? 1.1 : 1.5;
          const filter =
            state === "correct" || state === "reveal" || state === "hint"
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

        {/* Pulse ring at target position on reveal */}
        {revealedId && (
          <RevealPulse
            country={map.countries.find((c) => c.id === revealedId) ?? null}
          />
        )}

        {/* Labels — only for countries the player has interacted with this round.
            Naming them on the map before they're clicked would defeat the game.
            Honors the "Show country names on map" setting as a master switch. */}
        {showLabels && map.countries.map((c) => {
          const revealed =
            solvedId === c.id || revealedId === c.id || wrongIds.includes(c.id);
          if (!revealed) return null;
          const [cx, cy] = c.centroid;
          if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
          const fontSize = Math.max(8, Math.min(14, 12 / zoomLevel * 1.2));
          const color =
            solvedId === c.id || revealedId === c.id
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

      {/* Hover chip — shows a neutral indicator during active play and the
          actual country name only for countries already interacted with. */}
      <AnimatePresence>
        {hoveredId && (() => {
          const hc = map.countries.find((c) => c.id === hoveredId);
          if (!hc) return null;
          const alreadyRevealed =
            solvedId === hc.id ||
            revealedId === hc.id ||
            wrongIds.includes(hc.id);
          return (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="pointer-events-none absolute bottom-3 left-3 glass-strong rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-2"
            >
              <Crosshair size={12} className="text-cyan-300" />
              <span className="text-mist-100">
                {alreadyRevealed ? (
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
