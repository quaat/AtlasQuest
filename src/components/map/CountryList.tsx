import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { COUNTRIES_BY_CONTINENT } from "@/data/countries";
import type { ContinentId } from "@/data/continents";
import { cn, normalizeName } from "@/lib/utils";

interface Props {
  continent: ContinentId;
  wrongIds: string[];
  correctId: string | null;
  revealedId: string | null;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect: (id: string) => void;
  onFocus?: (id: string) => void;
  disabled?: boolean;
}

export function CountryList({
  continent,
  wrongIds,
  correctId,
  revealedId,
  hoveredId,
  onHover,
  onSelect,
  onFocus,
  disabled,
}: Props) {
  const [q, setQ] = useState("");
  const list = useMemo(() => COUNTRIES_BY_CONTINENT[continent], [continent]);

  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const nq = normalizeName(q);
    return list.filter(
      (c) =>
        normalizeName(c.name).includes(nq) ||
        normalizeName(c.shortName ?? "").includes(nq) ||
        c.iso3.toLowerCase().includes(nq),
    );
  }, [q, list]);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="flex items-center justify-between px-3 pt-3 pb-2 gap-2">
        <div className="text-[11px] uppercase tracking-[0.15em] text-mist-400">
          Countries <span className="text-mist-500">· {list.length}</span>
        </div>
      </div>
      <div className="relative px-3">
        <Search
          size={14}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-mist-400"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-8 py-2 text-sm text-mist-50 placeholder:text-mist-500 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/60"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-mist-400 hover:text-white"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <ul className="mt-1 flex-1 min-h-0 overflow-y-auto px-2 py-2">
        {filtered.map((c) => {
          const isWrong = wrongIds.includes(c.id);
          const isCorrect = correctId === c.id;
          const isRevealed = revealedId === c.id;
          const isHovered = hoveredId === c.id;
          return (
            <li key={c.id}>
              <button
                disabled={disabled || isCorrect}
                onClick={() => onSelect(c.id)}
                onMouseEnter={() => onHover?.(c.id)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => {
                  onHover?.(c.id);
                  onFocus?.(c.id);
                }}
                onBlur={() => onHover?.(null)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-cyan/60",
                  !isWrong && !isCorrect && !isRevealed && "hover:bg-white/5 text-mist-200",
                  isHovered && !isWrong && !isCorrect && !isRevealed && "bg-white/5",
                  isWrong && "bg-rose-500/15 text-rose-200 line-through",
                  isCorrect && "bg-emerald-500/15 text-emerald-200",
                  isRevealed && "bg-emerald-500/10 text-emerald-200",
                  disabled && !isCorrect && !isRevealed && "opacity-90",
                )}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span className="truncate">{c.name}</span>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-3 py-4 text-center text-xs text-mist-400">
            No matches.
          </li>
        )}
      </ul>
    </div>
  );
}
